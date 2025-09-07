/**
 * Типы для Socket.IO событий
 */

import { TeamPosition } from '../services/position.service';

// События от клиента к серверу
export interface ClientToServerEvents {
  // Подключение к игре
  'join-game': (gameId: number) => void;

  // Отключение от игры
  'leave-game': (gameId: number) => void;

  // Ping для проверки соединения
  'ping': () => void;
}

// События от сервера к клиенту
export interface ServerToClientEvents {
  // Обновление баллов команды
  'score-update': (data: {
    gameId: number;
    teamId: number;
    teamName: string;
    roundId: number;
    points: number;
    totalPoints: number;
    timestamp: string;
  }) => void;

  // Обновление позиций команд
  'positions-update': (data: {
    gameId: number;
    positions: TeamPosition[];
    changes: Array<{
      teamId: number;
      teamName: string;
      oldPosition?: number;
      newPosition: number;
      change: 'up' | 'down' | 'same' | 'new';
    }>;
    timestamp: string;
  }) => void;

  // Обновление табло (полное)
  'scoreboard-update': (data: {
    gameId: number;
    leaderboard: TeamPosition[];
    lastUpdated: string;
  }) => void;

  // Коррекция баллов
  'score-correction': (data: {
    gameId: number;
    scoreId: number;
    teamId: number;
    teamName: string;
    oldPoints: number;
    newPoints: number;
    reason: string;
    correctedBy: string;
    timestamp: string;
  }) => void;

  // Статус игры изменился
  'game-status-change': (data: {
    gameId: number;
    oldStatus: string;
    newStatus: string;
    timestamp: string;
  }) => void;

  // Pong ответ на ping
  'pong': () => void;

  // Ошибка
  'error': (error: {
    message: string;
    code?: string;
    timestamp: string;
  }) => void;
}

// Данные для подключения
export interface SocketData {
  userId?: number;
  userRole?: string;
  organizationId?: number;
  connectedGames: Set<number>;
}

// Конфигурация Socket.IO
export interface SocketConfig {
  cors: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
  pingTimeout: number;
  pingInterval: number;
  maxHttpBufferSize: number;
}
