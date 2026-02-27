"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ess_controller_1 = require("../controllers/ess.controller");
const bearerAuth_1 = require("../../../middlewares/bearerAuth");
const employeeAuth_1 = require("../../../middlewares/employeeAuth");
const multer_1 = __importDefault(require("../../../middlewares/multer"));
const router = express_1.default.Router();
const essController = new ess_controller_1.ESSController();
// ============================================
// DASHBOARD ROUTES
// ============================================
router.get('/dashboard', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getDashboard);
// ============================================
// CAREER PATH ROUTES
// ============================================
router.get('/career-path', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getCareerPath);
router.get('/career-path/:targetRoleId', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getCareerPathDetails);
// ============================================
// ENROLLMENT ROUTES
// ============================================
router.post('/enroll/course/:courseId', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.enrollInCourse);
router.post('/enroll/training/:trainingId', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.enrollInTraining);
// ============================================
// ACHIEVEMENT UPLOAD ROUTES
// ============================================
router.get('/achievements', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getAchievements);
router.post('/upload/achievement', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, multer_1.default.single('file'), essController.uploadAchievement);
// ============================================
// NOTIFICATION ROUTES
// ============================================
router.get('/notifications', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getNotifications);
router.get('/notifications/unread-count', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getUnreadCount);
router.patch('/notifications/:id/read', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.markNotificationRead);
// ============================================
// PERFORMANCE SUMMARY ROUTES
// ============================================
router.get('/performance-summary', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getPerformanceSummary);
// ============================================
// ATTENDANCE (MOCK) ROUTES
// ============================================
router.get('/attendance', bearerAuth_1.bearerAuth, employeeAuth_1.employeeAuth, essController.getAttendance);
exports.default = router;
