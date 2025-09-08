import { Organization } from '../models/organization.model';
import { User, UserRole } from '../models/user.model';
import {
  AuthError,
  ChangePasswordData,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterData,
  ResetPasswordData,
  SetNewPasswordData,
  ValidationError,
} from '../types/auth.types';
import { generateTokenPair, verifyToken } from '../utils/jwt.util';
import { comparePassword, hashPassword, validatePassword } from '../utils/password.util';

/**
 * Сервис аутентификации
 * Обрабатывает логин, регистрацию, управление токенами
 */
export class AuthService {
  /**
   * Аутентификация пользователя
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Валидация входных данных
    if (!email || !password) {
      throw new ValidationError('Email и пароль обязательны');
    }

    if (!this.isValidEmail(email)) {
      throw new ValidationError('Некорректный формат email');
    }

    // Поиск пользователя
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'isActive'],
        },
      ],
    });

    if (!user) {
      throw new AuthError('Неверные учетные данные', 401);
    }

    // Проверка активности пользователя
    if (!user.isActive) {
      throw new AuthError('Аккаунт деактивирован', 403);
    }

    // Проверка активности организации
    if (!user.organization.isActive) {
      throw new AuthError('Организация деактивирована', 403);
    }

    // Проверка пароля
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError('Неверные учетные данные', 401);
    }

    // Обновляем время последнего входа
    await user.update({ lastLoginAt: new Date() });

    // Генерируем токены
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Регистрация нового пользователя
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const {
      email,
      password,
      firstName,
      lastName,
      organizationId,
      role = 'USER' as UserRole,
    } = data;

    // Валидация входных данных
    this.validateRegistrationData(data);

    // Проверка существования пользователя
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ValidationError('Пользователь с таким email уже существует', 'email');
    }

    // Проверка существования организации
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      throw new ValidationError('Организация не найдена', 'organizationId');
    }

    if (!organization.isActive) {
      throw new ValidationError('Организация деактивирована', 'organizationId');
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(password);

    // Создание пользователя
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      organizationId,
      isActive: true,
    });

    // Генерируем токены
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Обновление access токена
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Верификация refresh токена
      const payload = verifyToken(refreshToken);

      // Поиск пользователя
      const user = await User.findByPk(payload.userId, {
        include: [
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name', 'isActive'],
          },
        ],
      });

      if (!user) {
        throw new AuthError('Пользователь не найден', 401);
      }

      if (!user.isActive) {
        throw new AuthError('Аккаунт деактивирован', 403);
      }

      if (!user.organization.isActive) {
        throw new AuthError('Организация деактивирована', 403);
      }

      // Генерируем новые токены
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      };

      return generateTokenPair(tokenPayload);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Недействительный refresh токен', 401);
    }
  }

  /**
   * Смена пароля
   */
  async changePassword(userId: number, data: ChangePasswordData): Promise<void> {
    const { currentPassword, newPassword } = data;

    // Валидация нового пароля
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '));
    }

    // Поиск пользователя
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AuthError('Пользователь не найден', 404);
    }

    // Проверка текущего пароля
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthError('Неверный текущий пароль', 401);
    }

    // Хеширование нового пароля
    const hashedNewPassword = await hashPassword(newPassword);

    // Обновление пароля
    await user.update({
      password: hashedNewPassword,
      passwordChangedAt: new Date(),
    });
  }

  /**
   * Сброс пароля (отправка email)
   */
  async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    const { email } = data;

    if (!this.isValidEmail(email)) {
      throw new ValidationError('Некорректный формат email');
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Не раскрываем информацию о существовании пользователя
      return;
    }

    // TODO: Генерация токена сброса и отправка email
    // Пока просто логируем
    console.log(`Password reset requested for user: ${user.email}`);
  }

  /**
   * Установка нового пароля по токену сброса
   */
  async setNewPassword(data: SetNewPasswordData): Promise<void> {
    const { token, newPassword } = data;

    // Валидация нового пароля
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '));
    }

    // TODO: Верификация токена сброса и обновление пароля
    // Пока просто логируем
    console.log(`New password set with token: ${token}`);
  }

  /**
   * Валидация данных регистрации
   */
  private validateRegistrationData(data: RegisterData): void {
    const { email, password, firstName, lastName, organizationId } = data;

    if (!email || !password || !firstName || !lastName || !organizationId) {
      throw new ValidationError('Все поля обязательны');
    }

    if (!this.isValidEmail(email)) {
      throw new ValidationError('Некорректный формат email', 'email');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '), 'password');
    }

    if (firstName.length < 2 || firstName.length > 50) {
      throw new ValidationError('Имя должно содержать от 2 до 50 символов', 'firstName');
    }

    if (lastName.length < 2 || lastName.length > 50) {
      throw new ValidationError('Фамилия должна содержать от 2 до 50 символов', 'lastName');
    }

    if (!Number.isInteger(organizationId) || organizationId <= 0) {
      throw new ValidationError('Некорректный ID организации', 'organizationId');
    }
  }

  /**
   * Валидация email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
