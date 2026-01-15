import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Get Admin Dashboard data
 * Aggregates data from all modules for the admin overview
 */
export const getAdminDashboard = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const dashboard = await dashboardService.getAdminDashboard();
  
  res.status(200).json({
    success: true,
    dashboard
  });
});

