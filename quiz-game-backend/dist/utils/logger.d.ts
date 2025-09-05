export declare const LOG_COLORS: {
    readonly error: "red";
    readonly warn: "yellow";
    readonly info: "green";
    readonly http: "magenta";
    readonly debug: "white";
};
declare const initializeWinston: () => Promise<void>;
export declare const logger: {
    error: (msg: string) => any;
    warn: (msg: string) => any;
    info: (msg: string) => any;
    http: (msg: string) => any;
    debug: (msg: string) => any;
};
export declare const morganStream: {
    write: (message: string) => void;
};
export { initializeWinston };
//# sourceMappingURL=logger.d.ts.map