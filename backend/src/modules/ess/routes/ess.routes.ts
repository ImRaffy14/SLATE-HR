import express from 'express';
import { ESSController } from '../controllers/ess.controller';
import { bearerAuth } from '../../../middlewares/bearerAuth';
import { employeeAuth } from '../../../middlewares/employeeAuth';
import upload from '../../../middlewares/multer';

const router = express.Router();
const essController = new ESSController();

// ============================================
// DASHBOARD ROUTES
// ============================================

router.get('/dashboard', bearerAuth, employeeAuth, essController.getDashboard);

// ============================================
// CAREER PATH ROUTES
// ============================================

router.get('/career-path', bearerAuth, employeeAuth, essController.getCareerPath);
router.get('/career-path/:targetRoleId', bearerAuth, employeeAuth, essController.getCareerPathDetails);

// ============================================
// ENROLLMENT ROUTES
// ============================================

router.post('/enroll/course/:courseId', bearerAuth, employeeAuth, essController.enrollInCourse);
router.post('/enroll/training/:trainingId', bearerAuth, employeeAuth, essController.enrollInTraining);

// ============================================
// ACHIEVEMENT UPLOAD ROUTES
// ============================================

router.post('/upload/achievement', bearerAuth, employeeAuth, upload.single('file'), essController.uploadAchievement);

// ============================================
// NOTIFICATION ROUTES
// ============================================

router.get('/notifications', bearerAuth, employeeAuth, essController.getNotifications);
router.patch('/notifications/:id/read', bearerAuth, employeeAuth, essController.markNotificationRead);

export default router;

