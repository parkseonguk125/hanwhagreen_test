import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubLayout from "../components/board/SubLayout";
import CompanyPageContent from "../components/content/CompanyPageContent";
import CeoPageContent from "../components/content/CeoPageContent";
import MapPageContent from "../components/content/MapPageContent";
import TechnologyPageContent from "../components/content/TechnologyPageContent";
import ConstructionPageContent from "../components/content/ConstructionPageContent";
import { getContentPageConfig } from "../config/contentPages";
import { subNavGroups } from "../utils/navRoutes";
import "../styles/default.css";
import "../styles/board-base.css";
import "../styles/sub-pages.css";
import "../styles/content-pages.css";
import "../styles/company-page.css";
import "../styles/ceo-page.css";
import "../styles/map-page.css";
import "../styles/technology-page.css";
import "../styles/technology-page-mobile.css";
import "../styles/construction-page.css";
import "../styles/construction-page-mobile.css";
import "../styles/board-pages.css";

function renderContent(config) {
  switch (config.coId) {
    case "company":
      return <CompanyPageContent config={config} />;
    case "ceo":
      return <CeoPageContent config={config} />;
    case "map":
      return <MapPageContent config={config} />;
    case "technology":
      return <TechnologyPageContent config={config} />;
    case "construction":
      return <ConstructionPageContent />;
    default:
      return null;
  }
}

export default function ContentPage() {
  const [searchParams] = useSearchParams();
  const coId = searchParams.get("co_id") || "";
  const config = getContentPageConfig(coId);

  useEffect(() => {
    if (config) {
      document.title = `${config.title} | 한화그린`;
      return () => {
        document.title = "한화그린";
      };
    }
    document.title = "한화그린";
    return undefined;
  }, [config]);

  if (!config) {
    return (
      <>
        <Header />
        <main className="main">
          <div className="inner board-loading">페이지를 찾을 수 없습니다.</div>
        </main>
        <Footer />
      </>
    );
  }

  const parentTitle = subNavGroups[config.navGroupIndex]?.title ?? "";

  return (
    <>
      <Header />
      <SubLayout
        pageId={config.pageId}
        pageClassName={config.pageClassName}
        title={config.title}
        bannerUrl={config.banner}
        visualSubtitle={config.visualSubtitle}
        bannerAsBackground={config.bannerAsBackground}
        currentNavTitle={config.navTitle}
        navGroupIndex={config.navGroupIndex}
        parentTitle={parentTitle}
      >
        {renderContent(config)}
      </SubLayout>
      <Footer />
    </>
  );
}
