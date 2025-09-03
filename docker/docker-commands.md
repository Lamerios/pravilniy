# 🐳 Docker Commands для Quiz Game

> **Быстрые команды для управления Docker контейнерами**

## 🚀 Основные команды

### Запуск всех сервисов для разработки
```bash
npm run dev
# Запускает: PostgreSQL, Redis, PgAdmin, Redis Commander
# Доступно на:
# - PgAdmin: http://localhost:8080 (admin@quiz-game.local / admin123)
# - Redis Commander: http://localhost:8081
```

### Запуск только базовых сервисов
```bash
npm run services:start
# Запускает только: PostgreSQL, Redis
```

### Остановка всех сервисов
```bash
npm run dev:stop
# или
npm run services:stop
```

## 🗄️ База данных (PostgreSQL)

### Управление
```bash
npm run db:start      # Запустить PostgreSQL
npm run db:stop       # Остановить PostgreSQL
npm run db:logs       # Посмотреть логи
npm run db:reset      # Сбросить БД (удалить все данные!)
```

### Подключение к БД
```bash
# Через Docker
docker-compose exec postgres psql -U quiz_user -d quiz_game_dev

# Локально (если установлен psql)
psql -h localhost -U quiz_user -d quiz_game_dev
```

### Бэкап и восстановление
```bash
# Создать бэкап
npm run db:backup

# Восстановить из бэкапа
docker-compose exec postgres psql -U quiz_user -d quiz_game_dev < backups/backup_20240127_120000.sql
```

## 🔴 Redis

### Управление
```bash
npm run redis:start    # Запустить Redis
npm run redis:stop     # Остановить Redis
npm run redis:logs     # Посмотреть логи
npm run redis:cli      # Подключиться к Redis CLI
npm run redis:flush    # Очистить все данные Redis
```

### Redis CLI команды
```bash
# Подключиться к Redis
npm run redis:cli

# В Redis CLI:
> ping                 # Проверить соединение
> keys *               # Посмотреть все ключи
> flushall             # Очистить все данные
> info memory          # Информация о памяти
> monitor              # Мониторинг команд в реальном времени
```

## 🔧 Утилиты

### Проверка состояния
```bash
npm run services:status    # Статус всех контейнеров
npm run health:check       # Проверка здоровья сервисов
npm run health:postgres    # Проверка PostgreSQL
npm run health:redis       # Проверка Redis
```

### Логи
```bash
npm run dev:logs           # Логи всех сервисов
npm run db:logs            # Логи PostgreSQL
npm run redis:logs         # Логи Redis

# Или напрямую через Docker
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Очистка
```bash
npm run services:clean     # Остановить и удалить все контейнеры + volumes
npm run clean              # Полная очистка Docker системы
```

## 🏭 Production

### Запуск в production режиме
```bash
npm run prod:start         # Запуск production конфигурации
npm run prod:stop          # Остановка production
npm run prod:logs          # Логи production
npm run prod:restart       # Перезапуск production
```

### Production конфигурация
- Использует переменные окружения из `.env`
- Включает Nginx reverse proxy
- Настроенное логирование
- Увеличенные лимиты памяти
- Безопасные настройки Redis

## 🐛 Troubleshooting

### Порты заняты
```bash
# Найти процесс на порту
netstat -ano | findstr :5432    # Windows
lsof -i :5432                   # macOS/Linux

# Остановить все контейнеры
docker-compose down
```

### Проблемы с volumes
```bash
# Удалить все volumes (ОСТОРОЖНО!)
docker-compose down -v

# Посмотреть все volumes
docker volume ls

# Удалить конкретный volume
docker volume rm pravilniy_postgres_data
```

### Контейнеры не запускаются
```bash
# Посмотреть ошибки
docker-compose logs postgres
docker-compose logs redis

# Пересобрать контейнеры
docker-compose up -d --force-recreate
```

### Очистка Docker системы
```bash
# Удалить неиспользуемые контейнеры, сети, образы
docker system prune -f

# Удалить ВСЕ (включая volumes)
docker system prune -a --volumes
```

## 📊 Мониторинг

### Использование ресурсов
```bash
# Статистика контейнеров
docker stats

# Использование места на диске
docker system df
```

### Веб-интерфейсы
- **PgAdmin**: http://localhost:8080
  - Email: admin@quiz-game.local
  - Password: admin123
  
- **Redis Commander**: http://localhost:8081
  - Автоматический доступ к Redis

## 🔗 Полезные ссылки

- [Docker Compose документация](https://docs.docker.com/compose/)
- [PostgreSQL Docker образ](https://hub.docker.com/_/postgres)
- [Redis Docker образ](https://hub.docker.com/_/redis)
- [PgAdmin Docker образ](https://hub.docker.com/r/dpage/pgadmin4)

---

> 💡 **Совет**: Всегда используйте `npm run` команды вместо прямых `docker-compose` команд для консистентности.
