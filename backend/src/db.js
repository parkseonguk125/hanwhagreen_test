import crypto from "crypto";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

/** DB 시드용 임시 관리자 (배포 전 변경 권장) */
export const SEED_ADMIN_ID = "admin";
export const SEED_ADMIN_PASSWORD = "green1234";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://hanwha:hanwha_local@localhost:5432/hanwhagreen",
});

pool.on("error", (err) => {
  console.error("[db] pool idle client error:", err.message);
});

function formatBoardDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function formatViewDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapNoticeRow(row, { includeContent = true } = {}) {
  if (!row) return null;

  const post = {
    id: row.id,
    isNotice: Boolean(row.is_notice),
    subject: row.subject,
    author: row.author,
    hits: row.hits,
    date: formatBoardDate(row.created_at),
    viewDate: formatViewDate(row.created_at),
  };

  if (includeContent) {
    post.content = row.content;
  }

  return post;
}

function mapQaRow(row, { includeContent = true } = {}) {
  if (!row) return null;

  const post = {
    id: row.id,
    status: row.status,
    isSecret: Boolean(row.is_secret),
    subject: row.subject,
    author: row.author,
    hits: row.hits,
    date: formatBoardDate(row.created_at),
    viewDate: formatViewDate(row.created_at),
    email: row.email || "",
    homepage: row.homepage || "",
    link1: row.link1 || "",
    link2: row.link2 || "",
    attachmentName: row.attachment_name || "",
    hasAttachment: Boolean(row.attachment_path),
    receiveMail: Boolean(row.receive_mail),
  };

  if (includeContent) {
    post.content = row.content;
  }

  return post;
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notice_posts (
      id SERIAL PRIMARY KEY,
      is_notice BOOLEAN NOT NULL DEFAULT TRUE,
      subject TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '관리자',
      content TEXT NOT NULL,
      hits INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS qa_posts (
      id SERIAL PRIMARY KEY,
      status TEXT NOT NULL DEFAULT '접수완료',
      is_secret BOOLEAN NOT NULL DEFAULT TRUE,
      subject TEXT NOT NULL,
      author TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT DEFAULT '',
      homepage TEXT DEFAULT '',
      content TEXT NOT NULL,
      receive_mail BOOLEAN NOT NULL DEFAULT TRUE,
      hits INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS members (
      mb_id VARCHAR(20) PRIMARY KEY,
      mb_password_hash TEXT NOT NULL,
      mb_name TEXT NOT NULL DEFAULT '',
      mb_level INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS member_sessions (
      token TEXT PRIMARY KEY,
      mb_id VARCHAR(20) NOT NULL REFERENCES members(mb_id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_member_sessions_mb_id ON member_sessions(mb_id);
    CREATE INDEX IF NOT EXISTS idx_member_sessions_expires ON member_sessions(expires_at);
  `);

  await migrateQaPosts();
  await seedDb();
}

async function migrateQaPosts() {
  await pool.query(`
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS link1 TEXT DEFAULT '';
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS link2 TEXT DEFAULT '';
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS attachment_name TEXT DEFAULT '';
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS attachment_path TEXT DEFAULT '';
  `);
}

async function seedDb() {
  const noticeCount = await pool.query("SELECT COUNT(*)::int AS count FROM notice_posts");
  if (noticeCount.rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO notice_posts (id, is_notice, subject, author, content, hits, created_at)
        VALUES ($1, TRUE, $2, $3, $4, $5, $6)
      `,
      [
        1,
        "한화그린 홈페이지 리뉴얼",
        "관리자",
        "한화그린 홈페이지가 리뉴얼 되었습니다.\n\n많은 관심과 사랑 부탁드립니다.",
        3437,
        "2024-04-11T00:00:00+09:00",
      ]
    );
    await pool.query(
      "SELECT setval(pg_get_serial_sequence('notice_posts', 'id'), (SELECT MAX(id) FROM notice_posts))"
    );
  }

  const qaCount = await pool.query("SELECT COUNT(*)::int AS count FROM qa_posts");
  if (qaCount.rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO qa_posts (
          id, status, is_secret, subject, author, password_hash,
          email, homepage, content, receive_mail, hits, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        18,
        "접수완료",
        true,
        "카지노 솔루션 | 슬롯 솔루션 | 홀덤 솔루션 | 라이브 홀덤 솔루션 | 에보소프트",
        "토지노 솔루션",
        bcrypt.hashSync("seed", 10),
        "",
        "",
        "온라인 문의드립니다.",
        true,
        1,
        "2026-02-09T00:00:00+09:00",
      ]
    );
    await pool.query(
      "SELECT setval(pg_get_serial_sequence('qa_posts', 'id'), (SELECT MAX(id) FROM qa_posts))"
    );
  }

  const memberCount = await pool.query("SELECT COUNT(*)::int AS count FROM members");
  if (memberCount.rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO members (mb_id, mb_password_hash, mb_name, mb_level)
        VALUES ($1, $2, $3, $4)
      `,
      [
        SEED_ADMIN_ID,
        bcrypt.hashSync(SEED_ADMIN_PASSWORD, 10),
        "관리자",
        10,
      ]
    );
  }
}

function mapMemberRow(row) {
  if (!row) return null;
  return {
    mb_id: row.mb_id,
    mb_name: row.mb_name,
    mb_level: row.mb_level,
  };
}

export async function verifyMemberLogin(mbId, password) {
  const { rows } = await pool.query(
    "SELECT mb_id, mb_password_hash, mb_name, mb_level FROM members WHERE mb_id = $1",
    [mbId]
  );
  const row = rows[0];
  if (!row || !bcrypt.compareSync(password, row.mb_password_hash)) {
    return null;
  }
  return mapMemberRow(row);
}

export async function createMemberSession(mbId, persistent = false) {
  const token = crypto.randomBytes(32).toString("hex");
  const hours = persistent ? 24 * 30 : 12;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  await pool.query(
    `
      INSERT INTO member_sessions (token, mb_id, expires_at)
      VALUES ($1, $2, $3)
    `,
    [token, mbId, expiresAt]
  );

  return { token, expiresAt: expiresAt.toISOString() };
}

export async function getMemberBySession(token) {
  await pool.query("DELETE FROM member_sessions WHERE expires_at < NOW()");

  const { rows } = await pool.query(
    `
      SELECT m.mb_id, m.mb_name, m.mb_level
      FROM member_sessions s
      JOIN members m ON m.mb_id = s.mb_id
      WHERE s.token = $1 AND s.expires_at > NOW()
    `,
    [token]
  );
  return mapMemberRow(rows[0]);
}

export async function deleteMemberSession(token) {
  const { rowCount } = await pool.query("DELETE FROM member_sessions WHERE token = $1", [
    token,
  ]);
  return rowCount > 0;
}

export async function listNoticePosts() {
  const { rows } = await pool.query(
    "SELECT * FROM notice_posts ORDER BY id DESC"
  );
  return rows.map((row) => mapNoticeRow(row, { includeContent: false }));
}

export async function getNoticePost(id, { incrementHits = false } = {}) {
  if (incrementHits) {
    await pool.query("UPDATE notice_posts SET hits = hits + 1 WHERE id = $1", [
      Number(id),
    ]);
  }

  const { rows } = await pool.query("SELECT * FROM notice_posts WHERE id = $1", [
    Number(id),
  ]);
  return mapNoticeRow(rows[0], { includeContent: true });
}

export async function listQaPosts() {
  const { rows } = await pool.query("SELECT * FROM qa_posts ORDER BY id DESC");
  return rows.map((row) => mapQaRow(row, { includeContent: false }));
}

export async function getQaPost(id, { includeContent = true } = {}) {
  const { rows } = await pool.query("SELECT * FROM qa_posts WHERE id = $1", [
    Number(id),
  ]);
  const row = rows[0];
  if (!row) return null;

  const shouldIncludeContent = includeContent && !row.is_secret;
  return mapQaRow(row, { includeContent: shouldIncludeContent });
}

export async function getQaPostFull(id) {
  const { rows } = await pool.query("SELECT * FROM qa_posts WHERE id = $1", [
    Number(id),
  ]);
  return mapQaRow(rows[0], { includeContent: true });
}

export async function verifyQaPassword(id, password) {
  const { rows } = await pool.query(
    "SELECT password_hash FROM qa_posts WHERE id = $1",
    [Number(id)]
  );
  if (!rows[0]) return false;
  return bcrypt.compareSync(password, rows[0].password_hash);
}

export async function createQaPost(payload) {
  const { rows } = await pool.query(
    `
      INSERT INTO qa_posts (
        status, is_secret, subject, author, password_hash,
        email, homepage, link1, link2, content,
        attachment_name, attachment_path, receive_mail, hits
      ) VALUES (
        '접수완료', TRUE, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0
      )
      RETURNING id
    `,
    [
      payload.subject,
      payload.author,
      bcrypt.hashSync(payload.password, 10),
      payload.email || "",
      payload.homepage || "",
      payload.link1 || "",
      payload.link2 || "",
      payload.content,
      payload.attachmentName || "",
      payload.attachmentPath || "",
      Boolean(payload.receiveMail),
    ]
  );

  return getQaPostFull(rows[0].id);
}

export async function incrementQaHits(id) {
  await pool.query("UPDATE qa_posts SET hits = hits + 1 WHERE id = $1", [
    Number(id),
  ]);
  return getQaPost(id);
}

export async function createNoticePost(payload) {
  const { rows } = await pool.query(
    `
      INSERT INTO notice_posts (is_notice, subject, author, content, hits)
      VALUES (TRUE, $1, $2, $3, 0)
      RETURNING id
    `,
    [payload.subject, payload.author || "관리자", payload.content]
  );
  return getNoticePost(rows[0].id);
}

export async function updateNoticePost(id, payload) {
  const { rowCount } = await pool.query(
    `
      UPDATE notice_posts
      SET subject = $1, author = $2, content = $3
      WHERE id = $4
    `,
    [payload.subject, payload.author || "관리자", payload.content, Number(id)]
  );
  if (!rowCount) return null;
  return getNoticePost(id);
}

export async function deleteNoticePost(id) {
  const { rowCount } = await pool.query("DELETE FROM notice_posts WHERE id = $1", [
    Number(id),
  ]);
  return rowCount > 0;
}

export async function getQaPostAttachmentMeta(id) {
  const { rows } = await pool.query(
    "SELECT attachment_name, attachment_path FROM qa_posts WHERE id = $1",
    [Number(id)]
  );
  return rows[0] || null;
}

export async function updateQaPost(id, payload) {
  const base = [
    payload.subject,
    payload.author,
    payload.email || "",
    payload.homepage || "",
    payload.link1 || "",
    payload.link2 || "",
    payload.content,
    payload.attachmentName ?? null,
    payload.attachmentPath ?? null,
    Boolean(payload.receiveMail),
    Number(id),
  ];

  const setAttachment =
    payload.attachmentName !== undefined && payload.attachmentPath !== undefined;

  let rowCount;
  if (payload.newPassword?.trim()) {
    const sql = setAttachment
      ? `
        UPDATE qa_posts
        SET subject = $1, author = $2, email = $3, homepage = $4,
            link1 = $5, link2 = $6, content = $7,
            attachment_name = $8, attachment_path = $9,
            receive_mail = $10, password_hash = $11
        WHERE id = $12
      `
      : `
        UPDATE qa_posts
        SET subject = $1, author = $2, email = $3, homepage = $4,
            link1 = $5, link2 = $6, content = $7, receive_mail = $8, password_hash = $9
        WHERE id = $10
      `;
    const params = setAttachment
      ? [...base.slice(0, 10), bcrypt.hashSync(payload.newPassword, 10), base[10]]
      : [...base.slice(0, 7), Boolean(payload.receiveMail), bcrypt.hashSync(payload.newPassword, 10), base[10]];
    const result = await pool.query(sql, params);
    rowCount = result.rowCount;
  } else {
    const sql = setAttachment
      ? `
        UPDATE qa_posts
        SET subject = $1, author = $2, email = $3, homepage = $4,
            link1 = $5, link2 = $6, content = $7,
            attachment_name = $8, attachment_path = $9, receive_mail = $10
        WHERE id = $11
      `
      : `
        UPDATE qa_posts
        SET subject = $1, author = $2, email = $3, homepage = $4,
            link1 = $5, link2 = $6, content = $7, receive_mail = $8
        WHERE id = $9
      `;
    const params = setAttachment
      ? base
      : [...base.slice(0, 7), Boolean(payload.receiveMail), base[10]];
    const result = await pool.query(sql, params);
    rowCount = result.rowCount;
  }

  if (!rowCount) return null;
  return getQaPostFull(id);
}

export async function deleteQaPost(id) {
  const { rowCount } = await pool.query("DELETE FROM qa_posts WHERE id = $1", [
    Number(id),
  ]);
  return rowCount > 0;
}

export async function checkDbHealth() {
  await pool.query("SELECT 1");
}
