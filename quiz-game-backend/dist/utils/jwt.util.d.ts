import { JWTConfig, JWTPayload } from '../types/auth.types';
declare const jwtConfig: JWTConfig;
export declare function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
export declare function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
export declare function verifyToken(token: string): JWTPayload;
export declare function decodeToken(token: string): JWTPayload | null;
export declare function extractTokenFromHeader(authHeader: string | undefined): string | null;
export declare function isTokenExpired(token: string): boolean;
export declare function getTokenExpiration(token: string): Date | null;
export declare function getTimeUntilExpiration(token: string): number | null;
export declare function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): {
    accessToken: string;
    refreshToken: string;
};
export declare function validateJWTConfig(): {
    isValid: boolean;
    errors: string[];
};
export { jwtConfig };
//# sourceMappingURL=jwt.util.d.ts.map