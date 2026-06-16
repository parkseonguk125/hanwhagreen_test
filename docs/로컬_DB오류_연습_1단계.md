# 1단계 — 로컬 DB 중단 오류 (발생만, 복구 없음)

DB를 **끄기만** 해서 오류 상태를 만듭니다.  
**복구는 4단계**에서 합니다.

---

## 실행 (1단계)

**Docker Desktop** 실행 후:

- **`로컬_DB오류_발생.bat`** 더블클릭  

또는:

```powershell
cd c:\Users\psw00\OneDrive\Desktop\docker_exam2
npm run local:db-error
```

---

## 오류 확인

| 확인 | 주소 |
|------|------|
| 홈 | http://localhost:8081 |
| 로그인 실패 | http://localhost:8081/bbs/login.php |
| API | http://localhost:8081/api/health |
| 로그 | `docker compose logs api --tail 30` |

---

## 다음

| 단계 | 내용 |
|------|------|
| 2 | 카카오 알림 — [카카오_알림_설정.md](카카오_알림_설정.md) |
| 3 | 로그 분석 |
| **4** | **복구** — `npm run local:db-fix` 또는 `로컬_DB오류_복구.bat` |

---

## 주의

- 1~3단계 동안 **DB는 꺼진 채** 둡니다.
- **4단계 전까지** `로컬_DB오류_복구.bat` 늼 실행하지 마세요.
