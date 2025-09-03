# 🚀 Quick Start Guide

> **Быстрый старт для Quiz Game проекта**

## ⚡ 5 минут до запуска

### 1️⃣ Предварительные требования

```bash
# Проверьте версии
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
docker --version  # >= 20.10
git --version     # любая
```

### 2️⃣ Клонирование и установка

```bash
# Клонируйте репозиторий
git clone https://github.com/quiz-game-team/quiz-game.git
cd quiz-game

# Установите зависимости
npm run install:all
```

### 3️⃣ Настройка окружения

```bash
# Windows
scripts\env-setup.bat

# Linux/macOS
chmod +x scripts/env-setup.sh
./scripts/env-setup.sh
```

### 4️⃣ Запуск сервисов

```bash
# Запустите PostgreSQL и Redis
npm run dev:services

# Дождитесь сообщения "Services started!"
```

### 5️⃣ Запуск приложения

```bash
# Запустите весь стек
npm run dev
```

🎉 **Готово!** Приложение доступно по адресам:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## 🔧 Альтернативный быстрый старт

### Автоматический запуск

```bash
# Один команда для всего
npm run start
```

Эта команда:
1. ✅ Установит зависимости
2. ✅ Настроит переменные окружения  
3. ✅ Запустит сервисы
4. ✅ Запустит приложение

### Проверка работоспособности

```bash
# Проверьте статус сервисов
npm run health:check

# Проверьте API
curl http://localhost:5001/api/health

# Проверьте frontend
# Откройте http://localhost:3000 в браузере
```

## 🆘 Если что-то пошло не так

### Проблема: "Port already in use"

```bash
# Найдите и остановите процесс
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Или используйте другие порты
# Измените в .env файлах
```

### Проблема: "Database connection failed"

```bash
# Проверьте Docker
docker-compose ps

# Перезапустите сервисы
npm run dev:restart
```

### Проблема: "Permission denied"

```bash
# Windows: запустите PowerShell от имени администратора
# Linux/macOS: используйте sudo
sudo chmod +x scripts/env-setup.sh
```

## 📚 Следующие шаги

После успешного запуска:

1. 📖 Изучите [Environment Setup](ENVIRONMENT_SETUP.md)
2. 🏗️ Познакомьтесь с [Architecture](../docs2/architecture-simple.md)
3. 🗄️ Изучите [Database Schema](../docs2/database-schema.md)
4. 🔌 Изучите [API Reference](../docs2/api-quick.md)
5. 🧪 Напишите первый тест
6. 🚀 Создайте feature ветку для разработки

## 💡 Полезные команды

```bash
# Разработка
npm run dev              # Запуск всего стека
npm run dev:backend      # Только backend
npm run dev:frontend     # Только frontend
npm run dev:services     # Только сервисы

# Тестирование
npm run test             # Все тесты
npm run test:watch       # Тесты с watch
npm run test:coverage    # Покрытие кода

# Качество кода
npm run lint             # ESLint проверка
npm run format           # Prettier форматирование
npm run type-check       # TypeScript проверка
npm run validate         # Полная валидация

# Docker
npm run dev:services     # Запуск сервисов
npm run dev:stop         # Остановка сервисов
npm run dev:logs         # Просмотр логов
npm run dev:restart      # Перезапуск сервисов

# Утилиты
npm run clean            # Очистка проекта
npm run setup            # Полная настройка
npm run health:check     # Проверка здоровья
```

## 🎯 Что дальше?

Теперь вы можете:

- 🎮 **Изучить приложение** - откройте http://localhost:3000
- 🔍 **Исследовать API** - http://localhost:5001/api/health
- 🗄️ **Посмотреть БД** - http://localhost:8080 (PgAdmin)
- 🔴 **Изучить кеш** - http://localhost:8081 (Redis Commander)
- 📝 **Начать разработку** - создайте feature ветку
- 🧪 **Написать тесты** - добавьте тесты для новой функциональности

---

> 💡 **Совет**: Если что-то не работает, проверьте логи: `npm run dev:logs`
