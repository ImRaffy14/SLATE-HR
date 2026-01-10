import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  private analyticsService = new AnalyticsService();

  /**
   * GET /succession/analytics/9box
   * Get 9-Box Grid data
   */
  get9BoxData = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      department: req.query.department as string,
      roleId: req.query.roleId as string,
    };

    const result = await this.analyticsService.get9BoxData(filters);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * GET /succession/analytics/readiness
   * Get readiness report
   */
  getReadinessReport = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      roleId: req.query.roleId as string,
      department: req.query.department as string,
    };

    const result = await this.analyticsService.getReadinessReport(filters);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * GET /succession/analytics/risk
   * Get risk analysis
   */
  getRiskAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      roleId: req.query.roleId as string,
      riskLevel: req.query.riskLevel as string,
    };

    const result = await this.analyticsService.getRiskAnalysis(filters);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * GET /succession/analytics/dashboard
   * Get dashboard summary
   */
  getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.analyticsService.getDashboardSummary();
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });
}

