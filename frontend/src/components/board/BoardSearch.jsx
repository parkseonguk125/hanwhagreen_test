import { useState } from "react";
import Icon from "../Icons";

export default function BoardSearch({ open, onClose, onSearch, initialField = "wr_subject", initialKeyword = "" }) {
  const [field, setField] = useState(initialField);
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({ field, keyword });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="bo_sch_wrap is-open">
      <fieldset className="bo_sch">
        <h3>검색</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="sfl" className="sound_only">
            검색대상
          </label>
          <select
            name="sfl"
            id="sfl"
            value={field}
            onChange={(event) => setField(event.target.value)}
          >
            <option value="wr_subject">제목</option>
            <option value="wr_content">내용</option>
            <option value="wr_subject||wr_content">제목+내용</option>
          </select>
          <label htmlFor="stx" className="sound_only">
            검색어<strong className="sound_only"> 필수</strong>
          </label>
          <div className="sch_bar">
            <input
              type="text"
              name="stx"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              required
              id="stx"
              className="sch_input"
              size="25"
              maxLength="20"
              placeholder=" 검색어를 입력해주세요"
            />
            <button type="submit" value="검색" className="sch_btn board-icon-btn">
              <Icon name="search" size="sm" />
              <span className="sound_only">검색</span>
            </button>
          </div>
          <button type="button" className="bo_sch_cls board-icon-btn" title="닫기" onClick={onClose}>
            <Icon name="times" size="sm" />
            <span className="sound_only">닫기</span>
          </button>
        </form>
      </fieldset>
      <div className="bo_sch_bg" onClick={onClose} role="presentation" />
    </div>
  );
}
