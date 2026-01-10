import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { PromotionService } from '../services/promotion.service';

export class PromotionController {
  private promotionService = new PromotionService();

  /**
   * GET /succession/promotions/pipeline
   * Get promotion pipeline
   */
  getPromotionPipeline = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      roleId: req.query.roleId as string,
      department: req.query.department as string,
      minScore: req.query.minScore ? parseFloat(req.query.minScore as string) : undefined,
    };

    const result = await this.promotionService.getPromotionPipeline(filters);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * POST /succession/promotions/notify
   * Send promotion alert
   */
  sendPromotionAlert = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, roleId, message } = req.body;

    if (!employeeId || !roleId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Employee ID and Role ID are required' 
      });
    }

    const result = await this.promotionService.sendPromotionAlert({
      employeeId,
      roleId,
      message,
    });
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * GET /succession/promotions/newly-eligible
   * Get newly eligible candidates
   */
  getNewlyEligibleCandidates = asyncHandler(async (req: Request, res: Response) => {
    const sinceDate = req.query.since 
      ? new Date(req.query.since as string) 
      : undefined;

    const candidates = await this.promotionService.getNewlyEligibleCandidates(sinceDate);
    
    res.status(200).json({
      status: 'success',
      candidates
    });
  });

  /**
   * GET /succession/promotions/report/:roleId
   * Get promotion report for a role
   */
  getPromotionReport = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.promotionService.getPromotionReport(req.params.roleId);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });
}

