import { Request, Response } from "express";
import { TrainingRecommendationService } from "../services/trainingRecommendation.service";
import { asyncHandler } from "../utils/asyncHandler";

export class TrainingRecommendationController {
  private recommendationService = new TrainingRecommendationService();

  // Create recommendation
  createRecommendation = asyncHandler(async (req: Request, res: Response) => {
    const recommendation = await this.recommendationService.createRecommendation(req.body);
    res.status(201).json({ status: "success", recommendation });
  });

  // Get all recommendations
  getRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await this.recommendationService.getRecommendations();
    res.status(200).json({ status: "success", recommendations });
  });

  // Get recommendation by ID
  getRecommendationById = asyncHandler(async (req: Request, res: Response) => {
    const recommendation = await this.recommendationService.getRecommendationById(req.params.id);
    res.status(200).json({ status: "success", recommendation });
  });

  // Get recommendations by competency
  getRecommendationsByCompetency = asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await this.recommendationService.getRecommendationsByCompetency(req.params.competencyId);
    res.status(200).json({ status: "success", recommendations });
  });

  // Get recommendations by difficulty level
  getRecommendationsByDifficulty = asyncHandler(async (req: Request, res: Response) => {
    const difficultyLevel = parseInt(req.params.difficultyLevel);
    const recommendations = await this.recommendationService.getRecommendationsByDifficulty(difficultyLevel);
    res.status(200).json({ status: "success", recommendations });
  });

  // Update recommendation
  updateRecommendation = asyncHandler(async (req: Request, res: Response) => {
    const recommendation = await this.recommendationService.updateRecommendation(req.params.id, req.body);
    res.status(200).json({ status: "success", recommendation });
  });

  // Delete recommendation
  deleteRecommendation = asyncHandler(async (req: Request, res: Response) => {
    await this.recommendationService.deleteRecommendation(req.params.id);
    res.status(200).json({ status: "success", message: "Training recommendation deleted successfully" });
  });
}

