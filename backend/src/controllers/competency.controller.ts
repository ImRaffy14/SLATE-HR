import { Request, Response } from "express";
import { CompetencyService } from "../services/competency.service";
import { asyncHandler } from "../utils/asyncHandler";

export class CompetencyController {
  private competencyService = new CompetencyService();

  // Create new competency
  createCompetency = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const competency = await this.competencyService.createCompetencyService(req.body, userId);
    res.status(201).json({ status: "success", competency });
  });

  // List all competencies
  getCompetencies = asyncHandler(async (req: Request, res: Response) => {
    const competencies = await this.competencyService.getCompetenciesService();
    res.status(200).json({ status: "success", competencies });
  });

  // Update competency
  updateCompetency = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
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

  // Add assessment (self or HR)
  addAssessment = asyncHandler(async (req: Request, res: Response) => {
    const assessment = await this.competencyService.addAssessmentService(req.body);
    res.status(201).json({ status: "success", assessment });
  });

  // Get analytics (average scores, gaps, etc.)
  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const analytics = await this.competencyService.getAnalyticsService();
    res.status(200).json({ status: "success", analytics });
  });
}
