export interface SeederOptions {
    basic?: boolean;
    demo?: boolean;
    reset?: boolean;
}
export declare function runAllSeeders(options?: SeederOptions): Promise<void>;
export declare function runBasicSeeders(): Promise<void>;
export declare function runFullSeeders(): Promise<void>;
export declare function runDemoSeeders(): Promise<void>;
export { seedBasicData } from './basic-seeder';
export { seedDemoGame } from './demo-game-seeder';
export default runAllSeeders;
//# sourceMappingURL=index.d.ts.map