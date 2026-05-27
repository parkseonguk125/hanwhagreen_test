import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchQaPost, verifyQaPost } from "../services/boardApi";
import { storeUnlockedQaPost } from "../services/boardAccess";
import { boardRouteTarget, boardViewRouteTarget } from "../utils/navRoutes";
import "../styles/password-page.css";

export default function BoardPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table") || "qa";
  const wrId = searchParams.get("wr_id");
  const mode = searchParams.get("w") || "s";

  const [password, setPassword] = useState("");
  const [postMeta, setPostMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("is-password-page");
    document.title = "비밀번호 입력 | 한화그린";

    return () => {
      document.body.classList.remove("is-password-page");
      document.title = "한화그린";
    };
  }, []);

  useEffect(() => {
    if (table !== "qa" || !wrId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetchQaPost(wrId)
      .then((post) => {
        if (!cancelled) setPostMeta(post);
      })
      .catch((fetchError) => {
        if (!cancelled) setError(fetchError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [table, wrId]);

  if (table !== "qa" || !wrId) {
    return (
      <div id="pw_confirm" className="mbskin">
        <h1>비밀번호 확인</h1>
        <p>잘못된 접근입니다.</p>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const post = await verifyQaPost(wrId, password.trim());
      storeUnlockedQaPost(post);
      navigate(boardViewRouteTarget("qa", post.id));
    } catch (submitError) {
      setError(submitError.message);
      alert(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div id="pw_confirm" className="mbskin">
        <p className="pw_loading">불러오는 중...</p>
      </div>
    );
  }

  if (error && !postMeta) {
    return (
      <div id="pw_confirm" className="mbskin">
        <h1>비밀번호 확인</h1>
        <p>{error}</p>
        <fieldset>
          <button type="button" className="btn_submit" onClick={() => navigate(boardRouteTarget("qa"))}>
            목록으로
          </button>
        </fieldset>
      </div>
    );
  }

  return (
    <div id="pw_confirm" className="mbskin">
      <h1>{postMeta?.subject}</h1>
      <p>
        <strong>비밀글 기능으로 보호된 글입니다.</strong>
        작성자와 관리자만 열람하실 수 있습니다.
        <br /> 본인이라면 비밀번호를 입력하세요.
      </p>

      <form id="fboardpassword" name="fboardpassword" onSubmit={handleSubmit}>
        <input type="hidden" name="w" value={mode} />
        <input type="hidden" name="bo_table" value={table} />
        <input type="hidden" name="wr_id" value={wrId} />
        <input type="hidden" name="comment_id" value="0" />
        <input type="hidden" name="sfl" value="" />
        <input type="hidden" name="stx" value="" />
        <input type="hidden" name="page" value="" />

        <fieldset>
          <label htmlFor="password_wr_password" className="sound_only">
            비밀번호<strong>필수</strong>
          </label>
          <input
            type="password"
            name="wr_password"
            id="password_wr_password"
            required
            className="frm_input required"
            size={15}
            maxLength={20}
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />
          <input type="submit" value="확인" className="btn_submit" disabled={submitting} />
        </fieldset>
      </form>
    </div>
  );
}
