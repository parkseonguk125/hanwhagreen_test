import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import Icon from "../components/Icons";
import MockRecaptcha from "../components/board/MockRecaptcha";
import {
  createNoticePost,
  createQaPost,
  fetchNoticePost,
  fetchQaPost,
  updateNoticePost,
  updateQaPost,
} from "../services/boardApi";
import { getQaPassword, getUnlockedQaPost, storeQaPassword, storeUnlockedQaPost } from "../services/boardAccess";
import { getStoredMember, isAdmin } from "../services/authAccess";
import { boardBanners } from "../config/boardBanners";
import { parseLegacyQaContent } from "../utils/qaPostDisplay";
import { boardRouteTarget, boardViewRouteTarget } from "../utils/navRoutes";
import "../styles/default.css";
import "../styles/board-base.css";
import "../styles/sub-pages.css";
import "../styles/board.css";
import "../styles/board-pages.css";
import "../styles/qna-skin.css";
import "../styles/notice-skin.css";

const boardConfig = {
  notice: {
    pageId: "board_list01",
    title: "공지사항",
    navTitle: "공지사항",
    banner: boardBanners.notice,
  },
  qa: {
    pageId: "qna",
    title: "온라인문의",
    navTitle: "온라인문의",
    banner: boardBanners.qa,
  },
};

const emptyForm = {
  wr_name: "",
  wr_password: "",
  wr_new_password: "",
  wr_email: "",
  wr_homepage: "",
  wr_subject: "",
  wr_content: "",
  wr_link1: "",
  wr_link2: "",
  mail: true,
  captcha: false,
};

