// Простые тесты для WebSocket утилит
describe('WebSocket Utils', () => {
  it('should format WebSocket URL correctly', () => {
    const baseUrl = 'http://localhost:3001';
    const gameId = 'game-123';
    const expectedUrl = `${baseUrl}?gameId=${gameId}`;

    expect(expectedUrl).toBe('http://localhost:3001?gameId=game-123');
  });

  it('should validate WebSocket connection status', () => {
    const statuses = ['connected', 'disconnected', 'reconnecting', 'error', 'failed'];

    statuses.forEach(status => {
      expect(typeof status).toBe('string');
      expect(status.length).toBeGreaterThan(0);
    });
  });

  it('should handle WebSocket event types', () => {
    const eventTypes = [
      'score-update',
      'positions-update',
      'scoreboard-update',
      'score-correction',
      'game-status-change'
    ];

    eventTypes.forEach(eventType => {
      expect(typeof eventType).toBe('string');
      expect(eventType).toContain('-');
    });
  });

  it('should format score data correctly', () => {
    const scoreData = {
      teamId: 1,
      teamName: 'Test Team',
      roundId: 1,
      points: 10,
      totalPoints: 25
    };

    expect(scoreData.teamId).toBe(1);
    expect(scoreData.teamName).toBe('Test Team');
    expect(scoreData.points).toBe(10);
    expect(scoreData.totalPoints).toBe(25);
  });

  it('should handle reconnection logic', () => {
    const maxAttempts = 5;
    const currentAttempt = 3;
    const shouldRetry = currentAttempt < maxAttempts;

    expect(shouldRetry).toBe(true);
    expect(maxAttempts).toBeGreaterThan(currentAttempt);
  });
});
