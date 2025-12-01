import express from "express";
import { TrainingRecommendationController } from "../../controllers/trainingRecommendation.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";
import { requireRole } from "../../middlewares/roleAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();
const recommendationController = new TrainingRecommendationController();

// Recommendation CRUD (HR/Admin only)
router.post("/create", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), recommendationController.createRecommendation);
router.get("/list", bearerAuth, recommendationController.getRecommendations);
router.get("/:id", bearerAuth, recommendationController.getRecommendationById);
router.get("/competency/:competencyId", bearerAuth, recommendationController.getRecommendationsByCompetency);
router.get("/difficulty/:difficultyLevel", bearerAuth, recommendationController.getRecommendationsByDifficulty);
router.put("/update/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), recommendationController.updateRecommendation);
router.delete("/delete/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), recommendationController.deleteRecommendation);

export default router;

