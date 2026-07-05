@echo off
chcp 65001 >nul
title 출격앱 환경확인
cd /d "%~dp0"
echo.
echo [실행 중] 출격앱 환경 점검을 시작합니다...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "mobile\scripts\check-setup.ps1"
echo.
echo 위 결과를 확인하세요. [OK] 가 많을수록 준비가 잘 된 것입니다.
pause
