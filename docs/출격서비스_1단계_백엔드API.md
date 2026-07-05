# 출격 서비스 1단계 — 백엔드 API (초보자용)

> **완료 내용**: `/api/attendance` REST API, DB 테이블, 사진 업로드, 앱 API 키 검증

---

## API 목록

| Method | URL | 인증 | 설명 |
|--------|-----|------|------|
| GET | `/api/attendance` | 없음 | 목록 (제목·날짜만) |
| POST | `/api/attendance` | `X-App-Key` | 출격 기록 + 사진 등록 |
| GET | `/api/attendance/:id` | 관리자 Bearer | 상세 (GPS·작업내용·인원 등) |
| GET | `/api/attendance/:id/photo` | 관리자 Bearer | 사진 다운로드 |
| DELETE | `/api/attendance/:id` | 관리자 Bearer | 삭제 |

---

## 환경변수 (`.env`)

```env
ATTENDANCE_APP_API_KEY=랜덤_문자열
# ATTENDANCE_UPLOAD_DIR=/app/uploads/attendance
```

Docker 사용 시 `docker-compose.yml` 이 업로드 볼륨을 자동 연결합니다.

---

## Docker 재시작 (코드 반영)

```powershell
cd C:\Users\psw00\OneDrive\Desktop\docker_exam2
docker compose up -d --build api
```

---

## 테스트 1 — 목록 (공개)

브라우저 또는 PowerShell:

```
http://localhost:3001/api/attendance
```

빈 배열 `[]` 이면 정상 (아직 등록 없음).

---

## 테스트 2 — 출격 등록 (앱 API 키)

PowerShell (`.env` 의 키 값으로 바꾸세요):

```powershell
$key = "MulWXILRt9T72pBihNdGmECSwQHgO1jV"
curl.exe -X POST "http://localhost:3001/api/attendance" `
  -H "X-App-Key: $key" `
  -F "work_date=2026-07-05" `
  -F "work_content=현장 점검 및 설비 확인" `
  -F "personnel_count=3" `
  -F "reporter_name=홍길동" `
  -F "latitude=36.1074943" `
  -F "longitude=128.5198071" `
  -F "address=경북 구미시" `
  -F "photo=@C:\path\to\test.jpg"
```

`photo=@...` 는 실제 JPG 경로가 있을 때만 넣으세요. 없으면 해당 `-F` 줄을 빼도 됩니다.

성공 시 `201` 과 JSON (id, subject, workDate 등) 이 반환됩니다.

---

## 테스트 3 — 잘못된 키 (403)

```powershell
curl.exe -X POST "http://localhost:3001/api/attendance" `
  -H "X-App-Key: wrong-key" `
  -F "work_date=2026-07-05" `
  -F "work_content=테스트"
```

`403` + `"앱 API 키가 올바르지 않습니다."`

---

## 테스트 4 — 관리자 상세

1. 로그인: `POST /api/auth/login` → `token` 받기  
   (기본 admin / green1234 — [로그인_안내.md](./로그인_안내.md))

```powershell
$login = curl.exe -s -X POST "http://localhost:3001/api/auth/login" `
  -H "Content-Type: application/json" `
  -d "{\"mb_id\":\"admin\",\"mb_password\":\"green1234\"}"
# JSON 에서 token 복사

curl.exe "http://localhost:3001/api/attendance/1" `
  -H "Authorization: Bearer 여기에_token"
```

---

## 관련 소스

| 역할 | 경로 |
|------|------|
| 라우트 | `backend/src/routes/attendance.js` |
| DB | `backend/src/db.js` |
| 앱 키 미들웨어 | `backend/src/middleware/requireAppKey.js` |
| 사진 업로드 | `backend/src/attendanceUpload.js`, `attendanceFiles.js` |

---

## 다음 단계

**2단계**: 홈페이지 고객센터「출결서비스」메뉴 + 목록/관리자 상세 페이지
