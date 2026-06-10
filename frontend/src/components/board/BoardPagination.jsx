import { Link } from "react-router-dom";
import { buildBoardUrl } from "../../utils/boardSca";

const WRITE_PAGES = 10;

function getPageRange(page, totalPages) {
  if (page <= WRITE_PAGES) {
    return { startPage: 1, endPage: Math.min(WRITE_PAGES, totalPages) };
  }
  const startPage = Math.floor((page - 1) / WRITE_PAGES) * WRITE_PAGES + 1;
  return { startPage, endPage: Math.min(startPage + WRITE_PAGES - 1, totalPages) };
}

export default function BoardPagination({ table, page, totalPages, sca = "" }) {
  if (totalPages <= 1) return null;

  const { startPage, endPage } = getPageRange(page, totalPages);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  const showStart = page > 1;
  const showPrev = page > WRITE_PAGES;
  const showNext = endPage < totalPages;
  const showEnd = page < totalPages;

  return (
    <nav className="pg_wrap">
      <span className="pg">
        {(showStart || showPrev) && (
          <span className="pg_arrow_group pg_arrow_group--start">
            {showStart && (
              <Link to={buildBoardUrl(table, { page: 1, sca })} className="pg_page pg_start">
                처음
              </Link>
            )}
            {showPrev && (
              <Link
                to={buildBoardUrl(table, { page: startPage - 1, sca })}
                className="pg_page pg_prev"
              >
                이전
              </Link>
            )}
          </span>
        )}
        {pages.map((current) =>
          current === page ? (
            <strong key={current} className="pg_current">
              {current === startPage ? <span className="sound_only">열린</span> : null}
              {current}
              <span className="sound_only">페이지</span>
            </strong>
          ) : (
            <Link key={current} to={buildBoardUrl(table, { page: current, sca })} className="pg_page">
              {current}
              <span className="sound_only">페이지</span>
            </Link>
          )
        )}
        {(showNext || showEnd) && (
          <span className="pg_arrow_group pg_arrow_group--end">
            {showNext && (
              <Link
                to={buildBoardUrl(table, { page: endPage + 1, sca })}
                className="pg_page pg_next"
              >
                다음
              </Link>
            )}
            {showEnd && (
              <Link to={buildBoardUrl(table, { page: totalPages, sca })} className="pg_page pg_end">
                맨끝
              </Link>
            )}
          </span>
        )}
      </span>
    </nav>
  );
}

