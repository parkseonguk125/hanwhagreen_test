# Public https URL — anyone on the internet can open (LTE, other Wi-Fi, etc.)
# Requires: docker compose up -d

param(
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$logFile = Join-Path $root "tunnel.log"
$urlFile = Join-Path $root "PUBLIC_URL.txt"

function Find-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $winget = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter "cloudflared.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($winget) { return $winget.FullName }
  return $null
}

function Find-Chrome {
  $paths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
  )
  foreach ($p in $paths) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

function Open-InChrome([string]$Url) {
  $chrome = Find-Chrome
  if (-not $chrome) {
    Write-Host "Chrome not found. Open this URL manually: $Url" -ForegroundColor Yellow
    return
  }
  Start-Process -FilePath $chrome -ArgumentList $Url
  Write-Host "Opened in Google Chrome." -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking site on http://localhost:8081 ..." -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "http://localhost:8081/" -UseBasicParsing -TimeoutSec 8
  if ($r.StatusCode -ne 200) { throw "bad status" }
} catch {
  Write-Host "Site not reachable. Run first: docker compose up -d" -ForegroundColor Red
  exit 1
}

$cf = Find-Cloudflared
if (-not $cf) {
  Write-Host "cloudflared not found. Install:" -ForegroundColor Yellow
  Write-Host "  winget install Cloudflare.cloudflared"
  Write-Host "Then run this script again."
  exit 1
}

# Stop previous tunnel on same port log if any
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Remove-Item $logFile -Force -ErrorAction SilentlyContinue
Remove-Item $urlFile -Force -ErrorAction SilentlyContinue

Write-Host "Starting public tunnel..." -ForegroundColor Cyan
$proc = Start-Process -FilePath $cf `
  -ArgumentList "tunnel", "--url", "http://localhost:8081" `
  -RedirectStandardOutput $logFile `
  -RedirectStandardError (Join-Path $root "tunnel.err.log") `
  -PassThru -WindowStyle Hidden

$publicUrl = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  $errLog = Join-Path $root "tunnel.err.log"
  if ((Test-Path $logFile) -or (Test-Path $errLog)) {
    $text = ""
    if (Test-Path $logFile) { $text += Get-Content $logFile -Raw -ErrorAction SilentlyContinue }
    if (Test-Path $errLog) { $text += Get-Content $errLog -Raw -ErrorAction SilentlyContinue }
    if ($text -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
      $publicUrl = $Matches[1]
      break
    }
  }
  if ($proc.HasExited) { break }
}

Write-Host ""
if ($publicUrl) {
  Set-Content -Path $urlFile -Value $publicUrl -Encoding UTF8
  Write-Host "=== Public URL (share this) ===" -ForegroundColor Green
  Write-Host ""
  Write-Host "  $publicUrl"
  Write-Host ""
  Write-Host "Saved to: PUBLIC_URL.txt" -ForegroundColor DarkGray
  Write-Host "Tunnel PID: $($proc.Id)  (stop: .\scripts\stop-public-url.ps1)" -ForegroundColor DarkGray
  if (-not $NoBrowser) {
    Open-InChrome $publicUrl
  }
} else {
  Write-Host "Tunnel started but URL not ready yet. Check tunnel.log in a few seconds." -ForegroundColor Yellow
  Write-Host "Or run: Get-Content tunnel.log"
}

Write-Host ""
