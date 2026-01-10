import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { PerformanceAnalyticsService } from '../services/analytics.service';

const analyticsService = new PerformanceAnalyticsService();

export class AnalyticsController {
  /**
   * Get team analytics for manager
   * GET /performance/analytics/team/:managerId
   */
  getTeamAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { managerId } = req.params;

    const analytics = await analyticsService.getTeamAnalytics(managerId);

    res.status(200).json(analytics);
  });

  /**
   * Get my team analytics (for logged in manager)
   * GET /performance/analytics/my-team
   */
  getMyTeamAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analytics = await analyticsService.getTeamAnalytics(userId);

    res.status(200).json(analytics);
  });

  /**
   * Get organization-wide analytics for HR
   * GET /performance/analytics/hr
   */
  getOrgAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const analytics = await analyticsService.getOrgAnalytics();

    res.status(200).json(analytics);
  });

  /**
   * Get dashboard summary
   * GET /performance/analytics/dashboard
   */
  getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await analyticsService.getDashboardSummary();

    res.status(200).json(summary);
  });
}

export const analyticsController = new AnalyticsController();
