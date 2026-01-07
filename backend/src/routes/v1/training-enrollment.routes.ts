import express from 'express';
import { TrainingEnrollmentController } from '../../modules/training/controllers/enrollment.controller';
import { bearerAuth } from '../../middlewares/bearerAuth';
import { requireRole } from '../../middlewares/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();
const enrollmentController = new TrainingEnrollmentController();

// Enrollment endpoints
router.get('/training/:trainingId', bearerAuth, enrollmentController.getTrainingEnrollments);
router.get('/employee/:id/trainings', bearerAuth, enrollmentController.getEmployeeTrainings);
router.get('/pending', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), enrollmentController.getPendingEnrollments);
router.patch('/:id/approve', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), enrollmentController.approveEnrollment);
router.patch('/:id/reject', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), enrollmentController.rejectEnrollment);

export default router;

