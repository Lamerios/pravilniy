"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const score_controller_1 = require("../controllers/score.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const score_middleware_1 = require("../middleware/score.middleware");
const router = (0, express_1.Router)();
router.get('/:gameId/scores', auth_middleware_1.authenticateToken, score_middleware_1.validateGameScoresQuery, score_controller_1.scoreController.getGameScoresHistory);
router.get('/:gameId/scores/stats', auth_middleware_1.authenticateToken, score_controller_1.scoreController.getGameScoreStats);
router.get('/:gameId/leaderboard', auth_middleware_1.authenticateToken, score_controller_1.scoreController.getGameLeaderboard);
router.get('/:gameId/rounds/summary', auth_middleware_1.authenticateToken, score_controller_1.scoreController.getGameRoundsSummary);
router.get('/:gameId/rounds/:roundId/scores', auth_middleware_1.authenticateToken, score_middleware_1.validateRoundScoresParams, score_controller_1.scoreController.getRoundScores);
exports.default = router;
//# sourceMappingURL=game-scores.routes.js.map