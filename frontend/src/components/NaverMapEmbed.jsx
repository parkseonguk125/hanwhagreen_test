import { useEffect, useRef } from "react";
import { HANWHA_GREEN_LOCATION, getNaverDirectionsUrl } from "../config/mapLinks.js";

const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";
const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID?.trim();

let scriptPromise;

function loadNaverMapScript() {
  if (!CLIENT_ID) {
    return Promise.reject(new Error("VITE_NAVER_MAP_CLIENT_ID 미설정"));
  }
  if (window.naver?.maps) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(NAVER_MAP_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("naver map load failed")));
      return;
    }

    const script = document.createElement("script");
    script.id = NAVER_MAP_SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(CLIENT_ID)}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("naver map load failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function NaverMapEmbed({ className = "", height = 300 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID || !mapRef.current) return undefined;

    let cancelled = false;

    loadNaverMapScript()
      .then(() => {
        if (cancelled || !mapRef.current || !window.naver?.maps) return;

        const center = new window.naver.maps.LatLng(
          HANWHA_GREEN_LOCATION.lat,
          HANWHA_GREEN_LOCATION.lng
        );

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
            center,
            zoom: 16,
            zoomControl: true,
            zoomControlOptions: {
              position: window.naver.maps.Position.TOP_RIGHT,
            },
          });

          const marker = new window.naver.maps.Marker({
            position: center,
            map: mapInstanceRef.current,
            title: HANWHA_GREEN_LOCATION.name,
          });

          const infoWindow = new window.naver.maps.InfoWindow({
            content: [
              '<div class="live-map-infowin">',
              `<strong>${HANWHA_GREEN_LOCATION.name}</strong>`,
              `<p>${HANWHA_GREEN_LOCATION.address}</p>`,
              "</div>",
            ].join(""),
          });

          window.naver.maps.Event.addListener(marker, "click", () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });

          infoWindow.open(mapInstanceRef.current, marker);
          window.naver.maps.Event.trigger(mapInstanceRef.current, "resize");
        } else {
          mapInstanceRef.current.setCenter(center);
        }
      })
      .catch(() => {
        /* offline / key missing — fallback UI below */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID) {
    return (
      <div className={`live-map-fallback ${className}`} style={{ minHeight: height }}>
        <p>네이버 지도 API 키가 설정되지 않았습니다.</p>
        <a href={getNaverDirectionsUrl()} target="_blank" rel="noopener noreferrer">
          네이버 지도에서 위치 보기
        </a>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`live-map-embed ${className}`}
      style={{
        width: "100%",
        ...(height != null ? { height } : { height: "100%" }),
      }}
      role="img"
      aria-label={`${HANWHA_GREEN_LOCATION.name} 위치 지도`}
    />
  );
}
