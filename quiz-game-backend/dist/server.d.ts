import { Server as HTTPServer } from 'http';
import { SocketService } from './socket/socket.server';
export declare class QuizGameServer {
    private httpServer;
    private socketService;
    private port;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    getSocketService(): SocketService;
    getHttpServer(): HTTPServer;
}
export declare let socketService: SocketService;
export declare function createServerWithSocket(): HTTPServer<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export declare function getSocketService(): SocketService;
//# sourceMappingURL=server.d.ts.map