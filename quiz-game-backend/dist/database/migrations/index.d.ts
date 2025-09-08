import * as createOrganizations from './001-create-organizations';
export declare const migrations: {
    name: string;
    up: typeof createOrganizations.up;
    down: typeof createOrganizations.down;
}[];
export declare function runAllMigrations(queryInterface: any): Promise<void>;
export declare function rollbackAllMigrations(queryInterface: any): Promise<void>;
export default migrations;
//# sourceMappingURL=index.d.ts.map