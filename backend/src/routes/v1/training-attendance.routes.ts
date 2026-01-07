import express from 'express';
import { TrainingAttendanceController } from '../../modules/training/controllers/attendance.controller';
import { bearerAuth } from '../../middlewares/bearerAuth';
import { requireRole } from '../../middlewares/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();
const attendanceController = new TrainingAttendanceController();

// Attendance update endpoint (not nested under trainings)
router.patch('/:id', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), attendanceController.updateAttendance);

// Create or update attendance by enrollmentId (HR/Admin/Manager only)
router.post('/enrollment/:enrollmentId', bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]), attendanceController.createOrUpdateAttendanceByEnrollment);

export default router;

