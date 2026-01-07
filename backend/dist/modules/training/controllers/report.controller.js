"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingReportController = void 0;
const report_service_1 = require("../services/report.service");
const asyncHandler_1 = require("../../../utils/asyncHandler");
class TrainingReportController {
    constructor() {
        this.reportService = new report_service_1.TrainingReportService();
        // Get training hours report
        this.getTrainingHoursReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                employeeId: req.query.employeeId,
                department: req.query.department,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };
            const result = await this.reportService.getTrainingHoursReport(filters);
            res.status(200).json({ status: 'success', ...result });
        });
        // Get attendance summary report
        this.getAttendanceSummaryReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                trainingId: req.query.trainingId,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                department: req.query.department
            };
            const result = await this.reportService.getAttendanceSummaryReport(filters);
            res.status(200).json({ status: 'success', ...result });
        });
        // Get competency improvement report
        this.getCompetencyImprovementReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                employeeId: req.query.employeeId,
                competencyId: req.query.competencyId,
                trainingId: req.query.trainingId,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };
            const result = await this.reportService.getCompetencyImprovementReport(filters);
            res.status(200).json({ status: 'success', ...result });
        });
        // Get trainer effectiveness report
        this.getTrainerEffectivenessReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                trainerId: req.query.trainerId,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
            };
            const result = await this.reportService.getTrainerEffectivenessReport(filters);
            res.status(200).json({ status: 'success', trainers: result });
        });
    }
}
exports.TrainingReportController = TrainingReportController;
