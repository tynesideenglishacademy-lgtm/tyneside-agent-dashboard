@echo off
title Tyneside Agent Dashboard Launcher
echo ========================================================
echo   Starting Tyneside Agent Dashboard & Backend Engine...
echo ========================================================
echo.

:: 1. Launch Backend Server in minimized window
echo [1/3] Starting Backend Server (Express + Supabase + NVIDIA NIM)...
start "Tyneside Backend Engine" /min cmd /c "cd /d "%~dp0backend" && npm run dev"

:: 2. Launch Frontend Vite Dev Server in minimized window
echo [2/3] Starting Frontend React App (Vite)...
start "Tyneside Agent Dashboard" /min cmd /c "cd /d "%~dp0" && npm run dev"

:: 3. Wait 3 seconds for servers to initialize
echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

:: 4. Open Default Web Browser to Dashboard
echo Opening Tyneside Agent Dashboard at http://localhost:5173...
start http://localhost:5173

echo.
echo ========================================================
echo   Dashboard launched successfully!
echo   You can minimize this window.
echo ========================================================
