# 🎨 Frontend разработка - Enterprise Guide

> **Для**: Frontend разработчиков | **Стек**: React 19 + TypeScript + Material-UI | **Enterprise-ready**

## 🚀 Быстрый старт

### Структура проекта
```
quiz-game-frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── common/         # Общие компоненты (Button, Input, etc.)
│   │   ├── layout/         # Layout компоненты
│   │   ├── forms/          # Формы
│   │   └── charts/         # Графики и аналитика
│   ├── pages/              # Страницы приложения
│   │   ├── admin/          # Админ панель
│   │   ├── public/         # Публичные страницы
│   │   └── auth/           # Аутентификация
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API клиенты и сервисы
│   ├── store/              # State management (Zustand)
│   ├── utils/              # Утилиты
│   ├── types/              # TypeScript типы
│   ├── constants/          # Константы
│   ├── assets/             # Статические файлы
│   └── tests/              # Тесты
├── public/                 # Публичные файлы
├── docs/                   # Документация компонентов
└── .storybook/             # Storybook конфигурация
```

### Команды для разработки
```bash
# Установка зависимостей
npm install

# Разработка с hot reload
npm run dev

# Сборка для продакшена
npm run build

# Тестирование
npm run test
npm run test:watch
npm run test:coverage

# Линтинг и форматирование
npm run lint
npm run lint:fix
npm run format

# Storybook
npm run storybook

# Анализ бандла
npm run build:analyze
```

## 🛠️ Технологический стек

### Основные технологии
| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 19.1+ | UI библиотека |
| **TypeScript** | 5.8+ | Типизация |
| **Vite** | 7.1+ | Build tool |
| **Material-UI** | 7.3+ | UI компоненты |
| **Zustand** | 5.0+ | State management |
| **React Router** | 6.30+ | Роутинг |
| **Socket.IO Client** | 4.8+ | WebSocket |
| **Axios** | 1.11+ | HTTP клиент |
| **React Hook Form** | 7.53+ | Формы |
| **Zod** | 3.25+ | Валидация схем |

### Инструменты разработки
| Инструмент | Версия | Назначение |
|------------|--------|------------|
| **ESLint** | 9.0+ | Линтинг |
| **Prettier** | 3.4+ | Форматирование |
| **Vitest** | 2.1+ | Тестирование |
| **Testing Library** | 16.1+ | Тестирование компонентов |
| **Storybook** | 8.4+ | Документация компонентов |
| **MSW** | 2.8+ | API моки |

## 🏗️ Архитектура Frontend

### Организация кода
```typescript
// Пример структуры компонента
src/components/scoreboard/
├── Scoreboard.tsx           # Главный компонент
├── ScoreboardHeader.tsx     # Подкомпоненты
├── ScoreboardTable.tsx
├── ScoreboardRow.tsx
├── hooks/
│   ├── useScoreboard.ts     # Бизнес-логика
│   └── useWebSocket.ts      # WebSocket подключение
├── types.ts                 # TypeScript типы
├── constants.ts             # Константы
├── utils.ts                 # Утилиты
├── Scoreboard.stories.tsx   # Storybook истории
├── Scoreboard.test.tsx      # Тесты
└── index.ts                 # Public API
```

### State Management (Zustand)
```typescript
// store/gameStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Game {
  id: string;
  title: string;
  status: 'created' | 'in_progress' | 'completed';
  teams: Team[];
}

interface GameState {
  // State
  currentGame: Game | null;
  games: Game[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentGame: (game: Game) => void;
  loadGames: () => Promise<void>;
  createGame: (gameData: CreateGameRequest) => Promise<void>;
  updateGameStatus: (gameId: string, status: Game['status']) => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentGame: null,
      games: [],
      loading: false,
      error: null,

      // Actions
      setCurrentGame: (game) => set({ currentGame: game }),

      loadGames: async () => {
        set({ loading: true, error: null });
        try {
          const response = await gameService.getGames();
          set({ games: response.data.games, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      createGame: async (gameData) => {
        set({ loading: true, error: null });
        try {
          const response = await gameService.createGame(gameData);
          set((state) => ({
            games: [response.data, ...state.games],
            currentGame: response.data,
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      updateGameStatus: (gameId, status) => {
        set((state) => ({
          games: state.games.map(game =>
            game.id === gameId ? { ...game, status } : game
          ),
          currentGame: state.currentGame?.id === gameId
            ? { ...state.currentGame, status }
            : state.currentGame
        }));
      },

      clearError: () => set({ error: null })
    }),
    { name: 'game-store' }
  )
);
```

