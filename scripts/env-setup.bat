@echo off
REM Quiz Game Environment Setup Script for Windows
REM Автоматическая настройка переменных окружения

echo 🔧 Настройка переменных окружения для Quiz Game...

REM Функция для генерации случайных строк (упрощенная версия для Windows)
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

REM Генерация простых секретов (в production используйте более сложные)
set JWT_SECRET=quiz-game-jwt-secret-change-in-production-32chars
set SESSION_SECRET=quiz-game-session-secret-24chars
set DB_PASSWORD=quiz_dev_password_16chars
set REDIS_PASSWORD=redis_dev_password_16chars

echo Генерация секретов завершена...

REM Проверка существования файлов
if exist ".env" (
    echo ⚠️ Файл .env уже существует
    set /p overwrite="Перезаписать? (y/N): "
    if /i not "%overwrite%"=="y" goto skip_root
)

REM Создание корневого .env
echo 📝 Создание корневого .env...
copy "env.example" ".env" >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка создания .env
) else (
    echo ✅ Создан .env
)

:skip_root

REM Backend .env
if exist "quiz-game-backend\.env" (
    echo ⚠️ Файл quiz-game-backend\.env уже существует
    set /p overwrite_backend="Перезаписать? (y/N): "
    if /i not "%overwrite_backend%"=="y" goto skip_backend
)

echo 📝 Создание backend .env...
copy "quiz-game-backend\env.example" "quiz-game-backend\.env" >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка создания backend .env
) else (
    echo ✅ Создан quiz-game-backend\.env
)

:skip_backend

REM Frontend .env
if exist "quiz-game-frontend\.env" (
    echo ⚠️ Файл quiz-game-frontend\.env уже существует
    set /p overwrite_frontend="Перезаписать? (y/N): "
    if /i not "%overwrite_frontend%"=="y" goto skip_frontend
)

echo 📝 Создание frontend .env...
copy "quiz-game-frontend\env.example" "quiz-game-frontend\.env" >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка создания frontend .env
) else (
    echo ✅ Создан quiz-game-frontend\.env
)

:skip_frontend

REM Docker .env
if exist "docker\.env" (
    echo ⚠️ Файл docker\.env уже существует
    set /p overwrite_docker="Перезаписать? (y/N): "
    if /i not "%overwrite_docker%"=="y" goto skip_docker
)

echo 📝 Создание docker .env...
copy "docker\env.example" "docker\.env" >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка создания docker .env
) else (
    echo ✅ Создан docker\.env
)

:skip_docker

REM Выбор окружения
echo.
echo 🔍 Определение окружения...
set /p environment="Выберите окружение (development/staging/production) [development]: "
if "%environment%"=="" set environment=development

echo.
echo 🔧 Настройка для %environment%...

REM Создание необходимых папок
echo 📁 Создание необходимых папок...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "quiz-game-backend\logs" mkdir quiz-game-backend\logs
if not exist "quiz-game-backend\uploads" mkdir quiz-game-backend\uploads
echo ✅ Папки созданы

REM Итоговый отчет
echo.
echo 🎉 Настройка переменных окружения завершена!
echo.
echo 📋 Созданные файлы:
if exist ".env" echo   ✅ .env
if exist "quiz-game-backend\.env" echo   ✅ quiz-game-backend\.env
if exist "quiz-game-frontend\.env" echo   ✅ quiz-game-frontend\.env
if exist "docker\.env" echo   ✅ docker\.env

echo.
echo 🔧 Следующие шаги:
echo   1. Проверьте созданные .env файлы
echo   2. При необходимости измените настройки
echo   3. Запустите: npm run setup
echo   4. Запустите: npm run dev

echo.
echo ⚠️ ВАЖНО для production:
echo   - Измените JWT_SECRET на случайную строку (32+ символа)
echo   - Измените SESSION_SECRET на случайную строку
echo   - Установите сложные пароли для БД
echo   - Настройте реальные URL для API

echo.
echo 📚 Документация:
echo   - docs\ENVIRONMENT_SETUP.md - полное руководство
echo   - env.example - примеры переменных
echo   - docker\env.example - Docker настройки

echo.
echo 🔐 Безопасность:
echo   - Никогда не коммитьте .env файлы в git
echo   - Регулярно обновляйте секреты
echo   - Используйте разные секреты для каждого окружения

pause
