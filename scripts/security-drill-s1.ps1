# S1 — 로그인 실패 3회 (임계치 미만, 관찰)
# Run: npm run local:security-s1

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$BaseUrl = "http://localhost:8081/api/auth/login"
$Body = '{"mb_id":"admin","mb_password":"wrong_password"}'

Write-Host ""
Write-Host "========================================"
Write-Host "  S1: 로그인 실패 3회 (관찰)"
Write-Host "========================================"
Write-Host ""

for ($i = 1; $i -le 3; $i++) {
    Write-Host "[$i/3] POST $BaseUrl (잘못된 비밀번호)"
    try {
        $r = Invoke-WebRequest -Uri $BaseUrl -Method POST -Body $Body `
            -ContentType "application/json" -UseBasicParsing
        Write-Host "  status: $($r.StatusCode)"
    } catch {
        if ($_.Exception.Response) {
            Write-Host "  status: $([int]$_.Exception.Response.StatusCode)"
        } else {
            Write-Host "  error: $_"
        }
    }
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "--- 확인 ---"
Write-Host "  docker compose logs api --tail 15"
Write-Host "  [security] login_failed 로그 확인"
Write-Host ""
Write-Host "조치: bash scripts/security-incident-snapshot.sh"
Write-Host ""
