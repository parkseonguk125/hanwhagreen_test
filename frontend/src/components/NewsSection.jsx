import { Link } from "react-router-dom";
import { notices, promoVideos } from "../data/mock";
import Icon from "./Icons";
import { boardRouteTarget, boardViewRouteTarget } from "../utils/navRoutes";

export default function NewsSection() {
  const noticeRoute = boardRouteTarget("notice");

  return (
    <div className="section news" id="home-news">
      <div className="inner">
        <div className="news_lt">
          <div className="news_tit">
            <p className="title">홍보영상</p>
            <Link to={boardRouteTarget("news")}>
              <span>+</span>
            </Link>
          </div>
          <div className="news_contents">
            <ul>
              {promoVideos.map((video) => (
                <li key={video.id}>
                  <Link to={boardViewRouteTarget("news", video.id)}>
                    <img src={video.image} alt={video.title} />
                    <dl>
                      <dt>{video.title}</dt>
                      <dd>{video.desc}</dd>
                    </dl>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="news_rt">
          <div className="news_tit">
            <p className="title">공지사항</p>
            <Link to={noticeRoute}>
              <span>+</span>
            </Link>          </div>
          <div className="news_contents2">
            <ul>
              {notices.map((item) => (
                <li key={item.title}>
                  <Link to={noticeRoute}>                    <p>
                      <strong>
                        <Icon name="mega-phone" size="md" className="notice-icon" />
                        {item.title}
                      </strong>
                    </p>
                    <span>{item.date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
