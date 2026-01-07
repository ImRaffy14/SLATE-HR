import { Request, Response } from "express";
import { LearningService } from "../services/learning.service";
import { asyncHandler } from "../utils/asyncHandler";

export class LearningController {
  private learningService = new LearningService();

  // ============================================
  // COURSE ENDPOINTS
  // ============================================

  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const course = await this.learningService.createCourseService(req.body, userId);
    res.status(201).json({ status: "success", course });
  });

  getCourses = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      competencyId: req.query.competencyId as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    const result = await this.learningService.getCoursesService(filters);
    res.status(200).json({ status: "success", ...result });
  });

  getCourseById = asyncHandler(async (req: Request, res: Response) => {
    const course = await this.learningService.getCourseByIdService(req.params.id);
    res.status(200).json({ status: "success", course });
  });

  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    const course = await this.learningService.updateCourseService(req.params.id, req.body, userId);
    res.status(200).json({ status: "success", course });
  });

  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    await this.learningService.deleteCourseService(req.params.id);
    res.status(200).json({ status: "success", message: "Course deleted" });
  });

  // ============================================
  // MATERIAL ENDPOINTS
  // ============================================

  addMaterial = asyncHandler(async (req: Request, res: Response) => {
    const material = await this.learningService.addMaterialService({
      courseId: req.params.courseId,
      ...req.body,
    });
    res.status(201).json({ status: "success", material });
  });

  uploadMaterial = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "File is required" });
    }
    const material = await this.learningService.uploadCourseMaterial(req.params.courseId, req.file);
    res.status(201).json({ status: "success", material });
  });

  updateMaterial = asyncHandler(async (req: Request, res: Response) => {
    const material = await this.learningService.updateMaterialService(req.params.id, req.body);
    res.status(200).json({ status: "success", material });
  });

  deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
    await this.learningService.deleteMaterialService(req.params.id);
    res.status(200).json({ status: "success", message: "Material deleted" });
  });

  // ============================================
  // QUIZ ENDPOINTS
  // ============================================

  createQuiz = asyncHandler(async (req: Request, res: Response) => {
    const quiz = await this.learningService.createQuizService({
      courseId: req.params.courseId,
      ...req.body,
    });
    res.status(201).json({ status: "success", quiz });
  });

  getQuiz = asyncHandler(async (req: Request, res: Response) => {
    const enrollmentId = req.query.enrollmentId as string | undefined;
    const quiz = await this.learningService.getQuizService(req.params.id, enrollmentId);
    res.status(200).json({ status: "success", quiz });
  });

  updateQuiz = asyncHandler(async (req: Request, res: Response) => {
    const quiz = await this.learningService.updateQuizService(req.params.id, req.body);
    res.status(200).json({ status: "success", quiz });
  });

  deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
    await this.learningService.deleteQuizService(req.params.id);
    res.status(200).json({ status: "success", message: "Quiz deleted" });
  });

  submitQuiz = asyncHandler(async (req: Request, res: Response) => {
    const attempt = await this.learningService.submitQuizAnswerService(
      req.body.enrollmentId,
      req.params.id,
      req.body.answers
    );
    res.status(200).json({ status: "success", attempt });
  });

  // ============================================
  // ENROLLMENT ENDPOINTS
  // ============================================

  enrollEmployee = asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await this.learningService.enrollEmployeeService(req.body);
    res.status(201).json({ status: "success", enrollment });
  });

  autoEnrollBasedOnGap = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.learningService.autoEnrollBasedOnGapService(req.body.employeeId);
    res.status(200).json({ status: "success", ...result });
  });

  getAllEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const enrollments = await this.learningService.getAllEnrollmentsService();
    res.status(200).json({ status: "success", enrollments });
  });

  getEmployeeEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const enrollments = await this.learningService.getEmployeeEnrollmentsService(req.params.employeeId);
    res.status(200).json({ status: "success", enrollments });
  });

  getEnrollmentDetails = asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await this.learningService.getCourseContentService(req.params.id);
    res.status(200).json({ status: "success", enrollment });
  });

  updateEnrollmentProgress = asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await this.learningService.updateEnrollmentProgressService(req.params.id);
    res.status(200).json({ status: "success", enrollment });
  });

  completeCourse = asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await this.learningService.completeCourseService(req.params.id);
    res.status(200).json({ status: "success", enrollment });
  });

  deleteEnrollment = asyncHandler(async (req: Request, res: Response) => {
    await this.learningService.deleteEnrollmentService(req.params.id);
    res.status(200).json({ status: "success", message: "Enrollment deleted" });
  });

  // ============================================
  // CONTENT DELIVERY ENDPOINTS
  // ============================================

  getCourseContent = asyncHandler(async (req: Request, res: Response) => {
    const content = await this.learningService.getCourseContentService(req.params.id);
    res.status(200).json({ status: "success", content });
  });

  markMaterialComplete = asyncHandler(async (req: Request, res: Response) => {
    const progress = await this.learningService.markMaterialCompleteService(
      req.body.enrollmentId,
      req.params.materialId,
      req.body.timeSpent
    );
    res.status(200).json({ status: "success", progress });
  });

  getQuizAttempt = asyncHandler(async (req: Request, res: Response) => {
    const enrollmentId = req.query.enrollmentId as string;
    if (!enrollmentId) {
      return res.status(400).json({ status: "error", message: "enrollmentId is required" });
    }
    const attempt = await this.learningService.getQuizAttemptService(enrollmentId, req.params.quizId);
    res.status(200).json({ status: "success", attempt });
  });

  // ============================================
  // CERTIFICATE ENDPOINTS
  // ============================================

  generateCertificate = asyncHandler(async (req: Request, res: Response) => {
    const certificate = await this.learningService.generateCertificateService(req.params.id);
    res.status(201).json({ status: "success", certificate });
  });

  getCertificate = asyncHandler(async (req: Request, res: Response) => {
    const certificate = await this.learningService.getCertificateService(req.params.id);
    if (!certificate) {
      return res.status(404).json({ status: "error", message: "Certificate not found" });
    }
    res.status(200).json({ status: "success", certificate });
  });

  // ============================================
  // REPORTING ENDPOINTS
  // ============================================

  getCompletionReport = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      employeeId: req.query.employeeId as string | undefined,
      courseId: req.query.courseId as string | undefined,
      department: req.query.department as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };
    const report = await this.learningService.getCompletionReport(filters);
    res.status(200).json({ status: "success", report });
  });

  getLearningHoursReport = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      employeeId: req.query.employeeId as string | undefined,
      department: req.query.department as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };
    const report = await this.learningService.getLearningHoursReport(filters);
    res.status(200).json({ status: "success", report });
  });

  getCourseAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const analytics = await this.learningService.getCourseAnalytics();
    res.status(200).json({ status: "success", analytics });
  });

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  getRecommendedCourses = asyncHandler(async (req: Request, res: Response) => {
    const courses = await this.learningService.getRecommendedCoursesService(req.params.employeeId);
    res.status(200).json({ status: "success", courses });
  });

  getEmployeeProgress = asyncHandler(async (req: Request, res: Response) => {
    const progress = await this.learningService.getEmployeeProgressService(req.params.employeeId);
    res.status(200).json({ status: "success", progress });
  });
}