### API Services
```typescript
// services/gameService.ts
import { apiClient } from './apiClient';
import type { Game, CreateGameRequest, UpdateGameRequest } from '../types/game';

class GameService {
  async getGames(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ games: Game[]; pagination: Pagination }>> {
    return apiClient.get('/games', { params });
  }

  async getGame(id: string): Promise<ApiResponse<Game>> {
    return apiClient.get(`/games/${id}`);
  }

  async createGame(data: CreateGameRequest): Promise<ApiResponse<Game>> {
    return apiClient.post('/games', data);
  }

  async updateGame(id: string, data: UpdateGameRequest): Promise<ApiResponse<Game>> {
    return apiClient.put(`/games/${id}`, data);
  }

  async getScoreboard(gameId: string): Promise<ApiResponse<Scoreboard>> {
    return apiClient.get(`/games/${gameId}/scoreboard`);
  }
}

export const gameService = new GameService();
```

### Custom Hooks
```typescript
// hooks/useWebSocket.ts
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

interface UseWebSocketProps {
  gameId?: string;
  onScoreUpdate?: (data: ScoreUpdateEvent) => void;
  onGameStatusChange?: (data: GameStatusEvent) => void;
}

export const useWebSocket = ({
  gameId,
  onScoreUpdate,
  onGameStatusChange
}: UseWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      setConnected(true);
      if (gameId) {
        newSocket.emit('game:join', { gameId });
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('score:updated', (data: ScoreUpdateEvent) => {
      onScoreUpdate?.(data);
    });

    newSocket.on('game:status:changed', (data: GameStatusEvent) => {
      onGameStatusChange?.(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [gameId, onScoreUpdate, onGameStatusChange]);

  const emitEvent = useCallback((event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  }, [socket, connected]);

  return {
    socket,
    connected,
    emitEvent
  };
};
```

## 🎯 Ключевые компоненты

### 1. Scoreboard (Табло)
```typescript
// components/scoreboard/Scoreboard.tsx
import React, { useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useGameStore } from '../../store/gameStore';
import type { Team } from '../../types/game';

interface ScoreboardProps {
  gameId: string;
  autoRefresh?: boolean;
  showPositions?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  gameId,
  autoRefresh = true,
  showPositions = true
}) => {
  const { currentGame, loadGame } = useGameStore();
  
  const { connected } = useWebSocket({
    gameId,
    onScoreUpdate: (data) => {
      // Обновляем локальное состояние
      updateTeamScore(data.teamId, data.teamTotalPoints);
    }
  });

  useEffect(() => {
    loadGame(gameId);
  }, [gameId, loadGame]);

  const sortedTeams = currentGame?.teams
    ?.slice()
    .sort((a, b) => b.totalPoints - a.totalPoints) || [];

  if (!currentGame) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          {currentGame.title}
        </Typography>
        <Box display="flex" gap={1}>
          <Chip
            label={connected ? 'Подключено' : 'Отключено'}
            color={connected ? 'success' : 'error'}
            size="small"
          />
          <Chip
            label={`Раунд ${currentGame.currentRound}`}
            color="primary"
            size="small"
          />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {showPositions && <TableCell>Место</TableCell>}
              <TableCell>Команда</TableCell>
              <TableCell>Стол</TableCell>
              <TableCell align="right">Баллы</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow
                key={team.id}
                data-testid="team-row"
                sx={{
                  backgroundColor: index === 0 ? 'gold.light' : 'inherit'
                }}
              >
                {showPositions && (
                  <TableCell>
                    <Typography
                      variant="h6"
                      color={index === 0 ? 'primary' : 'inherit'}
                    >
                      {index + 1}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {team.logoPath && (
                      <img
                        src={team.logoPath}
                        alt={`${team.name} logo`}
                        style={{ width: 32, height: 32, borderRadius: 4 }}
                      />
                    )}
                    <Typography variant="body1" fontWeight="medium">
                      {team.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{team.tableNumber}</TableCell>
                <TableCell align="right">
                  <Typography
                    variant="h6"
                    color={index === 0 ? 'primary' : 'inherit'}
                    data-testid="team-score"
                  >
                    {team.totalPoints.toFixed(1)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
```

