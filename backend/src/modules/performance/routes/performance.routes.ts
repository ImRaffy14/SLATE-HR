import { Router } from 'express';
import { AggregationController, aggregationController } from '../controllers/aggregation.controller';
import { AIController, aiController } from '../controllers/ai.controller';
import { AnalyticsController, analyticsController } from '../controllers/analytics.controller';

const router = Router();

// =============================================
// DATA AGGREGATION ROUTES
// =============================================

// Sync all employee snapshots
router.post('/sync', aggregationController.syncSnapshots.bind(aggregationController));

// Get all employees with latest metrics
router.get('/employees', aggregationController.getAllEmployeesWithMetrics.bind(aggregationController));

// Get employee performance history
router.get('/employee/:employeeId/history', aggregationController.getEmployeeHistory.bind(aggregationController));

// Get employee metrics
router.get('/employee/:employeeId/metrics', aggregationController.getEmployeeMetrics.bind(aggregationController));

// Create snapshot for employee
router.post('/employee/:employeeId/snapshot', aggregationController.createEmployeeSnapshot.bind(aggregationController));

// =============================================
// AI ANALYSIS ROUTES
// =============================================

// Analyze employee performance with AI
router.post('/ai/analyze/:employeeId', aiController.analyzeEmployee.bind(aiController));

// Get AI-generated recommendations
router.get('/ai/recommendations/:employeeId', aiController.getRecommendations.bind(aiController));

// Get quick recommendations (without AI)
router.get('/ai/quick-recommendations/:employeeId', aiController.getQuickRecommendations.bind(aiController));

// Get explainable AI output
router.get('/ai/explain/:employeeId', aiController.explainAnalysis.bind(aiController));

// Get all cached insights
router.get('/ai/insights/:employeeId', aiController.getAllInsights.bind(aiController));

// Assess risk for employee
router.post('/ai/risk/:employeeId', aiController.assessRisk.bind(aiController));

// Analyze trend
router.post('/ai/trend/:employeeId', aiController.analyzeTrend.bind(aiController));

// Cleanup expired insights
router.post('/ai/cleanup', aiController.cleanupInsights.bind(aiController));

// =============================================
// ANALYTICS ROUTES
// =============================================

// Get team analytics for specific manager
router.get('/analytics/team/:managerId', analyticsController.getTeamAnalytics.bind(analyticsController));

// Get team analytics for logged-in manager
router.get('/analytics/my-team', analyticsController.getMyTeamAnalytics.bind(analyticsController));

// Get organization-wide analytics (HR)
router.get('/analytics/hr', analyticsController.getOrgAnalytics.bind(analyticsController));

// Get dashboard summary
router.get('/analytics/dashboard', analyticsController.getDashboardSummary.bind(analyticsController));

export default router;
