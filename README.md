# 🎮 Правильный Квиз

> **Система управления интеллектуальными играми**

Современная платформа для проведения викторин, интеллектуальных игр и турниров с поддержкой команд, реального времени и аналитики.

[![CI/CD](https://github.com/quiz-game-team/quiz-game/workflows/CI%20Pipeline/badge.svg)](https://github.com/quiz-game-team/quiz-game/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## ✨ Возможности

- 🎯 **Управление играми** - создание, настройка, проведение
- 👥 **Команды** - регистрация, управление участниками
- 🏆 **Система баллов** - подсчет, рейтинги, статистика
- ⚡ **Real-time** - WebSocket для живых обновлений
- 📊 **Аналитика** - детальная статистика и отчеты
- 🔐 **Безопасность** - JWT аутентификация, роли
- 📱 **Адаптивность** - поддержка всех устройств
- 🐳 **Docker** - простое развертывание
- 🧪 **Тестирование** - полное покрытие кода

## 🚀 Быстрый старт

### 📋 Требования

- **Node.js** 18.0.0 или выше
- **npm** 9.0.0 или выше
- **Docker Desktop** (для локальной разработки)
- **Git**

### 🔧 Установка

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/quiz-game-team/quiz-game.git
cd quiz-game

# 2. Установите зависимости
npm run install:all

# 3. Настройте переменные окружения
npm run setup:env

# 4. Запустите сервисы
npm run dev:services

# 5. Запустите приложение
npm run dev
```

### 🌐 Доступные URL

После запуска приложение будет доступно по адресам:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **PgAdmin**: http://localhost:8080 (admin@quiz-game.local / admin123)
- **Redis Commander**: http://localhost:8081

## 📋 Требования

### Системные требования

| Компонент | Минимальная версия | Рекомендуемая версия |
|-----------|-------------------|---------------------|
| **Node.js** | 18.0.0 | 20.0.0 LTS |
| **npm** | 9.0.0 | 10.0.0 |
| **PostgreSQL** | 15.0 | 16.0 |
| **Redis** | 7.0 | 7.2 |
| **Docker** | 20.10 | 24.0 |

### Поддерживаемые ОС

- ✅ **Windows** 10/11 (64-bit)
- ✅ **macOS** 12.0+ (Intel/Apple Silicon)
- ✅ **Linux** Ubuntu 20.04+, CentOS 8+, RHEL 8+

## 🔧 Установка

### Вариант 1: Автоматическая установка (рекомендуется)

```bash
# Запустите автоматический скрипт установки
# Windows
scripts\env-setup.bat

# Linux/macOS
chmod +x scripts/env-setup.sh
./scripts/env-setup.sh
```

### Вариант 2: Ручная установка

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/quiz-game-team/quiz-game.git
cd quiz-game

# 2. Создайте .env файлы
cp env.example .env
cp quiz-game-backend/env.example quiz-game-backend/.env
cp quiz-game-frontend/env.example quiz-game-frontend/.env
cp docker/env.example docker/.env

# 3. Настройте переменные окружения
# Отредактируйте .env файлы под ваше окружение

# 4. Установите зависимости
npm install
npm run install:workspaces

# 5. Создайте необходимые папки
mkdir -p logs uploads backups
mkdir -p quiz-game-backend/logs quiz-game-backend/uploads
```

## ⚙️ Настройка

### Переменные окружения

Проект использует переменные окружения для конфигурации. Основные файлы:

- `.env` - корневые настройки
- `quiz-game-backend/.env` - backend конфигурация
- `quiz-game-frontend/.env` - frontend настройки
- `docker/.env` - Docker Compose конфигурация

#### Обязательные переменные

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_game_dev
DB_USER=quiz_user
DB_PASSWORD=your-secure-password

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-session-secret

# API
BACKEND_PORT=5001
FRONTEND_PORT=3000
```

#### Генерация секретов

```bash
# JWT Secret (32+ символа)
openssl rand -base64 32

# Session Secret (24+ символа)
openssl rand -base64 24

# Database Password (16+ символов)
openssl rand -base64 16
```

### Docker настройка

```bash
# Запуск development окружения
docker-compose --profile dev up -d

# Запуск только основных сервисов
docker-compose up -d postgres redis

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down
```

## 🚀 Запуск

### Development режим

```bash
# Запуск всего стека (backend + frontend + services)
npm run dev

# Запуск только backend
npm run dev:backend

# Запуск только frontend
npm run dev:frontend

# Запуск только сервисов (PostgreSQL, Redis)
npm run dev:services
```

### Production режим

```bash
# Сборка проекта
npm run build

# Запуск production
npm run prod:start

# Остановка production
npm run prod:stop
```

### Отдельные команды

```bash
# Установка зависимостей
npm run install:all

# Линтинг и форматирование
npm run lint
npm run format

# Тестирование
npm run test
npm run test:watch

# Type checking
npm run type-check

# Валидация проекта
npm run validate
```

## 🧪 Тестирование

### Unit тесты

```bash
# Запуск всех тестов
npm run test

# Тесты с watch режимом
npm run test:watch

# Тесты backend
npm run test:backend

# Тесты frontend
npm run test:frontend

# Покрытие кода
npm run test:coverage
```

### E2E тесты

```bash
# Установка Playwright
cd tests && npm install

# Запуск E2E тестов
npm run test:e2e

# Запуск в headed режиме
npm run test:e2e:headed
```

### Тестирование API

```bash
# Проверка health endpoints
curl http://localhost:5001/api/health
curl http://localhost:5001/api/ready

# Проверка CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5001/api/health
```

## 📚 Документация

### Основная документация

- [📖 Environment Setup](docs/ENVIRONMENT_SETUP.md) - настройка переменных окружения
- [🚀 Quick Start](docs/QUICK_START.md) - быстрое начало работы
- [👨‍💻 Development Guide](docs/DEVELOPMENT.md) - руководство для разработчиков
- [🏗️ Architecture](docs2/architecture-simple.md) - архитектура проекта
- [🗄️ Database Schema](docs2/database-schema.md) - схема базы данных
- [🔌 API Reference](docs2/api-quick.md) - API документация

### Docker документация

- [🐳 Docker Commands](docker/docker-commands.md) - команды Docker
- [📦 Docker Setup](docker/INSTALL_DOCKER.md) - установка Docker
- [⚙️ Docker Environment](docker/env.example) - переменные Docker

### CI/CD документация

- [🔄 GitHub Actions](.github/workflows/README.md) - описание workflows
- [📋 PR Template](.github/PULL_REQUEST_TEMPLATE.md) - шаблон Pull Request
- [🐛 Issue Templates](.github/ISSUE_TEMPLATE/) - шаблоны для issues

## 🏗️ Архитектура

### Структура проекта

```
quiz-game/
├── 📁 quiz-game-backend/          # Node.js + Express + TypeScript
│   ├── 📁 src/                    # Исходный код
│   ├── 📁 config/                 # Конфигурация
│   ├── 📁 models/                 # Sequelize модели
│   ├── 📁 routes/                 # API маршруты
│   ├── 📁 controllers/            # Контроллеры
│   ├── 📁 middleware/             # Middleware
│   ├── 📁 utils/                  # Утилиты
│   └── 📁 tests/                  # Тесты
├── 📁 quiz-game-frontend/         # React + TypeScript + Vite
│   ├── 📁 src/                    # Исходный код
│   ├── 📁 components/             # React компоненты
│   ├── 📁 pages/                  # Страницы
│   ├── 📁 hooks/                  # Custom hooks
│   ├── 📁 utils/                  # Утилиты
│   └── 📁 tests/                  # Тесты
├── 📁 docker/                     # Docker конфигурация
├── 📁 docs/                       # Документация
├── 📁 scripts/                    # Скрипты автоматизации
└── 📁 tests/                      # E2E тесты
```

### Технологический стек

| Компонент | Технология | Описание |
|-----------|------------|----------|
| **Backend** | Node.js + Express + TypeScript | API сервер |
| **Frontend** | React + TypeScript + Vite | SPA приложение |
| **Database** | PostgreSQL + Sequelize | Основная БД |
| **Cache** | Redis | Кеширование и сессии |
| **Authentication** | JWT + bcrypt | Аутентификация |
| **Real-time** | Socket.io | WebSocket соединения |
| **Testing** | Jest + Vitest + Playwright | Тестирование |
| **Linting** | ESLint + Prettier | Качество кода |
| **CI/CD** | GitHub Actions | Автоматизация |
| **Containerization** | Docker + Docker Compose | Развертывание |

## 🔄 Разработка

### Git Workflow

```bash
# Создание feature ветки
git checkout -b feature/your-feature-name

# Разработка и коммиты
git add .
git commit -m "feat(sprint-X): implement feature description

- Добавлено: что добавлено
- Изменено: что изменено
- Тесты: какие тесты

Refs: #X.Y"

# Push и создание PR
git push origin feature/your-feature-name
```

### Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Типы:**
- `feat` - новая функциональность
- `fix` - исправление багов
- `docs` - документация
- `style` - форматирование
- `refactor` - рефакторинг
- `test` - тесты
- `chore` - задачи

**Скоупы:**
- `sprint-0` до `sprint-8` - спринты
- `backend` - backend изменения
- `frontend` - frontend изменения
- `docker` - Docker изменения
- `ci` - CI/CD изменения

### Code Quality

```bash
# Проверка качества кода
npm run validate

# Автоматическое исправление
npm run lint:fix
npm run format

# Type checking
npm run type-check

# Security audit
npm run security:audit
```

## 🚀 Деплой

### Staging

```bash
# Автоматический деплой при push в main
git push origin main

# Ручной деплой в staging
# GitHub Actions → Deploy to Staging
```

### Production

```bash
# Ручной деплой с approval
# GitHub Actions → Deploy to Production
# Требует manual approval
```

### Docker образы

```bash
# Сборка образов
docker build -t quiz-game-backend ./quiz-game-backend
docker build -t quiz-game-frontend ./quiz-game-frontend

# Запуск production
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Troubleshooting

### Частые проблемы

#### 1. "Database connection failed"

```bash
# Проверьте статус PostgreSQL
docker-compose ps postgres

# Проверьте логи
docker-compose logs postgres

# Проверьте переменные окружения
echo $DB_HOST $DB_PORT $DB_NAME $DB_USER
```

#### 2. "Redis connection failed"

```bash
# Проверьте статус Redis
docker-compose ps redis

# Тест подключения
docker-compose exec redis redis-cli ping
```

#### 3. "Port already in use"

```bash
# Найдите процесс на порту
netstat -ano | findstr :5001
netstat -ano | findstr :3000

# Остановите процесс
taskkill /PID <PID> /F
```

#### 4. "Permission denied"

```bash
# Windows: запустите PowerShell от имени администратора
# Linux/macOS: используйте sudo
sudo chmod +x scripts/env-setup.sh
```

### Логи для отладки

```bash
# Backend логи
tail -f quiz-game-backend/logs/backend.log

# Frontend логи (в браузере DevTools)
# Console → Network → XHR

# Docker логи
docker-compose logs -f

# Системные логи
# Windows: Event Viewer
# Linux: journalctl -u quiz-game -f
```

## 🤝 Участие в разработке

### Как внести вклад

1. **Fork** репозитория
2. Создайте **feature ветку** (`git checkout -b feature/amazing-feature`)
3. Сделайте **коммит** изменений (`git commit -m 'Add amazing feature'`)
4. **Push** в ветку (`git push origin feature/amazing-feature`)
5. Откройте **Pull Request**

### Требования к PR

- ✅ Все тесты проходят
- ✅ Код соответствует стандартам (ESLint + Prettier)
- ✅ TypeScript типы корректны
- ✅ Добавлены/обновлены тесты
- ✅ Обновлена документация
- ✅ Следует commit convention
- ✅ Имеет метку спринта

### Code Review

- Минимум 1 approve от reviewer
- Все CI проверки пройдены
- Соответствие архитектурным принципам
- Качество и читаемость кода

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👥 Команда

- **Product Owner** - [@product-owner](https://github.com/product-owner)
- **Tech Lead** - [@tech-lead](https://github.com/tech-lead)
- **Backend Developer** - [@backend-dev](https://github.com/backend-dev)
- **Frontend Developer** - [@frontend-dev](https://github.com/frontend-dev)
- **DevOps Engineer** - [@devops-engineer](https://github.com/devops-engineer)

## 📞 Поддержка

- 📧 **Email**: support@pravilniy-quiz.com
- 💬 **Discord**: [Правильный Квиз Community](https://discord.gg/pravilniy-quiz)
- 🐛 **Issues**: [GitHub Issues](https://github.com/quiz-game-team/quiz-game/issues)
- 📖 **Wiki**: [GitHub Wiki](https://github.com/quiz-game-team/quiz-game/wiki)

## 🙏 Благодарности

- [Express.js](https://expressjs.com/) - веб-фреймворк
- [React](https://reactjs.org/) - UI библиотека
- [TypeScript](https://www.typescriptlang.org/) - типизированный JavaScript
- [PostgreSQL](https://www.postgresql.org/) - база данных
- [Redis](https://redis.io/) - кеш и сессии
- [Docker](https://www.docker.com/) - контейнеризация
- [GitHub Actions](https://github.com/features/actions) - CI/CD

---

<div align="center">

**🎮 Правильный Квиз** - Система управления интеллектуальными играми

[![GitHub stars](https://img.shields.io/github/stars/quiz-game-team/quiz-game?style=social)](https://github.com/quiz-game-team/quiz-game/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/quiz-game-team/quiz-game?style=social)](https://github.com/quiz-game-team/quiz-game/network/members)
[![GitHub issues](https://img.shields.io/github/issues/quiz-game-team/quiz-game)](https://github.com/quiz-game-team/quiz-game/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/quiz-game-team/quiz-game)](https://github.com/quiz-game-team/quiz-game/pulls)

**Сделано с ❤️ командой Правильный Квиз**

</div>
