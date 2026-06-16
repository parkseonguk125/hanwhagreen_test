@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\local-db-error-trigger.ps1"
echo.
pause
