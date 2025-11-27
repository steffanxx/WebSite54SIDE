@echo off
chcp 65001
echo Запуск 54Side...
cd /d "D:\WebSites\Clear Routine"

start "" node server.js
timeout /t 3 >nul
start "" "http://localhost:3000"

echo Сервер запущен
pause