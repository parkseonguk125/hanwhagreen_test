import { useEffect, useRef, useState } from "react";
import DetailButton from "./DetailButton";
import Icon from "./Icons";
import { areaTabs, assets, introLines } from "../data/mock";

export default function AreaSection() {
  const [activeTab, setActiveTab] = useState(0);
  const titleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".area_tit_ani").forEach((el, i) => {
            setTimeout(() => el.classList.add("on"), i * 180);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="section area">
      <div className="inner">
        <div className="area_tit_wrap" ref={titleRef}>
          <div className="area_tit">
            {introLines.map((line) => (
              <div className="area_tit_ani" key={line}>
                <p className="title">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="area_contents">
          <div className="area_con_wrap">
            <div className="area_tab">
              <ul>
                {areaTabs.map((tab) => (
                  <li
                    key={tab.id}
                    className={activeTab === tab.id ? "on" : ""}
                    style={{ width: "33.3%" }}
                    onMouseEnter={() => setActiveTab(tab.id)}
                    onFocus={() => setActiveTab(tab.id)}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </li>
                ))}
              </ul>
            </div>

            {areaTabs.map((tab) => (
              <div
                key={tab.id}
                className={`area_con background ${activeTab === tab.id ? "on" : ""}`}
                style={{
                  backgroundImage: `url('${assets.areaPanels[tab.id]}')`,
                }}
              >
                <div className="area_con_tit">
                  <Icon name="eco-energy" size="xl" className="area-eco-icon" />
                  <p dangerouslySetInnerHTML={{ __html: tab.text }} />
                  <DetailButton />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
