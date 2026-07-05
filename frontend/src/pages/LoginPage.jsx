import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isLoginRateLimitError, loginMember } from "../services/authApi";
import { isLoggedIn, storeAuth } from "../services/authAccess";
import {
  formatLockoutRemaining,
  getLoginLockoutAlertMessage,
  getLoginLockoutRemainingSeconds,
  setLoginLockout,
} from "../services/loginLockout";
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
  const [lockoutSeconds, setLockoutSeconds] = useState(() =>
    getLoginLockoutRemainingSeconds()
  );

  const isLockedOut = lockoutSeconds > 0;

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

  useEffect(() => {
    const syncLockout = () => {
      setLockoutSeconds(getLoginLockoutRemainingSeconds());
    };

    syncLockout();
    const timer = window.setInterval(syncLockout, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleAutoLoginChange = (event) => {
    if (isLockedOut) return;

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

    if (isLockedOut) {
      window.alert(getLoginLockoutAlertMessage(lockoutSeconds));
      return;
    }

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
      if (isLoginRateLimitError(error)) {
        const retryAfterSeconds = error.retryAfterSeconds || 300;
        const seconds = setLoginLockout(retryAfterSeconds);
        const remaining = Math.max(1, Math.ceil((seconds - Date.now()) / 1000));
        setLockoutSeconds(remaining);
        window.alert(getLoginLockoutAlertMessage(remaining));
        setForm((prev) => ({ ...prev, mb_password: "" }));
        return;
      }

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

        {isLockedOut ? (
          <div className="login_lockout_notice" role="alert">
            <strong>로그인 일시 제한</strong>
            <p>로그인 가능 횟수를 초과했습니다.</p>
            <p>
              <span className="login_lockout_timer">
                {formatLockoutRemaining(lockoutSeconds)}
              </span>{" "}
              후에 다시 로그인해 주세요.
            </p>
          </div>
        ) : null}

        <form name="flogin" id="flogin" onSubmit={handleSubmit}>
          <input type="hidden" name="url" value={returnUrl} readOnly />

          <fieldset id="login_fs" disabled={isLockedOut}>
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
                disabled={submitting || isLockedOut}
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
                disabled={submitting || isLockedOut}
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
                  disabled={submitting || isLockedOut}
                />
                <label htmlFor="login_auto_login">
                  <span />
                </label>
                <span className="login_text">자동 로그인</span>
              </div>
            </div>

            <button
              type="submit"
              className="login_submit"
              disabled={submitting || isLockedOut}
            >
              {isLockedOut
                ? `로그인 제한 (${formatLockoutRemaining(lockoutSeconds)})`
                : submitting
                  ? "로그인 중..."
                  : "로그인"}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
