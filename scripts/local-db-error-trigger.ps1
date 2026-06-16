# 1단계 - DB 중단으로 로컬 오류 발생 (복구 없음)
# Run: .\scripts\local-db-error-trigger.ps1
# 복구는 4단계: scripts/local-db-error-fix.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "========================================"
Write-Host "  1단계: DB 중지 (오류 발생만)"
Write-Host "========================================"
Write-Host ""

Write-Host "[1/3] Docker 상태 확인..."
docker compose ps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker Desktop 실행 여부 확인"
    exit 1
}

Write-Host ""
Write-Host "[2/3] DB 컨테이너 중지..."
docker compose stop db
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "[3/3] 오류 상태 활성화됨 (DB 중지)"
docker compose ps

Write-Host ""
Write-Host "--- 브라우저에서 확인 ---"
Write-Host "  홈:     http://localhost:8081"
Write-Host "  로그인: http://localhost:8081/bbs/login.php  (admin/green1234 -> 오류)"
Write-Host "  API:    http://localhost:8081/api/health"
Write-Host ""
Write-Host "--- 로그 ---"
Write-Host "  docker compose logs api --tail 30"
Write-Host ""
Write-Host "다음: 2단계 카카오 알림 -> 3단계 로그 분석"
Write-Host "복구(4단계): npm run local:db-fix  (지금은 실행하지 마세요)"
Write-Host ""
