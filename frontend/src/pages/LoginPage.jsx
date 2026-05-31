import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginMember } from "../services/authApi";
import { isLoggedIn, storeAuth } from "../services/authAccess";
import "../styles/login-page.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("url") || "/";

  const [form, setForm] = useState({
    mb_id: "",
    mb_password: "",
    auto_login: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add("is-login-page");
    document.title = "로그인 | 한화그린";

    if (isLoggedIn()) {
      navigate(returnUrl, { replace: true });
    }

    return () => {
      document.body.classList.remove("is-login-page");
      document.title = "한화그린";
    };
  }, [navigate, returnUrl]);

  const handleAutoLoginChange = (event) => {
    const checked = event.target.checked;
    if (checked) {
      const confirmed = window.confirm(
        "자동로그인을 사용하시면 다음부터 회원아이디와 비밀번호를 입력하실 필요가 없습니다.\n\n공공장소에서는 개인정보가 유출될 수 있으니 사용을 자제하여 주십시오.\n\n자동로그인을 사용하시겠습니까?"
      );
      setForm((prev) => ({ ...prev, auto_login: confirmed }));
      return;
    }

    setForm((prev) => ({ ...prev, auto_login: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.mb_id.trim()) {
      alert("회원아이디를 입력해 주세요.");
      return;
    }

    if (!form.mb_password.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await loginMember({
        mb_id: form.mb_id.trim(),
        mb_password: form.mb_password,
        auto_login: form.auto_login,
      });

      storeAuth(
        { token: data.token, member: data.member },
        { persistent: form.auto_login }
      );

      navigate(returnUrl, { replace: true });
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="mb_login" className="mbskin">
      <div className="login_skin">
        <div className="titleBox">
          <p>회원/로그인</p>
        </div>

        <form name="flogin" id="flogin" onSubmit={handleSubmit}>
          <input type="hidden" name="url" value={returnUrl} readOnly />

          <fieldset id="login_fs">
            <legend>회원로그인</legend>

            <label htmlFor="login_id" className="sound_only">
              회원아이디<strong className="sound_only"> 필수</strong>
            </label>
            <span className="login_name">
              <input
                type="text"
                name="mb_id"
                id="login_id"
                required
                className="frm_input required"
                size={20}
                maxLength={20}
                placeholder="아이디"
                value={form.mb_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, mb_id: event.target.value }))
                }
                disabled={submitting}
                autoComplete="username"
              />
            </span>

            <label htmlFor="login_pw" className="sound_only">
              비밀번호<strong className="sound_only"> 필수</strong>
            </label>
            <span className="login_pass">
              <input
                type="password"
                name="mb_password"
                id="login_pw"
                required
                className="frm_input required"
                size={20}
                maxLength={20}
                placeholder="비밀번호"
                value={form.mb_password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, mb_password: event.target.value }))
                }
                disabled={submitting}
                autoComplete="current-password"
              />
            </span>

            <div className="auto_login">
              <div className="login_if_auto chk_box">
                <input
                  type="checkbox"
                  name="auto_login"
                  id="login_auto_login"
                  className="selec_chk"
                  checked={form.auto_login}
                  onChange={handleAutoLoginChange}
                  disabled={submitting}
                />
                <label htmlFor="login_auto_login">
                  <span />
                </label>
                <span className="login_text">자동 로그인</span>
              </div>
            </div>

            <button type="submit" className="login_submit" disabled={submitting}>
              {submitting ? "로그인 중..." : "로그인"}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
