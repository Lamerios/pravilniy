import { validateEmail, validatePhone } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone', () => {
      expect(validatePhone('+7 (999) 123-45-67')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(validatePhone('invalid-phone')).toBe(false);
    });
  });
});
