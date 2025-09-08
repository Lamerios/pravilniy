import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
export declare const sequelize: Sequelize;
export declare function connectDatabase(): Promise<void>;
export declare function closeDatabase(): Promise<void>;
export default sequelize;
//# sourceMappingURL=database.d.ts.map