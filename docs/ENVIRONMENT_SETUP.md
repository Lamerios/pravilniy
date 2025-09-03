# 🔧 Environment Setup Guide

> **Полное руководство по настройке переменных окружения для Quiz Game**

## 📋 Обзор

Quiz Game использует переменные окружения для конфигурации всех компонентов системы. Каждая часть проекта имеет свой набор переменных, которые можно настроить для разных окружений.

## 📁 Структура файлов

```
quiz-game/
├── env.example                    # 🌐 Общие настройки проекта
├── quiz-game-backend/
│   └── env.example                # ⚙️ Backend конфигурация
├── quiz-game-frontend/
│   └── env.example                # 🎨 Frontend конфигурация (VITE_*)
├── docker/
│   └── env.example                # 🐳 Docker Compose настройки
└── docs/
    └── ENVIRONMENT_SETUP.md       # 📖 Эта документация
```

## 🚀 Быстрая настройка

### 1. Скопируйте example файлы
```bash
# Корневой .env
cp env.example .env

# Backend .env
cp quiz-game-backend/env.example quiz-game-backend/.env

# Frontend .env
cp quiz-game-frontend/env.example quiz-game-frontend/.env

# Docker .env
cp docker/env.example docker/.env
```

### 2. Настройте основные параметры
```bash
# В корневом .env
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-session-secret
```

### 3. Запустите проект
```bash
npm run setup
npm run dev
```

## 🔧 Переменные по категориям

### 🗄️ База данных (PostgreSQL)

| Переменная | Описание | По умолчанию | Обязательная |
|------------|----------|--------------|--------------|
| `DB_HOST` | Хост PostgreSQL | localhost | ✓ |
| `DB_PORT` | Порт PostgreSQL | 5432 | ✓ |
| `DB_NAME` | Имя базы данных | quiz_game_dev | ✓ |
| `DB_USER` | Пользователь БД | quiz_user | ✓ |
| `DB_PASSWORD` | Пароль БД | dev_password | ✓ |
| `DB_SSL` | Использовать SSL | false | - |
| `DB_POOL_MIN` | Мин. соединений | 2 | - |
| `DB_POOL_MAX` | Макс. соединений | 10 | - |

### 🔴 Кеш (Redis)

| Переменная | Описание | По умолчанию | Обязательная |
|------------|----------|--------------|--------------|
| `REDIS_HOST` | Хост Redis | localhost | ✓ |
| `REDIS_PORT` | Порт Redis | 6379 | ✓ |
| `REDIS_PASSWORD` | Пароль Redis | (пустой) | - |
| `REDIS_DB` | Номер БД | 0 | - |
| `REDIS_TTL` | TTL по умолчанию | 3600 | - |

### 🔐 Аутентификация

| Переменная | Описание | По умолчанию | Обязательная |
|------------|----------|--------------|--------------|
| `JWT_SECRET` | Секрет для JWT | (нужно установить) | ✓ |
| `JWT_EXPIRES_IN` | Время жизни токена | 24h | - |
| `JWT_REFRESH_EXPIRES_IN` | Время жизни refresh токена | 7d | - |
| `SESSION_SECRET` | Секрет сессий | (нужно установить) | ✓ |
| `BCRYPT_ROUNDS` | Раунды хеширования | 12 | - |

### 🌐 API и CORS

| Переменная | Описание | По умолчанию | Обязательная |
|------------|----------|--------------|--------------|
| `BACKEND_PORT` | Порт backend | 5001 | ✓ |
| `FRONTEND_PORT` | Порт frontend | 3000 | ✓ |
| `API_PREFIX` | Префикс API | /api | - |
| `CORS_ORIGIN` | Разрешенные домены | localhost:3000 | ✓ |
| `CORS_CREDENTIALS` | Поддержка cookies | true | - |

### 📁 Файлы и загрузки

| Переменная | Описание | По умолчанию | Обязательная |
|------------|----------|--------------|--------------|
| `UPLOAD_MAX_SIZE` | Макс. размер файла | 10mb | - |
| `UPLOAD_PATH` | Папка загрузок | ./uploads | - |
| `ALLOWED_FILE_TYPES` | Разрешенные типы | jpg,png,pdf | - |

### 📊 Логирование

| Переменная | Описание | По умолчанию | Обязательная |
|------------|----------|--------------|--------------|
| `LOG_LEVEL` | Уровень логов | debug | - |
| `LOG_FILE` | Файл логов | ./logs/app.log | - |
| `LOG_MAX_SIZE` | Макс. размер лога | 10mb | - |
| `LOG_MAX_FILES` | Количество файлов | 5 | - |

## 🌍 Настройки по окружениям

### 🔧 Development
```bash
NODE_ENV=development
DB_NAME=quiz_game_dev
LOG_LEVEL=debug
DEBUG=quiz-game:*
CORS_ORIGIN=http://localhost:3000
```

### 🧪 Testing
```bash
NODE_ENV=test
DB_NAME=quiz_game_test
LOG_LEVEL=error
API_TIMEOUT=5000
```

### 🚀 Staging
```bash
NODE_ENV=staging
DB_NAME=quiz_game_staging
LOG_LEVEL=info
CORS_ORIGIN=https://staging.quiz-game.com
SENTRY_ENVIRONMENT=staging
```

