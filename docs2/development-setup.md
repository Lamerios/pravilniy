# 🔧 Настройка среды разработки

> **Время**: 15-30 минут | **Уровень**: Начинающий | **ОС**: Windows/macOS/Linux

## ⚡ Быстрая настройка (5 минут)

### Проверка системы
```bash
# Проверяем версии
node --version    # Нужно >= 18.0.0
npm --version     # Нужно >= 9.0.0
git --version     # Любая современная версия

# Если что-то не установлено:
# Windows: winget install OpenJS.NodeJS
# macOS: brew install node
# Linux: sudo apt install nodejs npm
```

### Быстрый старт
```bash
# 1. Клонируем проект
git clone <repository-url>
cd quiz-game

# 2. Устанавливаем зависимости
npm run install:all

# 3. Настраиваем окружение
cp .env.example .env

# 4. Запускаем базу данных
npm run db:start

# 5. Инициализируем БД
npm run db:setup

# 6. Запускаем все сервисы
npm run dev
```

**Готово!** Открывайте http://localhost:3000

## 📋 Детальная настройка

### 1. Системные требования

| Компонент | Минимум | Рекомендуется | Проверка |
|-----------|---------|---------------|----------|
| Node.js | 18.0.0 | 20.0.0 LTS | `node --version` |
| npm | 9.0.0 | 10.0.0+ | `npm --version` |
| PostgreSQL | 15.0 | 16.0+ | `psql --version` |
| Git | 2.30+ | 2.40+ | `git --version` |
| RAM | 4GB | 8GB+ | - |
| Disk | 2GB | 5GB+ | - |

### 2. Установка PostgreSQL

#### Вариант A: Docker (рекомендуется)
```bash
# Запуск PostgreSQL в Docker
docker run -d \
  --name quiz-postgres \
  -e POSTGRES_DB=quiz_game_dev \
  -e POSTGRES_USER=quiz_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:15-alpine

# Проверка
docker ps | grep quiz-postgres
```

#### Вариант B: Локальная установка
```bash
# Windows
winget install PostgreSQL.PostgreSQL

# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-contrib

# Создание пользователя и БД
sudo -u postgres createuser -s quiz_user
sudo -u postgres createdb quiz_game_dev -O quiz_user
```

### 3. Настройка проекта

#### Клонирование репозитория
```bash
git clone <repository-url>
cd quiz-game

# Проверка структуры
ls -la
# Должны увидеть:
# - quiz-game-backend/
# - quiz-game-frontend/
# - docker-compose.yml
# - package.json
```

#### Установка зависимостей
```bash
# Корневые зависимости
npm install

# Backend зависимости
cd quiz-game-backend
npm install

# Frontend зависимости
cd ../quiz-game-frontend
npm install

# Или одной командой из корня
npm run install:all
```

### 4. Конфигурация окружения

#### Создание .env файла
```bash
# Копируем пример
cp .env.example .env

# Редактируем под свои настройки
nano .env  # или любой редактор
```

#### Базовые настройки .env
```bash
# === Development Environment ===
NODE_ENV=development

# === Database ===
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_game_dev
DB_USER=quiz_user
DB_PASSWORD=dev_password

# === Backend ===
BACKEND_PORT=5001
JWT_SECRET=dev-jwt-secret-key-change-in-production

# === Frontend ===
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:5001

# === Logging ===
LOG_LEVEL=debug

# === Uploads ===
UPLOAD_MAX_SIZE=10mb
UPLOAD_PATH=./uploads
```

### 5. Инициализация базы данных

#### Автоматическая настройка
```bash
# Из корня проекта
npm run db:setup

# Или поэтапно:
npm run db:create    # Создание БД
npm run db:migrate   # Миграции
npm run db:seed      # Тестовые данные
```

#### Ручная настройка
```bash
# Подключение к PostgreSQL
psql -h localhost -U quiz_user -d quiz_game_dev

# В psql консоли:
\dt                  # Список таблиц (должен быть пустым)
\q                   # Выход

# Запуск миграций
cd quiz-game-backend
npm run migrate

# Проверка таблиц
psql -h localhost -U quiz_user -d quiz_game_dev -c "\dt"
```

