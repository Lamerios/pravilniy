#!/bin/bash

# Quiz Game Setup Script
# Автоматическая настройка проекта для разработки

set -e

echo "🚀 Настройка Quiz Game проекта..."

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js >= 18.0.0, найдена версия $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) найден"

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker не найден. Некоторые функции будут недоступны"
    echo "Установите Docker Desktop для полной функциональности"
else
    echo "✅ Docker найден"
fi

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm run install:all

# Проверка Docker сервисов
if command -v docker &> /dev/null; then
    echo "🐳 Запуск Docker сервисов..."
    npm run services:start
    
    echo "⏳ Ожидание готовности сервисов..."
    sleep 10
    
    # Проверка здоровья сервисов
    if npm run health:check > /dev/null 2>&1; then
        echo "✅ Все сервисы запущены и готовы"
    else
        echo "⚠️ Некоторые сервисы могут быть недоступны"
    fi
else
    echo "⏭️ Пропуск запуска Docker сервисов"
fi

echo ""
echo "🎉 Настройка завершена!"
echo ""
echo "📋 Доступные команды:"
echo "  npm run dev          - Запуск в режиме разработки"
echo "  npm run build        - Сборка проекта"
echo "  npm run test         - Запуск всех тестов"
echo "  npm run lint         - Проверка кода"
echo "  npm run services:*   - Управление Docker сервисами"
echo ""
echo "🌐 После запуска будут доступны:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5001"
echo "  PgAdmin:  http://localhost:8080"
echo "  Redis:    http://localhost:8081"
echo ""
echo "🚀 Запустите 'npm run dev' для начала разработки!"
