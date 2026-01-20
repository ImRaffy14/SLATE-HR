"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESSController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const dashboard_service_1 = require("../services/dashboard.service");
const careerPath_service_1 = require("../services/careerPath.service");
const enrollment_service_1 = require("../services/enrollment.service");
const achievement_service_1 = require("../services/achievement.service");
const notification_service_1 = require("../services/notification.service");
const aggregation_service_1 = require("../../performance/services/aggregation.service");
const groq_service_1 = require("../../performance/ai/groq.service");
const recommendations_service_1 = require("../../performance/services/recommendations.service");
const explainability_service_1 = require("../../performance/ai/explainability.service");
class ESSController {
    constructor() {
        this.dashboardService = new dashboard_service_1.DashboardService();
        this.careerPathService = new careerPath_service_1.CareerPathService();
        this.enrollmentService = new enrollment_service_1.ESSEnrollmentService();
        this.achievementService = new achievement_service_1.AchievementService();
        this.notificationService = new notification_service_1.NotificationService();
        this.aggregationService = new aggregation_service_1.AggregationService();
        this.groqService = new groq_service_1.GroqService();
        this.recommendationsService = new recommendations_service_1.RecommendationsService();
        this.explainabilityService = new explainability_service_1.ExplainabilityService();
        /**
         * GET /ess/dashboard
         * Get employee dashboard with aggregated data
         */
        this.getDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            const dashboard = await this.dashboardService.getEmployeeDashboard(employeeId);
            res.status(200).json({
                status: 'success',
                dashboard
            });
        });
        /**
         * GET /ess/career-path
         * Get career path with all potential next roles
         */
        this.getCareerPath = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            const careerPath = await this.careerPathService.getCareerPath(employeeId);
            res.status(200).json({
                status: 'success',
                careerPath
            });
        });
        /**
         * GET /ess/career-path/:targetRoleId
         * Get detailed career path for a specific target role
         */
        this.getCareerPathDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            const targetRoleId = req.params.targetRoleId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            if (!targetRoleId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Target role ID is required'
                });
            }
            const careerPathDetails = await this.careerPathService.getCareerPathDetails(employeeId, targetRoleId);
            res.status(200).json({
                status: 'success',
                careerPathDetails
            });
        });
        /**
         * POST /ess/enroll/course/:courseId
         * Self-enroll in a course
         */
        this.enrollInCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            const courseId = req.params.courseId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            if (!courseId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Course ID is required'
                });
            }
            const enrollment = await this.enrollmentService.enrollInCourse(employeeId, courseId);
            res.status(201).json({
                status: 'success',
                message: 'Successfully enrolled in course',
                enrollment
            });
        });
        /**
         * POST /ess/enroll/training/:trainingId
         * Self-enroll in a training
         */
        this.enrollInTraining = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            const trainingId = req.params.trainingId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            if (!trainingId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Training ID is required'
                });
            }
            const enrollment = await this.enrollmentService.enrollInTraining(employeeId, trainingId);
            res.status(201).json({
                status: 'success',
                message: 'Training enrollment request submitted. Awaiting approval.',
                enrollment
            });
        });
        /**
         * GET /ess/achievements
         * Get employee's achievements/certificates
         */
        this.getAchievements = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            const filters = {
                status: req.query.status,
                competencyId: req.query.competencyId,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };
            const result = await this.achievementService.getEmployeeAchievements(employeeId, filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * POST /ess/upload/achievement
         * Upload achievement/certificate
         */
        this.uploadAchievement = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'File is required'
                });
            }
            const { title, description, competencyId } = req.body;
            if (!title || !title.trim()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Title is required'
                });
            }
            const achievement = await this.achievementService.uploadAchievement(employeeId, req.file, {
                title: title.trim(),
                description: description?.trim(),
                competencyId: competencyId?.trim() || undefined
            });
            res.status(201).json({
                status: 'success',
                message: 'Achievement uploaded successfully. Awaiting HR/Manager approval.',
                achievement
            });
        });
        /**
         * GET /ess/notifications
         * Get employee notifications
         */
        this.getNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            const filters = {
                isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
                type: req.query.type ? req.query.type : undefined,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };
            const result = await this.notificationService.getEmployeeNotifications(employeeId, filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * PATCH /ess/notifications/:id/read
         * Mark notification as read
         */
        this.markNotificationRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            const notificationId = req.params.id;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            if (!notificationId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Notification ID is required'
                });
            }
            const notification = await this.notificationService.markNotificationRead(notificationId, employeeId);
            res.status(200).json({
                status: 'success',
                message: 'Notification marked as read',
                notification
            });
        });
        /**
         * GET /ess/notifications/unread-count
         * Get unread notification count for employee
         */
        this.getUnreadCount = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            const count = await this.notificationService.getUnreadCount(employeeId);
            res.status(200).json({
                status: 'success',
                count
            });
        });
        /**
         * GET /ess/performance-summary
         * Get employee's own performance summary with AI insights
         */
        this.getPerformanceSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employeeId = req.employeeId;
            if (!employeeId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID is required'
                });
            }
            try {
                // Get performance summary
                const summary = await this.aggregationService.generatePerformanceSummary(employeeId);
                // Get latest snapshot
                const history = await this.aggregationService.getEmployeeHistory(employeeId, 6);
                // Get cached AI insights (if available)
                let aiInsight = null;
                try {
                    const insights = await this.groqService.getAllInsights(employeeId);
                    if (insights.FULL) {
                        // Simplify for employee view - remove sensitive details
                        const fullInsight = insights.FULL.analysisResult;
                        aiInsight = {
                            performanceTrend: fullInsight.performanceTrend,
                            strengthAreas: fullInsight.strengthAreas || [],
                            developmentAreas: fullInsight.developmentAreas || [],
                            recommendations: (fullInsight.recommendations || []).slice(0, 3),
                            generatedAt: insights.FULL.generatedAt
                        };
                    }
                }
                catch (err) {
                    console.warn('Could not fetch AI insights for employee:', err);
                }
                // Get quick recommendations (doesn't require AI)
                const recommendations = await this.recommendationsService.getQuickRecommendations(employeeId);
                res.status(200).json({
                    status: 'success',
                    summary: {
                        period: summary.period,
                        performanceTrend: summary.trend,
                        competencyGrowth: summary.competencyGrowth,
                        learningActivity: summary.learningActivity,
                        trainingAttendance: summary.trainingAttendance,
                        lastRating: summary.lastRating,
                        skillGapsCount: summary.skillGaps
                    },
                    history: history.map(h => ({
                        period: h.period,
                        overallScore: h.overallScore,
                        performanceScore: h.performanceScore,
                        competencyScore: h.competencyScore,
                        learningScore: h.learningScore,
                        trainingScore: h.trainingScore
                    })),
                    aiInsight,
                    recommendations: recommendations.slice(0, 5),
                    disclaimer: 'Performance insights are generated to help you understand your growth trajectory. Focus on continuous improvement!'
                });
            }
            catch (error) {
                console.error('Error getting performance summary:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to get performance summary'
                });
            }
        });
    }
}
exports.ESSController = ESSController;
