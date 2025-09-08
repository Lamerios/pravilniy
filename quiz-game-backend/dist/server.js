"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = exports.QuizGameServer = void 0;
exports.createServerWithSocket = createServerWithSocket;
exports.getSocketService = getSocketService;
const http_1 = require("http");
const app_1 = require("./app");
const socket_server_1 = require("./socket/socket.server");
const logger_1 = require("./utils/logger");
class QuizGameServer {
    httpServer;
    socketService;
    port;
    constructor() {
        this.port = parseInt(process.env['PORT'] || '5000', 10);
    }
    async start() {
        try {
            const app = (0, app_1.createApp)();
            this.httpServer = (0, http_1.createServer)(app);
            this.socketService = new socket_server_1.SocketService(this.httpServer);
            this.httpServer.listen(this.port, () => {
                logger_1.logger.info(`🚀 Quiz Game Backend started successfully! Port: ${this.port}, Environment: ${process.env['NODE_ENV'] || 'development'}, SocketIO: true`);
            });
            this.httpServer.on('error', (error) => {
                if (error.syscall !== 'listen') {
                    throw error;
                }
                const bind = typeof this.port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port;
                switch (error.code) {
                    case 'EACCES':
                        logger_1.logger.error(`${bind} requires elevated privileges`);
                        process.exit(1);
                    case 'EADDRINUSE':
                        logger_1.logger.error(`${bind} is already in use`);
                        process.exit(1);
                    default:
                        throw error;
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to start server: ${error.message}`);
            throw error;
        }
    }
    async stop() {
        return new Promise((resolve) => {
            if (this.httpServer) {
                this.httpServer.close(() => {
                    logger_1.logger.info('HTTP server stopped');
                    resolve();
                });
            }
            if (this.socketService) {
                this.socketService.close();
                logger_1.logger.info('Socket.IO service stopped');
            }
        });
    }
    getSocketService() {
        if (!this.socketService) {
            throw new Error('Socket service not initialized');
        }
        return this.socketService;
    }
    getHttpServer() {
        if (!this.httpServer) {
            throw new Error('HTTP server not initialized');
        }
        return this.httpServer;
    }
}
exports.QuizGameServer = QuizGameServer;
function createServerWithSocket() {
    const app = (0, app_1.createApp)();
    const httpServer = (0, http_1.createServer)(app);
    exports.socketService = new socket_server_1.SocketService(httpServer);
    return httpServer;
}
function getSocketService() {
    if (!exports.socketService) {
        throw new Error('Socket service not initialized. Call createServerWithSocket() first.');
    }
    return exports.socketService;
}
//# sourceMappingURL=server.js.map