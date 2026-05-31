# DB check script (beginner friendly)
# Run: .\scripts\check-db.ps1

$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

function Ok($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "[X]  $msg" -ForegroundColor Red }
function Info($msg) { Write-Host "     $msg" -ForegroundColor DarkGray }

Write-Host ""
Write-Host "=== Hanwhagreen DB Check ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Docker containers" -ForegroundColor Yellow
$db = docker ps --filter "name=hanwhagreen-db" --format "{{.Names}}" 2>$null
$api = docker ps --filter "name=hanwhagreen-api2" --format "{{.Names}}" 2>$null
$web = docker ps --filter "name=hanwhagreen-web2" --format "{{.Names}}" 2>$null

if ($db -eq "hanwhagreen-db") { Ok "PostgreSQL (hanwhagreen-db) running" }
else { Fail "PostgreSQL not running - run: docker compose up -d --build" }

if ($api -eq "hanwhagreen-api2") { Ok "API running" }
else { Fail "API not running" }

if ($web -eq "hanwhagreen-web2") { Ok "Web running" }
else { Fail "Web not running" }

Write-Host ""
Write-Host "2. API database connection" -ForegroundColor Yellow
try {
  $health = Invoke-RestMethod -Uri "http://localhost:8081/api/health" -TimeoutSec 8
  if ($health.database -eq "postgresql") {
    Ok "Connected to PostgreSQL (see database: postgresql)"
  } elseif ($health.status -eq "ok") {
    Fail "API works but not PostgreSQL yet - rebuild: docker compose up -d --build"
    Info "health response: $($health | ConvertTo-Json -Compress)"
  } else {
    Fail "Unexpected health response"
  }
} catch {
  Fail "Cannot reach http://localhost:8081/api/health"
  Info $_.Exception.Message
}

Write-Host ""
Write-Host "3. Board data from server DB" -ForegroundColor Yellow
try {
  $notice = Invoke-RestMethod -Uri "http://localhost:8081/api/notice" -TimeoutSec 8
  if (@($notice).Count -gt 0) {
    Ok "Notice board: $(@($notice).Count) post(s) from DB"
    Info "First: id=$($notice[0].id) $($notice[0].subject)"
  } else { Fail "Notice board: empty" }
} catch {
  Fail "Notice API failed"
}

try {
  $qa = Invoke-RestMethod -Uri "http://localhost:8081/api/qa" -TimeoutSec 8
  if (@($qa).Count -gt 0) {
    Ok "QA board: $(@($qa).Count) post(s) from DB"
    Info "First: id=$($qa[0].id) $($qa[0].subject)"
  } else { Fail "QA board: empty" }
} catch {
  Fail "QA API failed"
}

Write-Host ""
Write-Host "4. Member login (DB)" -ForegroundColor Yellow
try {
  $loginBody = @{ mb_id = "admin"; mb_password = "green1234"; auto_login = $false } | ConvertTo-Json
  $login = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -TimeoutSec 8
  if ($login.token -and $login.member.id -eq "admin") {
    Ok "Login API: admin account works (token issued)"
    Info "See docs/로그인_안내.md for credentials"
  } else {
    Fail "Login API: unexpected response"
  }
} catch {
  Fail "Login API failed (rebuild api: docker compose up -d --build api)"
  Info $_.Exception.Message
}

Write-Host ""
Write-Host "=== Browser checks ===" -ForegroundColor Cyan
Write-Host "  http://localhost:8081/api/health" -ForegroundColor White
Write-Host "    -> database must be postgresql" -ForegroundColor DarkGray
Write-Host "  http://localhost:8081/api/notice" -ForegroundColor White
Write-Host "    -> JSON list = notice from DB" -ForegroundColor DarkGray
Write-Host "  http://localhost:8081/bbs/board.php?bo_table=notice" -ForegroundColor White
Write-Host "    -> normal page = UI uses API" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  F12 -> Network tab -> reload notice page" -ForegroundColor DarkGray
Write-Host "    -> request to /api/notice = DB mode (not browser storage)" -ForegroundColor DarkGray
Write-Host ""

if ($db -eq "hanwhagreen-db") {
  Write-Host "=== Optional: see rows inside PostgreSQL ===" -ForegroundColor Cyan
  Write-Host '  docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -c "SELECT id, subject FROM notice_posts;"'
  Write-Host '  docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -c "SELECT id, subject FROM qa_posts;"'
  Write-Host '  docker exec hanwhagreen-db psql -U hanwha -d hanwhagreen -c "SELECT mb_id, mb_name, mb_level FROM members;"'
  Write-Host ""
}
