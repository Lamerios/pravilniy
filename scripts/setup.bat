@echo off
REM Quiz Game Setup Script for Windows
REM Автоматическая настройка проекта для разработки

echo 🚀 Настройка Quiz Game проекта...

REM Проверка Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден. Установите Node.js ^>= 18.0.0
    pause
    exit /b 1
)

echo ✅ Node.js найден

REM Проверка Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker не найден. Некоторые функции будут недоступны
    echo Установите Docker Desktop для полной функциональности
) else (
    echo ✅ Docker найден
)

REM Установка зависимостей
echo 📦 Установка зависимостей...
call npm run install:all

REM Проверка Docker сервисов
docker --version >nul 2>&1
if not errorlevel 1 (
    echo 🐳 Запуск Docker сервисов...
    call npm run services:start
    
    echo ⏳ Ожидание готовности сервисов...
    timeout /t 10 /nobreak >nul
    
    echo ✅ Сервисы запущены
) else (
    echo ⏭️ Пропуск запуска Docker сервисов
)

echo.
echo 🎉 Настройка завершена!
echo.
echo 📋 Доступные команды:
echo   npm run dev          - Запуск в режиме разработки
echo   npm run build        - Сборка проекта
echo   npm run test         - Запуск всех тестов
echo   npm run lint         - Проверка кода
echo   npm run services:*   - Управление Docker сервисами
echo.
echo 🌐 После запуска будут доступны:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5001
echo   PgAdmin:  http://localhost:8080
echo   Redis:    http://localhost:8081
echo.
echo 🚀 Запустите 'npm run dev' для начала разработки!
pause
