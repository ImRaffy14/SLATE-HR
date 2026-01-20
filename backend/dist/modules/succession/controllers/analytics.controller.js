"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const analytics_service_1 = require("../services/analytics.service");
class AnalyticsController {
    constructor() {
        this.analyticsService = new analytics_service_1.AnalyticsService();
        /**
         * GET /succession/analytics/9box
         * Get 9-Box Grid data
         */
        this.get9BoxData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                department: req.query.department,
                roleId: req.query.roleId,
            };
            const result = await this.analyticsService.get9BoxData(filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * GET /succession/analytics/readiness
         * Get readiness report
         */
        this.getReadinessReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                roleId: req.query.roleId,
                department: req.query.department,
            };
            const result = await this.analyticsService.getReadinessReport(filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * GET /succession/analytics/risk
         * Get risk analysis
         */
        this.getRiskAnalysis = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                roleId: req.query.roleId,
                riskLevel: req.query.riskLevel,
            };
            const result = await this.analyticsService.getRiskAnalysis(filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * GET /succession/analytics/dashboard
         * Get dashboard summary
         */
        this.getDashboardSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.analyticsService.getDashboardSummary();
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
    }
}
exports.AnalyticsController = AnalyticsController;
