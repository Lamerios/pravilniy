describe('Simple Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with async', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});

