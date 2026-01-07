"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingController = void 0;
const training_service_1 = require("../services/training.service");
const asyncHandler_1 = require("../../../utils/asyncHandler");
class TrainingController {
    constructor() {
        this.trainingService = new training_service_1.TrainingService();
        // Create training
        this.createTraining = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }
            const training = await this.trainingService.createTraining(req.body, userId);
            res.status(201).json({ status: 'success', training });
        });
        // Get all trainings
        this.getTrainings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                status: req.query.status,
                trainingType: req.query.trainingType,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                trainerId: req.query.trainerId,
                venueId: req.query.venueId,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };
            const result = await this.trainingService.getTrainings(filters);
            res.status(200).json({ status: 'success', ...result });
        });
        // Get training by ID
        this.getTrainingById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const training = await this.trainingService.getTrainingById(req.params.id);
            res.status(200).json({ status: 'success', training });
        });
        // Update training
        this.updateTraining = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }
            const training = await this.trainingService.updateTraining(req.params.id, req.body, userId);
            res.status(200).json({ status: 'success', training });
        });
        // Delete training
        this.deleteTraining = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.trainingService.deleteTraining(req.params.id);
            res.status(200).json({ status: 'success', message: 'Training deleted successfully' });
        });
        // Auto-suggest trainings for employee
        this.suggestTrainings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const trainings = await this.trainingService.suggestTrainingsForEmployee(req.params.employeeId);
            res.status(200).json({ status: 'success', trainings });
        });
    }
}
exports.TrainingController = TrainingController;
