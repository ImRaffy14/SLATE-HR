"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingEvaluationController = void 0;
const evaluation_service_1 = require("../services/evaluation.service");
const asyncHandler_1 = require("../../../utils/asyncHandler");
class TrainingEvaluationController {
    constructor() {
        this.evaluationService = new evaluation_service_1.TrainingEvaluationService();
        // Submit evaluation
        this.submitEvaluation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const evaluation = await this.evaluationService.submitEvaluation(req.params.enrollmentId, req.body);
            res.status(201).json({ status: 'success', evaluation });
        });
        // Get evaluation
        this.getEvaluation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const evaluation = await this.evaluationService.getEvaluation(req.params.enrollmentId);
            res.status(200).json({ status: 'success', evaluation });
        });
        // Get all evaluations for a training
        this.getTrainingEvaluations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const evaluations = await this.evaluationService.getTrainingEvaluations(req.params.id);
            res.status(200).json({ status: 'success', evaluations });
        });
    }
}
exports.TrainingEvaluationController = TrainingEvaluationController;
