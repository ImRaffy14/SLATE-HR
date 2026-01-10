import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { IDPService } from '../services/idp.service';

export class IDPController {
  private idpService = new IDPService();

  /**
   * POST /succession/idp/:employeeId
   * Create IDP for an employee
   */
  createIDP = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { targetRoleId, autoGenerateGoals } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!targetRoleId) {
      return res.status(400).json({ status: 'error', message: 'Target role ID is required' });
    }

    const idp = await this.idpService.createIDP({
      employeeId,
      targetRoleId,
      autoGenerateGoals,
    }, userId);
    
    res.status(201).json({
      status: 'success',
      message: 'IDP created successfully',
      idp
    });
  });

  /**
   * GET /succession/idp/:employeeId
   * Get employee's IDPs
   */
  getEmployeeIDPs = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const filters = {
      status: req.query.status as any,
      targetRoleId: req.query.targetRoleId as string,
    };

    const idps = await this.idpService.getEmployeeIDPs(employeeId, filters);
    
    res.status(200).json({
      status: 'success',
      idps
    });
  });

  /**
   * GET /succession/idp/detail/:idpId
   * Get IDP by ID
   */
  getIDPById = asyncHandler(async (req: Request, res: Response) => {
    const idp = await this.idpService.getIDPById(req.params.idpId);
    
    res.status(200).json({
      status: 'success',
      idp
    });
  });

  /**
   * PATCH /succession/idp/:idpId/status
   * Update IDP status
   */
  updateIDPStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: 'error', message: 'Status is required' });
    }

    const idp = await this.idpService.updateIDPStatus(req.params.idpId, status);
    
    res.status(200).json({
      status: 'success',
      message: 'IDP status updated',
      idp
    });
  });

  /**
   * POST /succession/idp/:idpId/goals
   * Add goal to IDP
   */
  addGoal = asyncHandler(async (req: Request, res: Response) => {
    const { idpId } = req.params;

    if (!req.body.title || !req.body.goalType) {
      return res.status(400).json({ status: 'error', message: 'Title and goal type are required' });
    }

    const goal = await this.idpService.addGoal(idpId, req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Goal added',
      goal
    });
  });

  /**
   * PATCH /succession/idp/goals/:goalId/progress
   * Update goal progress
   */
  updateGoalProgress = asyncHandler(async (req: Request, res: Response) => {
    const { goalId } = req.params;
    const { progress, completed } = req.body;

    if (progress === undefined) {
      return res.status(400).json({ status: 'error', message: 'Progress is required' });
    }

    const goal = await this.idpService.updateGoalProgress(goalId, progress, completed);
    
    res.status(200).json({
      status: 'success',
      message: 'Goal progress updated',
      goal
    });
  });

  /**
   * DELETE /succession/idp/goals/:goalId
   * Delete goal
   */
  deleteGoal = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.idpService.deleteGoal(req.params.goalId);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * POST /succession/idp/:employeeId/sync
   * Sync IDP goal progress with learning
   */
  syncGoalProgress = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.idpService.syncGoalProgressFromLearning(req.params.employeeId);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });
}

