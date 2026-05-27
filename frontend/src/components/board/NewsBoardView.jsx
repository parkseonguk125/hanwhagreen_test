import { useState } from "react";
import { Link } from "react-router-dom";
import { boardViewRouteTarget } from "../../utils/navRoutes";
import { boardLinkUrl } from "../../utils/youtube";

export default function NewsBoardView({ post }) {
  const [commentsOpen, setCommentsOpen] = useState(true);

  const handleCommentToggle = (event) => {
    event.preventDefault();
    setCommentsOpen((open) => !open);
  };

  return (
    <article id="bo_v" className="news-board-view" style={{ width: "100%" }}>
      <section id="bo_v_atc">
        <h2 id="bo_v_atc_title">본문</h2>
        <div id="bo_v_share" />

        {post.image && (
          <div id="bo_v_img">
            <a
              href={post.imageLink || post.image}
              target="_blank"
              rel="noreferrer"
              className="view_image"
            >
              <img src={post.image} alt="" />
            </a>
          </div>
        )}

        <div id="bo_v_con">{post.content}</div>
      </section>

      {post.relatedLink && (
        <section id="bo_v_link">
          <h2>관련링크</h2>
          <ul>
            <li>
              <i className="fa fa-link" aria-hidden="true" />
              <a href={boardLinkUrl("news", post.id)} target="_blank" rel="noreferrer">
                <strong>{post.relatedLink}</strong>
              </a>
              <br />
              <span className="bo_v_link_cnt">{post.linkCount.toLocaleString()}회 연결</span>
            </li>
          </ul>
        </section>
      )}

      {(post.prev || post.next) && (
        <ul className="bo_v_nb">
          {post.prev && (
            <li className="btn_prv">
              <span className="nb_tit">
                <i className="fa fa-chevron-up" aria-hidden="true" /> 이전글
              </span>
              <Link to={boardViewRouteTarget("news", post.prev.id)}>{post.prev.subject}</Link>
              <span className="nb_date">{post.prev.date}</span>
            </li>
          )}
          {post.next && (
            <li className="btn_next">
              <span className="nb_tit">
                <i className="fa fa-chevron-down" aria-hidden="true" /> 다음글
              </span>
              <Link to={boardViewRouteTarget("news", post.next.id)}>{post.next.subject}</Link>
              <span className="nb_date">{post.next.date}</span>
            </li>
          )}
        </ul>
      )}

      <button
        type="button"
        className={`cmt_btn${commentsOpen ? " cmt_btn_op" : ""}`}
        onClick={handleCommentToggle}
      >
        <span className="total">
          <b>댓글</b> 0
        </span>
        <span className="cmt_more" />
      </button>

      <section id="bo_vc" style={{ display: commentsOpen ? "block" : "none" }}>
        <h2>댓글목록</h2>
        <p id="bo_vc_empty">등록된 댓글이 없습니다.</p>
      </section>
    </article>
  );
}
