#!/bin/bash

# Quiz Game Environment Setup Script
# Автоматическая настройка переменных окружения

set -e

echo "🔧 Настройка переменных окружения для Quiz Game..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для генерации случайных строк
generate_secret() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Функция для проверки существования файла
check_env_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${YELLOW}⚠️ Файл $file уже существует${NC}"
        read -p "Перезаписать? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    return 0
}

# Функция создания .env файла из example
setup_env_file() {
    local example_file=$1
    local target_file=$2
    local description=$3

    echo -e "${BLUE}📝 Настройка $description...${NC}"

    if check_env_file "$target_file"; then
        cp "$example_file" "$target_file"
        echo -e "${GREEN}✅ Создан $target_file${NC}"
        return 0
    else
        echo -e "${YELLOW}⏭️ Пропущен $target_file${NC}"
        return 1
    fi
}

# Функция для замены значений в .env файле
replace_env_value() {
    local file=$1
    local key=$2
    local value=$3

    if [ -f "$file" ]; then
        # Экранируем специальные символы для sed
        escaped_value=$(printf '%s\n' "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')
        sed -i "s/^$key=.*/$key=$escaped_value/" "$file"
    fi
}

# Генерация секретов
echo -e "${BLUE}🔐 Генерация секретов...${NC}"
JWT_SECRET=$(generate_secret 32)
SESSION_SECRET=$(generate_secret 24)
DB_PASSWORD=$(generate_secret 16)
REDIS_PASSWORD=$(generate_secret 16)

echo "JWT_SECRET: ${JWT_SECRET:0:8}..."
echo "SESSION_SECRET: ${SESSION_SECRET:0:8}..."
echo "DB_PASSWORD: ${DB_PASSWORD:0:8}..."
echo "REDIS_PASSWORD: ${REDIS_PASSWORD:0:8}..."

# Настройка корневого .env
if setup_env_file "env.example" ".env" "корневого .env"; then
    replace_env_value ".env" "JWT_SECRET" "$JWT_SECRET"
    replace_env_value ".env" "SESSION_SECRET" "$SESSION_SECRET"
    replace_env_value ".env" "DB_PASSWORD" "$DB_PASSWORD"
fi

# Настройка backend .env
if setup_env_file "quiz-game-backend/env.example" "quiz-game-backend/.env" "backend .env"; then
    replace_env_value "quiz-game-backend/.env" "JWT_SECRET" "$JWT_SECRET"
    replace_env_value "quiz-game-backend/.env" "SESSION_SECRET" "$SESSION_SECRET"
    replace_env_value "quiz-game-backend/.env" "DB_PASSWORD" "$DB_PASSWORD"
fi

# Настройка frontend .env
setup_env_file "quiz-game-frontend/env.example" "quiz-game-frontend/.env" "frontend .env"

# Настройка docker .env
if setup_env_file "docker/env.example" "docker/.env" "docker .env"; then
    replace_env_value "docker/.env" "POSTGRES_PASSWORD" "$DB_PASSWORD"
    replace_env_value "docker/.env" "REDIS_PASSWORD" "$REDIS_PASSWORD"
fi

# Проверка окружения
echo -e "${BLUE}🔍 Определение окружения...${NC}"
read -p "Выберите окружение (development/staging/production) [development]: " environment
environment=${environment:-development}

# Настройка переменных в зависимости от окружения
case $environment in
    "development")
        echo -e "${GREEN}🔧 Настройка для development...${NC}"
        replace_env_value ".env" "NODE_ENV" "development"
        replace_env_value ".env" "LOG_LEVEL" "debug"
        replace_env_value "quiz-game-backend/.env" "NODE_ENV" "development"
        replace_env_value "quiz-game-frontend/.env" "VITE_NODE_ENV" "development"
        ;;
    "staging")
        echo -e "${YELLOW}🚀 Настройка для staging...${NC}"
        replace_env_value ".env" "NODE_ENV" "staging"
        replace_env_value ".env" "LOG_LEVEL" "info"
        replace_env_value "quiz-game-backend/.env" "NODE_ENV" "staging"
        replace_env_value "quiz-game-frontend/.env" "VITE_NODE_ENV" "staging"

        # Запрос staging URL
        read -p "Введите staging API URL [https://api-staging.quiz-game.com]: " staging_api_url
        staging_api_url=${staging_api_url:-https://api-staging.quiz-game.com}
        replace_env_value "quiz-game-frontend/.env" "VITE_API_URL" "$staging_api_url"
        ;;
    "production")
        echo -e "${RED}🌟 Настройка для production...${NC}"
        replace_env_value ".env" "NODE_ENV" "production"
        replace_env_value ".env" "LOG_LEVEL" "warn"
        replace_env_value "quiz-game-backend/.env" "NODE_ENV" "production"
        replace_env_value "quiz-game-frontend/.env" "VITE_NODE_ENV" "production"

        # Запрос production URL
        read -p "Введите production API URL [https://api.quiz-game.com]: " prod_api_url
        prod_api_url=${prod_api_url:-https://api.quiz-game.com}
        replace_env_value "quiz-game-frontend/.env" "VITE_API_URL" "$prod_api_url"

        # Дополнительные production настройки
        replace_env_value "quiz-game-backend/.env" "SESSION_SECURE" "true"
        replace_env_value "quiz-game-frontend/.env" "VITE_DEBUG_MODE" "false"
        replace_env_value "quiz-game-frontend/.env" "VITE_CONSOLE_LOGS" "false"
        ;;
esac

# Проверка обязательных переменных
echo -e "${BLUE}✅ Проверка конфигурации...${NC}"

check_required_var() {
    local file=$1
    local var=$2
    local description=$3

    if [ -f "$file" ]; then
        value=$(grep "^$var=" "$file" | cut -d'=' -f2)
        if [ -z "$value" ] || [ "$value" = "your-secret-key" ] || [ "$value" = "change-in-production" ]; then
            echo -e "${RED}❌ $description не настроен в $file${NC}"
            return 1
        else
            echo -e "${GREEN}✅ $description настроен${NC}"
            return 0
        fi
    fi
    return 1
}

# Проверка обязательных переменных
all_good=true

check_required_var ".env" "JWT_SECRET" "JWT Secret" || all_good=false
check_required_var ".env" "DB_PASSWORD" "Database Password" || all_good=false
check_required_var "quiz-game-backend/.env" "JWT_SECRET" "Backend JWT Secret" || all_good=false

# Создание папок
echo -e "${BLUE}📁 Создание необходимых папок...${NC}"
mkdir -p logs uploads backups
mkdir -p quiz-game-backend/logs quiz-game-backend/uploads
echo -e "${GREEN}✅ Папки созданы${NC}"

# Установка прав доступа
echo -e "${BLUE}🔒 Настройка прав доступа...${NC}"
chmod 600 .env quiz-game-backend/.env quiz-game-frontend/.env docker/.env 2>/dev/null || true
chmod 755 logs uploads backups
echo -e "${GREEN}✅ Права доступа настроены${NC}"

# Итоговый отчет
echo ""
echo -e "${GREEN}🎉 Настройка переменных окружения завершена!${NC}"
echo ""
echo -e "${BLUE}📋 Созданные файлы:${NC}"
[ -f ".env" ] && echo "  ✅ .env"
[ -f "quiz-game-backend/.env" ] && echo "  ✅ quiz-game-backend/.env"
[ -f "quiz-game-frontend/.env" ] && echo "  ✅ quiz-game-frontend/.env"
[ -f "docker/.env" ] && echo "  ✅ docker/.env"

echo ""
echo -e "${BLUE}🔧 Следующие шаги:${NC}"
echo "  1. Проверьте созданные .env файлы"
echo "  2. При необходимости измените настройки"
echo "  3. Запустите: npm run setup"
echo "  4. Запустите: npm run dev"

echo ""
if [ "$all_good" = true ]; then
    echo -e "${GREEN}✅ Все обязательные переменные настроены правильно${NC}"
else
    echo -e "${RED}⚠️ Некоторые переменные требуют дополнительной настройки${NC}"
fi

echo ""
echo -e "${YELLOW}📚 Документация:${NC}"
echo "  - docs/ENVIRONMENT_SETUP.md - полное руководство"
echo "  - env.example - примеры переменных"
echo "  - docker/env.example - Docker настройки"

echo ""
echo -e "${BLUE}🔐 Безопасность:${NC}"
echo "  - Никогда не коммитьте .env файлы в git"
echo "  - Регулярно обновляйте секреты"
echo "  - Используйте разные секреты для каждого окружения"
