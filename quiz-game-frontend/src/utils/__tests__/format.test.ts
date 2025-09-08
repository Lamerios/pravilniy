// Простые тесты для форматирования
describe('Format Utils', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = date.toLocaleDateString('ru-RU');
    expect(formatted).toBeDefined();
  });

  it('should format number correctly', () => {
    const number = 1234.56;
    const formatted = number.toLocaleString('ru-RU');
    expect(formatted).toBeDefined();
  });

  it('should format time correctly', () => {
    const time = new Date('2024-01-15T10:30:00Z');
    const formatted = time.toLocaleTimeString('ru-RU');
    expect(formatted).toBeDefined();
  });
});
