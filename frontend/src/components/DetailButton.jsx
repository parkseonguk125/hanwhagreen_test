import Icon from "./Icons";

export default function DetailButton({ onClick, href = "#" }) {
  const handleClick = (e) => {
    e.preventDefault();
    onClick?.(e);
  };

  return (
    <a href={href} className="detail-link" onClick={handleClick}>
      <div className="ani_btn">
        <p>자세히 보기</p>
        <Icon name="chevron-right" size="md" className="ani-btn-icon" />
      </div>
    </a>
  );
}
