# DB 백업·복원 (EC2, 초보용)

PostgreSQL 게시판 데이터를 `.sql` 파일로 저장하고, 필요할 때 되돌리는 방법입니다.

> **Git과의 차이:** GitHub에는 **코드**만 있습니다. 공지·문의·회원 **DB 데이터**는 `backups/*.sql`로 따로 보관해야 합니다.

---

## 준비

- EC2 SSH 접속 ([docs/WinSCP_PuTTY_배포_안내.md](WinSCP_PuTTY_배포_안내.md))
- 프로젝트 경로: `/home/ubuntu/hanwhagreen_test`
- 컨테이너 `hanwhagreen-db` 가 **실행 중**이어야 함

최신 스크립트 반영:

```bash
cd ~/hanwhagreen_test
git pull origin main
chmod +x scripts/db-backup.sh scripts/db-restore.sh scripts/ec2-pre-check.sh
```

---

## 1. 백업 만들기

```bash
cd ~/hanwhagreen_test
./scripts/db-backup.sh
```

성공하면:

```
backups/hanwhagreen_20260621_153000.sql
```

같은 파일이 생성됩니다.

**권장:** WinSCP로 `backups/*.sql`을 PC에도 복사해 두세요.

---

## 2. 복원 (연습)

1. (선택) 사이트에서 공지 1건 추가 → “복원하면 사라지는지” 확인용
2. 복원 실행:

```bash
cd ~/hanwhagreen_test
./scripts/db-restore.sh backups/hanwhagreen_YYYYMMDD_HHMMSS.sql
```

3. `yes` 입력 후 진행
4. 확인:

```bash
curl -s http://127.0.0.1/api/health
curl -s http://127.0.0.1/api/notice
docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -c "SELECT COUNT(*) FROM notice_posts;"
```

---

## 3. 수동 명령 (스크립트 없이)

백업:

```bash
docker exec hanwhagreen-db pg_dump -U hanwha -d hanwhagreen --clean --if-exists --no-owner --no-acl > backups/manual.sql
```

복원:

```bash
docker compose stop api
docker exec -i hanwhagreen-db psql -U hanwha -d hanwhagreen < backups/manual.sql
docker compose start api
```

---

## 주의

| 항목 | 설명 |
|------|------|
| QA **첨부파일** | DB 백업만으로는 `qa_uploads` 볼륨 파일은 복구되지 않음 |
| `backups/*.sql` | `.gitignore` 처리 — GitHub에 올리지 않음 |
| 복원 | 현재 DB 내용을 **백업 시점으로 덮어씀** |

---

## 관련 문서

- [서버_삭제_복구_연습_안내.md](서버_삭제_복구_연습_안내.md) — Git으로 코드 복구
- [AWS_EC2_배포_안내.md](AWS_EC2_배포_안내.md) — EC2 배포
