# 한화그린 홈페이지 (Docker 실습)

React 화면 + Node API + PostgreSQL 을 Docker 로 한 번에 실행하는 프로젝트입니다.

## 빠른 시작

```powershell
cd c:\Users\psw00\OneDrive\Desktop\docker_exam2
docker compose up -d --build
```

브라우저: **http://localhost:8081**

## 문서 (한국어)

| 문서 | 내용 |
|------|------|
| [docs/프로젝트_구조_안내.md](docs/프로젝트_구조_안내.md) | **폴더·파일이 뭔지**, 서로 어떻게 연결되는지 |
| [ROADMAP.md](ROADMAP.md) | 작업 진행 순서 (DB, 로그인, AWS…) |
| [docs/DB확인_안내.md](docs/DB확인_안내.md) | DB 연결 확인 |
| [docs/외부접속_안내.md](docs/외부접속_안내.md) | 인터넷 공개 URL (Cloudflare 터널) |
| [docs/로그인_안내.md](docs/로그인_안내.md) | 관리자 로그인 (DB, 임시 계정) |
| [docs/GitHub_안내.md](docs/GitHub_안내.md) | **4번** Git + GitHub 연동 |
| [docs/AWS_EC2_배포_안내.md](docs/AWS_EC2_배포_안내.md) | **5~6번** AWS EC2 배포·공인 IP 접속 |

## 바로 실행 (Windows)

| 파일 | 용도 |
|------|------|
| `DB확인.bat` | DB 상태 점검 |
| `공개주소_시작.bat` | 외부 접속용 공개 주소 만들기 |

## 폴더 한눈에

```
docker_exam2/
├── frontend/     ← 화면 (React)
├── backend/      ← API 서버 (Node)
├── db/           ← PostgreSQL 컨테이너 설정
├── nginx/        ← web 서버 설정
├── scripts/      ← PowerShell 도우미
└── docs/         ← 설명 문서·원본 참고 자료
```

자세한 설명은 **[docs/프로젝트_구조_안내.md](docs/프로젝트_구조_안내.md)** 를 보세요.
