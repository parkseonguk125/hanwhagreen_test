# 출결서비스 AWS 배포 (EC2 + APK)

> 로컬에서 출결 기능·UI 수정이 끝난 뒤, **EC2 서버**와 **직원 휴대폰 APK**에 반영하는 순서입니다.

---

## 한눈에 보기

```
[PC]
① GitHub push (최신 코드)
② 출결서비스_AWS배포.bat → ec2.env.upload 생성 + 프로덕션 APK 빌드
③ WinSCP로 ec2.env.upload → EC2 .env 업로드

[EC2 SSH/PuTTY]
④ git pull
⑤ ./scripts/ec2-deploy.sh
⑥ (선택) ./scripts/ssl-init.sh  ← HTTPS 미적용 시

[휴대폰]
⑦ 새 APK 설치 → 출결 등록 테스트

[PC 브라우저]
⑧ 출결서비스 게시판에서 사진·카드 UI 확인
```

---

## 사전 조건

| 항목 | 상태 |
|------|------|
| EC2 배포 (5~6번) | [AWS_EC2_배포_안내.md](./AWS_EC2_배포_안내.md) |
| DuckDNS 도메인 (7번) | [도메인_연결_안내.md](./도메인_연결_안내.md) |
| HTTPS (8번, 권장) | [HTTPS_안내.md](./HTTPS_안내.md) — 앱 API는 **https** 권장 |
| 로컬 `.env` | `ATTENDANCE_APP_API_KEY`, `VITE_NAVER_MAP_CLIENT_ID` 설정됨 |

**현재 문서 기준 예시**

- EC2 IP: `13.209.17.85`
- 도메인 예: `hanwhagreentest.duckdns.org`

---

## 1. PC — 코드 GitHub 반영

EC2는 GitHub `main` 브랜치를 pull 합니다. 로컬 변경을 먼저 push 하세요.

```powershell
cd C:\Users\psw00\OneDrive\Desktop\docker_exam2
git status
git add ...
git commit -m "출결서비스: 다중 사진, UI 개선"
git push origin main
```

---

## 2. PC — 배포 준비 스크립트

프로젝트 루트에서 **`출결서비스_AWS배포.bat`** 더블클릭 (또는 PowerShell):

```powershell
.\scripts\prepare-aws-deploy.ps1 -Domain "hanwhagreentest.duckdns.org" -BuildApk
```

스크립트가 하는 일:

1. Git 미커밋 변경 경고
2. **`ec2.env.upload`** 생성 (EC2용 `.env` 초안)
3. **`https://도메인/api`** 로 프로덕션 APK 빌드 → `mobile\dist\`

> 로컬 Wi-Fi 테스트용 `.env`의 `ATTENDANCE_APP_API_BASE_URL` 은 그대로 두어도 됩니다. APK만 프로덕션 URL로 빌드됩니다.

---

## 3. WinSCP — EC2에 `.env` 업로드

1. WinSCP로 EC2 접속 ([WinSCP_PuTTY_배포_안내.md](./WinSCP_PuTTY_배포_안내.md))
2. 로컬 `ec2.env.upload` → 서버 `~/hanwhagreen_test/.env` 로 복사 (덮어쓰기)
3. **중요**: `ATTENDANCE_APP_API_KEY` 가 로컬·APK·서버 **세 곳 모두 동일**해야 합니다.

---

## 4. EC2 — 배포 실행

PuTTY 터미널:

```bash
cd ~/hanwhagreen_test
git pull origin main
./scripts/ec2-deploy.sh
```

성공 시:

- `http://퍼블릭IP/` 또는 `https://도메인/` 접속 가능
- 출결 API: `https://도메인/api/attendance` (앱 전용, X-App-Key 필요)

### HTTPS 아직 안 했다면 (ROADMAP 8번)

1. AWS 보안 그룹 **443** 개방
2. DuckDNS IP = 현재 EC2 IP 확인
3. EC2에서:

```bash
./scripts/ssl-init.sh
# 도메인: hanwhagreentest.duckdns.org
# 이메일: 본인 Gmail
```

4. APK를 **`https://도메인/api`** 로 다시 빌드 (`출결서비스_AWS배포.bat`)

---

## 5. 서버 동작 확인

```bash
curl -s http://127.0.0.1/api/health
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/bbs/board.php?bo_table=attendance
docker compose ps
```

---

## 6. 휴대폰 — APK 설치

1. `mobile\dist\` 에서 **가장 최근** `hanwha-attendance_*.apk` 를 폰에 설치
2. 기존 앱이 있으면 삭제 후 재설치 권장
3. 앱에서 출결 등록 (사진 여러 장)
4. **같은 Wi-Fi 불필요** — 인터넷만 되면 EC2 API로 전송

---

## 7. 홈페이지 확인

관리자 로그인 후:

```
https://hanwhagreentest.duckdns.org/bbs/board.php?bo_table=attendance
```

확인 항목:

- [ ] 목록에 새 글 표시
- [ ] 상단 카드 (작업일·작성자·위치) 글자 크기·배치
- [ ] 출결 위치 지도
- [ ] 작업 내용 카드
- [ ] 현장 사진 3열 그리드, 6장 초과 시 스크롤

---

## 이후 코드 수정 시

| 위치 | 작업 |
|------|------|
| PC | `git push` |
| EC2 | `git pull` + `./scripts/ec2-deploy.sh` |
| 앱 API 주소 변경 시 | `출결서비스_AWS배포.bat` 으로 APK 재빌드 |

---

## 자주 묻는 것

**Q. 앱에서 "서버 오류" / 연결 실패**  
A. APK API 주소가 `https://도메인/api` 인지, EC2 api 컨테이너 healthy 인지, `ATTENDANCE_APP_API_KEY` 일치 여부 확인.

**Q. 홈페이지에 사진이 1장만 보임**  
A. EC2에 최신 코드가 배포됐는지 (`git log -1`), 앱에서 여러 장 선택했는지 확인.

**Q. HTTP만 있고 HTTPS 없음**  
A. Android 9+ 에서 cleartext(HTTP)가 막힐 수 있습니다. **ssl-init.sh** 로 HTTPS 적용 권장.

---

## 관련 문서

- [출격서비스_4단계_APK배포.md](./출격서비스_4단계_APK배포.md)
- [AWS_EC2_배포_안내.md](./AWS_EC2_배포_안내.md)
- [HTTPS_안내.md](./HTTPS_안내.md)
- [.env.ec2.example](../.env.ec2.example)
