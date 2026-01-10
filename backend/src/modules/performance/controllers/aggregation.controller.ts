import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { AggregationService } from '../services/aggregation.service';

const aggregationService = new AggregationService();

export class AggregationController {
  /**
   * Sync all employee performance snapshots
   * POST /performance/sync
   */
  syncSnapshots = asyncHandler(async (req: Request, res: Response) => {
    const result = await aggregationService.syncAllSnapshots();
    
    res.status(200).json({
      message: 'Performance snapshots synced successfully',
      synced: result.synced,
      failed: result.failed
    });
  });

  /**
   * Get employee performance history
   * GET /performance/employee/:employeeId/history
   */
  getEmployeeHistory = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 12;

    const history = await aggregationService.getEmployeeHistory(employeeId, limit);
    
    res.status(200).json({
      employeeId,
      history
    });
  });

  /**
   * Get employee metrics
   * GET /performance/employee/:employeeId/metrics
   */
  getEmployeeMetrics = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;

    const metrics = await aggregationService.getEmployeeMetrics(employeeId);
    
    res.status(200).json(metrics);
  });

  /**
   * Create snapshot for single employee
   * POST /performance/employee/:employeeId/snapshot
   */
  createEmployeeSnapshot = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { period } = req.body;

    const snapshot = await aggregationService.createSnapshot(employeeId, period);
    
    res.status(201).json({
      message: 'Snapshot created successfully',
      snapshot
    });
  });

  /**
   * Get all employees with latest metrics
   * GET /performance/employees
   */
  getAllEmployeesWithMetrics = asyncHandler(async (req: Request, res: Response) => {
    const employees = await aggregationService.getAllEmployeesWithMetrics();
    
    res.status(200).json({
      count: employees.length,
      employees
    });
  });
}

export const aggregationController = new AggregationController();
