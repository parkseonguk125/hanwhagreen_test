import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import BoardSearch from "../components/board/BoardSearch";
import BoardToolbar from "../components/board/BoardToolbar";
import NoticeBoardList from "../components/board/BoardListTable";
import BoardView from "../components/board/BoardView";
import {
  filterPosts,
  getNoticePost,
  incrementNoticeHits,
  noticePosts,
} from "../services/boardStorage";
import "../styles/default.css";
import "../styles/board-base.css";
import "../styles/sub-pages.css";
import "../styles/board.css";
import "../styles/board-pages.css";
import "../styles/notice-skin.css";

const ASSET = "https://hanwhagreen.com";

const noticeConfig = {
  pageId: "board_list01",
  title: "공지사항",
  navTitle: "공지사항",
  banner: `${ASSET}/theme/FT_WEB50/img/notice_banner.jpg`,
};

export default function NoticeBoardPage() {
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });

  const filteredPosts = useMemo(
    () => filterPosts(noticePosts, searchState),
    [searchState]
  );

  const handleSearch = ({ field, keyword }) => {
    setSearchState({ field, keyword });
  };

  const viewPost = useMemo(() => (wrId ? getNoticePost(wrId) : null), [wrId]);

  useEffect(() => {
    if (wrId) incrementNoticeHits(wrId);
  }, [wrId]);

  if (wrId) {
    if (!viewPost) {
      return (
        <>
          <Header />
          <SubLayout
            pageId={noticeConfig.pageId}
            title={noticeConfig.title}
            bannerUrl={noticeConfig.banner}
            currentNavTitle={noticeConfig.navTitle}
          >
            <section className="listSkin">
              <div className="inner board-loading">게시물을 찾을 수 없습니다.</div>
            </section>
          </SubLayout>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Header />
        <SubLayout
          pageId={noticeConfig.pageId}
          title={noticeConfig.title}
          bannerUrl={noticeConfig.banner}
          currentNavTitle={noticeConfig.navTitle}
        >
          <BoardView post={viewPost} table="notice" />
        </SubLayout>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <SubLayout
        pageId={noticeConfig.pageId}
        title={noticeConfig.title}
        bannerUrl={noticeConfig.banner}
        currentNavTitle={noticeConfig.navTitle}
      >
        <section className="listSkin">
          <div className="inner">
            <div id="bo_list" style={{ width: "100%" }}>
              <form id="fboardlist" onSubmit={(event) => event.preventDefault()}>
                <BoardToolbar table="notice" showWrite={false} onSearchOpen={() => setSearchOpen(true)} />
                <NoticeBoardList posts={filteredPosts} />
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
