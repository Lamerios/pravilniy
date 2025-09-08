import 'dotenv/config';
export declare const config: {
    server: {
        port: number;
        host: string;
        env: string;
    };
    db: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        pool: {
            min: number;
            max: number;
        };
        logging: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        ttl: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    logging: {
        level: string;
        file: string;
    };
};
export default config;
//# sourceMappingURL=config.d.ts.map