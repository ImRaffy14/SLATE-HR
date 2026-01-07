"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingEnrollmentController = void 0;
const enrollment_service_1 = require("../services/enrollment.service");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const client_1 = require("@prisma/client");
class TrainingEnrollmentController {
    constructor() {
        this.enrollmentService = new enrollment_service_1.TrainingEnrollmentService();
        // Create enrollment
        this.createEnrollment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { trainingId, employeeId, enrollmentType } = req.body;
            const type = enrollmentType || client_1.EnrollmentType.SELF;
            const enrollment = await this.enrollmentService.createEnrollment(trainingId, employeeId, type);
            res.status(201).json({ status: 'success', enrollment });
        });
        // Get employee's trainings
        this.getEmployeeTrainings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                status: req.query.status,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };
            const result = await this.enrollmentService.getEmployeeTrainings(req.params.id, filters);
            res.status(200).json({ status: 'success', ...result });
        });
        // Approve enrollment
        this.approveEnrollment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }
            const enrollment = await this.enrollmentService.approveEnrollment(req.params.id, userId);
            res.status(200).json({ status: 'success', enrollment });
        });
        // Reject enrollment
        this.rejectEnrollment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'User ID is required' });
            }
            const { rejectionReason } = req.body;
            const enrollment = await this.enrollmentService.rejectEnrollment(req.params.id, userId, rejectionReason);
            res.status(200).json({ status: 'success', enrollment });
        });
        // Get pending enrollments
        this.getPendingEnrollments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                trainingId: req.query.trainingId,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };
            const result = await this.enrollmentService.getPendingEnrollments(filters);
            res.status(200).json({ status: 'success', ...result });
        });
    }
}
exports.TrainingEnrollmentController = TrainingEnrollmentController;
