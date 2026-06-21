# 한화그린 홈페이지 — 작업 로드맵

## DB 선택 (1번)

| 방식 | 특징 | 실무 사용 |
|------|------|-----------|
| **PostgreSQL** | 관계형, Docker/AWS 표준, 로그인·CRUD에 적합 | **채택 (현재)** |
| MySQL / MariaDB | 관계형, 국내 호스팅·레거시에 많음 | 대안 |
| SQLite | 파일 DB, 설치 간단 | 소규모·프로토타입 |

## 진행 상태

- [x] **1. 공지사항 / 온라인문의 → PostgreSQL DB 연결**
- [x] **2. 공지/QA 게시판 CRUD**
- [x] **3. 로그인 (DB)** — `members` / `member_sessions`, 임시 계정 `admin` / `green1234`
- 공지 CRUD(작성·수정·삭제): **관리자 로그인 후**만 (API·화면)
- [x] 4. Git + GitHub — https://github.com/parkseonguk125/hanwhagreen_test
- [x] 5. AWS EC2 배포 — [docs/AWS_EC2_배포_안내.md](docs/AWS_EC2_배포_안내.md), `scripts/ec2-*.sh` (본인 AWS에서 실행)
- [x] 6. EC2 공인 IP 접속 확인 — `http://13.209.17.85/`
- [x] 7. 도메인 연결 — [docs/도메인_연결_안내.md](docs/도메인_연결_안내.md) (무료: DuckDNS)
- [ ] 8. HTTPS (Let's Encrypt) — [docs/HTTPS_안내.md](docs/HTTPS_안내.md), `scripts/ssl-*.sh`
- [x] **9. 미구현 GNB 메뉴 페이지** — ABOUT US, BUSINESS, 회사실적, 지식산업권 (정적·갤러리)
- [x] **10. Playwright E2E** — [docs/Playwright_안내.md](docs/Playwright_안내.md), `e2e/tests/`
- [ ] **11. DB 백업·복원** — [docs/DB_백업_복원_안내.md](docs/DB_백업_복원_안내.md), `scripts/db-backup.sh`, `scripts/db-restore.sh`
- [ ] **12. EC2 서버 삭제·복구 연습** — [docs/서버_삭제_복구_연습_안내.md](docs/서버_삭제_복구_연습_안내.md), `scripts/ec2-pre-check.sh`

## 문서

- [README.md](README.md) — 시작 방법
- [docs/프로젝트_구조_안내.md](docs/프로젝트_구조_안내.md) — 폴더·파일 설명
- [docs/AWS_EC2_배포_안내.md](docs/AWS_EC2_배포_안내.md) — **5~6번** EC2 배포·접속 확인
- [docs/도메인_연결_안내.md](docs/도메인_연결_안내.md) — **7번** 무료 도메인 (DuckDNS)
- [docs/HTTPS_안내.md](docs/HTTPS_안내.md) — **HTTPS** Let's Encrypt (EC2)
- [docs/Playwright_안내.md](docs/Playwright_안내.md) — E2E 테스트 실행법
- [docs/DB_백업_복원_안내.md](docs/DB_백업_복원_안내.md) — **11번** DB 백업·복원
- [docs/서버_삭제_복구_연습_안내.md](docs/서버_삭제_복구_연습_안내.md) — **12번** EC2 삭제·복구 연습

## 3번 구현 요약

- DB: `members`, `member_sessions` 테이블
- API: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- 임시 계정: **admin** / **green1234** (상세: [docs/로그인_안내.md](docs/로그인_안내.md))

## 1번 구현 요약

- Docker: `postgres:16` + API `pg` 드라이버
- API: `GET /api/notice`, `GET /api/notice/:id`, `GET /api/qa`, …
- 프론트: 공지·QA 목록/상세가 `/api` 호출 (브라우저 저장소 미사용)
