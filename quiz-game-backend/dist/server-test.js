"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizGameTestServer = void 0;
const http_1 = require("http");
const app_test_1 = require("./app-test");
const config_1 = require("./config/config");
class QuizGameTestServer {
    app = (0, app_test_1.createTestApp)();
    server;
    port;
    constructor() {
        this.port = config_1.config.server.port;
        this.server = (0, http_1.createServer)(this.app);
    }
    async start() {
        try {
            console.log('🚀 Starting Quiz Game Test Server (no database)...');
            this.server.listen(this.port, () => {
                console.log(`🚀 Server is running on http://${config_1.config.server.host}:${this.port}`);
                console.log(`🌍 Environment: ${config_1.config.server.env}`);
                console.log(`📊 Health check: http://${config_1.config.server.host}:${this.port}/health`);
                console.log(`🔗 API info: http://${config_1.config.server.host}:${this.port}/api`);
                console.log(`⚠️  Note: Database connection disabled for testing`);
            });
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());
        }
        catch (error) {
            console.error('❌ Failed to start test server:', error);
            process.exit(1);
        }
    }
    async shutdown() {
        console.log('\n🛑 Shutting down test server...');
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
exports.QuizGameTestServer = QuizGameTestServer;
if (require.main === module) {
    const server = new QuizGameTestServer();
    server.start().catch((error) => {
        console.error('❌ Test server startup failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server-test.js.map