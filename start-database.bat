@echo off
title Arafat Poultry - MySQL Database Starter
echo ========================================================
echo   Arafat Poultry & Fisheries - MySQL Database Service
echo ========================================================
echo Checking if MySQL is already running...
netstat -ano | findstr "3306" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MySQL is already running on port 3306!
) else (
    echo [STARTING] Starting MySQL server from Laragon...
    start "" "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" --defaults-file="C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini"
    timeout /t 3 /nobreak >nul
    echo [OK] MySQL started successfully!
)
echo.
echo Press any key to close this window.
pause >nul