### 2. Game Creation Form
```typescript
// components/forms/GameForm.tsx
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  Grid
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { gameFormSchema, type GameFormData } from './schemas';

interface GameFormProps {
  onSubmit: (data: GameFormData) => void;
  loading?: boolean;
  initialData?: Partial<GameFormData>;
}

export const GameForm: React.FC<GameFormProps> = ({
  onSubmit,
  loading = false,
  initialData
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      teams: [
        { name: '', tableNumber: 1 },
        { name: '', tableNumber: 2 }
      ],
      ...initialData
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'teams'
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            {...register('title')}
            label="Название игры"
            fullWidth
            error={!!errors.title}
            helperText={errors.title?.message}
            data-testid="game-title-input"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            {...register('date')}
            label="Дата игры"
            type="date"
            fullWidth
            error={!!errors.date}
            helperText={errors.date?.message}
            InputLabelProps={{ shrink: true }}
            data-testid="game-date-input"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Команды
          </Typography>
          
          {fields.map((field, index) => (
            <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register(`teams.${index}.name`)}
                    label="Название команды"
                    fullWidth
                    error={!!errors.teams?.[index]?.name}
                    helperText={errors.teams?.[index]?.name?.message}
                    data-testid="team-name-input"
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    {...register(`teams.${index}.tableNumber`, {
                      valueAsNumber: true
                    })}
                    label="Номер стола"
                    type="number"
                    fullWidth
                    error={!!errors.teams?.[index]?.tableNumber}
                    helperText={errors.teams?.[index]?.tableNumber?.message}
                    data-testid="table-number-input"
                  />
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  <IconButton
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Button
            startIcon={<Add />}
            onClick={() => append({ name: '', tableNumber: fields.length + 1 })}
            variant="outlined"
            data-testid="add-team-button"
          >
            Добавить команду
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              data-testid="create-game-submit"
            >
              {loading ? 'Создание...' : 'Создать игру'}
            </Button>
            
            <Button variant="outlined">
              Отмена
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
```

### 3. Score Input Component
```typescript
// components/scoring/ScoreInput.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  TextField,
  Paper,
  Chip
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';

interface ScoreInputProps {
  teamId: string;
  teamName: string;
  questionNumber: number;
  maxStake?: number;
  onSubmit: (data: {
    teamId: string;
    questionNumber: number;
    isCorrect: boolean;
    stake?: number;
    notes?: string;
  }) => void;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  teamId,
  teamName,
  questionNumber,
  maxStake = 3,
  onSubmit
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stake, setStake] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (isCorrect === null) return;

    onSubmit({
      teamId,
      questionNumber,
      isCorrect,
      stake: isCorrect ? stake : undefined,
      notes: notes.trim() || undefined
    });

    // Reset form
    setIsCorrect(null);
    setStake(null);
    setNotes('');
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {teamName} - Вопрос {questionNumber}
      </Typography>

      <Box mb={2}>
        <Typography variant="body2" gutterBottom>
          Ответ:
        </Typography>
        <ButtonGroup>
          <Button
            variant={isCorrect === true ? 'contained' : 'outlined'}
            color="success"
            startIcon={<Check />}
            onClick={() => setIsCorrect(true)}
            data-testid="correct-answer"
          >
            Правильно
          </Button>
          <Button
            variant={isCorrect === false ? 'contained' : 'outlined'}
            color="error"
            startIcon={<Close />}
            onClick={() => setIsCorrect(false)}
            data-testid="incorrect-answer"
          >
            Неправильно
          </Button>
        </ButtonGroup>
      </Box>

      {isCorrect && (
        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Ставка:
          </Typography>
          <Box display="flex" gap={1}>
            {Array.from({ length: maxStake }, (_, i) => i + 1).map((value) => (
              <Chip
                key={value}
                label={value}
                clickable
                color={stake === value ? 'primary' : 'default'}
                onClick={() => setStake(value)}
                data-testid={`stake-${value}`}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box mb={2}>
        <TextField
          label="Заметки (опционально)"
          multiline
          rows={2}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isCorrect === null}
        data-testid="save-score"
      >
        Сохранить
      </Button>
    </Paper>
  );
};
```

## 🧪 Тестирование

### Unit тесты компонентов
```typescript
// components/scoreboard/__tests__/Scoreboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Scoreboard } from '../Scoreboard';
import { useGameStore } from '../../../store/gameStore';

// Mock store
vi.mock('../../../store/gameStore');
const mockUseGameStore = vi.mocked(useGameStore);

// Mock WebSocket hook
vi.mock('../../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({ connected: true })
}));

describe('Scoreboard', () => {
  const mockGame = {
    id: 'game-1',
    title: 'Test Game',
    currentRound: 2,
    teams: [
      {
        id: 'team-1',
        name: 'Team Alpha',
        tableNumber: 1,
        totalPoints: 15.5
      },
      {
        id: 'team-2',
        name: 'Team Beta',
        tableNumber: 2,
        totalPoints: 12.0
      }
    ]
  };

  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      currentGame: mockGame,
      loadGame: vi.fn()
    });
  });

  it('renders game title and teams', () => {
    render(<Scoreboard gameId="game-1" />);
    
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
  });

  it('sorts teams by points descending', () => {
    render(<Scoreboard gameId="game-1" />);
    
    const teamRows = screen.getAllByTestId('team-row');
    const firstTeamScore = teamRows[0].querySelector('[data-testid="team-score"]');
    
    expect(firstTeamScore).toHaveTextContent('15.5');
  });

  it('shows connection status', () => {
    render(<Scoreboard gameId="game-1" />);
    
    expect(screen.getByText('Подключено')).toBeInTheDocument();
  });
});
```

