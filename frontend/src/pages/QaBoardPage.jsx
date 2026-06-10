import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import BoardSearch from "../components/board/BoardSearch";
import BoardToolbar, { BoardWriteBottom } from "../components/board/BoardToolbar";
import { QaBoardList } from "../components/board/BoardListTable";
import NoticeBoardView from "../components/board/NoticeBoardView";
import { fetchQaPost, fetchQaPosts } from "../services/boardApi";
import { getUnlockedQaPost, isQaPostUnlocked, storeUnlockedQaPost } from "../services/boardAccess";
import { isAdmin } from "../services/authAccess";
import { filterPosts } from "../services/boardStorage";
import { boardBanners } from "../config/boardBanners";
import { boardPasswordRouteTarget } from "../utils/navRoutes";
import "../styles/default.css";
import "../styles/board-base.css";
import "../styles/sub-pages.css";
import "../styles/board.css";
import "../styles/board-pages.css";
import "../styles/qna-skin.css";
import "../styles/notice-view.css";
import "../styles/qa-board-mobile.css";

const qaConfig = {
  pageId: "qna",
  title: "온라인문의",
  navTitle: "온라인문의",
  banner: boardBanners.qa,
};

export default function QaBoardPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");
  const adminLoggedIn = isAdmin();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const [qaPosts, setQaPosts] = useState([]);
  const [qaLoading, setQaLoading] = useState(!wrId);
  const [viewPost, setViewPost] = useState(() => (wrId ? getUnlockedQaPost(wrId) : null));
  const [viewLoading, setViewLoading] = useState(() => Boolean(wrId) && !getUnlockedQaPost(wrId));
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (wrId) return undefined;

    let cancelled = false;
    setQaLoading(true);

    fetchQaPosts()
      .then((posts) => {
        if (!cancelled) setQaPosts(posts);
      })
      .finally(() => {
        if (!cancelled) setQaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId]);

  useEffect(() => {
    if (!wrId) {
      setViewPost(null);
      setNeedsPassword(false);
      setViewLoading(false);
      return undefined;
    }

    const unlockedPost = getUnlockedQaPost(wrId);
    if (unlockedPost) {
      setViewPost(unlockedPost);
      setViewLoading(false);
      setNeedsPassword(false);
      return undefined;
    }

    let cancelled = false;
    setViewLoading(true);
    setViewPost(null);
    setNeedsPassword(false);

    fetchQaPost(wrId)
      .then((post) => {
        if (cancelled) return;

        if (post.isSecret && !post.content) {
          setNeedsPassword(true);
          return;
        }

        storeUnlockedQaPost(post);
        setViewPost(post);
      })
      .finally(() => {
        if (!cancelled) setViewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId, adminLoggedIn, location.pathname, location.search]);

  useEffect(() => {
    if (!viewPost) return undefined;

    document.title = `${viewPost.subject} > 온라인문의 | 한화그린`;
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  const filteredPosts = useMemo(
    () => filterPosts(qaPosts, searchState),
    [qaPosts, searchState]
  );

  const handleSearch = ({ field, keyword }) => {
    setSearchState({ field, keyword });
  };

  const layoutProps = {
    pageId: qaConfig.pageId,
    pageClassName: "qa-page",
    title: qaConfig.title,
    bannerUrl: qaConfig.banner,
    currentNavTitle: qaConfig.navTitle,
    navGroupIndex: 4,
  };

  if (wrId && needsPassword && !isQaPostUnlocked(wrId) && !adminLoggedIn) {
    return <Navigate to={boardPasswordRouteTarget("qa", wrId)} replace />;
  }

  if (wrId && viewLoading) {
    return (
      <>
        <Header />
        <SubLayout {...layoutProps}>
          <section className="listSkin">
            <div className="inner board-loading">불러오는 중...</div>
          </section>
        </SubLayout>
        <Footer />
      </>
    );
  }

  if (wrId && viewPost) {
    return (
      <>
        <Header />
        <SubLayout {...layoutProps}>
          <NoticeBoardView post={viewPost} table="qa" />
        </SubLayout>
        <Footer />
      </>
    );
  }

  if (wrId) {
    return (
      <>
        <Header />
        <SubLayout {...layoutProps}>
          <section className="listSkin">
            <div className="inner board-loading">게시물을 불러올 수 없습니다.</div>
          </section>
        </SubLayout>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <SubLayout {...layoutProps}>
        <section className="listSkin">
          <div className="inner">
            <div id="bo_list" style={{ width: "100%" }}>
              <form id="fboardlist" onSubmit={(event) => event.preventDefault()}>
                <BoardToolbar
                  table="qa"
                  showWrite
                  onSearchOpen={() => setSearchOpen(true)}
                />

                {qaLoading && <p className="board-loading">불러오는 중...</p>}

                {!qaLoading && <QaBoardList posts={filteredPosts} />}
                <BoardWriteBottom table="qa" />
              </form>

              <BoardSearch
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSearch={handleSearch}
                initialField={searchState.field}
                initialKeyword={searchState.keyword}
              />
            </div>
          </div>
        </section>
      </SubLayout>
      <Footer />
    </>
  );
}
