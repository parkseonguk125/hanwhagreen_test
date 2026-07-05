@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "APK_DIR=%~dp0mobile\dist"
if not exist "%APK_DIR%" mkdir "%APK_DIR%"
explorer "%APK_DIR%"
