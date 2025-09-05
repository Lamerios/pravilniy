# Database Seeders

Система сидеров для создания тестовых данных в базе данных Quiz Game.

## 📁 Структура

```
seeders/
├── basic-seeder.ts      # Базовые данные (организация, админ, шаблон)
├── demo-game-seeder.ts  # Полный пример игры с результатами
├── index.ts             # Управление сидерами
└── README.md           # Документация
```

## 🚀 Использование

### Быстрый старт

```bash
# Полная настройка БД (миграции + все сиды)
npm run db:setup

# Сброс и полная настройка
npm run db:reset
```

### Детальное управление

```bash
# Только базовые данные
npm run db:seed:basic

# Только демо игра (требует базовые данные)
npm run db:seed:demo

# Все сиды
npm run db:seed:full

# Кастомный запуск
npm run db:seed basic
npm run db:seed demo
npm run db:seed full
```

## 📦 Типы сидеров

### 1. Basic Seeder (`basic-seeder.ts`)

**Создает минимальные данные для работы системы:**

- 🏢 **Organization**: "Quiz Game Demo Organization"
- 👤 **Admin User**: admin@quiz-game.com / password123
- 📋 **Game Template**: "Классическая викторина"

**Использование:**
```bash
npm run db:seed:basic
```

### 2. Demo Game Seeder (`demo-game-seeder.ts`)

**Создает полный пример завершенной игры:**

- 🎮 **Game**: "Знания без границ" (FINISHED)
- 👥 **4 Teams**: Знатоки, Эрудиты, Мудрецы, Новички
- 🎯 **3 Rounds**: Разминка, Основной, Финал
- 💯 **Scores**: Баллы за каждый раунд + бонусы
- 🏆 **Results**: Полная таблица результатов

**Использование:**
```bash
# Требует наличия базовых данных
npm run db:seed:demo
```

## 🎯 Бизнес-логика

Сидеры демонстрируют правильный бизнес-процесс:

### ✅ Что создается:
- Организации и пользователи
- Шаблоны игр
- Игровые сессии
- Команды с участниками
- Раунды игр
- **Только баллы за раунды** (вносит администратор)

### ❌ Что НЕ создается:
- Вопросы (не хранятся в системе)
- Ответы команд (не хранятся в системе)
- Детальная информация о вопросах

### 📊 Процесс игры:
1. Администратор создает игру на основе шаблона
2. Команды регистрируются на игру
3. Администратор создает раунды
4. Во время игры команды отвечают на бумаге
5. **Администратор вносит только баллы за раунд**
6. Система формирует итоговую таблицу

## 🔧 Разработка

### Добавление нового сидера

1. Создайте файл `my-seeder.ts`:
```typescript
export async function seedMyData(): Promise<void> {
  try {
    console.log('🌱 Starting my seeder...');

    // Ваш код создания данных

    console.log('✅ My seeder completed!');
  } catch (error) {
    console.error('❌ My seeder failed:', error);
    throw error;
  }
}
```

2. Добавьте в `index.ts`:
```typescript
import { seedMyData } from './my-seeder';

export { seedMyData } from './my-seeder';
```

3. Обновите `seed.ts` для поддержки нового типа.

### Принципы разработки

- ✅ **Идемпотентность**: сидер можно запускать многократно
- ✅ **Проверка зависимостей**: проверяйте наличие необходимых данных
- ✅ **Логирование**: подробные сообщения о процессе
- ✅ **Обработка ошибок**: корректная обработка исключений
- ✅ **Типизация**: используйте TypeScript типы

## 📈 Мониторинг

### Логи выполнения

Каждый сидер выводит подробную информацию:

```
🌱 Starting database seeding...
📋 Options: basic=true, demo=true, reset=false

📦 Running basic seeder...
✅ Organization created: Quiz Game Demo Organization
✅ Admin user created: admin@quiz-game.com
✅ Game template created: Классическая викторина

🎮 Running demo game seeder...
✅ Demo game created: Демонстрационная викторина "Знания без границ"
✅ Teams created: 4
✅ Rounds created: 3
✅ Scores created: 15

🎉 All seeders completed successfully!
```

### Проверка результатов

После запуска сидеров проверьте данные:

```sql
-- Базовые данные
SELECT * FROM organizations;
SELECT * FROM users;
SELECT * FROM game_templates;

-- Демо игра
SELECT * FROM games WHERE game_code = 'DEMO2024';
SELECT * FROM teams WHERE game_id = '...';
SELECT * FROM rounds WHERE game_id = '...';
SELECT * FROM scores WHERE game_id = '...';
```

## 🚨 Важные замечания

1. **Порядок выполнения**: basic → demo
2. **Зависимости**: demo-seeder требует данные из basic-seeder
3. **Безопасность**: не используйте в production
4. **Производительность**: сидеры могут быть медленными на больших данных
5. **Очистка**: используйте `npm run db:reset` для полной очистки

## 🔗 Связанные файлы

- `src/database/migrate.ts` - Система миграций
- `src/database/init.ts` - Инициализация БД
- `src/models/` - Модели Sequelize
- `package.json` - npm скрипты
