"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingRecommendationController = void 0;
const trainingRecommendation_service_1 = require("../services/trainingRecommendation.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class TrainingRecommendationController {
    constructor() {
        this.recommendationService = new trainingRecommendation_service_1.TrainingRecommendationService();
        // Create recommendation
        this.createRecommendation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const recommendation = await this.recommendationService.createRecommendation(req.body);
            res.status(201).json({ status: "success", recommendation });
        });
        // Get all recommendations
        this.getRecommendations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const recommendations = await this.recommendationService.getRecommendations();
            res.status(200).json({ status: "success", recommendations });
        });
        // Get recommendation by ID
        this.getRecommendationById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const recommendation = await this.recommendationService.getRecommendationById(req.params.id);
            res.status(200).json({ status: "success", recommendation });
        });
        // Get recommendations by competency
        this.getRecommendationsByCompetency = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const recommendations = await this.recommendationService.getRecommendationsByCompetency(req.params.competencyId);
            res.status(200).json({ status: "success", recommendations });
        });
        // Get recommendations by difficulty level
        this.getRecommendationsByDifficulty = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const difficultyLevel = parseInt(req.params.difficultyLevel);
            const recommendations = await this.recommendationService.getRecommendationsByDifficulty(difficultyLevel);
            res.status(200).json({ status: "success", recommendations });
        });
        // Update recommendation
        this.updateRecommendation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const recommendation = await this.recommendationService.updateRecommendation(req.params.id, req.body);
            res.status(200).json({ status: "success", recommendation });
        });
        // Delete recommendation
        this.deleteRecommendation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.recommendationService.deleteRecommendation(req.params.id);
            res.status(200).json({ status: "success", message: "Training recommendation deleted successfully" });
        });
    }
}
exports.TrainingRecommendationController = TrainingRecommendationController;
