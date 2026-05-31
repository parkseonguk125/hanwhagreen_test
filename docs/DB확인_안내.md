# DB 적용 확인 방법 (초보자용)

## 가장 쉬운 방법: `DB확인.bat`

1. 프로젝트 폴더에서 **`DB확인.bat`** 더블클릭
2. 검은 창에 **[OK]** 가 여러 개 나오면 DB 연동 성공
3. **[X]** 가 나오면 아래 "문제 해결" 참고

---

## 방법 1 — 브라우저만으로 확인 (추천)

### ① DB 연결 종류 확인

주소창에 입력:

```
http://localhost:8081/api/health
```

**성공 예시 (PostgreSQL 적용됨):**

```json
{"status":"ok","database":"postgresql"}
```

- `database` 가 **`postgresql`** 이면 → 서버가 PostgreSQL 사용 중
- `database` 가 없고 `{"status":"ok"}` 만 있으면 → **예전 버전** (아직 PostgreSQL 미적용)

### ② 공지사항이 DB에서 오는지

```
http://localhost:8081/api/notice
```

**성공 예시:** 글 목록 JSON (제목 `한화그린 홈페이지 리뉴얼` 등)

### ③ 온라인문의가 DB에서 오는지

```
http://localhost:8081/api/qa
```

**성공 예시:** 글 목록 JSON (id 18 등)

### ④ 화면으로 확인

| 페이지 | 주소 |
|--------|------|
| 공지사항 | http://localhost:8081/bbs/board.php?bo_table=notice |
| 온라인문의 | http://localhost:8081/bbs/board.php?bo_table=qa |

글 목록이 보이면 UI도 서버 데이터를 쓰는 것입니다.

---

## 방법 2 — 개발자 도구 (DB vs 브라우저 저장소)

1. 공지사항 페이지 연다
2. 키보드 **F12** → **Network(네트워크)** 탭
3. **새로고침(F5)**
4. 목록에서 **`notice`** 요청 찾기

| 보이는 것 | 의미 |
|-----------|------|
| `/api/notice` 요청 | **서버 DB 사용** (적용됨) |
| localStorage만 사용 | 예전 방식 (브라우저 저장) |

**Application** 탭 → **Local Storage** 에 게시글 데이터가 없어도 목록이 보이면 → DB에서 읽는 것입니다.

---

## 방법 3 — Docker에서 DB 직접 보기

PowerShell:

```powershell
cd c:\Users\psw00\OneDrive\Desktop\docker_exam2
docker compose ps
```

`hanwhagreen-db` 가 **Up** 이어야 합니다.

DB 안 글 보기:

```powershell
docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -c "SELECT id, subject FROM notice_posts;"
docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -c "SELECT id, subject FROM qa_posts;"
```

표에 글이 보이면 PostgreSQL에 저장된 것입니다.

---

## 지금 PC 상태 (확인 시점 참고)

PostgreSQL 컨테이너(`hanwhagreen-db`)가 없으면:

```powershell
docker compose up -d --build
```

PostgreSQL 이미지 다운로드가 실패하면(EOF 오류):

```powershell
docker pull postgres:16-alpine
docker compose up -d --build
```

성공 후 **`DB확인.bat`** 을 다시 실행하세요.

---

## 한 줄 요약

**`http://localhost:8081/api/health` 에 `"database":"postgresql"` 이 보이면 DB 적용 완료입니다.**
