"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const logger_1 = require("./utils/logger");
async function initializeApp() {
    try {
        logger_1.logger.info('Starting Quiz Game Backend...');
        const server = new server_1.QuizGameServer();
        await server.start();
    }
    catch (error) {
        logger_1.logger.error(`Failed to initialize application: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
}
process.on('uncaughtException', (error) => {
    logger_1.logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    process.exit(1);
});
initializeApp().catch((error) => {
    logger_1.logger.error(`Application startup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map