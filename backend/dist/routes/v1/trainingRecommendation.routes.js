"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trainingRecommendation_controller_1 = require("../../controllers/trainingRecommendation.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const recommendationController = new trainingRecommendation_controller_1.TrainingRecommendationController();
// Recommendation CRUD (HR/Admin only)
router.post("/create", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), recommendationController.createRecommendation);
router.get("/list", bearerAuth_1.bearerAuth, recommendationController.getRecommendations);
router.get("/:id", bearerAuth_1.bearerAuth, recommendationController.getRecommendationById);
router.get("/competency/:competencyId", bearerAuth_1.bearerAuth, recommendationController.getRecommendationsByCompetency);
router.get("/difficulty/:difficultyLevel", bearerAuth_1.bearerAuth, recommendationController.getRecommendationsByDifficulty);
router.put("/update/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), recommendationController.updateRecommendation);
router.delete("/delete/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), recommendationController.deleteRecommendation);
exports.default = router;
