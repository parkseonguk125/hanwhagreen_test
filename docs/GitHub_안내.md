# 4번 — Git + GitHub 연동 안내

## 지금 PC 상태 (확인됨)

| 항목 | 상태 |
|------|------|
| Git 설치 | **이미 있음** (`git version 2.52.0.windows.1`) — **다시 설치할 필요 없음** |
| 로컬 저장소 | **이미 있음** (`docker_exam2` 폴더가 Git 프로젝트) |
| GitHub 원격 | 아직 없음 → 아래에서 저장소 만들고 `push` |

## 내가 할 일 vs 직접 할 일

| 작업 | 누가 |
|------|------|
| `.gitignore` 정리, 코드·문서 준비 | Cursor(에이전트) 또는 본인 |
| **GitHub 회원가입** | **본인** (한 번만) |
| **GitHub에 빈 저장소 생성** | **본인** (웹에서 클릭) |
| `git push` 시 **로그인·토큰 입력** | **본인** (비밀번호는 GitHub에 직접만) |
| 원격 URL 연결·첫 push 명령 실행 | 본인 PC 터미널 (또는 에이전트가 명령 안내) |

> 에이전트는 **본인 GitHub 계정으로 대신 로그인·push 할 수 없습니다.**  
> 저장소 이름·공개/비공개 선택만 정해 주시면, 나머지 명령은 단계별로 안내할 수 있습니다.

---

## 1단계: GitHub 저장소 만들기

1. 브라우저에서 https://github.com 로그인 (없으면 Sign up)
2. 오른쪽 위 **+** → **New repository**
3. 예시 설정:
   - Repository name: `hanwhagreen-docker` (원하는 이름)
   - **Private** 권장 (과제·실습용)
   - **README / .gitignore / license 추가하지 않기** (로컬에 이미 있음)
4. **Create repository** 클릭
5. 생성 후 나오는 주소 복사 (예: `https://github.com/내아이디/hanwhagreen-docker.git`)

---

## 2단계: 변경 사항 커밋 (로컬)

PowerShell:

```powershell
cd c:\Users\psw00\OneDrive\Desktop\docker_exam2

git status
git add .
git status
git commit -m "DB·게시판·로그인·QA 첨부/링크 및 문서 정리"
```

`git add .` 전에 `git status`로 `tunnel.log`, `.env` 등이 **안 올라가는지** 확인하세요 (`.gitignore`에 포함됨).

---

## 3단계: GitHub에 연결하고 올리기

`YOUR_REPO_URL`을 1단계에서 복사한 주소로 바꿉니다.

```powershell
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
```

이미 `origin`이 있으면:

```powershell
git remote set-url origin YOUR_REPO_URL
git push -u origin main
```

### 로그인 창이 뜨면

- **HTTPS**: GitHub **Personal Access Token** 사용 (비밀번호 대신)
  - GitHub → Settings → Developer settings → Personal access tokens → Generate
  - 권한: `repo` (비공개 저장소면 필수)
- 또는 **Git Credential Manager**가 설치되어 있으면 브라우저 로그인 안내가 나옵니다.

---

## 4단계: 잘 올라갔는지 확인

- GitHub 저장소 페이지에 `frontend/`, `backend/`, `docker-compose.yml` 등이 보이면 성공
- `ROADMAP.md` 4번을 `[x]`로 표시해 두면 진행 기록과 맞습니다

---

## 이후 작업할 때 (5번 EC2 준비)

```powershell
git add .
git commit -m "변경 내용 설명"
git push
```

EC2 서버에서는:

```bash
git clone YOUR_REPO_URL
cd hanwhagreen-docker   # 저장소 폴더명에 맞게
docker compose up -d --build
```

---

## 자주 묻는 것

**Q. Git을 새로 설치해야 하나요?**  
A. 이 PC에는 이미 설치되어 있습니다.

**Q. Cursor가 전부 해줄 수 있나요?**  
A. 로컬 정리·문서·명령 안내는 가능합니다. GitHub 계정·토큰·첫 `push` 인증은 본인만 가능합니다.

**Q. `tunnel.log`도 올려도 되나요?**  
A. 아니요. `.gitignore`에 넣어 두었습니다. 로그·`.env`는 올리지 마세요.
