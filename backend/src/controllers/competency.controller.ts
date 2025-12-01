import { Request, Response } from "express";
import { CompetencyService } from "../services/competency.service";
import { asyncHandler } from "../utils/asyncHandler";

export class CompetencyController {
  private competencyService = new CompetencyService();

  // Create new competency
  createCompetency = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const competency = await this.competencyService.createCompetencyService(req.body, userId);
    res.status(201).json({ status: "success", competency });
  });

  // List all competencies (optionally filter by job role ID or employee ID)
  getCompetencies = asyncHandler(async (req: Request, res: Response) => {
    const jobRoleId = req.query.jobRoleId as string | undefined;
    const employeeId = req.query.employeeId as string | undefined;
    
    let competencies;
    if (employeeId) {
      // Get competencies relevant to employee's position
      competencies = await this.competencyService.getCompetenciesByEmployeePosition(employeeId);
    } else if (jobRoleId) {
      competencies = await this.competencyService.getCompetenciesByJobRoleId(jobRoleId);
    } else {
      competencies = await this.competencyService.getCompetenciesService(jobRoleId);
    }
    
    res.status(200).json({ status: "success", competencies });
  });

  // Get single competency by ID
  getCompetencyById = asyncHandler(async (req: Request, res: Response) => {
    const competency = await this.competencyService.getCompetencyById(req.params.id);
    res.status(200).json({ status: "success", competency });
  });

  // Update competency
  updateCompetency = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const updated = await this.competencyService.updateCompetencyService(req.params.id, req.body, userId);
    res.status(200).json({ status: "success", competency: updated });
  });

  // Delete competency
  deleteCompetency = asyncHandler(async (req: Request, res: Response) => {
    await this.competencyService.deleteCompetencyService(req.params.id);
    res.status(200).json({ status: "success", message: "Competency deleted" });
  });

  // Assign competency to employee
  assignCompetencyToEmployee = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const assignment = await this.competencyService.assignCompetencyToEmployee({
      ...req.body,
      updatedBy: userId,
    });
    res.status(201).json({ status: "success", assignment });
  });

  // Update self-rating
  updateSelfRating = asyncHandler(async (req: Request, res: Response) => {
    const updated = await this.competencyService.updateSelfRating(req.params.id, req.body.selfRating);
    res.status(200).json({ status: "success", employeeCompetency: updated });
  });

  // Update manager rating
  updateManagerRating = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const updated = await this.competencyService.updateManagerRating(
      req.params.id,
      req.body.managerRating,
      userId,
      req.body.notes
    );
    res.status(200).json({ status: "success", employeeCompetency: updated });
  });

  // Upload attachment
  uploadAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "File is required" });
    }
    const updated = await this.competencyService.uploadAttachment(req.params.id, req.file);
    res.status(200).json({ status: "success", employeeCompetency: updated });
  });

  // Get employee competencies
  getEmployeeCompetencies = asyncHandler(async (req: Request, res: Response) => {
    const competencies = await this.competencyService.getEmployeeCompetencies(req.params.employeeId);
    res.status(200).json({ status: "success", competencies });
  });

  // Run gap analysis
  runGapAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const gapAnalysis = await this.competencyService.runGapAnalysis(
      req.body.employeeId,
      req.body.competencyId
    );
    res.status(200).json({ status: "success", gapAnalysis });
  });

  // Get gap analysis
  getGapAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const gapAnalysis = await this.competencyService.getGapAnalysis(
      req.params.employeeId,
      req.query.competencyId as string | undefined
    );
    res.status(200).json({ status: "success", gapAnalysis });
  });

  // Generate gap report
  generateGapReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await this.competencyService.generateGapReport(req.params.employeeId);
    res.status(200).json({ status: "success", report });
  });

  // Get recommendations for employee
  getRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await this.competencyService.getRecommendations(req.params.employeeId);
    res.status(200).json({ status: "success", recommendations });
  });

  // Legacy: Add assessment (kept for backward compatibility)
  addAssessment = asyncHandler(async (req: Request, res: Response) => {
    // This is now handled by assignCompetencyToEmployee and updateSelfRating/updateManagerRating
    // Keeping for backward compatibility but it should be deprecated
    res.status(400).json({ 
      status: "error", 
      message: "This endpoint is deprecated. Use assignCompetencyToEmployee and updateSelfRating/updateManagerRating instead." 
    });
  });

  // Get analytics (average scores, gaps, etc.)
  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const analytics = await this.competencyService.getAnalyticsService();
    res.status(200).json({ status: "success", analytics });
  });

  // Get suggested competencies for employee based on job role
  getSuggestedCompetencies = asyncHandler(async (req: Request, res: Response) => {
    const suggested = await this.competencyService.getSuggestedCompetenciesForEmployee(req.params.employeeId);
    res.status(200).json({ status: "success", suggested });
  });

  // Batch update manager ratings
  batchUpdateRatings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const updated = await this.competencyService.batchUpdateManagerRatings({
      ...req.body,
      updatedBy: userId,
    });
    res.status(200).json({ status: "success", employeeCompetencies: updated });
  });
}
