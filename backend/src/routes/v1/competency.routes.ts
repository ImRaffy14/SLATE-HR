import express from "express";
import { CompetencyController } from "../../controllers/competency.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";
import { requireRole } from "../../middlewares/roleAuth";
import { UserRole } from "@prisma/client";
import upload from "../../middlewares/multer";

const router = express.Router();
const competencyController = new CompetencyController();

// Competency CRUD (HR/Admin only)
// IMPORTANT: Specific routes must come before parameterized routes (/:id)
router.post("/create", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), competencyController.createCompetency);
router.get("/list", bearerAuth, competencyController.getCompetencies);
router.post("/assign", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), competencyController.assignCompetencyToEmployee);
router.put("/batch-ratings", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), competencyController.batchUpdateRatings);

// Gap analysis
router.post("/gap-analysis", bearerAuth, competencyController.runGapAnalysis);
router.get("/gap-analysis/:employeeId", bearerAuth, competencyController.getGapAnalysis);
router.get("/gap-report/:employeeId", bearerAuth, competencyController.generateGapReport);

// Recommendations
router.get("/recommendations/:employeeId", bearerAuth, competencyController.getRecommendations);

// Employee competencies
router.get("/employee/:employeeId", bearerAuth, competencyController.getEmployeeCompetencies);
router.get("/suggest/:employeeId", bearerAuth, competencyController.getSuggestedCompetencies);

// Legacy endpoints (kept for backward compatibility)
router.post("/assessment", bearerAuth, competencyController.addAssessment);

// Analytics (must come before /:id route)
router.get("/analytics", bearerAuth, competencyController.getAnalytics);

// Parameterized routes (must come last)
router.get("/:id", bearerAuth, competencyController.getCompetencyById);
router.put("/update/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), competencyController.updateCompetency);
router.delete("/delete/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), competencyController.deleteCompetency);

// Rating updates
router.put("/self-rating/:id", bearerAuth, competencyController.updateSelfRating); // Deprecated - kept for backward compatibility
router.put("/manager-rating/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), competencyController.updateManagerRating);

// File upload
router.post("/upload/:id", bearerAuth, upload.single("file"), competencyController.uploadAttachment);

export default router;
