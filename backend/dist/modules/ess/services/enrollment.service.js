"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESSEnrollmentService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
const learning_service_1 = require("../../../services/learning.service");
const enrollment_service_1 = require("../../training/services/enrollment.service");
const client_1 = require("@prisma/client");
const notification_service_1 = require("../services/notification.service");
class ESSEnrollmentService {
    constructor() {
        this.learningService = new learning_service_1.LearningService();
        this.trainingEnrollmentService = new enrollment_service_1.TrainingEnrollmentService();
        this.notificationService = new notification_service_1.NotificationService();
    }
    /**
     * Self-enroll in a course
     * Creates enrollment with EnrollmentType.SELF
     */
    async enrollInCourse(employeeId, courseId) {
        // Validate employee exists
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Validate course exists and is published
        const course = await prisma_1.default.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        if (course.status !== 'PUBLISHED') {
            throw new appError_1.AppError('Cannot enroll in a course that is not published', 400);
        }
        // Check for duplicate enrollment
        const existingEnrollment = await prisma_1.default.enrollment.findFirst({
            where: {
                employeeId,
                courseId
            }
        });
        if (existingEnrollment) {
            throw new appError_1.AppError('Employee is already enrolled in this course', 400);
        }
        // Create enrollment with SELF type
        const enrollment = await prisma_1.default.enrollment.create({
            data: {
                employeeId,
                courseId,
                enrollmentType: client_1.EnrollmentType.SELF,
                isRequired: false,
                status: 'NOT_STARTED'
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true
                    }
                }
            }
        });
        // Create notification for employee
        try {
            await this.notificationService.createNotification(employeeId, 'COURSE_DUE', `You have successfully enrolled in the course: ${course.title}. Please start the course to begin learning.`, {
                enrollmentId: enrollment.id,
                courseId: course.id,
                courseTitle: course.title
            });
        }
        catch (error) {
            // Don't fail enrollment if notification creation fails
            console.error('Failed to create notification:', error);
        }
        return enrollment;
    }
    /**
     * Self-enroll in a training
     * Delegates to TrainingEnrollmentService with EnrollmentType.SELF
     */
    async enrollInTraining(employeeId, trainingId) {
        // Validate employee exists
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Delegate to TrainingEnrollmentService with SELF type
        // This will create enrollment with PENDING status (requires approval)
        const enrollment = await this.trainingEnrollmentService.createEnrollment(trainingId, employeeId, client_1.EnrollmentType.SELF);
        // Create notification for employee
        try {
            await this.notificationService.createNotification(employeeId, 'TRAINING_APPROVAL', `Your enrollment request for training: ${enrollment.training.title} has been submitted. Awaiting approval.`, {
                enrollmentId: enrollment.id,
                trainingId: enrollment.training.id,
                trainingTitle: enrollment.training.title
            });
        }
        catch (error) {
            // Don't fail enrollment if notification creation fails
            console.error('Failed to create notification:', error);
        }
        return enrollment;
    }
}
exports.ESSEnrollmentService = ESSEnrollmentService;
