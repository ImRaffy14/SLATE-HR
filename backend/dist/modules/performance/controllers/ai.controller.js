"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AIController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const aggregation_service_1 = require("../services/aggregation.service");
const groq_service_1 = require("../ai/groq.service");
const recommendations_service_1 = require("../services/recommendations.service");
const explainability_service_1 = require("../ai/explainability.service");
const aggregationService = new aggregation_service_1.AggregationService();
const groqService = new groq_service_1.GroqService();
const recommendationsService = new recommendations_service_1.RecommendationsService();
const explainabilityService = new explainability_service_1.ExplainabilityService();
class AIController {
    constructor() {
        /**
         * Analyze employee performance with AI
         * POST /performance/ai/analyze/:employeeId
         */
        this.analyzeEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const { forceRefresh } = req.body;
            // Generate performance summary
            const summary = await aggregationService.generatePerformanceSummary(employeeId);
            // Get AI analysis
            const analysis = await groqService.analyzePerformance(employeeId, summary, forceRefresh === true);
            res.status(200).json({
                employeeId,
                summary,
                analysis,
                generatedAt: new Date(),
                disclaimer: explainabilityService.getBiasDisclaimer()
            });
        });
        /**
         * Get AI-generated recommendations for employee
         * GET /performance/ai/recommendations/:employeeId
         */
        this.getRecommendations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const forceRefresh = req.query.refresh === 'true';
            const recommendations = await recommendationsService.getRecommendations(employeeId, forceRefresh);
            res.status(200).json(recommendations);
        });
        /**
         * Get quick recommendations without AI
         * GET /performance/ai/quick-recommendations/:employeeId
         */
        this.getQuickRecommendations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const recommendations = await recommendationsService.getQuickRecommendations(employeeId);
            res.status(200).json({
                employeeId,
                recommendations,
                note: 'These recommendations are based on gap analysis, not AI analysis'
            });
        });
        /**
         * Get explainable AI output
         * GET /performance/ai/explain/:employeeId
         */
        this.explainAnalysis = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            // Get summary and existing analysis
            const summary = await aggregationService.generatePerformanceSummary(employeeId);
            const insights = await groqService.getAllInsights(employeeId);
            if (!insights.FULL) {
                return res.status(404).json({
                    error: 'No analysis found for this employee. Run analysis first.'
                });
            }
            // Generate explanation using rule-based approach first
            const ruleBasedExplanation = explainabilityService.generateExplanation(summary, insights.FULL.analysisResult);
            // Optionally get AI-powered explanation
            let aiExplanation = null;
            if (req.query.includeAI === 'true') {
                try {
                    aiExplanation = await groqService.explainAnalysis(employeeId, summary, insights.FULL.analysisResult);
                }
                catch (err) {
                    console.warn('AI explanation failed, using rule-based only');
                }
            }
            res.status(200).json({
                employeeId,
                explanation: ruleBasedExplanation,
                aiExplanation,
                originalAnalysis: insights.FULL.analysisResult,
                analysisDate: insights.FULL.generatedAt
            });
        });
        /**
         * Get all cached insights for employee
         * GET /performance/ai/insights/:employeeId
         */
        this.getAllInsights = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const insights = await groqService.getAllInsights(employeeId);
            res.status(200).json({
                employeeId,
                hasInsights: Object.keys(insights).length > 0,
                insights
            });
        });
        /**
         * Assess risk for employee
         * POST /performance/ai/risk/:employeeId
         */
        this.assessRisk = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const { forceRefresh } = req.body;
            const summary = await aggregationService.generatePerformanceSummary(employeeId);
            const riskAssessment = await groqService.assessRisk(employeeId, summary, forceRefresh === true);
            res.status(200).json({
                employeeId,
                summary,
                riskAssessment,
                generatedAt: new Date()
            });
        });
        /**
         * Analyze trend over time
         * POST /performance/ai/trend/:employeeId
         */
        this.analyzeTrend = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const { forceRefresh } = req.body;
            // Get history for trend analysis
            const history = await aggregationService.getEmployeeHistory(employeeId, 12);
            if (history.length < 2) {
                return res.status(400).json({
                    error: 'Insufficient history for trend analysis. At least 2 snapshots required.'
                });
            }
            const trendData = history.map((h) => ({
                period: h.period,
                overallScore: h.overallScore
            }));
            const trendAnalysis = await groqService.analyzeTrend(employeeId, trendData, forceRefresh === true);
            res.status(200).json({
                employeeId,
                history: trendData,
                analysis: trendAnalysis,
                generatedAt: new Date()
            });
        });
        /**
         * Cleanup expired insights
         * POST /performance/ai/cleanup
         */
        this.cleanupInsights = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const deletedCount = await groqService.cleanupExpiredInsights();
            res.status(200).json({
                message: 'Expired insights cleaned up',
                deletedCount
            });
        });
    }
}
exports.AIController = AIController;
exports.aiController = new AIController();
