import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import BoardSearch from "../components/board/BoardSearch";
import BoardToolbar, { BoardWriteBottom } from "../components/board/BoardToolbar";
import { QaBoardList } from "../components/board/BoardListTable";
import BoardView from "../components/board/BoardView";
import { fetchQaPost, fetchQaPosts } from "../services/boardApi";
import { getUnlockedQaPost, isQaPostUnlocked, storeUnlockedQaPost } from "../services/boardAccess";
import { filterPosts } from "../services/boardStorage";
import { boardPasswordRouteTarget } from "../utils/navRoutes";
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

export default function QaBoardPage() {
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const [qaPosts, setQaPosts] = useState([]);
  const [qaLoading, setQaLoading] = useState(!wrId);
  const [qaError, setQaError] = useState("");
  const [viewPost, setViewPost] = useState(null);
  const [viewLoading, setViewLoading] = useState(Boolean(wrId));
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (wrId) return undefined;

    let cancelled = false;
    setQaLoading(true);
    setQaError("");

    fetchQaPosts()
      .then((posts) => {
        if (!cancelled) setQaPosts(posts);
      })
      .catch((error) => {
        if (!cancelled) {
          setQaError(error.message);
          setQaPosts([]);
        }
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
    setQaError("");
    setViewPost(null);
    setNeedsPassword(false);

    fetchQaPost(wrId)
      .then((post) => {
        if (cancelled) return;

        if (post.isSecret) {
          setNeedsPassword(true);
          return;
        }

        storeUnlockedQaPost(post);
        setViewPost(post);
      })
      .catch((error) => {
        if (!cancelled) setQaError(error.message);
      })
      .finally(() => {
        if (!cancelled) setViewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId]);

  const filteredPosts = useMemo(
    () => filterPosts(qaPosts, searchState),
    [qaPosts, searchState]
  );

  const handleSearch = ({ field, keyword }) => {
    setSearchState({ field, keyword });
  };

  const layoutProps = {
    pageId: qaConfig.pageId,
    title: qaConfig.title,
    bannerUrl: qaConfig.banner,
    currentNavTitle: qaConfig.navTitle,
  };

  if (wrId && needsPassword && !isQaPostUnlocked(wrId)) {
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
          <BoardView post={viewPost} table="qa" />
        </SubLayout>
        <Footer />
      </>
    );
  }

  if (wrId && qaError) {
    return (
      <>
        <Header />
        <SubLayout {...layoutProps}>
          <section className="listSkin">
            <div className="inner board-loading">{qaError}</div>
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
                {qaError && !qaLoading && (
                  <p className="board-loading" style={{ color: "#c00" }}>
                    {qaError}
                  </p>
                )}

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
