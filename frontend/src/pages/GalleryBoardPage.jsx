import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import BoardSearch from "../components/board/BoardSearch";
import BoardToolbar from "../components/board/BoardToolbar";
import BoardPagination from "../components/board/BoardPagination";
import ProjectCategoryNav, { scaMatches } from "../components/board/ProjectCategoryNav";
import CertificationGalleryList from "../components/board/CertificationGalleryList";
import CertificationBoardView from "../components/board/CertificationBoardView";
import { boardBanners } from "../config/boardBanners";
import {
  filterPosts,
  getGalleryPost,
  incrementGalleryHits,
  galleryPostsForTable,
} from "../services/boardStorage";
import { boardViewRouteTarget, subNavGroups } from "../utils/navRoutes";
import "../styles/default.css";
import "../styles/board-base.css";
import "../styles/sub-pages.css";
import "../styles/board.css";
import "../styles/board-pages.css";
import "../styles/project-page.css";
import "../styles/certification-page.css";

const galleryConfigs = {
  project: {
    table: "project",
    pageId: "product03",
    title: "주요실적",
    navTitle: "주요실적",
    navGroupIndex: 2,
    pageSize: 15,
    bannerAsBackground: true,
  },
  certification: {
    table: "certification",
    pageId: "product01",
    title: "인증서",
    navTitle: "인증서",
    navGroupIndex: 3,
    parentTitle: "게시판",
    pageSize: 15,
    bannerAsBackground: true,
  },
};

function ProjectGalleryList({ posts, table }) {
  return (
    <div>
      <ul className="listForm">
        {posts.length === 0 ? (
          <li className="empty_list">게시물이 없습니다.</li>
        ) : (
          posts.map((post) => (
            <li key={post.id}>
              <Link to={boardViewRouteTarget(table, post.id)} title={post.subject}>
                <div className="img_box">
                  <img src={post.image} alt={post.subject} />
                </div>
                <div className="text_box">
                  <h2 className="subject">{post.subject} </h2>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ProjectBoardView({ post, table }) {
  const listTarget = `/bbs/board.php?bo_table=${table}`;

  return (
    <article id="bo_v" style={{ width: "100%" }}>
      <section id="bo_v_atc">
        <h2 id="bo_v_atc_title">본문</h2>
        <div id="bo_v_img">
          <img src={post.imageLink || post.image} alt={post.subject} />
        </div>
        <div id="bo_v_con">
          <h3>{post.subject}</h3>
          {post.desc && <p>{post.desc}</p>}
        </div>
      </section>
      <div className="bo_v_btns">
        <Link to={listTarget} className="btn_b01">
          목록
        </Link>
      </div>
    </article>
  );
}

export default function GalleryBoardPage({ table }) {
  const config = galleryConfigs[table];
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const activeSca = searchParams.get("sca") || "";
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const allPosts = useMemo(() => galleryPostsForTable(table), [table]);

  const filteredPosts = useMemo(() => {
    let posts = filterPosts(allPosts, searchState);

    if (table === "project" && activeSca) {
      posts = posts.filter((post) => scaMatches(activeSca, post.categorySca));
    }

    return posts;
  }, [allPosts, searchState, table, activeSca]);

  const pageSize = config?.pageSize ?? 15;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const viewPost = useMemo(
    () => (wrId ? getGalleryPost(table, wrId) : null),
    [table, wrId]
  );

  useEffect(() => {
    if (viewPost) {
      incrementGalleryHits(table, viewPost.id);
      document.title = `${viewPost.subject} > ${config.title} | 한화그린`;
      return () => {
        document.title = "한화그린";
      };
    }
    document.title = `${config.title}  페이지 | 한화그린`;
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost, config?.title]);

  if (!config) {
    return null;
  }

  const parentTitle = config.parentTitle ?? subNavGroups[config.navGroupIndex]?.title ?? "";
  const banner = boardBanners[table];

  if (wrId) {
    if (!viewPost) {
      return (
        <>
          <Header />
          <SubLayout
            pageId={config.pageId}
            title={config.title}
            bannerUrl={banner}
            bannerAsBackground={config.bannerAsBackground}
            visualSubtitle={config.visualSubtitle}
            currentNavTitle={config.navTitle}
            navGroupIndex={config.navGroupIndex}
            parentTitle={parentTitle}
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
          pageId={config.pageId}
          title={config.title}
          bannerUrl={banner}
          bannerAsBackground={config.bannerAsBackground}
          visualSubtitle={config.visualSubtitle}
          currentNavTitle={config.navTitle}
          navGroupIndex={config.navGroupIndex}
          parentTitle={parentTitle}
        >
          <section className="listSkin">
            <div className="inner">
              {table === "certification" ? (
                <CertificationBoardView post={viewPost} table={table} />
              ) : (
                <ProjectBoardView post={viewPost} table={table} />
              )}
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
        pageId={config.pageId}
        title={config.title}
        bannerUrl={banner}
        bannerAsBackground={config.bannerAsBackground}
        visualSubtitle={config.visualSubtitle}
        currentNavTitle={config.navTitle}
        navGroupIndex={config.navGroupIndex}
        parentTitle={parentTitle}
      >
        <section className="listSkin">
          <div className="inner">
            <div id="bo_list" style={{ width: "100%" }}>
              <form id="fboardlist" onSubmit={(event) => event.preventDefault()}>
                <BoardToolbar
                  table={table}
                  showWrite={false}
                  onSearchOpen={() => setSearchOpen(true)}
                />
                {table === "project" && (
                  <ProjectCategoryNav table={table} activeSca={activeSca} />
                )}
                {table === "project" ? (
                  <ProjectGalleryList posts={pagePosts} table={table} />
                ) : (
                  <CertificationGalleryList posts={pagePosts} table={table} />
                )}
                {pagePosts.length > 0 && (
                  <BoardPagination
                    table={table}
                    page={currentPage}
                    totalPages={totalPages}
                    sca={activeSca}
                  />
                )}
              </form>
              <BoardSearch
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSearch={setSearchState}
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
