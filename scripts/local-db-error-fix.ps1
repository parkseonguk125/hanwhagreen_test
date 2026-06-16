# 4단계 - DB 복구 (1~3단계 연습 후에만 사용)
# Run: .\scripts\local-db-error-fix.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "========================================"
Write-Host "  4단계: DB 복구"
Write-Host "========================================"
Write-Host ""

Write-Host "[1/4] DB 컨테이너 시작..."
docker compose start db
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "[2/4] API health 대기 (최대 30초)..."
$ok = $false
for ($i = 1; $i -le 10; $i++) {
    Start-Sleep -Seconds 3
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8081/api/health" -UseBasicParsing -TimeoutSec 5
        if ($r.StatusCode -eq 200 -and $r.Content -match '"status":"ok"') {
            $ok = $true
            break
        }
    } catch {
        Write-Host "  대기... ($i/10)"
    }
}

Write-Host ""
Write-Host "[3/4] 컨테이너 상태:"
docker compose ps

Write-Host ""
if ($ok) {
    Write-Host "[4/4] 복구 완료"
    Write-Host "  http://localhost:8081/bbs/login.php"
} else {
    Write-Host "[4/4] DB 시작됨. API 준비 중일 수 있음."
    Write-Host "  docker compose restart api"
}
Write-Host ""