## 🚀 Запуск для разработки

### Вариант 1: Все сразу (рекомендуется)
```bash
# Из корня проекта
npm run dev

# Запускается:
# - Backend на http://localhost:5001
# - Frontend на http://localhost:3000
# - PostgreSQL на localhost:5432
```

### Вариант 2: По отдельности
```bash
# Терминал 1: Backend
cd quiz-game-backend
npm run dev

# Терминал 2: Frontend
cd quiz-game-frontend
npm run dev

# Терминал 3: База данных (если не Docker)
sudo service postgresql start
```

### Проверка работы
```bash
# Backend API
curl http://localhost:5001/api/health
# Ответ: {"status":"ok","timestamp":"..."}

# Frontend
open http://localhost:3000
# Должна открыться главная страница

# База данных
npm run db:test
# Ответ: "Database connection successful"
```

## 🛠️ Настройка IDE (Cursor)

### Рекомендуемые расширения
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "ms-python.python"
  ]
}
```

### Настройки проекта
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Полезные сниппеты
```json
// .vscode/snippets.json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "interface ${1:Component}Props {",
      "  ${2:prop}: ${3:string};",
      "}",
      "",
      "const ${1:Component}: React.FC<${1:Component}Props> = ({ ${2:prop} }) => {",
      "  return (",
      "    <div>",
      "      ${4:content}",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:Component};"
    ]
  }
}
```

## 🧪 Проверка установки

### Чек-лист
- [ ] Node.js >= 18.0.0
- [ ] PostgreSQL работает
- [ ] Зависимости установлены
- [ ] .env файл настроен
- [ ] База данных создана и мигрирована
- [ ] Backend запускается на :5001
- [ ] Frontend запускается на :3000
- [ ] API отвечает на /health
- [ ] Тесты проходят

### Команды проверки
```bash
# Системные требования
node --version && npm --version && git --version

# Сервисы
npm run health:check

# Тесты
npm run test:quick

# Линтеры
npm run lint:check
```

## 🚨 Решение проблем

### Порт уже занят
```bash
# Найти процесс
lsof -i :5001  # macOS/Linux
netstat -ano | findstr :5001  # Windows

# Убить процесс
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Или изменить порт в .env
BACKEND_PORT=5002
```

### База данных не подключается
```bash
# Проверить статус PostgreSQL
sudo service postgresql status  # Linux
brew services list | grep postgresql  # macOS

# Проверить настройки в .env
echo $DB_HOST $DB_PORT $DB_NAME $DB_USER

# Тест подключения
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version();"
```

### Модули не найдены
```bash
# Очистить кеши
npm cache clean --force
rm -rf node_modules package-lock.json

# Переустановить
npm install

# Или для всего проекта
npm run clean:install
```

### Ошибки TypeScript
```bash
# Обновить типы
npm update @types/node @types/react

# Перезапустить TypeScript сервер в IDE
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## 📚 Полезные команды

### Разработка
```bash
npm run dev              # Запуск в development режиме
npm run dev:backend      # Только backend
npm run dev:frontend     # Только frontend
npm run dev:debug        # С отладкой
```

### База данных
```bash
npm run db:reset         # Сброс БД
npm run db:migrate       # Миграции
npm run db:seed          # Тестовые данные
npm run db:backup        # Бэкап
```

### Тестирование
```bash
npm test                 # Все тесты
npm run test:unit        # Unit тесты
npm run test:integration # Интеграционные
npm run test:watch       # Watch режим
```

### Утилиты
```bash
npm run lint             # Проверка кода
npm run lint:fix         # Исправление
npm run format           # Форматирование
npm run clean            # Очистка
```

---

## 🔗 Следующие шаги

После успешной настройки:

1. 🌐 [Изучить API](./api-quick.md)
2. 🎨 [Frontend разработка](./frontend-guide.md)
3. ⚙️ [Backend разработка](./backend-guide.md)
4. 🧪 [Написать первый тест](./testing-guide.md)

---

> 💡 **Совет**: Если что-то не работает, проверьте [troubleshooting.md](./troubleshooting.md) или создайте Issue в репозитории.
