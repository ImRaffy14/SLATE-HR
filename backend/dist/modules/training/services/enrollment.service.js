"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingEnrollmentService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../ess/services/notification.service");
class TrainingEnrollmentService {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
    }
    /**
     * Create enrollment (self or manual)
     * If enrollmentType is MANUAL (HR/Admin enrollment), auto-approve
     */
    async createEnrollment(trainingId, employeeId, enrollmentType = client_1.EnrollmentType.SELF, approvedBy // For manual enrollment, this is the HR/Admin user ID
    ) {
        // Check training exists
        const training = await prisma_1.default.training.findUnique({
            where: { id: trainingId },
            include: {
                enrollments: {
                    where: {
                        status: { in: [client_1.TrainingEnrollmentStatus.PENDING, client_1.TrainingEnrollmentStatus.APPROVED] }
                    }
                }
            }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        // Check if training is open for enrollment
        if (training.status !== 'OPEN' && training.status !== 'ONGOING') {
            throw new appError_1.AppError('Training is not open for enrollment', 400);
        }
        // Check if already enrolled
        const existingEnrollment = await prisma_1.default.trainingEnrollment.findFirst({
            where: {
                trainingId,
                employeeId,
                status: { not: client_1.TrainingEnrollmentStatus.CANCELLED }
            }
        });
        if (existingEnrollment) {
            throw new appError_1.AppError('Employee is already enrolled in this training', 400);
        }
        // Check max participants
        const approvedCount = training.enrollments.filter(e => e.status === client_1.TrainingEnrollmentStatus.APPROVED).length;
        if (approvedCount >= training.maxParticipants) {
            throw new appError_1.AppError('Training is full', 400);
        }
        // For manual enrollment (HR/Admin), auto-approve
        const status = enrollmentType === client_1.EnrollmentType.MANUAL
            ? client_1.TrainingEnrollmentStatus.APPROVED
            : client_1.TrainingEnrollmentStatus.PENDING;
        // Create enrollment
        const enrollment = await prisma_1.default.trainingEnrollment.create({
            data: {
                trainingId,
                employeeId,
                enrollmentType,
                status,
                ...(status === client_1.TrainingEnrollmentStatus.APPROVED && approvedBy ? {
                    approvedBy,
                    approvedAt: new Date()
                } : {})
            },
            include: {
                training: {
                    include: {
                        venue: true,
                        trainer: true
                    }
                },
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true
                    }
                }
            }
        });
        // Create notification for employee
        try {
            if (status === client_1.TrainingEnrollmentStatus.APPROVED) {
                // Manual enrollment - already approved
                await this.notificationService.createNotification(employeeId, 'TRAINING_APPROVAL', `You have been enrolled in the training: ${enrollment.training.title}. Training starts on ${new Date(enrollment.training.startDate).toLocaleDateString()}.`, {
                    enrollmentId: enrollment.id,
                    trainingId: enrollment.training.id,
                    trainingTitle: enrollment.training.title
                });
            }
            // For PENDING status, notification is created in ESS enrollment service
        }
        catch (error) {
            // Don't fail enrollment if notification creation fails
            console.error('Failed to create notification:', error);
        }
        return enrollment;
    }
    /**
     * Get employee's trainings
     */
    async getEmployeeTrainings(employeeId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            employeeId
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        const [enrollments, total] = await Promise.all([
            prisma_1.default.trainingEnrollment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    training: {
                        include: {
                            venue: true,
                            trainer: true
                        }
                    },
                    employee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true,
                            position: true,
                            employeeId: true
                        }
                    },
                    attendance: true,
                    evaluation: true
                },
                orderBy: {
                    enrolledAt: 'desc'
                }
            }),
            prisma_1.default.trainingEnrollment.count({ where })
        ]);
        return {
            enrollments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Approve enrollment
     */
    async approveEnrollment(enrollmentId, approvedBy) {
        const enrollment = await prisma_1.default.trainingEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                training: {
                    include: {
                        enrollments: {
                            where: {
                                status: client_1.TrainingEnrollmentStatus.APPROVED
                            }
                        }
                    }
                }
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        if (enrollment.status !== client_1.TrainingEnrollmentStatus.PENDING) {
            throw new appError_1.AppError('Enrollment is not pending', 400);
        }
        // Check max participants
        const approvedCount = enrollment.training.enrollments.length;
        if (approvedCount >= enrollment.training.maxParticipants) {
            throw new appError_1.AppError('Training is full', 400);
        }
        const updatedEnrollment = await prisma_1.default.trainingEnrollment.update({
            where: { id: enrollmentId },
            data: {
                status: client_1.TrainingEnrollmentStatus.APPROVED,
                approvedBy,
                approvedAt: new Date()
            },
            include: {
                training: true,
                employee: true
            }
        });
        // Create notification for employee
        try {
            await this.notificationService.createNotification(enrollment.employeeId, 'TRAINING_APPROVAL', `Your enrollment request for training: ${updatedEnrollment.training.title} has been approved. Training starts on ${new Date(updatedEnrollment.training.startDate).toLocaleDateString()}.`, {
                enrollmentId: updatedEnrollment.id,
                trainingId: updatedEnrollment.training.id,
                trainingTitle: updatedEnrollment.training.title
            });
        }
        catch (error) {
            // Don't fail approval if notification creation fails
            console.error('Failed to create notification:', error);
        }
        return updatedEnrollment;
    }
    /**
     * Reject enrollment
     */
    async rejectEnrollment(enrollmentId, approvedBy, rejectionReason) {
        const enrollment = await prisma_1.default.trainingEnrollment.findUnique({
            where: { id: enrollmentId }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        if (enrollment.status !== client_1.TrainingEnrollmentStatus.PENDING) {
            throw new appError_1.AppError('Enrollment is not pending', 400);
        }
        return prisma_1.default.trainingEnrollment.update({
            where: { id: enrollmentId },
            data: {
                status: client_1.TrainingEnrollmentStatus.REJECTED,
                approvedBy,
                approvedAt: new Date(),
                rejectionReason
            },
            include: {
                training: true,
                employee: true
            }
        });
    }
    /**
     * Get all enrollments for a training
     */
    async getTrainingEnrollments(trainingId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 100;
        const skip = (page - 1) * limit;
        const where = {
            trainingId
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        const [enrollments, total] = await Promise.all([
            prisma_1.default.trainingEnrollment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    training: {
                        include: {
                            venue: true,
                            trainer: true
                        }
                    },
                    employee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true,
                            position: true
                        }
                    },
                    attendance: true,
                    evaluation: true
                },
                orderBy: {
                    enrolledAt: 'desc'
                }
            }),
            prisma_1.default.trainingEnrollment.count({ where })
        ]);
        return {
            enrollments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get pending enrollments
     */
    async getPendingEnrollments(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.TrainingEnrollmentStatus.PENDING
        };
        if (filters?.trainingId) {
            where.trainingId = filters.trainingId;
        }
        const [enrollments, total] = await Promise.all([
            prisma_1.default.trainingEnrollment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    training: {
                        include: {
                            venue: true,
                            trainer: true
                        }
                    },
                    employee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true,
                            position: true
                        }
                    }
                },
                orderBy: {
                    enrolledAt: 'asc'
                }
            }),
            prisma_1.default.trainingEnrollment.count({ where })
        ]);
        return {
            enrollments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
exports.TrainingEnrollmentService = TrainingEnrollmentService;
