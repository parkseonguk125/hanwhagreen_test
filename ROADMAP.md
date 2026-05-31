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
- [ ] 6. EC2 공인 IP 접속 확인 — 위 가이드 **⑦절** (`http://퍼블릭IP/`)
- [ ] 7. 도메인 연결

## 문서

- [README.md](README.md) — 시작 방법
- [docs/프로젝트_구조_안내.md](docs/프로젝트_구조_안내.md) — 폴더·파일 설명
- [docs/AWS_EC2_배포_안내.md](docs/AWS_EC2_배포_안내.md) — **5~6번** EC2 배포·접속 확인

## 3번 구현 요약

- DB: `members`, `member_sessions` 테이블
- API: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- 임시 계정: **admin** / **green1234** (상세: [docs/로그인_안내.md](docs/로그인_안내.md))

## 1번 구현 요약

- Docker: `postgres:16` + API `pg` 드라이버
- API: `GET /api/notice`, `GET /api/notice/:id`, `GET /api/qa`, …
- 프론트: 공지·QA 목록/상세가 `/api` 호출 (브라우저 저장소 미사용)
