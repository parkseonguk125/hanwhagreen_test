import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import DetailButton from "./DetailButton";
import Icon from "./Icons";
import "swiper/css";
import "swiper/css/navigation";
import { assets, certificates } from "../data/mock";

export default function CertGallery() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const stop = (e) => e.preventDefault();

  return (
    <div
      className="section gallery background"
      style={{ backgroundImage: `url('${assets.galleryBg}')` }}
    >
      <div className="inner">
        <div className="gall_tit">
          <div className="gall_tit_ani">
            <p className="title">한화그린</p>
            <p className="title">인증서 및 특허증</p>
          </div>
          <div className="gall_arrow">
            <button
              ref={prevRef}
              type="button"
              className="slick-arrow gall-arrow-btn"
              aria-label="이전"
            >
              <Icon name="chevron-left" size="md" />
            </button>
            <button
              ref={nextRef}
              type="button"
              className="slick-arrow gall-arrow-btn"
              aria-label="다음"
            >
              <Icon name="chevron-right" size="md" />
            </button>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ backgroundSize: `${progress}% 100%` }}
          >
            <span className="sr-only">슬라이드 진행률</span>
          </div>
          <DetailButton />
        </div>

        <div className="gall_con_wrap">
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
            onProgress={(swiper) => {
              setProgress(Math.max(5, Math.abs(swiper.progress) * 100));
            }}
            slidesPerView={1.3}
            spaceBetween={10}
            breakpoints={{
              768: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1400: { slidesPerView: 4 },
            }}
            className="gall_contents"
          >
            {certificates.map((cert) => (
              <SwiperSlide key={cert.title}>
                <div className="gall_con">
                  <a href="#" onClick={stop}>
                    <img src={cert.image} alt={cert.title} />
                    <dl>
                      <dt style={{ color: "black" }}>{cert.title}</dt>
                      <dd style={{ color: "#ccc" }}>{cert.desc}</dd>
                    </dl>
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
