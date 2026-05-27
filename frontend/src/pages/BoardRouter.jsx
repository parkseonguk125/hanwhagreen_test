import { useSearchParams } from "react-router-dom";
import NoticeBoardPage from "./NoticeBoardPage";
import NewsBoardPage from "./NewsBoardPage";
import QaBoardPage from "./QaBoardPage";

export default function BoardRouter() {
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table") || "notice";

  if (table === "qa") {
    return <QaBoardPage />;
  }

  if (table === "news") {
    return <NewsBoardPage />;
  }

  return <NoticeBoardPage />;
}
