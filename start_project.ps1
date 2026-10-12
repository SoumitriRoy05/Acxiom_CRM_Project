# AcxiomCRM PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         Starting AcxiomCRM Full-Stack Application       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Launching Spring Boot Backend on http://localhost:8080 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir/backend'; mvn spring-boot:run"

Write-Host "Launching React Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir/frontend'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Both processes started in background windows."
