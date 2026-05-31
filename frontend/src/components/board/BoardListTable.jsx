import { Link } from "react-router-dom";
import Icon from "../Icons";
import { isAdmin } from "../../services/authAccess";
import { boardPasswordRouteTarget, boardRouteTarget, boardViewRouteTarget, parseAppHref } from "../../utils/navRoutes";

export default function NoticeBoardList({ posts }) {
  const listUrl = boardRouteTarget("notice");

  return (
    <div className="tbl_head01 tbl_wrap">
      <table>
        <caption>공지사항 목록</caption>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">제목</th>
            <th scope="col" className="col4">
              글쓴이
            </th>
            <th scope="col" className="col5">
              <Link to={{ ...listUrl, search: "?bo_table=notice&sst=wr_hit&sod=desc" }}>조회 </Link>
            </th>
            <th scope="col" className="col6">
              <Link to={{ ...listUrl, search: "?bo_table=notice&sst=wr_datetime&sod=desc" }}>날짜 </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="5">게시물이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr
                key={post.id}
                className={`${post.isNotice ? "bo_notice" : ""} ${index % 2 ? "even" : ""}`.trim()}
              >
                <td className="td_num2">
                  {post.isNotice ? (
                    <strong className="notice_icon">공지</strong>
                  ) : (
                    post.id
                  )}
                </td>
                <td className="td_subject" style={{ paddingLeft: 0 }}>
                  <div className="bo_tit">
                    <Link to={boardViewRouteTarget("notice", post.id)}>{post.subject}</Link>
                  </div>
                </td>
                <td className="td_name sv_use">
                  <span className="sv_member">{post.author}</span>
                </td>
                <td className="td_num">{post.hits}</td>
                <td className="td_datetime">{post.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function NewsBoardList({ posts }) {
  return (
    <div className="tbl_head01 tbl_wrap">
      <table>
        <caption>홍보영 목록</caption>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="5">게시물이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} className={index % 2 ? "even" : ""}>
                <td className="td_num2">{post.id}</td>
                <td className="td_subject" style={{ paddingLeft: 0 }}>
                  <div className="bo_tit">
                    <Link to={boardViewRouteTarget("news", post.id)}>
                      {post.listSubject || post.subject}
                    </Link>
                    <i className="fa fa-heart" aria-hidden="true" />
                    <i className="fa fa-download" aria-hidden="true" />
                    <i className="fa fa-link" aria-hidden="true" />
                  </div>
                </td>
                <td className="td_name sv_use">
                  <span className="sv_member">{post.author}</span>
                </td>
                <td className="td_num">{post.hits}</td>
                <td className="td_datetime">{post.listDate || post.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function QaBoardList({ posts }) {
  const listUrl = boardRouteTarget("qa");
  const adminLoggedIn = isAdmin();

  return (
    <div className="tbl_head01 tbl_wrap">
      <table>
        <caption>고객지원 목록</caption>
        <thead>
          <tr>
            <th scope="col">진행상황</th>
            <th scope="col">제목</th>
            <th scope="col" className="col4">
              글쓴이
            </th>
            <th scope="col" className="col5">
              <Link to={{ ...listUrl, search: "?bo_table=qa&sst=wr_hit&sod=desc" }}>조회 </Link>
            </th>
            <th scope="col" className="col6">
              <Link to={{ ...listUrl, search: "?bo_table=qa&sst=wr_datetime&sod=desc" }}>날짜 </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="5">게시물이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} className={index % 2 ? "even" : ""}>
                <td className="td_num2">
                  <p>
                    <span className="icon">
                      <Icon name="message" size="sm" />
                    </span>
                    <span className="text">{post.status}</span>
                  </p>
                </td>
                <td className="td_subject" style={{ paddingLeft: 0 }}>
                  <div className="bo_tit">
                    <Link
                      to={
                        post.isSecret && !adminLoggedIn
                          ? boardPasswordRouteTarget("qa", post.id)
                          : boardViewRouteTarget("qa", post.id)
                      }
                    >
                      {post.isSecret && (
                        <span className="bo-lock-icon" aria-hidden="true">
                          <Icon name="lock" size="sm" />
                        </span>
                      )}
                      {post.subject}
                    </Link>
                  </div>
                </td>
                <td className="td_name sv_use">
                  <span className="sv_guest">{post.author}</span>
                </td>
                <td className="td_num">{post.hits}</td>
                <td className="td_datetime">{post.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
