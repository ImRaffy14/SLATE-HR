import express from 'express';
import { TrainingController } from '../../modules/training/controllers/training.controller';
import { TrainingEnrollmentController } from '../../modules/training/controllers/enrollment.controller';
import { TrainingAttendanceController } from '../../modules/training/controllers/attendance.controller';
import { TrainingEvaluationController } from '../../modules/training/controllers/evaluation.controller';
import { bearerAuth } from '../../middlewares/bearerAuth';
import { requireRole } from '../../middlewares/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();
const trainingController = new TrainingController();
const enrollmentController = new TrainingEnrollmentController();
const attendanceController = new TrainingAttendanceController();
const evaluationController = new TrainingEvaluationController();

// Training CRUD (HR/Admin only for create/update/delete)
router.post('/', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), trainingController.createTraining);
router.get('/', bearerAuth, trainingController.getTrainings);
router.get('/trainers', bearerAuth, trainingController.getTrainers);
router.get('/venues', bearerAuth, trainingController.getVenues);
router.get('/suggestions/:employeeId', bearerAuth, trainingController.suggestTrainings);
router.get('/:id', bearerAuth, trainingController.getTrainingById);
router.put('/:id', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), trainingController.updateTraining);
router.delete('/:id', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), trainingController.deleteTraining);

// Enrollment route (nested under training)
router.post('/:id/enroll', bearerAuth, enrollmentController.createEnrollment);

// Attendance routes (nested under training)
router.post('/:id/qr', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), attendanceController.generateQRCode);
router.post('/:id/attendance/scan', bearerAuth, attendanceController.scanQRCode);
router.get('/:id/attendance', bearerAuth, attendanceController.getAttendanceList);

// Evaluation routes (nested under training)
router.get('/:id/evaluations', bearerAuth, evaluationController.getTrainingEvaluations);

export default router;

