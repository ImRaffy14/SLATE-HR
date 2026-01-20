"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetencyController = void 0;
const competency_service_1 = require("../services/competency.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class CompetencyController {
    constructor() {
        this.competencyService = new competency_service_1.CompetencyService();
        // Create new competency
        this.createCompetency = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: "error", message: "User ID is required" });
            }
            const competency = await this.competencyService.createCompetencyService(req.body, userId);
            res.status(201).json({ status: "success", competency });
        });
        // List all competencies (optionally filter by job role ID or employee ID)
        this.getCompetencies = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const jobRoleId = req.query.jobRoleId;
            const employeeId = req.query.employeeId;
            let competencies;
            if (employeeId) {
                // Get competencies relevant to employee's position
                competencies = await this.competencyService.getCompetenciesByEmployeePosition(employeeId);
            }
            else if (jobRoleId) {
                competencies = await this.competencyService.getCompetenciesByJobRoleId(jobRoleId);
            }
            else {
                competencies = await this.competencyService.getCompetenciesService(jobRoleId);
            }
            res.status(200).json({ status: "success", competencies });
        });
        // Get single competency by ID
        this.getCompetencyById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const competency = await this.competencyService.getCompetencyById(req.params.id);
            res.status(200).json({ status: "success", competency });
        });
        // Update competency
        this.updateCompetency = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: "error", message: "User ID is required" });
            }
            const updated = await this.competencyService.updateCompetencyService(req.params.id, req.body, userId);
            res.status(200).json({ status: "success", competency: updated });
        });
        // Delete competency
        this.deleteCompetency = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.competencyService.deleteCompetencyService(req.params.id);
            res.status(200).json({ status: "success", message: "Competency deleted" });
        });
        // Assign competency to employee
        this.assignCompetencyToEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
        this.updateSelfRating = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const updated = await this.competencyService.updateSelfRating(req.params.id, req.body.selfRating);
            res.status(200).json({ status: "success", employeeCompetency: updated });
        });
        // Update manager rating
        this.updateManagerRating = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: "error", message: "User ID is required" });
            }
            const updated = await this.competencyService.updateManagerRating(req.params.id, req.body.managerRating, userId, req.body.notes);
            res.status(200).json({ status: "success", employeeCompetency: updated });
        });
        // Upload attachment
        this.uploadAttachment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.file) {
                return res.status(400).json({ status: "error", message: "File is required" });
            }
            const updated = await this.competencyService.uploadAttachment(req.params.id, req.file);
            res.status(200).json({ status: "success", employeeCompetency: updated });
        });
        // Get employee competencies
        this.getEmployeeCompetencies = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const competencies = await this.competencyService.getEmployeeCompetencies(req.params.employeeId);
            res.status(200).json({ status: "success", competencies });
        });
        // Run gap analysis
        this.runGapAnalysis = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const gapAnalysis = await this.competencyService.runGapAnalysis(req.body.employeeId, req.body.competencyId);
            res.status(200).json({ status: "success", gapAnalysis });
        });
        // Get gap analysis
        this.getGapAnalysis = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const gapAnalysis = await this.competencyService.getGapAnalysis(req.params.employeeId, req.query.competencyId);
            res.status(200).json({ status: "success", gapAnalysis });
        });
        // Generate gap report
        this.generateGapReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const report = await this.competencyService.generateGapReport(req.params.employeeId);
            res.status(200).json({ status: "success", report });
        });
        // Get recommendations for employee
        this.getRecommendations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const recommendations = await this.competencyService.getRecommendations(req.params.employeeId);
            res.status(200).json({ status: "success", recommendations });
        });
        // Legacy: Add assessment (kept for backward compatibility)
        this.addAssessment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // This is now handled by assignCompetencyToEmployee and updateSelfRating/updateManagerRating
            // Keeping for backward compatibility but it should be deprecated
            res.status(400).json({
                status: "error",
                message: "This endpoint is deprecated. Use assignCompetencyToEmployee and updateSelfRating/updateManagerRating instead."
            });
        });
        // Get analytics (average scores, gaps, etc.)
        this.getAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const analytics = await this.competencyService.getAnalyticsService();
            res.status(200).json({ status: "success", analytics });
        });
        // Get suggested competencies for employee based on job role
        this.getSuggestedCompetencies = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const suggested = await this.competencyService.getSuggestedCompetenciesForEmployee(req.params.employeeId);
            res.status(200).json({ status: "success", suggested });
        });
        // Batch update manager ratings
        this.batchUpdateRatings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
}
exports.CompetencyController = CompetencyController;
