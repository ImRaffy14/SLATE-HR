"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const learning_controller_1 = require("../../controllers/learning.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("../../middlewares/multer"));
const router = express_1.default.Router();
const learningController = new learning_controller_1.LearningController();
// ============================================
// COURSE ROUTES
// ============================================
// Course CRUD (HR/Admin only)
router.post("/courses", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.createCourse);
router.get("/courses", bearerAuth_1.bearerAuth, learningController.getCourses);
router.get("/courses/:id", bearerAuth_1.bearerAuth, learningController.getCourseById);
router.put("/courses/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.updateCourse);
router.delete("/courses/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.deleteCourse);
// ============================================
// MATERIAL ROUTES
// ============================================
router.post("/courses/:courseId/materials", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.addMaterial);
router.post("/courses/:courseId/materials/upload", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), multer_1.default.single("file"), learningController.uploadMaterial);
router.put("/materials/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.updateMaterial);
router.delete("/materials/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.deleteMaterial);
// ============================================
// QUIZ ROUTES
// ============================================
router.post("/courses/:courseId/quizzes", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.createQuiz);
router.get("/quizzes/:id", bearerAuth_1.bearerAuth, learningController.getQuiz);
router.put("/quizzes/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.updateQuiz);
router.delete("/quizzes/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), learningController.deleteQuiz);
router.post("/quizzes/:id/submit", bearerAuth_1.bearerAuth, learningController.submitQuiz);
// ============================================
// ENROLLMENT ROUTES
// ============================================
router.post("/enrollments", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), learningController.enrollEmployee);
router.post("/enrollments/auto-enroll", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), learningController.autoEnrollBasedOnGap);
router.get("/enrollments/employee/:employeeId", bearerAuth_1.bearerAuth, learningController.getEmployeeEnrollments);
router.get("/enrollments/:id", bearerAuth_1.bearerAuth, learningController.getEnrollmentDetails);
router.patch("/enrollments/:id/progress", bearerAuth_1.bearerAuth, learningController.updateEnrollmentProgress);
router.patch("/enrollments/:id/complete", bearerAuth_1.bearerAuth, learningController.completeCourse);
router.delete("/enrollments/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), learningController.deleteEnrollment);
// ============================================
// CONTENT DELIVERY ROUTES
// ============================================
router.get("/enrollments/:id/content", bearerAuth_1.bearerAuth, learningController.getCourseContent);
router.post("/materials/:materialId/complete", bearerAuth_1.bearerAuth, learningController.markMaterialComplete);
router.get("/quizzes/:quizId/attempt", bearerAuth_1.bearerAuth, learningController.getQuizAttempt);
// ============================================
// CERTIFICATE ROUTES
// ============================================
router.post("/enrollments/:id/certificate", bearerAuth_1.bearerAuth, learningController.generateCertificate);
router.get("/certificates/:id", bearerAuth_1.bearerAuth, learningController.getCertificate);
// ============================================
// REPORTING ROUTES
// ============================================
router.get("/reports/completion", bearerAuth_1.bearerAuth, learningController.getCompletionReport);
router.get("/reports/learning-hours", bearerAuth_1.bearerAuth, learningController.getLearningHoursReport);
router.get("/reports/analytics", bearerAuth_1.bearerAuth, learningController.getCourseAnalytics);
// ============================================
// UTILITY ROUTES
// ============================================
router.get("/recommended/:employeeId", bearerAuth_1.bearerAuth, learningController.getRecommendedCourses);
router.get("/progress/:employeeId", bearerAuth_1.bearerAuth, learningController.getEmployeeProgress);
exports.default = router;
