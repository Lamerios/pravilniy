// Настройка тестовой среды
beforeAll(async () => {
  // Устанавливаем тестовую среду
  if (process.env['NODE_ENV'] !== 'test') {
    process.env['NODE_ENV'] = 'test';
  }
});

// Увеличиваем таймаут для тестов
jest.setTimeout(10000);
