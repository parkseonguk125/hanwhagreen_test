# 출격 서비스 4단계 — Release APK 빌드·배포 (초보자용)

> **완료 내용**: 사내 태블릿에 설치할 APK 빌드 스크립트·서명 설정·설치 안내

---

## 한눈에 보기

| 항목 | 내용 |
|------|------|
| **빌드** | `출격앱_APK빌드.bat` (또는 PowerShell 스크립트) |
| **결과물** | `mobile/dist/hanwha-attendance_버전_날짜.apk` |
| **배포** | Play 스토어 없이 APK 파일 직접 설치 (사이드로드) |
| **서명** | `key.properties` 없으면 테스트용 debug 서명 / 있으면 release 서명 |

---

## 1. 빌드 전 준비

### 1-1. `.env` 확인

프로젝트 루트 `.env`:

```env
ATTENDANCE_APP_API_KEY=...          # 이미 있음
NAVER_MAP_CLIENT_ID=...              # 앱 내 지도 (선택)
ATTENDANCE_APP_API_BASE_URL=https://your-domain.com/api
```

| 변수 | 설명 |
|------|------|
| `ATTENDANCE_APP_API_BASE_URL` | **태블릿이 접속할 API 주소** (끝에 `/api` 필수) |
| `ATTENDANCE_APP_API_KEY` | 서버와 동일한 앱 키 |

**API 주소 예시**

| 환경 | 예시 |
|------|------|
| 로컬 PC + 같은 Wi-Fi 태블릿 | `http://192.168.0.10:3001/api` (PC IP) |
| AWS/도메인 배포 후 | `https://hanwhagreen.co.kr/api` |

> APK에 API 주소가 **박혀서** 나갑니다. 서버 주소가 바뀌면 **APK를 다시 빌드**해야 합니다.

### 1-2. 서버(백엔드) 실행

태블릿이 접속할 서버가 떠 있어야 합니다.

```powershell
docker compose up -d
```

---

## 2. APK 빌드

### 방법 A — 배치 파일 (더블클릭)

프로젝트 루트 **`출격앱_APK빌드.bat`**

### 방법 B — PowerShell

```powershell
cd C:\Users\psw00\OneDrive\Desktop\docker_exam2
.\mobile\scripts\build-android-release.ps1
```

`.env`에 `ATTENDANCE_APP_API_BASE_URL`이 없을 때:

```powershell
.\mobile\scripts\build-android-release.ps1 -ApiBaseUrl "http://192.168.0.10:3001/api"
```

빌드가 끝나면:

```
mobile\dist\hanwha-attendance_1.0.0_20260705-1600.apk
```

---

## 3. Release 서명 (정식 배포용, 선택)

처음에는 **debug 서명**으로도 설치·테스트 가능합니다.  
업데이트 APK를 같은 키로 계속 배포하려면 **release 키스토어**를 만드세요.

### 3-1. 키스토어 생성

Android Studio JDK 사용 (경로는 PC마다 다를 수 있음):

```powershell
cd mobile\android
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" `
  -genkey -v `
  -keystore hanwha-attendance-release.jks `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -alias hanwha-attendance
```

### 3-2. key.properties

```powershell
copy key.properties.example key.properties
```

`key.properties` 내용 수정 (비밀번호·경로).  
**Git에 올리지 마세요.**

### 3-3. 다시 빌드

`출격앱_APK빌드.bat` 실행 → release 키로 서명됩니다.

---

## 4. 태블릿에 설치

1. APK 파일을 태블릿으로 전송 (USB, 카카오톡, 이메일 등)
2. 태블릿에서 APK 파일 탭
3. **「출처를 알 수 없는 앱」** 설치 허용 (기기 설정)
4. **한화그린 출격** 앱 실행
5. 위치·카메라 권한 허용
6. 출격 등록 → 홈페이지 출결서비스에서 확인

### 같은 Wi-Fi 로컬 테스트

1. PC에서 `ipconfig` → IPv4 주소 확인 (예: `192.168.0.10`)
2. `.env` → `ATTENDANCE_APP_API_BASE_URL=http://192.168.0.10:3001/api`
3. APK 다시 빌드
4. 태블릿도 **같은 Wi-Fi**에 연결
5. PC 방화벽에서 **3001 포트** 허용 필요할 수 있음

---

## 5. 버전 올리기

`mobile/pubspec.yaml`:

```yaml
version: 1.0.1+2
```

| 부분 | 의미 |
|------|------|
| `1.0.1` | 사용자에게 보이는 버전 |
| `+2` | Android versionCode (업데이트마다 +1) |

수정 후 다시 `출격앱_APK빌드.bat`

---

## 6. 문제 해결

| 증상 | 해결 |
|------|------|
| API 주소 없음 오류 | `.env`에 `ATTENDANCE_APP_API_BASE_URL` 추가 |
| 앱에서 전송 실패 | API 주소·방화벽·Docker API(3001) 확인 |
| 401 인증 오류 | `ATTENDANCE_APP_API_KEY`가 서버 `.env`와 동일한지 |
| 설치 안 됨 | 이전 APK와 **서명 키가 다름** → 기존 앱 삭제 후 재설치 |
| 지도 안 보임 | `NAVER_MAP_CLIENT_ID` 빌드 시 포함됐는지, APK 재빌드 |

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `mobile/scripts/build-android-release.ps1` | Release APK 빌드 |
| `출격앱_APK빌드.bat` | 더블클릭 실행 |
| `mobile/android/key.properties.example` | 서명 설정 예시 |
| `mobile/dist/` | 빌드된 APK 저장 (Git 제외) |

---

## 전체 단계 요약

| 단계 | 내용 | 상태 |
|------|------|------|
| 0 | 환경·Flutter | ✅ |
| 1 | 백엔드 API | ✅ |
| 2 | 홈페이지 출결서비스 | ✅ |
| 3 | Flutter 앱 | ✅ |
| 4 | APK 빌드·배포 | ✅ |
