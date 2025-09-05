"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizGameServer = void 0;
const http_1 = require("http");
const app_1 = require("./app");
const config_1 = require("./config/config");
const database_1 = require("./config/database");
class QuizGameServer {
    app = (0, app_1.createApp)();
    server;
    port;
    constructor() {
        this.port = config_1.config.server.port;
        this.server = (0, http_1.createServer)(this.app);
    }
    async start() {
        try {
            await (0, database_1.connectDatabase)();
            this.server.listen(this.port, () => {
                console.log(`🚀 Server is running on http://${config_1.config.server.host}:${this.port}`);
                console.log(`🌍 Environment: ${config_1.config.server.env}`);
                console.log(`📊 Database: ${config_1.config.db.host}:${config_1.config.db.port}/${config_1.config.db.name}`);
            });
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
    async shutdown() {
        console.log('\n🛑 Shutting down server...');
        this.server.close(() => {
            console.log('✅ HTTP server closed');
            process.exit(0);
        });
        setTimeout(() => {
            console.error('❌ Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    }
}
exports.QuizGameServer = QuizGameServer;
if (require.main === module) {
    const server = new QuizGameServer();
    server.start().catch((error) => {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map