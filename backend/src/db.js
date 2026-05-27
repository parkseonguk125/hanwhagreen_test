import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "qa.db");

function ensureDbDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatBoardDate(isoString) {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function mapRow(row, { includeContent = true } = {}) {
  if (!row) return null;

  const post = {
    id: row.id,
    status: row.status,
    isSecret: Boolean(row.is_secret),
    subject: row.subject,
    author: row.author,
    hits: row.hits,
    date: formatBoardDate(row.created_at),
    email: row.email || "",
    homepage: row.homepage || "",
    receiveMail: Boolean(row.receive_mail),
  };

  if (includeContent) {
    post.content = row.content;
  }

  return post;
}

let db;

export function getDb() {
  if (db) return db;

  ensureDbDir();
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS qa_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL DEFAULT '접수완료',
      is_secret INTEGER NOT NULL DEFAULT 1,
      subject TEXT NOT NULL,
      author TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT DEFAULT '',
      homepage TEXT DEFAULT '',
      content TEXT NOT NULL,
      receive_mail INTEGER NOT NULL DEFAULT 1,
      hits INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  seedDb(db);
  return db;
}

function seedDb(database) {
  const count = database.prepare("SELECT COUNT(*) AS count FROM qa_posts").get().count;
  if (count > 0) return;

  const insert = database.prepare(`
    INSERT INTO qa_posts (
      id, status, is_secret, subject, author, password_hash,
      email, homepage, content, receive_mail, hits, created_at
    ) VALUES (
      @id, @status, @is_secret, @subject, @author, @password_hash,
      @email, @homepage, @content, @receive_mail, @hits, @created_at
    )
  `);

  insert.run({
    id: 18,
    status: "접수완료",
    is_secret: 1,
    subject: "카지노 솔루션 | 슬롯 솔루션 | 홀덤 솔루션 | 라이브 홀덤 솔루션 | 에보소프트",
    author: "토지노 솔루션",
    password_hash: bcrypt.hashSync("seed", 10),
    email: "",
    homepage: "",
    content: "온라인 문의드립니다.",
    receive_mail: 1,
    hits: 1,
    created_at: "2026-02-09 00:00:00",
  });
}

export function listQaPosts() {
  const rows = getDb()
    .prepare("SELECT * FROM qa_posts ORDER BY id DESC")
    .all();
  return rows.map((row) => mapRow(row, { includeContent: false }));
}

export function getQaPost(id, { includeContent = true } = {}) {
  const row = getDb().prepare("SELECT * FROM qa_posts WHERE id = ?").get(Number(id));
  if (!row) return null;

  const shouldIncludeContent = includeContent && !row.is_secret;
  return mapRow(row, { includeContent: shouldIncludeContent });
}

export function getQaPostFull(id) {
  const row = getDb().prepare("SELECT * FROM qa_posts WHERE id = ?").get(Number(id));
  if (!row) return null;
  return mapRow(row, { includeContent: true });
}

export function getQaPostPublic(id) {
  return getQaPost(id, { includeContent: false });
}

export function verifyQaPassword(id, password) {
  const row = getDb().prepare("SELECT password_hash FROM qa_posts WHERE id = ?").get(Number(id));
  if (!row) return false;
  return bcrypt.compareSync(password, row.password_hash);
}

export function createQaPost(payload) {
  const result = getDb()
    .prepare(`
      INSERT INTO qa_posts (
        status, is_secret, subject, author, password_hash,
        email, homepage, content, receive_mail, hits
      ) VALUES (
        '접수완료', 1, @subject, @author, @password_hash,
        @email, @homepage, @content, @receive_mail, 0
      )
    `)
    .run({
      subject: payload.subject,
      author: payload.author,
      password_hash: bcrypt.hashSync(payload.password, 10),
      email: payload.email || "",
      homepage: payload.homepage || "",
      content: payload.content,
      receive_mail: payload.receiveMail ? 1 : 0,
    });

  return getQaPostFull(result.lastInsertRowid);
}

export function incrementQaHits(id) {
  getDb()
    .prepare("UPDATE qa_posts SET hits = hits + 1 WHERE id = ?")
    .run(Number(id));
  return getQaPost(id);
}
