import { ChangePasswordData, LoginCredentials, LoginResponse, RefreshTokenResponse, RegisterData, ResetPasswordData, SetNewPasswordData } from '../types/auth.types';
export declare class AuthService {
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    register(data: RegisterData): Promise<LoginResponse>;
    refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
    changePassword(userId: number, data: ChangePasswordData): Promise<void>;
    requestPasswordReset(data: ResetPasswordData): Promise<void>;
    setNewPassword(data: SetNewPasswordData): Promise<void>;
    private validateRegistrationData;
    private isValidEmail;
}
//# sourceMappingURL=auth.service.d.ts.map