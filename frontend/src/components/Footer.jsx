import { useEffect, useState } from "react";
import Icon from "./Icons";
import SlideToggle from "./common/SlideToggle";
import { assets, footerInfo } from "../data/mock";

export default function Footer() {
  const [familyOpen, setFamilyOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stop = (e) => e.preventDefault();

  return (
    <>
      <footer id="footer">
        <div className="foo-inner">
          <div className="logo">
            <img src={assets.logoBlack} alt="logo" />
          </div>
          <div className="foo-info">
            <div className="foo-tp">
              <ul>
                <li>
                  <a href="#" onClick={stop}>
                    회사소개
                  </a>
                </li>
                <li>
                  <a href="#" onClick={stop}>
                    보유기술
                  </a>
                </li>
                <li>
                  <a
                    href="https://map.naver.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    오시는길
                  </a>
                </li>
              </ul>
              <div
                className="family-tab"
                onClick={() => setFamilyOpen((v) => !v)}
              >
                <p>FAMILY SITE</p>
                <Icon name="chevron-right" size="md" className="family-icon" />
                <SlideToggle open={familyOpen} as="ul" className="f-tab">
                  <li>
                    <a href="https://www.naver.com/" target="_blank" rel="noopener noreferrer">
                      NAVER
                    </a>
                  </li>
                  <li>
                    <a href="https://www.google.com/" target="_blank" rel="noopener noreferrer">
                      GOOGLE
                    </a>
                  </li>
                  <li>
                    <a href="https://www.daum.net/" target="_blank" rel="noopener noreferrer">
                      DAUM
                    </a>
                  </li>
                </SlideToggle>
              </div>
            </div>
            <div className="foo-btm">
              <ul className="foo-lt">
                <li>{footerInfo.address}</li>
                <li>{footerInfo.email}</li>
                <li>Copyright © (주)한화그린 All Rights Reserved.</li>
              </ul>
              <div className="foo-rt">
                <ul className="phone">
                  <li>대표전화 {footerInfo.phone}</li>
                  <li>{footerInfo.hours}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showTop && (
        <button
          type="button"
          className="top-scroll-btn"
          aria-label="상단으로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Icon name="arrow-up" size="lg" />
          <span>상단으로</span>
        </button>
      )}
    </>
  );
}
