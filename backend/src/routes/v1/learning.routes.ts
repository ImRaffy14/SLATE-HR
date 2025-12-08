import express from "express";
import { LearningController } from "../../controllers/learning.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";
import { requireRole } from "../../middlewares/roleAuth";
import { UserRole } from "@prisma/client";
import upload from "../../middlewares/multer";

const router = express.Router();
const learningController = new LearningController();

// ============================================
// COURSE ROUTES
// ============================================

// Course CRUD (HR/Admin only)
router.post("/courses", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.createCourse);
router.get("/courses", bearerAuth, learningController.getCourses);
router.get("/courses/:id", bearerAuth, learningController.getCourseById);
router.put("/courses/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.updateCourse);
router.delete("/courses/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.deleteCourse);

// ============================================
// MATERIAL ROUTES
// ============================================

router.post("/courses/:courseId/materials", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.addMaterial);
router.post("/courses/:courseId/materials/upload", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), upload.single("file"), learningController.uploadMaterial);
router.put("/materials/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.updateMaterial);
router.delete("/materials/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.deleteMaterial);

// ============================================
// QUIZ ROUTES
// ============================================

router.post("/courses/:courseId/quizzes", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.createQuiz);
router.get("/quizzes/:id", bearerAuth, learningController.getQuiz);
router.put("/quizzes/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.updateQuiz);
router.delete("/quizzes/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), learningController.deleteQuiz);
router.post("/quizzes/:id/submit", bearerAuth, learningController.submitQuiz);

// ============================================
// ENROLLMENT ROUTES
// ============================================

router.post("/enrollments", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), learningController.enrollEmployee);
router.post("/enrollments/auto-enroll", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), learningController.autoEnrollBasedOnGap);
router.get("/enrollments/employee/:employeeId", bearerAuth, learningController.getEmployeeEnrollments);
router.get("/enrollments/:id", bearerAuth, learningController.getEnrollmentDetails);
router.patch("/enrollments/:id/progress", bearerAuth, learningController.updateEnrollmentProgress);
router.patch("/enrollments/:id/complete", bearerAuth, learningController.completeCourse);
router.delete("/enrollments/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), learningController.deleteEnrollment);

// ============================================
// CONTENT DELIVERY ROUTES
// ============================================

router.get("/enrollments/:id/content", bearerAuth, learningController.getCourseContent);
router.post("/materials/:materialId/complete", bearerAuth, learningController.markMaterialComplete);
router.get("/quizzes/:quizId/attempt", bearerAuth, learningController.getQuizAttempt);

// ============================================
// CERTIFICATE ROUTES
// ============================================

router.post("/enrollments/:id/certificate", bearerAuth, learningController.generateCertificate);
router.get("/certificates/:id", bearerAuth, learningController.getCertificate);

// ============================================
// REPORTING ROUTES
// ============================================

router.get("/reports/completion", bearerAuth, learningController.getCompletionReport);
router.get("/reports/learning-hours", bearerAuth, learningController.getLearningHoursReport);
router.get("/reports/analytics", bearerAuth, learningController.getCourseAnalytics);

// ============================================
// UTILITY ROUTES
// ============================================

router.get("/recommended/:employeeId", bearerAuth, learningController.getRecommendedCourses);
router.get("/progress/:employeeId", bearerAuth, learningController.getEmployeeProgress);

export default router;

