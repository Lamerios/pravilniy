export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
export declare function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
};
export declare function generateRandomPassword(length?: number): string;
export declare function isPasswordCompromised(password: string): Promise<boolean>;
//# sourceMappingURL=password.util.d.ts.map