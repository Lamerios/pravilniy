# 🏗️ Структура проекта Quiz Game

> **Монорепозиторий** с Backend (Node.js) и Frontend (React)

## 📁 Корневая структура

```
quiz-game/
├── 📁 quiz-game-backend/        # Backend приложение
├── 📁 quiz-game-frontend/       # Frontend приложение
├── 📁 docker/                   # Docker конфигурации
├── 📁 docs/                     # Проектная документация
├── 📁 docs2/                    # Техническая документация
├── 📁 tests/                    # E2E тесты (Playwright)
├── 📁 scripts/                  # Утилиты и скрипты
├── 📁 .github/                  # GitHub Actions и шаблоны
├── 📁 .vscode/                  # VS Code настройки
├── 📁 backups/                  # Бэкапы базы данных
├── 📁 logs/                     # Логи приложения
├── 📄 package.json              # Корневой package.json (workspace)
├── 📄 docker-compose.yml        # Development окружение
├── 📄 docker-compose.prod.yml   # Production окружение
├── 📄 .gitignore                # Git игнорируемые файлы
└── 📄 README.md                 # Главная документация
```

## 🔧 Backend структура

```
quiz-game-backend/
├── 📁 src/
│   ├── 📁 config/               # Конфигурации (DB, Redis, etc)
│   ├── 📁 controllers/          # API контроллеры
│   ├── 📁 middleware/           # Express middleware
│   ├── 📁 models/               # Sequelize модели
│   ├── 📁 routes/               # API маршруты
│   ├── 📁 services/             # Бизнес-логика
│   ├── 📁 types/                # TypeScript типы
│   ├── 📁 utils/                # Утилиты
│   └── 📄 index.ts              # Точка входа
├── 📁 dist/                     # Скомпилированный код
├── 📁 logs/                     # Логи
├── 📄 package.json              # Backend зависимости
├── 📄 tsconfig.json             # TypeScript конфигурация
├── 📄 .eslintrc.js              # ESLint правила
└── 📄 .prettierrc               # Prettier конфигурация
```

## 🎨 Frontend структура

```
quiz-game-frontend/
├── 📁 src/
│   ├── 📁 components/           # React компоненты
│   ├── 📁 pages/                # Страницы приложения
│   ├── 📁 hooks/                # Кастомные хуки
│   ├── 📁 services/             # API сервисы
│   ├── 📁 utils/                # Утилиты
│   ├── 📁 types/                # TypeScript типы
│   ├── 📁 assets/               # Статические файлы
│   ├── 📁 contexts/             # React контексты
│   ├── 📁 layouts/              # Макеты страниц
│   ├── 📁 test/                 # Тестовые утилиты
│   ├── 📄 main.tsx              # Точка входа
│   └── 📄 App.tsx               # Главный компонент
├── 📁 dist/                     # Собранные файлы
├── 📁 public/                   # Публичные файлы
├── 📄 index.html                # HTML шаблон
├── 📄 package.json              # Frontend зависимости
├── 📄 vite.config.ts            # Vite конфигурация
├── 📄 tsconfig.json             # TypeScript конфигурация
├── 📄 .eslintrc.js              # ESLint правила
└── 📄 .prettierrc               # Prettier конфигурация
```

## 🐳 Docker структура

```
docker/
├── 📁 postgres/
│   ├── 📄 init.sql              # Инициализация БД
│   └── 📄 init-prod.sql         # Production инициализация
├── 📁 redis/
│   ├── 📄 redis.conf            # Development конфигурация
│   └── 📄 redis-prod.conf       # Production конфигурация
├── 📁 nginx/
│   └── 📄 nginx.conf            # Nginx конфигурация
├── 📄 INSTALL_DOCKER.md         # Инструкции по установке
└── 📄 docker-commands.md        # Команды управления
```

## 🧪 Тестирование

```
tests/
├── 📁 e2e/                      # E2E тесты
├── 📁 fixtures/                 # Тестовые данные
├── 📁 utils/                    # Тестовые утилиты
├── 📄 playwright.config.ts      # Playwright конфигурация
└── 📄 package.json              # Тестовые зависимости
```

## ⚙️ Скрипты и утилиты

```
scripts/
├── 📄 setup.sh                  # Linux/macOS установка
├── 📄 setup.bat                 # Windows установка
├── 📄 deploy.sh                 # Деплой скрипт
└── 📄 backup.sh                 # Бэкап скрипт
```

## 📚 Документация

```
docs/
├── 📄 tasklist.md               # План разработки
├── 📄 workflow.md               # Рабочий процесс
└── 📄 git-workflow.md           # Git процессы

docs2/
├── 📄 README.md                 # Техническая документация
├── 📄 architecture-simple.md    # Архитектура
├── 📄 development-setup.md      # Настройка разработки
├── 📄 api-quick.md              # API документация
├── 📄 database-schema.md        # Схема БД
├── 📄 frontend-guide.md         # Frontend руководство
├── 📄 backend-guide.md          # Backend руководство
├── 📄 testing-guide.md          # Тестирование
└── 📄 deployment-guide.md       # Деплой
```

## 🔧 Конфигурации

### VS Code (.vscode/)
- `settings.json` - Настройки редактора
- `extensions.json` - Рекомендуемые расширения
- `launch.json` - Конфигурации отладки
- `tasks.json` - Задачи сборки

### GitHub (.github/)
- `workflows/` - GitHub Actions
- `PULL_REQUEST_TEMPLATE.md` - Шаблон PR
- `ISSUE_TEMPLATE/` - Шаблоны Issues

## 📊 Управление зависимостями

### Workspaces (npm)
Проект использует npm workspaces для управления монорепозиторием:

```json
{
  "workspaces": [
    "quiz-game-backend",
    "quiz-game-frontend"
  ]
}
```

### Команды установки
```bash
npm run install:all        # Установка всех зависимостей
npm run install:workspaces  # Только workspace зависимости
npm run clean:install       # Чистая переустановка
```

## 🚀 Команды разработки

### Основные
```bash
npm run dev                 # Запуск в development режиме
npm run build               # Сборка всего проекта
npm run test                # Все тесты
npm run lint                # Проверка кода
npm run format              # Форматирование
```

### Сервисы
```bash
npm run services:start      # Запуск PostgreSQL + Redis
npm run services:stop       # Остановка сервисов
npm run services:status     # Статус сервисов
```

### Утилиты
```bash
npm run clean               # Очистка
npm run validate            # Полная проверка
npm run release             # Подготовка к релизу
```

---

## 🔄 Workflow разработки

1. **Клонирование**: `git clone <repo>`
2. **Установка**: `npm run setup` или `scripts/setup.sh`
3. **Разработка**: `npm run dev`
4. **Тестирование**: `npm run test`
5. **Сборка**: `npm run build`
6. **Деплой**: `scripts/deploy.sh`

---

> 💡 **Совет**: Используйте VS Code с рекомендуемыми расширениями для лучшего опыта разработки.
