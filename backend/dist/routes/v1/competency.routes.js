"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const competency_controller_1 = require("../../controllers/competency.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("../../middlewares/multer"));
const router = express_1.default.Router();
const competencyController = new competency_controller_1.CompetencyController();
// Competency CRUD (HR/Admin only)
// IMPORTANT: Specific routes must come before parameterized routes (/:id)
router.post("/create", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), competencyController.createCompetency);
router.get("/list", bearerAuth_1.bearerAuth, competencyController.getCompetencies);
router.post("/assign", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), competencyController.assignCompetencyToEmployee);
router.put("/batch-ratings", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), competencyController.batchUpdateRatings);
// Gap analysis
router.post("/gap-analysis", bearerAuth_1.bearerAuth, competencyController.runGapAnalysis);
router.get("/gap-analysis/:employeeId", bearerAuth_1.bearerAuth, competencyController.getGapAnalysis);
router.get("/gap-report/:employeeId", bearerAuth_1.bearerAuth, competencyController.generateGapReport);
// Recommendations
router.get("/recommendations/:employeeId", bearerAuth_1.bearerAuth, competencyController.getRecommendations);
// Employee competencies
router.get("/employee/:employeeId", bearerAuth_1.bearerAuth, competencyController.getEmployeeCompetencies);
router.get("/suggest/:employeeId", bearerAuth_1.bearerAuth, competencyController.getSuggestedCompetencies);
// Legacy endpoints (kept for backward compatibility)
router.post("/assessment", bearerAuth_1.bearerAuth, competencyController.addAssessment);
// Analytics (must come before /:id route)
router.get("/analytics", bearerAuth_1.bearerAuth, competencyController.getAnalytics);
// Parameterized routes (must come last)
router.get("/:id", bearerAuth_1.bearerAuth, competencyController.getCompetencyById);
router.put("/update/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), competencyController.updateCompetency);
router.delete("/delete/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), competencyController.deleteCompetency);
// Rating updates
router.put("/self-rating/:id", bearerAuth_1.bearerAuth, competencyController.updateSelfRating); // Deprecated - kept for backward compatibility
router.put("/manager-rating/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), competencyController.updateManagerRating);
// File upload
router.post("/upload/:id", bearerAuth_1.bearerAuth, multer_1.default.single("file"), competencyController.uploadAttachment);
exports.default = router;
