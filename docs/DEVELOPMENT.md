# 👨‍💻 Development Guide

> **Полное руководство для разработчиков Quiz Game**

## 🎯 Обзор

Этот документ содержит всю необходимую информацию для разработчиков, которые хотят внести вклад в проект Quiz Game.

## 🏗️ Архитектура проекта

### Структура монорепозитория

```
quiz-game/
├── 📁 quiz-game-backend/          # Backend API (Node.js + Express + TypeScript)
├── 📁 quiz-game-frontend/         # Frontend SPA (React + TypeScript + Vite)
├── 📁 docker/                     # Docker конфигурация и скрипты
├── 📁 docs/                       # Документация проекта
├── 📁 scripts/                    # Скрипты автоматизации
├── 📁 tests/                      # E2E тесты (Playwright)
├── 📁 .github/                    # GitHub Actions workflows
└── 📄 package.json                # Корневой package.json с workspaces
```

### Технологический стек

| Слой | Технологии | Описание |
|------|------------|----------|
| **Frontend** | React 18 + TypeScript + Vite | SPA приложение |
| **Backend** | Node.js + Express + TypeScript | REST API сервер |
| **Database** | PostgreSQL 15+ + Sequelize | Основная БД + ORM |
| **Cache** | Redis 7+ | Кеширование + сессии |
| **Real-time** | Socket.io | WebSocket соединения |
| **Testing** | Jest + Vitest + Playwright | Unit + E2E тесты |
| **Linting** | ESLint + Prettier | Качество кода |
| **CI/CD** | GitHub Actions | Автоматизация |
| **Containerization** | Docker + Docker Compose | Развертывание |

## 🚀 Начало работы

### Предварительные требования

```bash
# Проверьте версии
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
docker --version  # >= 20.10
git --version     # любая
```

### Первоначальная настройка

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

## 🔄 Git Workflow

### Ветки

- **`main`** - продакшн код (только через PR)
- **`develop`** - основная ветка разработки
- **`feature/*`** - новые функции
- **`bugfix/*`** - исправления багов
- **`hotfix/*`** - срочные исправления

### Создание feature ветки

```bash
# Переключитесь на develop
git checkout develop
git pull origin develop

# Создайте feature ветку
git checkout -b feature/your-feature-name

# Разрабатывайте и коммитьте
git add .
git commit -m "feat(sprint-X): implement feature description

- Добавлено: что добавлено
- Изменено: что изменено
- Тесты: какие тесты

Refs: #X.Y"
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

**Примеры:**
```bash
feat(sprint-1): implement user authentication

- Добавлено: JWT аутентификация с refresh токенами
- Добавлено: bcrypt хеширование паролей
- Добавлено: middleware для защиты маршрутов
- Тесты: unit тесты для auth сервиса

Refs: #1.1

fix(backend): resolve database connection timeout

- Изменено: увеличен timeout для DB подключения
- Изменено: добавлена retry логика
- Тесты: обновлены тесты подключения

Refs: #1.3
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

