# WinSCP + PuTTY로 EC2 재배포 (PowerShell 대신)

PowerShell `ssh` 대신 **WinSCP**(파일·접속) + **PuTTY**(터미널)로 EC2에 접속해 Git 소스를 받고 Docker를 실행하는 방법입니다.

> **이미 한 번 배포했다면** EC2·Docker 설치는 끝난 상태입니다. 이번에는 **최신 코드 pull + Docker 재빌드**만 하면 됩니다.

---

## 준비물

| 항목 | 예시 (본인 환경에 맞게 수정) |
|------|------------------------------|
| EC2 퍼블릭 IP | `13.209.17.85` (중지 후 재시작하면 **바뀔 수 있음**) |
| SSH 키 (.pem) | `C:\Users\psw00\Downloads\hanwhagreen-key.pem` |
| 로그인 사용자 | `ubuntu` |
| GitHub 저장소 | https://github.com/parkseonguk125/hanwhagreen_test.git |
| 서버 프로젝트 경로 | `/home/ubuntu/hanwhagreen_test` |

### 프로그램 설치 (없을 때만)

- [WinSCP](https://winscp.net/eng/download.php) — SFTP + PuTTY 연동
- [PuTTY](https://www.putty.org/) — SSH 터미널 (WinSCP 설치 시 함께 설치되는 경우 많음)

---

## 0. 배포 전 AWS에서 확인 (중요)

SSH가 **연결 안 됨 / 타임아웃**이면 아래를 먼저 확인하세요.

1. AWS 콘솔 → **EC2** → **인스턴스**
2. 인스턴스 상태가 **실행 중** 인지
3. **퍼블릭 IPv4** 주소 복사 (이전 `13.209.17.85`와 다를 수 있음)
4. **보안 그룹** → 인바운드 규칙:
   - **SSH 22** — 소스: **내 IP** (또는 테스트 시 `0.0.0.0/0`, 보안상 내 IP 권장)
   - **HTTP 80** — 소스: `0.0.0.0/0` (웹 접속용)

---

## 1. WinSCP로 세션 만들기

1. WinSCP 실행 → **새 세션**
2. 아래처럼 입력:

| 필드 | 값 |
|------|-----|
| 파일 프로토콜 | **SFTP** |
| 호스트 이름 | EC2 **퍼블릭 IP** |
| 포트 번호 | `22` |
| 사용자 이름 | `ubuntu` |

3. **고급** 클릭 → **SSH** → **인증**:
   - **개인키 파일**: `hanwhagreen-key.pem` 선택  
   - PuTTY 형식이 아니면 WinSCP가 **.ppk 변환** 안내 → **예** 클릭해 `.ppk` 생성·저장

4. **저장** → 세션 이름 예: `hanwhagreen-ec2`
5. **로그인** 클릭

- 처음 접속: 호스트 키 확인 → **예**
- 왼쪽: 내 PC, 오른쪽: EC2 서버 파일

---

## 2. PuTTY 터미널 열기 (WinSCP에서)

WinSCP에 접속된 상태에서:

1. 메뉴 **명령** → **PuTTY 열기** (또는 툴바 PuTTY 아이콘)
2. 검은 터미널에 `ubuntu@ip-...` 프롬프트가 보이면 성공

> PuTTY만 단독으로 쓸 때: **호스트**에 `ubuntu@퍼블릭IP`, **Connection → SSH → Auth** 에서 `.ppk` 키 지정.

---

## 3. Git 소스 받기 (PuTTY 터미널)

### A. 이미 배포한 적 있음 (`~/hanwhagreen_test` 폴더 있음)

```bash
cd ~/hanwhagreen_test
git pull origin main
```

`Already up to date` 가 아니라 변경 파일 목록이 나오면 최신 코드 반영된 것입니다.

### B. 처음이거나 폴더가 없음

```bash
git clone https://github.com/parkseonguk125/hanwhagreen_test.git ~/hanwhagreen_test
cd ~/hanwhagreen_test
chmod +x scripts/ec2-setup.sh scripts/ec2-deploy.sh
./scripts/ec2-setup.sh    # Docker 미설치 시에만 (최초 1회)
```

`docker` 권한 오류가 나면 PuTTY를 **닫았다가 WinSCP에서 PuTTY 다시 열기**, 또는:

```bash
newgrp docker
```

---

## 4. Docker 빌드·실행 (재배포 핵심)

프로젝트 폴더에서 아래 **둘 중 하나** 실행.

### 방법 1 — 스크립트 (권장)

```bash
cd ~/hanwhagreen_test
./scripts/ec2-deploy.sh
```

(`git pull` + `docker compose` 빌드·실행을 한 번에 처리)

### 방법 2 — 수동

```bash
cd ~/hanwhagreen_test
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.ec2.yml up -d --build
docker compose ps
```

- **처음 빌드·대규모 변경 후**는 5~15분 걸릴 수 있습니다.
- `web`, `api`, `db` 컨테이너가 **Up** / **healthy** 인지 확인.

---

## 5. 서버에서 동작 확인 (PuTTY)

```bash
curl -s http://127.0.0.1/api/health
```

기대 응답 예:

```json
{"status":"ok","database":"postgresql"}
```

로그 확인:

```bash
cd ~/hanwhagreen_test
docker compose logs api --tail 30
docker compose logs web --tail 20
```

---

## 6. PC 브라우저에서 확인

```
http://(EC2_퍼블릭_IP)/
```

예: `http://13.209.17.85/`

확인 항목:

- 홈 화면
- GNB: 회사소개, 사업분야, 시공실적, 프로젝트, 인증 등 **새 페이지**
- 공지사항 / 온라인문의
- 관리자: `http://(IP)/bbs/login.php` — `admin` / `green1234`

---

## WinSCP로 할 수 있는 것 (선택)

| 작업 | 설명 |
|------|------|
| 로그 파일 보기 | 오른쪽 패널에서 서버 경로 탐색 (일반적으로 Docker 로그는 `docker compose logs` 사용) |
| `.env` 수정 | `~/hanwhagreen_test/.env` — WinSCP로 편집 후 `docker compose up -d --build` 재실행 |
| 스크립트 업로드 | 로컬 수정본을 SFTP로 올리는 것보다 **GitHub push → git pull** 이 정석 |

---

## 자주 나는 문제

| 증상 | 해결 |
|------|------|
| WinSCP/PuTTY **연결 타임아웃** | EC2 **실행 중**인지, 보안 그룹 **SSH 22** 가 **현재 내 IP**에 열려 있는지 |
| **Network error: Connection refused** | 인스턴스 중지됨 또는 잘못된 IP |
| `permission denied (publickey)` | `.pem` / `.ppk` 경로·사용자 `ubuntu` 확인 |
| `docker: permission denied` | PuTTY 재접속 또는 `newgrp docker` |
| `git pull` 충돌 | 서버에서 로컬 수정 안 했다면: `git fetch origin` 후 `git reset --hard origin/main` (서버 데이터 주의) |
| 웹만 예전 화면 | `docker compose ... up -d --build` 로 **재빌드** 했는지 확인 |
| HTTP 접속 안 됨 | 보안 그룹 **80** 포트, `docker compose ps` 에서 `web` Up 여부 |

---

## 다음에 코드 수정했을 때

1. PC에서 GitHub에 `git push`
2. WinSCP 접속 → PuTTY 열기
3. `cd ~/hanwhagreen_test && ./scripts/ec2-deploy.sh`

---

## 관련 문서

- [AWS_EC2_배포_안내.md](AWS_EC2_배포_안내.md) — EC2 최초 생성·PowerShell SSH
- [도메인_연결_안내.md](도메인_연결_안내.md) — 7번 DuckDNS
