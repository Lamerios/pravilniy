# 🌐 API Quick Reference

> **Для**: Frontend разработчиков | **Время**: 15 минут | **Статус**: Актуально

## ⚡ Быстрый старт

### Base URL
```
Development: http://localhost:5001/api
Production:  https://api.quiz-game.com/api
```

### Аутентификация
```javascript
// Получение токена
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password'
  })
});

const { token } = await response.json();

// Использование токена
const authHeaders = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## 🎯 Основные endpoints

### 🎮 Игры

#### Список игр
```http
GET /api/games
```

**Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "uuid-123",
        "title": "Quiz Night #1",
        "date": "2025-01-27",
        "status": "in_progress",
        "teamCount": 8
      }
    ],
    "pagination": {
      "page": 1,
      "total": 10,
      "pages": 2
    }
  }
}
```

#### Создание игры
```http
POST /api/games
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Quiz Night #2",
  "templateId": "uuid-template",
  "date": "2025-01-28",
  "teams": [
    {
      "name": "Team Alpha",
      "tableNumber": 1
    },
    {
      "name": "Team Beta", 
      "tableNumber": 2
    }
  ]
}
```

#### Табло игры
```http
GET /api/games/:id/scoreboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "uuid-123",
    "gameTitle": "Quiz Night #1",
    "status": "in_progress",
    "currentRound": 2,
    "teams": [
      {
        "id": "uuid-team-1",
        "name": "Team Alpha",
        "tableNumber": 1,
        "totalPoints": 15.5,
        "position": 1
      }
    ]
  }
}
```

### 👥 Команды

#### Список команд
```http
GET /api/teams?search=alpha&page=1&limit=10
```

#### Создание команды
```http
POST /api/teams
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "New Team",
  "description": "Team description"
}
```

### 🎯 Баллы

#### Обновление баллов
```http
POST /api/scores
Authorization: Bearer <token>
```

**Request:**
```json
{
  "gameId": "uuid-game",
  "roundId": "uuid-round", 
  "teamId": "uuid-team",
  "questionNumber": 3,
  "isCorrect": true,
  "stake": 2,
  "notes": "Correct answer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pointsAwarded": 4.0,
    "teamTotalPoints": 19.5,
    "position": 1
  }
}
```

## 🔌 WebSocket API

### Подключение
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001', {
  transports: ['websocket']
});

// Подключение к игре
socket.emit('game:join', { gameId: 'uuid-123' });
```

### События

#### Обновление баллов
```javascript
socket.on('score:updated', (data) => {
  console.log('Score updated:', data);
  // {
  //   gameId: "uuid-123",
  //   teamId: "uuid-team-1", 
  //   pointsAwarded: 4.0,
  //   teamTotalPoints: 19.5,
  //   position: 1
  // }
});
```

#### Изменение статуса игры
```javascript
socket.on('game:status:changed', (data) => {
  console.log('Game status changed:', data);
  // {
  //   gameId: "uuid-123",
  //   oldStatus: "created",
  //   newStatus: "in_progress"
  // }
});
```

## 🚨 Обработка ошибок

### HTTP статус коды
| Код | Значение | Пример |
|-----|----------|---------|
| 200 | OK | Успешный запрос |
| 201 | Created | Ресурс создан |
| 400 | Bad Request | Ошибка валидации |
| 401 | Unauthorized | Нет токена |
| 403 | Forbidden | Нет прав |
| 404 | Not Found | Ресурс не найден |
| 500 | Server Error | Ошибка сервера |

### Формат ошибок
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Обработка в коде
```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API Error');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};
```

## 📊 Валидация данных

### Игры
```javascript
const gameSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  date: {
    required: true,
    format: 'YYYY-MM-DD'
  },
  teams: {
    required: true,
    minItems: 2,
    maxItems: 20
  }
};
```

### Команды
```javascript
const teamSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    unique: true
  },
  tableNumber: {
    required: true,
    min: 1,
    max: 999
  }
};
```

## 🔧 Утилиты для разработки

### API клиент
```javascript
// utils/api.js
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API Error');
    }

    return data;
  }

  // Shortcuts
  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiClient(import.meta.env.VITE_API_URL);
```

### React hooks
```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useApi = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.get(endpoint);
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};

// Использование
const { data: games, loading, error } = useApi('/games');
```

## 📋 Postman коллекция

### Импорт коллекции
1. Скачайте [Quiz Game API.postman_collection.json](./postman/collection.json)
2. Импортируйте в Postman: File → Import
3. Настройте environment переменные:

```json
{
  "baseUrl": "http://localhost:5001/api",
  "authToken": "your-jwt-token-here"
}
```

### Основные запросы
- **Auth** → Login → Get Token
- **Games** → Get All Games
- **Games** → Create Game  
- **Games** → Get Scoreboard
- **Teams** → Create Team
- **Scores** → Update Score

## 🧪 Тестирование API

### Unit тесты
```javascript
// __tests__/api.test.js
import { api } from '../utils/api';

describe('API Client', () => {
  test('should get games list', async () => {
    const response = await api.get('/games');
    
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data.games)).toBe(true);
  });

  test('should handle errors', async () => {
    await expect(api.get('/invalid-endpoint'))
      .rejects.toThrow('Not Found');
  });
});
```

### Integration тесты
```javascript
// __tests__/game-flow.test.js
describe('Game Flow', () => {
  test('should create game and update scores', async () => {
    // 1. Create game
    const game = await api.post('/games', gameData);
    expect(game.success).toBe(true);

    // 2. Update score
    const score = await api.post('/scores', scoreData);
    expect(score.data.pointsAwarded).toBeGreaterThan(0);

    // 3. Check scoreboard
    const scoreboard = await api.get(`/games/${game.data.id}/scoreboard`);
    expect(scoreboard.data.teams[0].totalPoints).toBeGreaterThan(0);
  });
});
```

## 🔗 Полезные ссылки

- 📖 [Полная API документация](../docs/api.md)
- 🏗️ [Архитектура системы](./architecture-simple.md)  
- 🧪 [Тестирование](./testing-guide.md)
- 🚨 [Troubleshooting](./troubleshooting.md)

---

> 💡 **Совет**: Используйте браузерные DevTools для отладки API запросов. В Network tab можно увидеть все запросы и ответы.
