# 🌿 Git Workflow для Quiz Game

> **Стратегия**: Git Flow | **Команда**: 30 разработчиков | **Основные ветки**: main, develop

## 🌳 Структура веток

### Постоянные ветки
```
main (production)
├── Защищенная ветка
├── Только через Pull Request
├── Автоматический deploy в production
└── Требует review от 2+ разработчиков

develop (integration)
├── Основная ветка разработки
├── Интеграция всех функций
├── Автоматический deploy в staging
└── Требует review от 1+ разработчика
```

### Временные ветки
```
feature/[task-id]-[short-description]
├── Новые функции
├── Создаются от develop
└── Merge в develop

hotfix/[issue-id]-[short-description]
├── Критические исправления
├── Создаются от main
└── Merge в main и develop

release/[version]
├── Подготовка к релизу
├── Создаются от develop
└── Merge в main и develop
```

## 🔄 Рабочий процесс

### Для новой функции
```bash
# 1. Обновляем develop
git checkout develop
git pull origin develop

# 2. Создаем feature ветку
git checkout -b feature/0.1-git-setup

# 3. Работаем и коммитим
git add .
git commit -m "feat(sprint-0): implement task 0.1 - setup Git repository"

# 4. Пушим ветку
git push -u origin feature/0.1-git-setup

# 5. Создаем Pull Request в develop
```

### Для критического исправления
```bash
# 1. Создаем hotfix от main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Исправляем и коммитим
git add .
git commit -m "fix: critical bug in scoring system"

# 3. Создаем PR в main И develop
```

## 📝 Соглашения о коммитах

### Формат
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы коммитов
- `feat`: новая функция
- `fix`: исправление ошибки
- `docs`: изменения в документации
- `style`: форматирование кода
- `refactor`: рефакторинг
- `test`: добавление тестов
- `chore`: обслуживание кода

### Примеры
```bash
feat(sprint-0): implement task 0.1 - setup Git repository

- Добавлено: .gitignore для Node.js/React проекта
- Добавлено: GitHub templates для PR и Issues
- Настроено: Git Flow с ветками main/develop

Refs: #0.1

fix(auth): resolve JWT token expiration issue

Fixes: #123
```

## 🛡️ Правила защиты веток

### main ветка
- ✅ Require pull request reviews (2 reviewers)
- ✅ Dismiss stale PR reviews when new commits are pushed
- ✅ Require review from code owners
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators in restrictions

### develop ветка
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

## 🚀 CI/CD Integration

### Автоматические проверки
```yaml
# .github/workflows/checks.yml
on: [push, pull_request]

jobs:
  test:
    - Lint code
    - Run unit tests
    - Run integration tests
    - Check test coverage

  build:
    - Build backend
    - Build frontend
    - Docker image build
```

### Автоматический deploy
```yaml
# main ветка → production
# develop ветка → staging
# feature/* ветки → review apps
```

## 👥 Роли и права

### Tech Lead
- Merge в main
- Настройка branch protection
- Code review любых PR

### Senior Developers
- Merge в develop
- Code review junior PR
- Создание release веток

### Developers
- Создание feature веток
- Code review peer PR
- Merge своих PR после approval

## 📊 Мониторинг

### Метрики Git
- Количество активных веток
- Время жизни feature веток
- Частота коммитов
- Размер Pull Request

### Качество кода
- Code coverage
- Lint errors
- Security vulnerabilities
- Performance metrics

---

## 🔗 Полезные команды

```bash
# Обновить все ветки
git fetch --all --prune

# Удалить merged ветки
git branch --merged develop | grep -v develop | xargs git branch -d

# Посмотреть граф веток
git log --oneline --graph --all

# Найти коммит по тексту
git log --grep="task 0.1"

# Статистика коммитов
git shortlog -sn
```

---

> 💡 **Совет**: Всегда создавайте небольшие, сфокусированные PR. Большие PR сложно ревьюить и они замедляют разработку.
