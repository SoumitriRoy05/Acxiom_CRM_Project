@echo off
title AcxiomCRM Spring Boot Backend
echo ========================================================
echo    Starting AcxiomCRM Spring Boot Backend (Port 8080)
echo ========================================================
cd /d "%~dp0backend"
mvn spring-boot:run
pause
