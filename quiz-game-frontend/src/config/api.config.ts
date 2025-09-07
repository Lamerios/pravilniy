// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',

  // User endpoints
  USERS: '/users',
  PROFILE: '/users/profile',

  // Game endpoints
  GAMES: '/games',
  TEMPLATES: '/templates',

  // Team endpoints
  TEAMS: '/teams',

  // Score endpoints
  SCORES: '/scores',

  // Upload endpoints
  UPLOAD: '/upload',
  UPLOAD_TEAM_LOGO: '/upload/team-logo',
  UPLOAD_GAME_TEMPLATE: '/upload/game-template'
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;

export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];


