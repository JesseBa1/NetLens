@echo off
setlocal
chcp 65001 >nul
title NetLens
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0NetLens.ps1" %*
if errorlevel 1 pause
endlocal
