@echo off
title AcxiomCRM React Frontend
echo ========================================================
echo    Starting AcxiomCRM React Frontend (Port 5173)
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
