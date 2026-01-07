"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningController = void 0;
const learning_service_1 = require("../services/learning.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class LearningController {
    constructor() {
        this.learningService = new learning_service_1.LearningService();
        // ============================================
        // COURSE ENDPOINTS
        // ============================================
        this.createCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: "error", message: "User ID is required" });
            }
            const course = await this.learningService.createCourseService(req.body, userId);
            res.status(201).json({ status: "success", course });
        });
        this.getCourses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                status: req.query.status,
                categoryId: req.query.categoryId,
                competencyId: req.query.competencyId,
                search: req.query.search,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            };
            const result = await this.learningService.getCoursesService(filters);
            res.status(200).json({ status: "success", ...result });
        });
        this.getCourseById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const course = await this.learningService.getCourseByIdService(req.params.id);
            res.status(200).json({ status: "success", course });
        });
        this.updateCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            if (!userId) {
                return res.status(400).json({ status: "error", message: "User ID is required" });
            }
            const course = await this.learningService.updateCourseService(req.params.id, req.body, userId);
            res.status(200).json({ status: "success", course });
        });
        this.deleteCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.learningService.deleteCourseService(req.params.id);
            res.status(200).json({ status: "success", message: "Course deleted" });
        });
        // ============================================
        // MATERIAL ENDPOINTS
        // ============================================
        this.addMaterial = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const material = await this.learningService.addMaterialService({
                courseId: req.params.courseId,
                ...req.body,
            });
            res.status(201).json({ status: "success", material });
        });
        this.uploadMaterial = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.file) {
                return res.status(400).json({ status: "error", message: "File is required" });
            }
            const material = await this.learningService.uploadCourseMaterial(req.params.courseId, req.file);
            res.status(201).json({ status: "success", material });
        });
        this.updateMaterial = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const material = await this.learningService.updateMaterialService(req.params.id, req.body);
            res.status(200).json({ status: "success", material });
        });
        this.deleteMaterial = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.learningService.deleteMaterialService(req.params.id);
            res.status(200).json({ status: "success", message: "Material deleted" });
        });
        // ============================================
        // QUIZ ENDPOINTS
        // ============================================
        this.createQuiz = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const quiz = await this.learningService.createQuizService({
                courseId: req.params.courseId,
                ...req.body,
            });
            res.status(201).json({ status: "success", quiz });
        });
        this.getQuiz = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const enrollmentId = req.query.enrollmentId;
            const quiz = await this.learningService.getQuizService(req.params.id, enrollmentId);
            res.status(200).json({ status: "success", quiz });
        });
        this.updateQuiz = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const quiz = await this.learningService.updateQuizService(req.params.id, req.body);
            res.status(200).json({ status: "success", quiz });
        });
        this.deleteQuiz = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.learningService.deleteQuizService(req.params.id);
            res.status(200).json({ status: "success", message: "Quiz deleted" });
        });
        this.submitQuiz = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const attempt = await this.learningService.submitQuizAnswerService(req.body.enrollmentId, req.params.id, req.body.answers);
            res.status(200).json({ status: "success", attempt });
        });
        // ============================================
        // ENROLLMENT ENDPOINTS
        // ============================================
        this.enrollEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const enrollment = await this.learningService.enrollEmployeeService(req.body);
            res.status(201).json({ status: "success", enrollment });
        });
        this.autoEnrollBasedOnGap = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.learningService.autoEnrollBasedOnGapService(req.body.employeeId);
            res.status(200).json({ status: "success", ...result });
        });
        this.getEmployeeEnrollments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const enrollments = await this.learningService.getEmployeeEnrollmentsService(req.params.employeeId);
            res.status(200).json({ status: "success", enrollments });
        });
        this.getEnrollmentDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const enrollment = await this.learningService.getCourseContentService(req.params.id);
            res.status(200).json({ status: "success", enrollment });
        });
        this.updateEnrollmentProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const enrollment = await this.learningService.updateEnrollmentProgressService(req.params.id);
            res.status(200).json({ status: "success", enrollment });
        });
        this.completeCourse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const enrollment = await this.learningService.completeCourseService(req.params.id);
            res.status(200).json({ status: "success", enrollment });
        });
        this.deleteEnrollment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.learningService.deleteEnrollmentService(req.params.id);
            res.status(200).json({ status: "success", message: "Enrollment deleted" });
        });
        // ============================================
        // CONTENT DELIVERY ENDPOINTS
        // ============================================
        this.getCourseContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const content = await this.learningService.getCourseContentService(req.params.id);
            res.status(200).json({ status: "success", content });
        });
        this.markMaterialComplete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const progress = await this.learningService.markMaterialCompleteService(req.body.enrollmentId, req.params.materialId, req.body.timeSpent);
            res.status(200).json({ status: "success", progress });
        });
        this.getQuizAttempt = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const enrollmentId = req.query.enrollmentId;
            if (!enrollmentId) {
                return res.status(400).json({ status: "error", message: "enrollmentId is required" });
            }
            const attempt = await this.learningService.getQuizAttemptService(enrollmentId, req.params.quizId);
            res.status(200).json({ status: "success", attempt });
        });
        // ============================================
        // CERTIFICATE ENDPOINTS
        // ============================================
        this.generateCertificate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const certificate = await this.learningService.generateCertificateService(req.params.id);
            res.status(201).json({ status: "success", certificate });
        });
        this.getCertificate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const certificate = await this.learningService.getCertificateService(req.params.id);
            if (!certificate) {
                return res.status(404).json({ status: "error", message: "Certificate not found" });
            }
            res.status(200).json({ status: "success", certificate });
        });
        // ============================================
        // REPORTING ENDPOINTS
        // ============================================
        this.getCompletionReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                employeeId: req.query.employeeId,
                courseId: req.query.courseId,
                department: req.query.department,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
            };
            const report = await this.learningService.getCompletionReport(filters);
            res.status(200).json({ status: "success", report });
        });
        this.getLearningHoursReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                employeeId: req.query.employeeId,
                department: req.query.department,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
            };
            const report = await this.learningService.getLearningHoursReport(filters);
            res.status(200).json({ status: "success", report });
        });
        this.getCourseAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const analytics = await this.learningService.getCourseAnalytics();
            res.status(200).json({ status: "success", analytics });
        });
        // ============================================
        // UTILITY ENDPOINTS
        // ============================================
        this.getRecommendedCourses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const courses = await this.learningService.getRecommendedCoursesService(req.params.employeeId);
            res.status(200).json({ status: "success", courses });
        });
        this.getEmployeeProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const progress = await this.learningService.getEmployeeProgressService(req.params.employeeId);
            res.status(200).json({ status: "success", progress });
        });
    }
}
exports.LearningController = LearningController;
