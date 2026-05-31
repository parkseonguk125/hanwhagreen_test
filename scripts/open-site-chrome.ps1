# Open site in Google Chrome (local or public URL from PUBLIC_URL.txt)

param(
  [ValidateSet("local", "public")]
  [string]$Target = "public"
)

$root = Split-Path $PSScriptRoot -Parent
$urlFile = Join-Path $root "PUBLIC_URL.txt"

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

$url = if ($Target -eq "local") {
  "http://localhost:8081/"
} elseif (Test-Path $urlFile) {
  (Get-Content $urlFile -Raw).Trim()
} else {
  $null
}

if (-not $url) {
  Write-Host "No public URL. Run: .\scripts\start-public-url-host.ps1" -ForegroundColor Yellow
  exit 1
}

$chrome = Find-Chrome
if (-not $chrome) {
  Write-Host "Chrome not installed. URL: $url" -ForegroundColor Yellow
  exit 1
}

Start-Process -FilePath $chrome -ArgumentList $url
Write-Host "Chrome: $url" -ForegroundColor Green
