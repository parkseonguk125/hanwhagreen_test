@echo off
REM 4단계 전용 - 1~3단계 끝난 뒤에만 실행
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\local-db-error-fix.ps1"
echo.
pause
