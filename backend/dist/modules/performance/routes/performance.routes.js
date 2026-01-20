"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aggregation_controller_1 = require("../controllers/aggregation.controller");
const ai_controller_1 = require("../controllers/ai.controller");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
// =============================================
// DATA AGGREGATION ROUTES
// =============================================
// Sync all employee snapshots
router.post('/sync', aggregation_controller_1.aggregationController.syncSnapshots.bind(aggregation_controller_1.aggregationController));
// Get all employees with latest metrics
router.get('/employees', aggregation_controller_1.aggregationController.getAllEmployeesWithMetrics.bind(aggregation_controller_1.aggregationController));
// Get employee performance history
router.get('/employee/:employeeId/history', aggregation_controller_1.aggregationController.getEmployeeHistory.bind(aggregation_controller_1.aggregationController));
// Get employee metrics
router.get('/employee/:employeeId/metrics', aggregation_controller_1.aggregationController.getEmployeeMetrics.bind(aggregation_controller_1.aggregationController));
// Create snapshot for employee
router.post('/employee/:employeeId/snapshot', aggregation_controller_1.aggregationController.createEmployeeSnapshot.bind(aggregation_controller_1.aggregationController));
// =============================================
// AI ANALYSIS ROUTES
// =============================================
// Analyze employee performance with AI
router.post('/ai/analyze/:employeeId', ai_controller_1.aiController.analyzeEmployee.bind(ai_controller_1.aiController));
// Get AI-generated recommendations
router.get('/ai/recommendations/:employeeId', ai_controller_1.aiController.getRecommendations.bind(ai_controller_1.aiController));
// Get quick recommendations (without AI)
router.get('/ai/quick-recommendations/:employeeId', ai_controller_1.aiController.getQuickRecommendations.bind(ai_controller_1.aiController));
// Get explainable AI output
router.get('/ai/explain/:employeeId', ai_controller_1.aiController.explainAnalysis.bind(ai_controller_1.aiController));
// Get all cached insights
router.get('/ai/insights/:employeeId', ai_controller_1.aiController.getAllInsights.bind(ai_controller_1.aiController));
// Assess risk for employee
router.post('/ai/risk/:employeeId', ai_controller_1.aiController.assessRisk.bind(ai_controller_1.aiController));
// Analyze trend
router.post('/ai/trend/:employeeId', ai_controller_1.aiController.analyzeTrend.bind(ai_controller_1.aiController));
// Cleanup expired insights
router.post('/ai/cleanup', ai_controller_1.aiController.cleanupInsights.bind(ai_controller_1.aiController));
// =============================================
// ANALYTICS ROUTES
// =============================================
// Get team analytics for specific manager
router.get('/analytics/team/:managerId', analytics_controller_1.analyticsController.getTeamAnalytics.bind(analytics_controller_1.analyticsController));
// Get team analytics for logged-in manager
router.get('/analytics/my-team', analytics_controller_1.analyticsController.getMyTeamAnalytics.bind(analytics_controller_1.analyticsController));
// Get organization-wide analytics (HR)
router.get('/analytics/hr', analytics_controller_1.analyticsController.getOrgAnalytics.bind(analytics_controller_1.analyticsController));
// Get dashboard summary
router.get('/analytics/dashboard', analytics_controller_1.analyticsController.getDashboardSummary.bind(analytics_controller_1.analyticsController));
exports.default = router;
