import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Icon from "./Icons";
import "swiper/css";
import "swiper/css/navigation";
import { projects } from "../data/mock";

export default function Product() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const stop = (e) => e.preventDefault();

  return (
    <div className="section product">
      <div className="inner">
        <div className="pro_tit">
          <dl>
            <dt className="title">한화그린 주요실적</dt>
            <dd>주요실적 현황</dd>
          </dl>
          <div className="pro_controll">
            <a href="#" onClick={stop}>
              자세히 보기
            </a>
            <div className="pro_arrow">
              <button
                ref={prevRef}
                type="button"
                className="slick-arrow pro-arrow-btn"
                aria-label="이전"
              >
                <Icon name="chevron-left" size="md" />
              </button>
              <button
                ref={nextRef}
                type="button"
                className="slick-arrow pro-arrow-btn"
                aria-label="다음"
              >
                <Icon name="chevron-right" size="md" />
              </button>
            </div>
          </div>
        </div>

        <div className="pro_contents">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            slidesPerView={1.2}
            spaceBetween={20}
            breakpoints={{
              768: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1400: { slidesPerView: 4 },
            }}
            className="pro_slick"
            watchSlidesProgress
          >
            {projects.map((item) => (
              <SwiperSlide key={item.title}>
                <div className="pro_con">
                  <a href="#" onClick={stop}>
                    <div className="pro_con_img">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <p>{item.title}</p>
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
