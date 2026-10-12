@echo off
title AcxiomCRM Launcher
echo ========================================================
echo          Starting AcxiomCRM Full-Stack Application
echo ========================================================
echo 1. Launching Spring Boot Backend on http://localhost:8080 ...
start "AcxiomCRM Backend" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

echo 2. Launching React Frontend on http://localhost:5173 ...
start "AcxiomCRM Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo ========================================================
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:5173
echo ========================================================
echo Both services launched in separate windows!
pause
