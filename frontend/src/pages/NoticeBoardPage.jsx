import { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import Header from "../components/Header";

import Footer from "../components/Footer";

import SubLayout from "../components/board/SubLayout";

import BoardSearch from "../components/board/BoardSearch";

import BoardToolbar from "../components/board/BoardToolbar";

import NoticeBoardList from "../components/board/BoardListTable";

import NoticeBoardView from "../components/board/NoticeBoardView";

import { boardBanners } from "../config/boardBanners";
import { fetchNoticePost, fetchNoticePosts } from "../services/boardApi";
import { isAdmin } from "../services/authAccess";

import { filterPosts } from "../services/boardStorage";

import "../styles/default.css";

import "../styles/board-base.css";

import "../styles/sub-pages.css";

import "../styles/board.css";

import "../styles/board-pages.css";

import "../styles/notice-skin.css";

import "../styles/notice-view.css";

import "../styles/notice-board-mobile.css";



const noticeConfig = {

  pageId: "board_list01",

  title: "공지사항",

  navTitle: "공지사항",

  banner: boardBanners.notice,

};



export default function NoticeBoardPage() {

  const [searchParams] = useSearchParams();

  const wrId = searchParams.get("wr_id");



  const [searchOpen, setSearchOpen] = useState(false);

  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });

  const [noticePosts, setNoticePosts] = useState([]);

  const [listLoading, setListLoading] = useState(!wrId);

  const [viewPost, setViewPost] = useState(null);

  const [viewLoading, setViewLoading] = useState(Boolean(wrId));

  const [viewMissing, setViewMissing] = useState(false);



  useEffect(() => {

    if (wrId) return undefined;



    let cancelled = false;

    setListLoading(true);



    fetchNoticePosts()

      .then((posts) => {

        if (!cancelled) setNoticePosts(posts);

      })

      .finally(() => {

        if (!cancelled) setListLoading(false);

      });



    return () => {

      cancelled = true;

    };

  }, [wrId]);



  useEffect(() => {

    if (!wrId) {

      setViewPost(null);

      setViewLoading(false);

      setViewMissing(false);

      return undefined;

    }



    let cancelled = false;

    setViewLoading(true);

    setViewMissing(false);

    setViewPost(null);



    fetchNoticePost(wrId)

      .then((post) => {

        if (!cancelled) setViewPost(post);

      })

      .catch(() => {

        if (!cancelled) setViewMissing(true);

      })

      .finally(() => {

        if (!cancelled) setViewLoading(false);

      });



    return () => {

      cancelled = true;

    };

  }, [wrId]);



  const filteredPosts = useMemo(

    () => filterPosts(noticePosts, searchState),

    [noticePosts, searchState]

  );



  const handleSearch = ({ field, keyword }) => {

    setSearchState({ field, keyword });

  };



  useEffect(() => {

    if (viewPost) {

      document.title = `${viewPost.subject} > 공지사항 | 한화그린`;

      return () => {

        document.title = "한화그린";

      };

    }



    document.title = "공지사항  페이지 | 한화그린";

    return () => {

      document.title = "한화그린";

    };

  }, [viewPost]);



  if (wrId) {

    if (viewLoading) {

      return (

        <>

          <Header />

          <SubLayout

            pageId={noticeConfig.pageId}

            pageClassName="notice-page"

            title={noticeConfig.title}

            bannerUrl={noticeConfig.banner}

            currentNavTitle={noticeConfig.navTitle}
            navGroupIndex={4}

          >

            <section className="listSkin">

              <div className="inner board-loading">불러오는 중...</div>

            </section>

          </SubLayout>

          <Footer />

        </>

      );

    }



    if (viewMissing || !viewPost) {

      return (

        <>

          <Header />

          <SubLayout

            pageId={noticeConfig.pageId}

            pageClassName="notice-page"

            title={noticeConfig.title}

            bannerUrl={noticeConfig.banner}

            currentNavTitle={noticeConfig.navTitle}
            navGroupIndex={4}

          >

            <section className="listSkin">

              <div className="inner board-loading">

                게시물을 찾을 수 없습니다.

              </div>

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

          pageClassName="notice-page"

          title={noticeConfig.title}

          bannerUrl={noticeConfig.banner}

          currentNavTitle={noticeConfig.navTitle}
          navGroupIndex={4}

        >

          <NoticeBoardView post={viewPost} table="notice" />

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

        pageClassName="notice-page"

        title={noticeConfig.title}

        bannerUrl={noticeConfig.banner}

        currentNavTitle={noticeConfig.navTitle}
        navGroupIndex={4}

      >

        <section className="listSkin">

          <div className="inner">

            <div id="bo_list" style={{ width: "100%" }}>

              <form id="fboardlist" onSubmit={(event) => event.preventDefault()}>

                <BoardToolbar
                  table="notice"
                  showWrite={isAdmin()}
                  onSearchOpen={() => setSearchOpen(true)}
                />

                {listLoading && <p className="board-loading">불러오는 중...</p>}

                {!listLoading && <NoticeBoardList posts={filteredPosts} />}

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

