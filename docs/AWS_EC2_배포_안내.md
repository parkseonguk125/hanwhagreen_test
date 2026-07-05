# 5번·6번 — AWS EC2 배포 & 공인 IP 접속 (초보용)

## 이게 뭔가요?

| 지금 (내 PC) | 5~6번 이후 (EC2) |
|--------------|------------------|
| `docker compose up` → **localhost:8081** | AWS **가상 서버(EC2)** 에 같은 Docker 실행 |
| PC 꺼지면 사이트 접속 불가 | 서버가 켜져 있는 동안 **인터넷 어디서나** 접속 |
| Cloudflare 터널 = 임시 공개 | EC2 **퍼블릭 IP** = 고정에 가까운 주소 (6번) |

**올리는 것:** GitHub에 있는 **소스 코드**를 EC2에 `git clone` → `docker compose up`  
**올리는 것 아님:** Docker Desktop 설치 파일 자체

---

## 전체 순서 (한눈에)

```
① AWS 가입
② EC2 인스턴스 만들기 (Ubuntu + 키 페어)
③ 보안 그룹: SSH(22), HTTP(80) 열기
④ SSH로 서버 접속
⑤ ec2-setup.sh  → Docker 설치
⑥ ec2-deploy.sh → GitHub에서 받아서 실행
⑦ 브라우저 http://퍼블릭IP/ 접속 확인 (6번)
```

---

## ① AWS 계정

1. https://aws.amazon.com/ko/ 접속 → **AWS 계정 생성**
2. 카드 등록 필요 (프리 티어: t2.micro 등 12개월 무료 범위 있음)
3. 로그인 후 리전: **아시아 태평양(서울) ap-northeast-2** 권장 (오른쪽 위에서 선택)

---

## ② EC2 인스턴스 만들기

1. AWS 콘솔 검색창에 **EC2** 입력 → Enter  
2. 왼쪽 **인스턴스** → **인스턴스 시작** (주황 버튼)

### 이름 및 AMI

| 항목 | 선택 |
|------|------|
| 이름 | `hanwhagreen-web` (아무거나) |
| AMI | **Ubuntu Server 22.04 LTS** (무료 티어 가능) |
| 아키텍처 | 64비트 (x86) |

### 인스턴스 유형

| 항목 | 선택 |
|------|------|
| 유형 | **t2.micro** 또는 **t3.micro** (프리 티어) |

### 키 페어 (중요 — 잃어버리면 SSH 불가)

1. **새 키 페어 생성**  
2. 이름: `hanwhagreen-key`  
3. 형식: **.pem**  
4. **키 페어 생성** 클릭 → `.pem` 파일 **다운로드**  
   - 예: `C:\Users\본인\Downloads\hanwhagreen-key.pem`  
   - **한 번만** 받을 수 있음 → 안전한 폴더에 보관

### 네트워크 설정 (보안 그룹)

**보안 그룹 규칙 편집**에서 아래 추가:

| 유형 | 포트 | 소스 | 용도 |
|------|------|------|------|
| SSH | 22 | **내 IP** | 서버 원격 접속 |
| HTTP | 80 | **0.0.0.0/0** | 홈페이지 접속 (6번) |

> SSH는 가능하면 "내 IP"만. HTTP(80)는 전 세계에서 접속하려면 0.0.0.0/0.

### 스토리지

- 기본 **8~30GB** 그대로 OK

### 마무리

- **인스턴스 시작** 클릭  
- 상태가 **실행 중** 될 때까지 1~2분 대기

---

## ③ 퍼블릭 IP 확인 (6번에 사용)

1. EC2 → **인스턴스** → 방금 만든 인스턴스 클릭  
2. 아래 요약에서 **퍼블릭 IPv4 주소** 복사  
   - 예: `3.34.12.34`  
3. 나중에 브라우저: `http://3.34.12.34/` (https 아님, **http**)

---

## ④ Windows에서 SSH 접속

PowerShell:

```powershell
# 키 파일 경로는 본인 다운로드 위치로 변경
$KEY = "C:\Users\psw00\Downloads\hanwhagreen-key.pem"
$IP = "여기에_퍼블릭_IP"

# pem 권한 (처음 한 번, 오류 나면)
icacls $KEY /inheritance:r
icacls $KEY /grant:r "$($env:USERNAME):(R)"

ssh -i $KEY ubuntu@$IP
```

- 처음 접속: `Are you sure...` → **yes** 입력  
- 프롬프트가 `ubuntu@ip-...` 로 바뀌면 성공

---

## ⑤ 서버에 Docker 설치 (최초 1회)

SSH 접속한 상태에서:

