export declare function checkDatabaseConnection(): Promise<boolean>;
export declare function getDatabaseInfo(): Promise<{
    dialect: string;
    database: string;
    host: string;
    port: number;
    tables: string[];
}>;
export declare function checkTablesExist(): Promise<{
    exists: boolean;
    tables: string[];
    missingTables: string[];
}>;
export declare function cleanAllTables(): Promise<void>;
export declare function dropAllTables(): Promise<void>;
export declare function getTableCounts(): Promise<Record<string, number>>;
export declare function checkDatabaseStatus(): Promise<void>;
export declare function waitForConfirmation(message: string): Promise<boolean>;
export declare function formatDuration(startTime: number): string;
//# sourceMappingURL=utils.d.ts.map