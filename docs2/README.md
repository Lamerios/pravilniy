# 🎯 Quiz Game - Документация для разработки

> **Версия**: 1.0.0 | **Обновлено**: 2025-01-27 | **Статус**: Активная разработка

## 🚀 Быстрый старт для разработчиков

### Что это?
Quiz Game - система управления интеллектуальными играми с real-time табло и автоматическим подсчетом баллов.

### За 5 минут
```bash
# 1. Клонирование и установка
git clone <repo-url>
cd quiz-game
npm run setup

# 2. Запуск в development
npm run dev

# 3. Открыть в браузере
http://localhost:3000
```

### Первые шаги
1. 📖 [Архитектура системы](./architecture-simple.md) - понять как работает
2. 🔧 [Настройка среды](./development-setup.md) - настроить локально
3. 🌐 [API Guide](./api-quick.md) - работать с backend
4. 🧪 [Тестирование](./testing-guide.md) - писать и запускать тесты

## 📁 Структура документации

```
docs2/
├── README.md                  # 👈 Вы здесь - главная страница
├── architecture-simple.md    # 🏗️ Архитектура без воды
├── development-setup.md      # 🔧 Настройка среды разработки
├── api-quick.md              # 🌐 API документация (краткая)
├── database-schema.md        # 🗄️ Схема БД и миграции
├── frontend-guide.md         # 🎨 Frontend разработка
├── backend-guide.md          # ⚙️ Backend разработка
├── testing-guide.md          # 🧪 Тестирование и QA
├── deployment-guide.md       # 🚀 Деплой и CI/CD
├── troubleshooting.md        # 🚨 Решение проблем
├── contributing.md           # 👥 Как участвовать в разработке
└── cursor-tips.md            # 💡 Советы по работе в Cursor
```

## 🎯 Для кого эта документация

| Роль | Главные документы | Время изучения |
|------|-------------------|----------------|
| **Новый разработчик** | README → architecture-simple → development-setup | 30 мин |
| **Frontend разработчик** | frontend-guide → api-quick → testing-guide | 45 мин |
| **Backend разработчик** | backend-guide → database-schema → api-quick | 45 мин |
| **DevOps/SRE** | deployment-guide → troubleshooting | 20 мин |
| **QA Engineer** | testing-guide → troubleshooting | 25 мин |

## ⚡ Быстрые ссылки

### Разработка
- 🔧 [Локальная настройка](./development-setup.md#быстрая-настройка)
- 🐛 [Отладка](./troubleshooting.md#частые-проблемы)
- 📝 [Стандарты кода](./contributing.md#code-style)
- 🧪 [Запуск тестов](./testing-guide.md#команды)

### API
- 📊 [Postman коллекция](./api-quick.md#postman)
- 🔌 [WebSocket события](./api-quick.md#websocket)
- ❌ [Коды ошибок](./api-quick.md#errors)
- 🔐 [Аутентификация](./api-quick.md#auth)

### Деплой
- 🐳 [Docker setup](./deployment-guide.md#docker)
- 🚀 [CI/CD pipeline](./deployment-guide.md#cicd)
- 📊 [Мониторинг](./deployment-guide.md#monitoring)
- 🔄 [Rollback](./deployment-guide.md#rollback)

## 🔍 Поиск по документации

### По проблеме
- **Не запускается локально** → [troubleshooting.md](./troubleshooting.md#local-setup)
- **Ошибки API** → [api-quick.md](./api-quick.md#errors)
- **Проблемы с БД** → [database-schema.md](./database-schema.md#troubleshooting)
- **Тесты не проходят** → [testing-guide.md](./testing-guide.md#debugging)

### По технологии
- **React/TypeScript** → [frontend-guide.md](./frontend-guide.md)
- **Node.js/Express** → [backend-guide.md](./backend-guide.md)
- **PostgreSQL** → [database-schema.md](./database-schema.md)
- **Docker** → [deployment-guide.md](./deployment-guide.md#docker)

## 📊 Статус проекта

### ✅ Готово
- [x] Базовая архитектура
- [x] API endpoints (основные)
- [x] Frontend компоненты (основные)
- [x] База данных (схема)

### 🔄 В работе
- [ ] Тестирование (50% готово)
- [ ] WebSocket real-time (75% готово)
- [ ] Аутентификация (25% готово)
- [ ] CI/CD pipeline (планируется)

### 📋 Планируется
- [ ] Мобильная версия
- [ ] Аналитика и отчеты
- [ ] Интеграции (Slack, Teams)
- [ ] Многоязычность

## 💡 Cursor IDE Tips

### Полезные команды
- `Ctrl+Shift+P` → "Quiz Game: Setup Dev Environment"
- `Ctrl+Shift+P` → "Quiz Game: Run Tests"
- `Ctrl+Shift+P` → "Quiz Game: Start Dev Server"

### AI Prompts для разработки
```
@docs Как создать новый API endpoint?
@docs Как добавить новый компонент React?
@docs Как написать тест для контроллера?
@docs Как настроить новую миграцию БД?
```

## 🆘 Нужна помощь?

### Быстрые решения
1. **Проект не запускается** → [troubleshooting.md](./troubleshooting.md#startup-issues)
2. **Ошибка в тестах** → [testing-guide.md](./testing-guide.md#common-errors)
3. **Проблема с API** → [api-quick.md](./api-quick.md#debugging)

### Связь с командой
- 💬 **Slack**: #quiz-game-dev
- 📧 **Email**: dev-team@quiz-game.com
- 🐛 **Issues**: GitHub Issues
- 📖 **Wiki**: Confluence Space

---

## 📝 Обновления документации

**Последние изменения:**
- 2025-01-27: Создана новая структура документации
- 2025-01-27: Добавлены quick start guides
- 2025-01-27: Оптимизирована навигация

**Как обновлять:**
1. Редактируйте markdown файлы
2. Создавайте PR с изменениями
3. Получайте review от команды
4. Обновляйте дату в заголовке

---

> 💡 **Совет**: Эта документация создана для быстрого старта. Если что-то неясно - создавайте Issue или обращайтесь к команде!
