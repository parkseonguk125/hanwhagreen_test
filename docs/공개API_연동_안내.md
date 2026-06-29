# 공개 API 연동 안내 (초보자용)

홈 첫 화면 **실시간 정보** 섹션(날씨·미세먼지·주가·네이버 지도)을 쓰려면 외부 API 키를 발급받아 `.env`에 넣어야 합니다.

---

## 1. 전체 구조

```
[브라우저] → Nginx(8081) → /api/live/* → Express API → 공공데이터포털 (날씨·미세먼지)
                                                      → 한국투자증권 Open API (주가)
[브라우저] → Daum roughmap (지도)
```

- **공공데이터 `serviceKey`는 백엔드에만** 넣습니다. Git에 올리지 마세요.
- **KIS App Key/Secret**도 백엔드 `.env`에만 넣습니다.

---

## 2. 공공데이터포털 키 발급

### 2-1. 회원가입

1. [data.go.kr](https://www.data.go.kr) 접속 후 회원가입·로그인
2. **마이페이지 → 데이터활용 → Open API** 에서 **일반 인증키(Decoding)** 복사

### 2-2. API 3종 활용신청 (각각 "활용신청" 클릭)

| 기능 | 검색어 / 서비스명 |
|------|-------------------|
| 날씨 | **기상청_단기예보 조회서비스** |
| 미세먼지 | **한국환경공단_에어코리아_대기오염정보** |

> 주가는 **한국투자증권 Open API**로 실시간 조회합니다. (아래 2-4절)  
> KIS 키가 없으면 **금융위원회_주식시세정보**(종가)로 대체됩니다.

### 2-4. 한국투자증권 Open API (실시간 주가)

1. [KIS Developers](https://apiportal.koreainvestment.com) 접속 → 회원가입
2. **앱 등록** → `App Key`, `App Secret` 발급
3. **국내주식** 시세 API 사용 신청 (모의투자만 쓸 경우 `KIS_USE_VTS=1`)

`.env` 추가:

```env
KIS_APP_KEY=발급받은_App_Key
KIS_APP_SECRET=발급받은_App_Secret
# 모의투자 서버 사용 시
# KIS_USE_VTS=1
```

| 기능 | 검색어 / 서비스명 (KIS 미설정 시 대체) |
|------|-------------------|
| 주가(대체) | **금융위원회_주식시세정보** |

개발 단계는 대부분 **자동승인**됩니다.

### 2-3. `.env` 설정

프로젝트 루트 `.env` 파일에 추가:

```env
DATA_GO_KR_SERVICE_KEY=여기에_일반인증키_Decoding_값
# LIVE_DATA_CACHE_MS=600000
```

---

## 3. 네이버 지도 Client ID 발급

1. [NCP 콘솔](https://console.ncloud.com) 로그인
2. **AI·NAVER API → Application** → Maps 등록
3. **Web Dynamic Map** 선택
4. 서비스 URL에 다음 등록:
   - `http://localhost:8081`
   - 배포 도메인 (예: `https://your-domain.com`)
5. 발급된 **Client ID** 복사

### `.env`에 추가

```env
VITE_NAVER_MAP_CLIENT_ID=발급받은_Client_ID
```

---

## 4. 실행 방법

키를 넣은 뒤 **이미지를 다시 빌드**해야 합니다 (Vite는 빌드 시 env를 번들에 넣음).

```bash
docker compose up --build -d
```

### 확인 URL

| 대상 | URL |
|------|-----|
| 홈 화면 | http://localhost:8081 |
| API 상태 | http://localhost:3001/api/live/status |
| 날씨 | http://localhost:3001/api/live/weather |
| 미세먼지 | http://localhost:3001/api/live/air-quality |
| 주가 | http://localhost:3001/api/live/stocks |

`/api/live/status` 에서 `kisKeyConfigured: true` 이면 실시간 주가가 활성화됩니다.

---

## 5. 주가 데이터 참고

### 실시간 (KIS 키 설정 시)

- **한국투자증권 Open API** `국내주식 현재가` 조회
- **장중(09:00~15:30)** 서버·화면 모두 약 **30초**마다 갱신
- **장 마감 후** 마지막 체결가 표시 (자동 갱신 없음)

### 대체 (KIS 키 없거나 오류 시)

금융위원회 주식시세정보는 **실시간 호가가 아닙니다**.

- 기준일(`basDt`) 영업일 **종가** 기준
- 데이터는 **다음 영업일 13시 이후** 갱신되는 경우가 많음

---

## 6. 자주 나는 오류

| 증상 | 원인 | 해결 |
|------|------|------|
| `DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다` | `.env` 미설정 또는 API 컨테이너 미재시작 | `.env` 작성 후 `docker compose up -d --build api` |
| `SERVICE_KEY_IS_NOT_REGISTERED` | 해당 API 활용신청 안 함 | data.go.kr에서 3종 각각 활용신청 |
| `LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS` | 일일 트래픽 초과 | 잠시 후 재시도 (서버에 캐시 적용됨) |
| 주가가 종가로만 표시 | `KIS_APP_KEY` 미설정 | KIS Developers에서 키 발급 후 `.env` 설정 |
| `KIS 토큰 발급 실패` | App Key/Secret 오류 | 키 재확인, 모의투자면 `KIS_USE_VTS=1` |

---

## 7. 관련 소스 파일

| 역할 | 경로 |
|------|------|
| API 라우트 | `backend/src/routes/liveData.js` |
| 날씨 | `backend/src/services/weatherService.js` |
| 미세먼지 | `backend/src/services/airQualityService.js` |
| 주가 | `backend/src/services/stockService.js` |
| KIS 클라이언트 | `backend/src/services/kisClient.js` |
| 홈 UI | `frontend/src/components/live/LiveInfoSection.jsx` |
| 네이버 지도 | `frontend/src/components/NaverMapEmbed.jsx` |
| 회사 좌표 | `frontend/src/config/mapLinks.js` |

---

## 8. 로컬 개발 (Docker 없이)

```bash
# 터미널 1 — API
cd backend && npm install && DATA_GO_KR_SERVICE_KEY=키값 npm start

# 터미널 2 — 프론트
cd frontend && npm install
# frontend/.env.local 에 VITE_NAVER_MAP_CLIENT_ID=... (선택)
npm run dev
```

프론트 dev 서버는 Vite proxy로 `/api` → `localhost:3000` (또는 3001) 로 연결됩니다.
