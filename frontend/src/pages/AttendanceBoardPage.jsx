import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import BoardSearch from "../components/board/BoardSearch";
import BoardToolbar from "../components/board/BoardToolbar";
import { AttendanceBoardList } from "../components/board/BoardListTable";
import AttendanceBoardView from "../components/board/AttendanceBoardView";
import { boardBanners } from "../config/boardBanners";
import { fetchAttendancePost, fetchAttendancePosts } from "../services/boardApi";
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
import "../styles/attendance-board-mobile.css";

const attendanceConfig = {
  pageId: "board_list_attendance",
  title: "출결서비스",
  navTitle: "출결서비스",
  banner: boardBanners.attendance,
};

function attendanceLoginPath(wrId) {
  const returnPath = `/bbs/board.php?bo_table=attendance&wr_id=${wrId}`;
  return `/bbs/login.php?url=${encodeURIComponent(returnPath)}`;
}

export default function AttendanceBoardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const [posts, setPosts] = useState([]);
  const [listLoading, setListLoading] = useState(!wrId);
  const [viewPost, setViewPost] = useState(null);
  const [viewLoading, setViewLoading] = useState(Boolean(wrId));
  const [viewMissing, setViewMissing] = useState(false);

  useEffect(() => {
    if (wrId) return undefined;

    let cancelled = false;
    setListLoading(true);

    fetchAttendancePosts()
      .then((items) => {
        if (!cancelled) setPosts(items);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
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

    if (!isAdmin()) {
      navigate(attendanceLoginPath(wrId), { replace: true });
      return undefined;
    }

    let cancelled = false;
    setViewLoading(true);
    setViewMissing(false);
    setViewPost(null);

    fetchAttendancePost(wrId)
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
  }, [wrId, navigate]);

  const filteredPosts = useMemo(
    () => filterPosts(posts, searchState),
    [posts, searchState]
  );

  const handleSearch = ({ field, keyword }) => {
    setSearchState({ field, keyword });
  };

  useEffect(() => {
    if (viewPost) {
      document.title = `${viewPost.listSubject || viewPost.subject} > 출결서비스 | 한화그린`;
      return () => {
        document.title = "한화그린";
      };
    }

    document.title = "출결서비스 페이지 | 한화그린";
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  const layoutProps = {
    pageId: attendanceConfig.pageId,
    pageClassName: "notice-page attendance-page",
    title: attendanceConfig.title,
    bannerUrl: attendanceConfig.banner,
    currentNavTitle: attendanceConfig.navTitle,
    navGroupIndex: 4,
  };

  if (wrId) {
    if (viewLoading) {
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

    if (viewMissing || !viewPost) {
      return (
        <>
          <Header />
          <SubLayout {...layoutProps}>
            <section className="listSkin">
              <div className="inner board-loading">출결 기록을 찾을 수 없습니다.</div>
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
          <AttendanceBoardView post={viewPost} />
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
            <p className="attendance-list-notice">
              출결 기록 목록입니다. 상세 내용(GPS·작업내용·사진)은 관리자 로그인 후 열람할 수
              있습니다.
            </p>
            <div id="bo_list" style={{ width: "100%" }}>
              <form id="fboardlist" onSubmit={(event) => event.preventDefault()}>
                <BoardToolbar
                  table="attendance"
                  showWrite={false}
                  onSearchOpen={() => setSearchOpen(true)}
                />
                {listLoading && <p className="board-loading">불러오는 중...</p>}
                {!listLoading && <AttendanceBoardList posts={filteredPosts} />}
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