# Запуск конкретного теста
npm run test:e2e -- tests/auth.spec.ts
```

### Написание тестов

#### Backend тесты (Jest)

```typescript
// quiz-game-backend/src/__tests__/auth.test.ts
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('login', () => {
    it('should authenticate valid user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.login(credentials);
      
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(credentials.email);
    });

    it('should reject invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});
```

#### Frontend тесты (Vitest)

```typescript
// quiz-game-frontend/src/__tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LoginForm from '../components/LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render login form', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

#### E2E тесты (Playwright)

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('user sees error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});
```

## 🔧 Качество кода

### Линтинг и форматирование

```bash
# Проверка ESLint
npm run lint

# Автоматическое исправление ESLint
npm run lint:fix

# Проверка Prettier
npm run format:check

# Форматирование Prettier
npm run format

# Полная валидация
npm run validate
```

### TypeScript проверки

```bash
# Type checking
npm run type-check

# Type checking backend
npm run type-check:backend

# Type checking frontend
npm run type-check:frontend
```

### Конфигурация ESLint

#### Backend (.eslintrc.js)

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

#### Frontend (.eslintrc.js)

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### Prettier конфигурация

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🐳 Docker разработка

### Запуск сервисов

```bash
# Development профиль (с PgAdmin, Redis Commander)
docker-compose --profile dev up -d

# Только основные сервисы
docker-compose up -d postgres redis

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Полезные команды

```bash
# Проверка статуса
npm run services:status

# Перезапуск сервисов
npm run dev:restart

# Просмотр логов
npm run dev:logs

# Очистка volumes
npm run services:clean
```

### Отладка в Docker

```bash
# Подключение к PostgreSQL
docker-compose exec postgres psql -U quiz_user -d quiz_game_dev

# Подключение к Redis
docker-compose exec redis redis-cli

# Просмотр логов конкретного сервиса
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 📊 Мониторинг и отладка

### Логирование

#### Backend логи

```typescript
// quiz-game-backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/backend.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

#### Frontend логи

```typescript
// quiz-game-frontend/src/utils/logger.ts
const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
};
```

### Health checks

```bash
# Проверка здоровья всех сервисов
npm run health:check

# Проверка PostgreSQL
npm run health:postgres

# Проверка Redis
npm run health:redis
```

### Отладка

#### Backend отладка

```typescript
// Включите debug режим
DEBUG=quiz-game:backend:* npm run dev:backend

// Или используйте console.log (только для development)
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

#### Frontend отладка

```typescript
// Используйте React DevTools
// Включите debug режим
VITE_DEBUG_MODE=true npm run dev:frontend

// Или используйте console.log
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

## 🔒 Безопасность

### Переменные окружения

```bash
# Никогда не коммитьте .env файлы
# Добавьте в .gitignore
.env
.env.local
.env.production

# Используйте .env.example для шаблонов
cp .env.example .env
# Отредактируйте .env с реальными значениями
```

### Секреты

```bash
# Генерация JWT секрета
openssl rand -base64 32

# Генерация session секрета
openssl rand -base64 24

# Генерация пароля БД
openssl rand -base64 16
```

### Security audit

```bash
# Проверка уязвимостей
npm run security:audit

# Автоматическое исправление
npm run security:fix
```

## 🚀 Деплой

### Staging

```bash
# Автоматический деплой при push в main
git push origin main

# Ручной деплой
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

## 📋 Pull Request процесс

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

### CI/CD проверки

```yaml
# .github/workflows/ci.yml
- name: Lint & Test
  run: npm run lint && npm run test

- name: Type Check
  run: npm run type-check

- name: Build
  run: npm run build

- name: E2E Tests
  run: npm run test:e2e
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

# Перезапустите сервисы
npm run dev:restart
```

#### 2. "Redis connection failed"

```bash
# Проверьте статус Redis
docker-compose ps redis

# Тест подключения
docker-compose exec redis redis-cli ping

# Перезапустите Redis
docker-compose restart redis
```

#### 3. "Port already in use"

```bash
# Найдите процесс на порту
netstat -ano | findstr :5001
netstat -ano | findstr :3000

# Остановите процесс
taskkill /PID <PID> /F

# Или используйте другие порты
# Измените в .env файлах
```

#### 4. "Permission denied"

```bash
# Windows: запустите PowerShell от имени администратора
# Linux/macOS: используйте sudo
sudo chmod +x scripts/env-setup.sh
```

#### 5. "TypeScript compilation errors"

```bash
# Проверьте типы
npm run type-check

# Очистите кеш
npm run clean:build

# Переустановите зависимости
npm run clean:install
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

## 📚 Ресурсы

### Документация

- [📖 Environment Setup](ENVIRONMENT_SETUP.md) - настройка переменных окружения
- [🚀 Quick Start](QUICK_START.md) - быстрое начало работы
- [🏗️ Architecture](../docs2/architecture-simple.md) - архитектура проекта
- [🗄️ Database Schema](../docs2/database-schema.md) - схема базы данных
- [🔌 API Reference](../docs2/api-quick.md) - API документация
- [🧪 Testing Guide](../docs2/testing-guide.md) - руководство по тестированию

### Внешние ресурсы

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sequelize Documentation](https://sequelize.org/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)

### Сообщество

- [GitHub Issues](https://github.com/quiz-game-team/quiz-game/issues)
- [GitHub Discussions](https://github.com/quiz-game-team/quiz-game/discussions)
- [Discord Community](https://discord.gg/quiz-game)

---

> 💡 **Совет**: Если у вас есть вопросы, создайте issue или присоединитесь к Discord сообществу!
