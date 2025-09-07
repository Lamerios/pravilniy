import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url?: string;
  gameId: number;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onScoreUpdate?: (data: any) => void;
  onPositionsUpdate?: (data: any) => void;
  onScoreboardUpdate?: (data: any) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001',
    gameId,
    autoConnect = true,
    reconnectAttempts: maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    onConnect,
    onDisconnect,
    onError,
    onScoreUpdate,
    onPositionsUpdate,
    onScoreboardUpdate
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnect = useRef(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected || connecting) {
      return;
    }

    setConnecting(true);
    isManualDisconnect.current = false;

    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: false, // Управляем переподключением вручную
      autoConnect: false
    });

    // Обработчики событий
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      setConnecting(false);
      setReconnectAttempts(0);

      // Подключаемся к игре
      newSocket.emit('join-game', gameId);

      onConnect?.();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
      setConnecting(false);

      onDisconnect?.();

      // Автоматическое переподключение только если это не ручное отключение
      if (!isManualDisconnect.current && reconnectAttempts < maxReconnectAttempts) {
        console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, reconnectInterval * Math.pow(2, reconnectAttempts)); // Экспоненциальная задержка
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnecting(false);
      onError?.(error);
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    });

    // Обработчики игровых событий
    newSocket.on('score-update', (data) => {
      console.log('Score update received:', data);
      onScoreUpdate?.(data);
    });

    newSocket.on('positions-update', (data) => {
      console.log('Positions update received:', data);
      onPositionsUpdate?.(data);
    });

    newSocket.on('scoreboard-update', (data) => {
      console.log('Scoreboard update received:', data);
      onScoreboardUpdate?.(data);
    });

    // Подключаемся
    newSocket.connect();

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [url, gameId, connecting, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onConnect, onDisconnect, onError, onScoreUpdate, onPositionsUpdate, onScoreboardUpdate]);

  const disconnect = useCallback(() => {
    isManualDisconnect.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.emit('leave-game', gameId);
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    setConnected(false);
    setConnecting(false);
    setReconnectAttempts(0);
  }, [gameId]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      isManualDisconnect.current = false;
      setReconnectAttempts(0);
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Автоматическое подключение при монтировании
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    connected,
    connecting,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect
  };
};
