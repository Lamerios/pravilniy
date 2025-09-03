# 🔄 GitHub Actions Workflows

> **CI/CD Pipeline для Quiz Game проекта**

## 📋 Обзор Workflows

### 🔄 ci.yml - Основной CI Pipeline
**Триггеры:** Push в main/develop, Pull Requests
**Задачи:**
- 🧹 Lint проверка (ESLint + Prettier)
- 🔍 TypeScript type checking
- 🧪 Unit тесты (Jest + Vitest)
- 🏗️ Build проверка
- 🎭 E2E тесты (Playwright)
- 🔒 Security audit

### 🔍 pr-check.yml - Проверка Pull Requests
**Триггеры:** PR события (opened, synchronize, reopened)
**Задачи:**
- 📋 Валидация PR (размер, commit messages)
- 📊 Анализ качества кода
- 📦 Проверка изменений зависимостей
- 🤖 Автоматические проверки (labels, описание)
- 📢 Уведомления о статусе

### 🚀 cd.yml - Deployment Pipeline
**Триггеры:** Push в main, Manual workflow dispatch
**Задачи:**
- 🐳 Сборка Docker образов
- 🚀 Деплой в Staging
- 💨 Smoke тесты
- 🌟 Деплой в Production (с approval)
- ↩️ Rollback механизм

### 📦 dependency-review.yml - Анализ Зависимостей
**Триггеры:** PR с изменениями package.json/lock файлов
**Задачи:**
- 🔍 Проверка уязвимостей
- ⚖️ Анализ лицензий
- 🔒 Security audit
- 📊 Bundle size analysis

### 🔍 codeql.yml - Анализ Безопасности
**Триггеры:** Push, PR, Schedule (еженедельно)
**Задачи:**
- 🔍 CodeQL анализ
- 🛡️ Поиск уязвимостей
- 📊 Security reporting

## 🔧 Конфигурация

### Переменные окружения
```yaml
env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
```

### Секреты (требуются)
- `GITHUB_TOKEN` - автоматически предоставляется
- `SNYK_TOKEN` - для Snyk security scan
- `CODECOV_TOKEN` - для coverage reporting

### Environments
- **staging** - автоматический деплой из main
- **production** - ручной деплой с approval

## 📊 Матрица тестирования

### Workspaces
```yaml
strategy:
  matrix:
    workspace: [quiz-game-backend, quiz-game-frontend]
```

### Services (для E2E тестов)
```yaml
services:
  postgres:
    image: postgres:15-alpine
  redis:
    image: redis:7-alpine
```

## 🏷️ Labels и Конвенции

### Обязательные labels для PR
- `sprint-0`, `sprint-1`, ..., `sprint-8`
- Тип изменения: `bug`, `feature`, `enhancement`

### Commit message конвенция
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Примеры:**
```
feat(sprint-0): implement CI/CD pipeline
fix(backend): resolve database connection issue
docs(readme): update installation instructions
```

## 🚀 Workflow Статусы

### Обязательные проверки для merge
- ✅ CI Pipeline успешен
- ✅ PR Checks прошли
- ✅ Code Quality соответствует стандартам
- ✅ Security проверки пройдены
- ✅ Минимум 1 approve от reviewer

### Автоматические действия
- 🏷️ Автоматическое добавление labels
- 📊 Комментарии с результатами проверок
- 📢 Уведомления в Slack (будет настроено)
- 🐳 Сборка и публикация Docker образов

## 🔄 Deployment Flow

```
main branch
    ↓
🏗️ Build Images
    ↓
🚀 Deploy Staging
    ↓
💨 Smoke Tests
    ↓
👥 Manual Approval
    ↓
🌟 Deploy Production
```

## 📈 Monitoring и Metrics

### Собираемые метрики
- ⏱️ Время выполнения CI/CD
- 📊 Test coverage
- 🐛 Количество багов
- 🚀 Частота деплоев
- ↩️ Количество rollback'ов

### Dashboards
- GitHub Actions dashboard
- CodeQL security overview
- Dependency vulnerability tracking

## 🛠️ Локальная отладка

### Запуск проверок локально
```bash
# Lint проверка
npm run lint

# Тесты
npm run test

# Build
npm run build

# Полная валидация (как в CI)
npm run validate
```

### Act для локального запуска GitHub Actions
```bash
# Установка act
# Windows: choco install act-cli
# macOS: brew install act

# Запуск CI локально
act -j lint-and-test
act -j build
```

## 🔧 Troubleshooting

### Частые проблемы
1. **Тесты падают в CI, но работают локально**
   - Проверьте переменные окружения
   - Убедитесь в идентичности Node.js версий

2. **Docker build fails**
   - Проверьте Dockerfile
   - Убедитесь в наличии всех файлов

3. **Dependency review fails**
   - Проверьте лицензии новых зависимостей
   - Исправьте уязвимости через npm audit

### Полезные команды
```bash
# Просмотр логов workflow
gh run list
gh run view <run-id>

# Повторный запуск failed workflow
gh run rerun <run-id>
```

---

> 💡 **Совет**: Всегда проверяйте CI локально перед push в удаленный репозиторий!