export default function BoardWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table") || "qa";
  const wrId = searchParams.get("wr_id");
  const isEdit = searchParams.get("w") === "u" && wrId;
  const config = boardConfig[table] || boardConfig.qa;

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(Boolean(isEdit));
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (table !== "notice") return undefined;

    if (!isAdmin()) {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      alert("공지사항은 관리자 로그인 후 작성·수정할 수 있습니다.");
      navigate(`/bbs/login.php?url=${encodeURIComponent(returnPath)}`, { replace: true });
      return undefined;
    }

    if (!isEdit) {
      const member = getStoredMember();
      setForm((prev) => ({
        ...prev,
        wr_name: member?.name || member?.id || "관리자",
      }));
    }

    return undefined;
  }, [table, isEdit, navigate]);

  useEffect(() => {
    if (!isEdit) return undefined;

    let cancelled = false;
    setLoading(true);
    setLoadError("");

    const load = async () => {
      try {
        if (table === "notice") {
          const post = await fetchNoticePost(wrId, { skipHit: true });
          if (cancelled) return;
          setForm({
            ...emptyForm,
            wr_name: post.author || "관리자",
            wr_subject: post.subject || "",
            wr_content: post.content || "",
            captcha: true,
          });
          return;
        }

        if (table === "qa") {
          let data = getUnlockedQaPost(wrId);
          if (!data) {
            const peek = await fetchQaPost(wrId);
            if (peek?.isSecret) {
              throw new Error("비밀번호 확인 후 수정할 수 있습니다.");
            }
            data = peek;
          }
          if (cancelled) return;
          const legacy = parseLegacyQaContent(data.content || "");
          setForm({
            ...emptyForm,
            wr_name: data.author || "",
            wr_email: data.email || "",
            wr_homepage: data.homepage || "",
            wr_subject: data.subject || "",
            wr_content: legacy.content,
            wr_link1: data.link1 || legacy.link1,
            wr_link2: data.link2 || legacy.link2,
            mail: data.receiveMail !== false,
            wr_password: getQaPassword(wrId),
            captcha: true,
          });
        }
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isEdit, table, wrId]);

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setAttachment(file);
  };

  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.wr_name.trim() || !form.wr_subject.trim() || !form.wr_content.trim()) {
      alert("필수 항목을 입력해 주세요.");
      return;
    }

    if (table === "qa" && !isEdit && !form.wr_password.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    if (table === "qa" && isEdit && !form.wr_password.trim()) {
      alert("현재 비밀번호를 입력해 주세요.");
      return;
    }

    if (table === "notice" && !isAdmin()) {
      alert("관리자 로그인이 필요합니다.");
      return;
    }

    if (!isEdit && !form.captcha) {
      alert("로봇이 아닙니다를 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const content = form.wr_content.trim();

      if (table === "notice") {
        const payload = {
          author: form.wr_name.trim(),
          subject: form.wr_subject.trim(),
          content,
        };

        const post = isEdit
          ? await updateNoticePost(wrId, payload)
          : await createNoticePost(payload);

        alert(isEdit ? "수정되었습니다." : "등록되었습니다.");
        navigate(boardViewRouteTarget("notice", post.id));
        return;
      }

      if (table === "qa") {
        if (isEdit) {
          const post = await updateQaPost(
            wrId,
            {
              password: form.wr_password,
              author: form.wr_name.trim(),
              email: form.wr_email.trim(),
              homepage: form.wr_homepage.trim(),
              link1: form.wr_link1.trim(),
              link2: form.wr_link2.trim(),
              subject: form.wr_subject.trim(),
              content,
              receiveMail: form.mail,
              newPassword: form.wr_new_password.trim() || undefined,
            },
            attachment
          );
          storeUnlockedQaPost(post);
          storeQaPassword(wrId, form.wr_new_password.trim() || form.wr_password);
          alert("수정되었습니다.");
          navigate(boardViewRouteTarget("qa", post.id));
          return;
        }

        const post = await createQaPost(
          {
            author: form.wr_name.trim(),
            password: form.wr_password,
            email: form.wr_email.trim(),
            homepage: form.wr_homepage.trim(),
            link1: form.wr_link1.trim(),
            link2: form.wr_link2.trim(),
            subject: form.wr_subject.trim(),
            content,
            receiveMail: form.mail,
          },
          attachment
        );

        storeUnlockedQaPost(post);
        storeQaPassword(post.id, form.wr_password);
        alert("문의가 접수되었습니다.");
        navigate(boardViewRouteTarget("qa", post.id));
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!boardConfig[table]) {
    return (
      <>
        <Header />
        <main className="main" style={{ padding: "120px 20px", textAlign: "center" }}>
          <p>지원하지 않는 게시판입니다.</p>
          <Link to={boardRouteTarget("notice")}>공지사항으로 이동</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <SubLayout pageId={config.pageId} title={config.title} bannerUrl={config.banner} currentNavTitle={config.navTitle}>
          <section className="sec sec1">
            <article className="inner board-loading">불러오는 중...</article>
          </section>
        </SubLayout>
        <Footer />
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Header />
        <SubLayout pageId={config.pageId} title={config.title} bannerUrl={config.banner} currentNavTitle={config.navTitle}>
          <section className="sec sec1">
            <article className="inner board-loading">
              <p>{loadError}</p>
              <Link to={boardRouteTarget(table)}>목록으로</Link>
            </article>
          </section>
        </SubLayout>
        <Footer />
      </>
    );
  }

  const pageTitle = isEdit ? `${config.title} 글수정` : `${config.title} 글쓰기`;

  return (
    <>
      <Header />
      <SubLayout
        pageId={config.pageId}
        title={config.title}
        bannerUrl={config.banner}
        currentNavTitle={config.navTitle}
      >
        <section className="sec sec1">
          <article className="inner">
            <section id="bo_w">
              <h2 className="sound_only">{pageTitle}</h2>
              <form id="fwrite" onSubmit={handleSubmit} style={{ width: "100%" }}>
                <div className="bo_w_info write_div">
                  <label htmlFor="wr_name" className="sound_only">
                    이름<strong>필수</strong>
                  </label>
                  <input
                    type="text"
                    name="wr_name"
                    id="wr_name"
                    required
                    className="frm_input half_input required"
                    placeholder="이름"
                    value={form.wr_name}
                    onChange={updateField("wr_name")}
                  />

                  {table === "qa" && (
                    <>
                      <label htmlFor="wr_password" className="sound_only">
                        {isEdit ? "현재 비밀번호" : "비밀번호"}
                        <strong>필수</strong>
                      </label>
                      <input
                        type="password"
                        name="wr_password"
                        id="wr_password"
                        required
                        className="frm_input half_input required"
                        placeholder={isEdit ? "현재 비밀번호" : "비밀번호"}
                        value={form.wr_password}
                        onChange={updateField("wr_password")}
                      />
                      {isEdit && (
                        <>
                          <label htmlFor="wr_new_password" className="sound_only">
                            새 비밀번호
                          </label>
                          <input
                            type="password"
                            name="wr_new_password"
                            id="wr_new_password"
                            className="frm_input half_input"
                            placeholder="새 비밀번호 (변경 시만)"
                            value={form.wr_new_password}
                            onChange={updateField("wr_new_password")}
                          />
                        </>
                      )}
                      <label htmlFor="wr_email" className="sound_only">
                        이메일
                      </label>
                      <input
                        type="text"
                        name="wr_email"
                        id="wr_email"
                        className="frm_input half_input email"
                        placeholder="이메일"
                        value={form.wr_email}
                        onChange={updateField("wr_email")}
                      />
                      <label htmlFor="wr_homepage" className="sound_only">
                        홈페이지
                      </label>
                      <input
                        type="text"
                        name="wr_homepage"
                        id="wr_homepage"
                        className="frm_input half_input"
                        placeholder="홈페이지"
                        value={form.wr_homepage}
                        onChange={updateField("wr_homepage")}
                      />
                    </>
                  )}
                </div>

                {table === "qa" && (
                  <div className="write_div">
                    <ul className="bo_v_option">
                      <li className="chk_box">
                        <input
                          type="checkbox"
                          id="mail"
                          name="mail"
                          className="selec_chk"
                          checked={form.mail}
                          onChange={updateField("mail")}
                        />
                        <label htmlFor="mail">
                          <span />
                          답변메일받기
                        </label>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="bo_w_tit write_div">
                  <input
                    type="text"
                    name="wr_subject"
                    id="wr_subject"
                    required
                    className="frm_input full_input required"
                    placeholder="제목"
                    value={form.wr_subject}
                    onChange={updateField("wr_subject")}
                  />
                </div>

                <div className="write_div">
                  <textarea
                    id="wr_content"
                    name="wr_content"
                    required
                    maxLength={65536}
                    style={{ width: "100%", height: 300 }}
                    placeholder="내용"
                    value={form.wr_content}
                    onChange={updateField("wr_content")}
                  />
                </div>

                {table === "qa" && !isEdit && (
                  <>
                    <div className="bo_w_link write_div">
                      <label htmlFor="wr_link1">
                        <Icon name="link" size="md" className="write-field-icon" />
                      </label>
                      <input
                        type="text"
                        name="wr_link1"
                        id="wr_link1"
                        className="frm_input full_input"
                        value={form.wr_link1}
                        onChange={updateField("wr_link1")}
                      />
                    </div>
                    <div className="bo_w_link write_div">
                      <label htmlFor="wr_link2">
                        <Icon name="link" size="md" className="write-field-icon" />
                      </label>
                      <input
                        type="text"
                        name="wr_link2"
                        id="wr_link2"
                        className="frm_input full_input"
                        value={form.wr_link2}
                        onChange={updateField("wr_link2")}
                      />
                    </div>
                    <div className="bo_w_flie write_div">
                      <label htmlFor="bf_file_0" className="lb_icon">
                        <Icon name="folder-open" size="md" className="write-field-icon" />
                        <span className="sound_only">파일 첨부</span>
                      </label>
                      <div className="file_wr">
                        <input
                          ref={fileInputRef}
                          type="file"
                          name="bf_file[]"
                          id="bf_file_0"
                          className="frm_file"
                          onChange={handleAttachmentChange}
                        />
                        {attachment && (
                          <button
                            type="button"
                            className="file_del"
                            onClick={clearAttachment}
                            aria-label="첨부 파일 삭제"
                          >
                            {attachment.name} 삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!isEdit && (
                  <div className="write_div">
                    <MockRecaptcha
                      checked={form.captcha}
                      onChange={(value) => setForm((prev) => ({ ...prev, captcha: value }))}
                    />
                  </div>
                )}

                <div className="btn_confirm write_div">
                  <Link to={boardRouteTarget(table)} className="btn_cancel btn">
                    취소
                  </Link>
                  <button type="submit" className="btn_submit btn" disabled={submitting}>
                    {submitting ? "처리 중..." : isEdit ? "수정완료" : "작성완료"}
                  </button>
                </div>
              </form>
            </section>
          </article>
        </section>
      </SubLayout>
      <Footer />
    </>
  );
}
