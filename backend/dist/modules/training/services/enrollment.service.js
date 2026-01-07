"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingEnrollmentService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
const client_1 = require("@prisma/client");
class TrainingEnrollmentService {
    /**
     * Create enrollment (self or manual)
     */
    async createEnrollment(trainingId, employeeId, enrollmentType = client_1.EnrollmentType.SELF) {
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
        // Create enrollment
        const enrollment = await prisma_1.default.trainingEnrollment.create({
            data: {
                trainingId,
                employeeId,
                enrollmentType,
                status: client_1.TrainingEnrollmentStatus.PENDING
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
        return prisma_1.default.trainingEnrollment.update({
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
