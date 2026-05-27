import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import Icon from "../components/Icons";
import MockRecaptcha from "../components/board/MockRecaptcha";
import { createQaPost } from "../services/boardApi";
import { storeUnlockedQaPost } from "../services/boardAccess";
import { boardRouteTarget, boardViewRouteTarget } from "../utils/navRoutes";
import "../styles/default.css";
import "../styles/board-base.css";
import "../styles/sub-pages.css";
import "../styles/board.css";
import "../styles/board-pages.css";
import "../styles/qna-skin.css";

const ASSET = "https://hanwhagreen.com";

const qaConfig = {
  pageId: "qna",
  title: "온라인문의",
  navTitle: "온라인문의",
  banner: `${ASSET}/theme/FT_WEB50/img/qa.png`,
};

export default function BoardWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table") || "qa";
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    wr_name: "",
    wr_password: "",
    wr_email: "",
    wr_homepage: "",
    wr_subject: "",
    wr_content: "",
    wr_link1: "",
    wr_link2: "",
    mail: true,
    captcha: false,
  });

  if (table !== "qa") {
    return (
      <>
        <Header />
        <main className="main" style={{ padding: "120px 20px", textAlign: "center" }}>
          <p>글쓰기는 온라인문의 게시판에서만 가능합니다.</p>
          <Link to={boardRouteTarget("notice")}>공지사항으로 이동</Link>
        </main>
        <Footer />
      </>
    );
  }

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.wr_name.trim() || !form.wr_password.trim() || !form.wr_subject.trim() || !form.wr_content.trim()) {
      alert("필수 항목을 입력해 주세요.");
      return;
    }

    if (!form.captcha) {
      alert("로봇이 아닙니다를 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      let content = form.wr_content.trim();
      if (form.wr_link1.trim()) content += `\n\n링크1: ${form.wr_link1.trim()}`;
      if (form.wr_link2.trim()) content += `\n\n링크2: ${form.wr_link2.trim()}`;

      const post = await createQaPost({
        author: form.wr_name.trim(),
        password: form.wr_password,
        email: form.wr_email.trim(),
        homepage: form.wr_homepage.trim(),
        subject: form.wr_subject.trim(),
        content,
        receiveMail: form.mail,
      });

      storeUnlockedQaPost(post);
      alert("문의가 접수되었습니다.");
      navigate(boardViewRouteTarget("qa", post.id));
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <SubLayout
        pageId={qaConfig.pageId}
        title={qaConfig.title}
        bannerUrl={qaConfig.banner}
        currentNavTitle={qaConfig.navTitle}
      >
        <section className="sec sec1">
          <article className="inner">
            <section id="bo_w">
              <h2 className="sound_only">온라인문의</h2>
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
                  <label htmlFor="wr_password" className="sound_only">
                    비밀번호<strong>필수</strong>
                  </label>
                  <input
                    type="password"
                    name="wr_password"
                    id="wr_password"
                    required
                    className="frm_input half_input required"
                    placeholder="비밀번호"
                    value={form.wr_password}
                    onChange={updateField("wr_password")}
                  />
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
                    size={50}
                    placeholder="홈페이지"
                    value={form.wr_homepage}
                    onChange={updateField("wr_homepage")}
                  />
                </div>

                <div className="write_div">
                  <span className="sound_only">옵션</span>
                  <ul className="bo_v_option">
                    <li className="chk_box">
                      <input
                        type="checkbox"
                        id="mail"
                        name="mail"
                        className="selec_chk"
                        value="mail"
                        checked={form.mail}
                        onChange={updateField("mail")}
                      />
                      <label htmlFor="mail">
                        <span />답변메일받기
                      </label>
                    </li>
                  </ul>
                </div>

                <div className="bo_w_tit write_div">
                  <label htmlFor="wr_subject" className="sound_only">
                    제목<strong>필수</strong>
                  </label>
                  <div id="autosave_wrapper" className="write_div">
                    <input
                      type="text"
                      name="wr_subject"
                      id="wr_subject"
                      required
                      className="frm_input full_input required"
                      size={50}
                      maxLength={255}
                      placeholder="제목"
                      value={form.wr_subject}
                      onChange={updateField("wr_subject")}
                    />
                  </div>
                </div>

                <div className="write_div">
                  <label htmlFor="wr_content" className="sound_only">
                    내용<strong>필수</strong>
                  </label>
                  <div className="wr_content">
                    <span className="sound_only">웹 에디터 시작</span>
                    <textarea
                      id="wr_content"
                      name="wr_content"
                      required
                      maxLength={65536}
                      style={{ width: "100%", height: 300 }}
                      value={form.wr_content}
                      onChange={updateField("wr_content")}
                    />
                    <span className="sound_only">웹 에디터 끝</span>
                  </div>
                </div>

                <div className="bo_w_link write_div">
                  <label htmlFor="wr_link1">
                    <Icon name="link" size="md" className="write-field-icon" />
                    <span className="sound_only"> 링크 #1</span>
                  </label>
                  <input
                    type="text"
                    name="wr_link1"
                    id="wr_link1"
                    className="frm_input full_input"
                    size={50}
                    value={form.wr_link1}
                    onChange={updateField("wr_link1")}
                  />
                </div>

                <div className="bo_w_link write_div">
                  <label htmlFor="wr_link2">
                    <Icon name="link" size="md" className="write-field-icon" />
                    <span className="sound_only"> 링크 #2</span>
                  </label>
                  <input
                    type="text"
                    name="wr_link2"
                    id="wr_link2"
                    className="frm_input full_input"
                    size={50}
                    value={form.wr_link2}
                    onChange={updateField("wr_link2")}
                  />
                </div>

                <div className="bo_w_flie write_div">
                  <div className="file_wr write_div">
                    <label htmlFor="bf_file_1" className="lb_icon">
                      <Icon name="folder-open" size="md" className="write-field-icon" />
                      <span className="sound_only"> 파일 #1</span>
                    </label>
                    <input
                      type="file"
                      name="bf_file[]"
                      id="bf_file_1"
                      title="파일첨부 1 : 용량 2,048,576 바이트 이하만 업로드 가능"
                      className="frm_file"
                    />
                  </div>
                </div>

                <div className="write_div">
                  <MockRecaptcha checked={form.captcha} onChange={(value) => setForm((prev) => ({ ...prev, captcha: value }))} />
                </div>

                <div className="btn_confirm write_div">
                  <Link to={boardRouteTarget("qa")} className="btn_cancel btn">
                    취소
                  </Link>
                  <button type="submit" id="btn_submit" accessKey="s" className="btn_submit btn" disabled={submitting}>
                    {submitting ? "등록 중..." : "작성완료"}
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
