import { Request, Response } from "express";
import { PerformanceService } from "../services/performance.service";
import { asyncHandler } from "../utils/asyncHandler";

export class PerformanceController {
  private performanceService = new PerformanceService();

  // Generate performance analysis for a given employee
  analyzeEmployeePerformance = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const analysis = await this.performanceService.analyzeEmployeePerformanceService(employeeId);
    res.status(200).json({
      status: "success",
      analysis,
    });
  });

  // Get organization-wide performance insights
  getOrgPerformanceAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const analytics = await this.performanceService.getOrgPerformanceAnalyticsService();
    res.status(200).json({
      status: "success",
      analytics,
    });
  });
}
