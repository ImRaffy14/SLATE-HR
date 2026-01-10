import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { CandidateService } from '../services/candidate.service';

export class CandidateController {
  private candidateService = new CandidateService();

  /**
   * POST /succession/roles/:roleId/talent-pool
   * Add employee to talent pool
   */
  addToTalentPool = asyncHandler(async (req: Request, res: Response) => {
    const { roleId } = req.params;
    const { employeeId, notes } = req.body;

    if (!employeeId) {
      return res.status(400).json({ status: 'error', message: 'Employee ID is required' });
    }

    const talentPool = await this.candidateService.addToTalentPool(roleId, employeeId, notes);
    
    res.status(201).json({
      status: 'success',
      message: 'Employee added to talent pool',
      talentPool
    });
  });

  /**
   * GET /succession/roles/:roleId/candidates
   * Get ranked candidates for a role
   */
  getRankedCandidates = asyncHandler(async (req: Request, res: Response) => {
    const { roleId } = req.params;

    const result = await this.candidateService.getRankedCandidates(roleId);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * DELETE /succession/talent-pool/:id
   * Remove from talent pool
   */
  removeFromTalentPool = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.candidateService.removeFromTalentPool(req.params.id);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * POST /succession/candidates/:employeeId/evaluate
   * Rate employee's potential
   */
  ratePotential = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { rating, comments } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ status: 'error', message: 'Rating must be between 1 and 5' });
    }

    const potentialRating = await this.candidateService.ratePotential(
      employeeId,
      rating,
      comments,
      userId
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Potential rating added',
      potentialRating
    });
  });

  /**
   * GET /succession/candidates/:employeeId/score
   * Get candidate score and details
   */
  getCandidateScore = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.candidateService.getCandidateScore(req.params.employeeId);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * POST /succession/roles/:roleId/recalculate
   * Recalculate scores for all candidates in a role
   */
  recalculateRoleScores = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.candidateService.recalculateRoleScores(req.params.roleId);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * GET /succession/candidates/:employeeId/potential-history
   * Get potential rating history
   */
  getPotentialRatingHistory = asyncHandler(async (req: Request, res: Response) => {
    const ratings = await this.candidateService.getPotentialRatingHistory(req.params.employeeId);
    
    res.status(200).json({
      status: 'success',
      ratings
    });
  });
}

