import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { NewsBoardList } from "../components/board/BoardListTable";
import NewsBoardView from "../components/board/NewsBoardView";
import {
  getNewsPost,
  incrementNewsHits,
  newsPosts,
} from "../services/boardStorage";
import "../styles/default.css";
import "../styles/board-base.css";
import "../styles/board-pages.css";
import "../styles/notice-skin.css";
import "../styles/news-board.css";

export default function NewsBoardPage() {
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");
  const viewPost = useMemo(() => (wrId ? getNewsPost(wrId) : null), [wrId]);

  useEffect(() => {
    if (viewPost) {
      document.title = `${viewPost.subject} > 홍보영 | 한화그린`;
      incrementNewsHits(viewPost.id);
      return () => {
        document.title = "한화그린";
      };
    }

    document.title = "홍보영  페이지 | 한화그린";
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  if (wrId) {
    if (!viewPost) {
      return (
        <>
          <Header />
          <main className="main news-board-page">
            <div className="news-view-wrap">
              <p className="news-board-empty">게시물을 찾을 수 없습니다.</p>
            </div>
          </main>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Header />
        <main className="main news-board-page">
          <div className="news-view-wrap">
            <NewsBoardView post={viewPost} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="main news-board-page sub">
        <div className="news-view-wrap news-list-wrap">
          <div id="bo_list" style={{ width: "100%" }}>
            <NewsBoardList posts={newsPosts} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
