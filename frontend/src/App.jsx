import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BoardRouter from "./pages/BoardRouter";
import BoardWritePage from "./pages/BoardWritePage";
import BoardPasswordPage from "./pages/BoardPasswordPage";
import LoginPage from "./pages/LoginPage";
import NewsLinkPage from "./pages/NewsLinkPage";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bbs/board.php" element={<BoardRouter />} />
        <Route path="/bbs/write.php" element={<BoardWritePage />} />
        <Route path="/bbs/password.php" element={<BoardPasswordPage />} />
        <Route path="/bbs/login.php" element={<LoginPage />} />
        <Route path="/bbs/link.php" element={<NewsLinkPage />} />
      </Routes>
    </>
  );
}