```bash
# GitHub에서 스크립트만 먼저 받기 (또는 clone 후 실행)
git clone https://github.com/parkseonguk125/hanwhagreen_test.git ~/hanwhagreen_test
cd ~/hanwhagreen_test
chmod +x scripts/ec2-setup.sh scripts/ec2-deploy.sh
./scripts/ec2-setup.sh
```

**`docker` 권한 오류**가 나면:

```bash
exit
```

Windows PowerShell에서 **SSH 다시 접속** 후:

```bash
cd ~/hanwhagreen_test
./scripts/ec2-deploy.sh
```

또는 같은 SSH 안에서:

```bash
newgrp docker
./scripts/ec2-deploy.sh
```

---

## ⑥ 배포 실행 (5번 핵심)

```bash
cd ~/hanwhagreen_test
./scripts/ec2-deploy.sh
```

스크립트가 하는 일:

1. GitHub에서 최신 코드 `git pull`  
2. `docker compose` + **ec2용 설정(80번 포트)** 로 빌드·실행  
3. `web` / `api` / `db` 컨테이너 기동

**처음 빌드는 5~15분** 걸릴 수 있습니다.

### EC2 `.env` 설정 (출결서비스·지도·알림)

Git에는 `.env`가 없습니다. **WinSCP**로 서버에 직접 올려야 합니다.

1. PC에서 **`출결서비스_AWS배포.bat`** 실행 → `ec2.env.upload` 생성  
   또는 `.env.ec2.example` 을 참고해 작성
2. WinSCP: `ec2.env.upload` → `~/hanwhagreen_test/.env`
3. 필수 항목:

| 변수 | 설명 |
|------|------|
| `ATTENDANCE_APP_API_KEY` | 출결 앱 API 키 (로컬 `.env` 와 동일) |
| `VITE_NAVER_MAP_CLIENT_ID` | 웹 지도 (docker build 시 주입) |
| `NOTIFY_LINK_URL` | `https://본인도메인/` |

상세: [출결서비스_AWS_배포_안내.md](출결서비스_AWS_배포_안내.md)

---

### 수동으로 할 때 (스크립트 대신)

```bash
cd ~/hanwhagreen_test
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.ec2.yml up -d --build
docker compose ps
```

---

## ⑦ 접속 확인 (6번)

1. PC·휴대폰 브라우저에서:  
   **`http://퍼블릭_IP/`**  
   (예: `http://3.34.12.34/`)
2. 한화그린 홈 화면이 보이면 성공  
3. **공지사항 / 온라인문의** 목록이 보이는지 확인  
4. 관리자: `http://퍼블릭_IP/bbs/login.php`  
   - 아이디 `admin` / 비밀번호 `green1234` (실서비스 전 변경 권장)

### 안 될 때 체크

| 증상 | 확인 |
|------|------|
| 연결 안 됨 | EC2 보안 그룹 **HTTP 80** 열려 있는지 |
| 오래 로딩 | SSH에서 `docker compose ps` — web/api **healthy** 인지 |
| 502 / 빈 화면 | `docker compose logs api --tail 50` |
| 빌드 실패 | `docker compose logs` 메모리 부족 시 t3.small 검토 |

SSH에서 API 헬스:

```bash
curl -s http://127.0.0.1/api/health
# {"status":"ok","database":"postgresql"} 이 나오면 좋음
```

---

## 코드 수정 후 다시 배포

로컬에서 GitHub에 push 한 뒤, EC2 SSH에서:

```bash
cd ~/hanwhagreen_test
./scripts/ec2-deploy.sh
```

---

## 비용·주의

- **실행 중인 EC2** 는 시간당 요금 (프리 티어 초과 시)  
- 안 쓸 때: EC2 인스턴스 **중지** (Stop) — IP가 바뀔 수 있음  
- DB 비밀번호·관리자 비밀번호는 **기본값 그대로 두지 말 것** (실습 후 변경)  
- 저장소가 **Public** 이면 코드가 공개됨

---

## 7번(도메인) 미리보기

6번까지는 `http://IP/` 로 접속.  
7번에서는 도메인(예: `www.mysite.com`) DNS를 EC2 IP에 연결하고, HTTPS(Let’s Encrypt)를 추가합니다.

---

## 프로젝트에 추가된 파일

| 파일 | 용도 |
|------|------|
| `docker-compose.ec2.yml` | 웹 포트 **80** 공개 |
| `scripts/ec2-setup.sh` | Docker 설치 |
| `scripts/ec2-deploy.sh` | clone/pull + compose up |
| `출결서비스_AWS배포.bat` | EC2용 `.env` 생성 + 프로덕션 APK 빌드 (PC) |
| `.env.ec2.example` | EC2 `.env` 항목 예시 |

GitHub: https://github.com/parkseonguk125/hanwhagreen_test