### 🌟 Production
```bash
NODE_ENV=production
DB_NAME=quiz_game_prod
LOG_LEVEL=warn
CORS_ORIGIN=https://quiz-game.com
SENTRY_ENVIRONMENT=production
SESSION_SECURE=true
```

## 🔒 Безопасность

### ✅ Обязательные изменения для Production

1. **JWT_SECRET** - минимум 32 символа, случайная строка
   ```bash
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **SESSION_SECRET** - случайная строка
   ```bash
   SESSION_SECRET=$(openssl rand -base64 24)
   ```

3. **Пароли БД** - сложные пароли
   ```bash
   DB_PASSWORD=$(openssl rand -base64 16)
   REDIS_PASSWORD=$(openssl rand -base64 16)
   ```

4. **CORS настройки** - только нужные домены
   ```bash
   CORS_ORIGIN=https://yourdomain.com
   ```

5. **SSL настройки** - для HTTPS
   ```bash
   SESSION_SECURE=true
   HELMET_HSTS_ENABLED=true
   ```

### 🛡️ Проверка безопасности
```bash
# Проверка слабых паролей
npm run security:audit

# Проверка переменных окружения
npm run env:validate
```

## 🔄 Миграция между окружениями

### Development → Staging
```bash
# 1. Скопируйте .env
cp .env .env.staging

# 2. Измените окружение
sed -i 's/development/staging/g' .env.staging
sed -i 's/localhost/staging-db-host/g' .env.staging

# 3. Обновите секреты
# Вручную измените JWT_SECRET, DB_PASSWORD, etc.
```

### Staging → Production
```bash
# 1. Создайте production .env
cp .env.staging .env.production

# 2. Измените на production
sed -i 's/staging/production/g' .env.production

# 3. Обновите все секреты и домены
```

## 🧪 Тестирование конфигурации

### Проверка подключений
```bash
# Проверка БД
npm run db:test

# Проверка Redis
npm run redis:test

# Проверка всех сервисов
npm run health:check
```

### Валидация переменных
```bash
# Backend валидация
cd quiz-game-backend
npm run env:validate

# Frontend валидация
cd quiz-game-frontend
npm run env:validate
```

## 🐳 Docker конфигурация

### Основные переменные Docker
```bash
COMPOSE_PROJECT_NAME=quiz-game
POSTGRES_PASSWORD=secure-password
REDIS_PASSWORD=redis-password
PGADMIN_DEFAULT_EMAIL=admin@quiz-game.com
PGADMIN_DEFAULT_PASSWORD=admin-password
```

### Профили Docker Compose
```bash
# Development (с PgAdmin, Redis Commander)
COMPOSE_PROFILES=dev
docker-compose --profile dev up

# Production (только основные сервисы)
COMPOSE_PROFILES=prod
docker-compose --profile prod up
```

## 📱 Frontend специфика (Vite)

### Правила именования
- Все переменные должны начинаться с `VITE_`
- Доступны в браузере (не храните секреты!)

### Примеры
```bash
# ✅ Правильно - доступно в браузере
VITE_API_URL=https://api.quiz-game.com
VITE_APP_NAME=Quiz Game

# ❌ Неправильно - не будет доступно
API_SECRET=secret-key
```

## 🔧 Утилиты и скрипты

### Генерация секретов
```bash
# JWT Secret (32+ символа)
openssl rand -base64 32

# Session Secret (24+ символа)
openssl rand -base64 24

# Пароль БД (16+ символов)
openssl rand -base64 16
```

### Проверка переменных
```bash
# Список всех переменных
printenv | grep -E "(DB_|REDIS_|JWT_|VITE_)"

# Проверка обязательных переменных
npm run env:check
```

### Бэкап конфигурации
```bash
# Создать бэкап .env файлов
tar -czf env-backup-$(date +%Y%m%d).tar.gz .env */**.env

# Восстановить из бэкапа
tar -xzf env-backup-20240127.tar.gz
```

## 🆘 Troubleshooting

### Частые проблемы

1. **"Database connection failed"**
   ```bash
   # Проверьте переменные БД
   echo $DB_HOST $DB_PORT $DB_NAME $DB_USER

   # Тест подключения
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME
   ```

2. **"JWT token invalid"**
   ```bash
   # Проверьте JWT_SECRET
   echo $JWT_SECRET | wc -c  # Должно быть > 32
   ```

3. **"CORS error"**
   ```bash
   # Проверьте CORS_ORIGIN
   echo $CORS_ORIGIN
   # Должен содержать URL frontend
   ```

4. **"Redis connection failed"**
   ```bash
   # Тест Redis
   redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
   ```

### Логи для отладки
```bash
# Backend логи
tail -f quiz-game-backend/logs/backend.log

# Docker логи
docker-compose logs -f

# Системные логи
journalctl -u quiz-game -f
```

## 📚 Дополнительные ресурсы

- [Docker Environment Documentation](../docker/docker-commands.md)
- [Backend Configuration Guide](../docs2/backend-guide.md)
- [Frontend Configuration Guide](../docs2/frontend-guide.md)
- [Security Best Practices](../docs2/security-guide.md)
- [Deployment Guide](../docs2/deployment-guide.md)

---

> 💡 **Совет**: Всегда используйте разные секреты для каждого окружения и регулярно их обновляйте!
