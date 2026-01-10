import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { RoleService } from '../services/role.service';

export class RoleController {
  private roleService = new RoleService();

  /**
   * POST /succession/roles
   * Create a critical role
   */
  createCriticalRole = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const role = await this.roleService.createCriticalRole(req.body, userId);
    
    res.status(201).json({
      status: 'success',
      message: 'Critical role created successfully',
      role
    });
  });

  /**
   * GET /succession/roles
   * Get all critical roles
   */
  getCriticalRoles = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      isCritical: req.query.isCritical === 'true' ? true : req.query.isCritical === 'false' ? false : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await this.roleService.getCriticalRoles(filters);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * GET /succession/roles/:id
   * Get critical role by ID
   */
  getCriticalRoleById = asyncHandler(async (req: Request, res: Response) => {
    const role = await this.roleService.getCriticalRoleById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      role
    });
  });

  /**
   * PUT /succession/roles/:id
   * Update critical role
   */
  updateCriticalRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await this.roleService.updateCriticalRole(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      message: 'Critical role updated successfully',
      role
    });
  });

  /**
   * DELETE /succession/roles/:id
   * Delete critical role
   */
  deleteCriticalRole = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.roleService.deleteCriticalRole(req.params.id);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * GET /succession/competencies
   * Get competencies for role mapping
   */
  getCompetenciesForMapping = asyncHandler(async (req: Request, res: Response) => {
    const competencies = await this.roleService.getCompetenciesForMapping();
    
    res.status(200).json({
      status: 'success',
      competencies
    });
  });
}

