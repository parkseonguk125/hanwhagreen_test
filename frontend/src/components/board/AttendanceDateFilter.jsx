export default function AttendanceDateFilter({
  workDate = "",
  workMonth = "",
  resultCount = 0,
  loading = false,
  onApplyDate,
  onApplyMonth,
  onReset,
}) {
  return (
    <div className="attendance-date-filter">
      <div className="attendance-date-filter-row">
        <span className="attendance-date-filter-label">작업일</span>
        <input
          type="date"
          className="attendance-date-input"
          value={workDate}
          onChange={(event) => onApplyDate(event.target.value)}
          disabled={loading}
          aria-label="작업일 선택"
        />
        <button
          type="button"
          className="btn_b01 btn attendance-date-btn"
          onClick={onReset}
          disabled={loading || (!workDate && !workMonth)}
        >
          전체 보기
        </button>
      </div>

      <div className="attendance-date-filter-row">
        <span className="attendance-date-filter-label">월별</span>
        <input
          type="month"
          className="attendance-date-input"
          value={workMonth}
          onChange={(event) => onApplyMonth(event.target.value)}
          disabled={loading}
          aria-label="월 선택"
        />
        <span className="attendance-date-filter-count">
          {loading ? "불러오는 중…" : `${resultCount}건`}
        </span>
      </div>
    </div>
  );
}