### Integration тесты
```typescript
// components/forms/__tests__/GameForm.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameForm } from '../GameForm';

describe('GameForm Integration', () => {
  it('creates game with teams', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<GameForm onSubmit={mockOnSubmit} />);

    // Fill form
    await user.type(screen.getByTestId('game-title-input'), 'Test Game');
    await user.type(screen.getByTestId('game-date-input'), '2025-01-27');

    // Fill team names
    const teamInputs = screen.getAllByTestId('team-name-input');
    await user.type(teamInputs[0], 'Team Alpha');
    await user.type(teamInputs[1], 'Team Beta');

    // Submit form
    await user.click(screen.getByTestId('create-game-submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Game',
        date: '2025-01-27',
        teams: [
          { name: 'Team Alpha', tableNumber: 1 },
          { name: 'Team Beta', tableNumber: 2 }
        ]
      });
    });
  });
});
```

## 🎨 Styling и Theming

### Material-UI Theme
```typescript
// theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036'
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 500
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    }
  }
});
```

## 📱 Responsive Design

### Breakpoints и адаптивность
```typescript
// hooks/useBreakpoint.ts
import { useTheme, useMediaQuery } from '@mui/material';

export const useBreakpoint = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return { isMobile, isTablet, isDesktop };
};

// Использование в компонентах
const ScoreboardResponsive: React.FC = () => {
  const { isMobile } = useBreakpoint();
  
  return (
    <TableContainer>
      <Table size={isMobile ? 'small' : 'medium'}>
        {/* ... */}
      </Table>
    </TableContainer>
  );
};
```

## 🚀 Оптимизация производительности

### Lazy Loading и Code Splitting
```typescript
// pages/index.ts
import { lazy } from 'react';

// Lazy loading страниц
export const AdminDashboard = lazy(() => import('./admin/Dashboard'));
export const PublicScoreboard = lazy(() => import('./public/Scoreboard'));
export const GameCreate = lazy(() => import('./admin/GameCreate'));

// App.tsx
import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/scoreboard/:gameId" element={<PublicScoreboard />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

### Memoization
```typescript
// Оптимизация ререндеров
import { memo, useMemo, useCallback } from 'react';

export const ScoreboardRow = memo<ScoreboardRowProps>(({ team, position }) => {
  const formattedScore = useMemo(
    () => team.totalPoints.toFixed(1),
    [team.totalPoints]
  );

  return (
    <TableRow>
      <TableCell>{position}</TableCell>
      <TableCell>{team.name}</TableCell>
      <TableCell>{formattedScore}</TableCell>
    </TableRow>
  );
});
```

## 📖 Storybook

### Конфигурация компонентов
```typescript
// components/scoreboard/Scoreboard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Scoreboard } from './Scoreboard';

const meta: Meta<typeof Scoreboard> = {
  title: 'Components/Scoreboard',
  component: Scoreboard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gameId: 'game-1',
    autoRefresh: false
  },
  parameters: {
    mockData: [
      {
        url: '/api/games/game-1',
        method: 'GET',
        status: 200,
        response: {
          success: true,
          data: {
            id: 'game-1',
            title: 'Quiz Night #1',
            teams: [
              { id: 'team-1', name: 'Team Alpha', totalPoints: 15.5 },
              { id: 'team-2', name: 'Team Beta', totalPoints: 12.0 }
            ]
          }
        }
      }
    ]
  }
};

export const Loading: Story = {
  args: {
    gameId: 'game-1'
  },
  parameters: {
    mockData: [
      {
        url: '/api/games/game-1',
        method: 'GET',
        delay: 2000,
        status: 200,
        response: { success: true, data: {} }
      }
    ]
  }
};
```

## 🔧 Полезные команды

### Разработка
```bash
# Создание нового компонента
npm run generate:component ComponentName

# Создание новой страницы
npm run generate:page PageName

# Создание нового хука
npm run generate:hook useHookName

# Анализ размера бандла
npm run build:analyze

# Проверка типов TypeScript
npm run type-check
```

---

## 🔗 Следующие шаги

1. ⚙️ [Backend интеграция](./backend-guide.md)
2. 🧪 [Тестирование Frontend](./testing-guide.md)
3. 🚀 [Деплой Frontend](./deployment-guide.md)

---

> 💡 **Enterprise совет**: Используйте TypeScript строго, настройте ESLint правила для команды, документируйте компоненты в Storybook и пишите тесты с самого начала.
