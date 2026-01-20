"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = exports.AnalyticsController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const analytics_service_1 = require("../services/analytics.service");
const analyticsService = new analytics_service_1.PerformanceAnalyticsService();
class AnalyticsController {
    constructor() {
        /**
         * Get team analytics for manager
         * GET /performance/analytics/team/:managerId
         */
        this.getTeamAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { managerId } = req.params;
            const analytics = await analyticsService.getTeamAnalytics(managerId);
            res.status(200).json(analytics);
        });
        /**
         * Get my team analytics (for logged in manager)
         * GET /performance/analytics/my-team
         */
        this.getMyTeamAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const analytics = await analyticsService.getTeamAnalytics(userId);
            res.status(200).json(analytics);
        });
        /**
         * Get organization-wide analytics for HR
         * GET /performance/analytics/hr
         */
        this.getOrgAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const analytics = await analyticsService.getOrgAnalytics();
            res.status(200).json(analytics);
        });
        /**
         * Get dashboard summary
         * GET /performance/analytics/dashboard
         */
        this.getDashboardSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const summary = await analyticsService.getDashboardSummary();
            res.status(200).json(summary);
        });
    }
}
exports.AnalyticsController = AnalyticsController;
exports.analyticsController = new AnalyticsController();
