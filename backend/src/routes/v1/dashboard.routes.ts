import express from 'express';
import { getAdminDashboard } from '../../controllers/dashboard.controller';
import { requireRole } from '../../middlewares/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

/**
 * @route   GET /api/v1/dashboard/admin
 * @desc    Get admin dashboard overview data
 * @access  Private (Admin, HR only)
 */
router.get('/admin', requireRole([UserRole.ADMIN, UserRole.HR]), getAdminDashboard);

export default router;

