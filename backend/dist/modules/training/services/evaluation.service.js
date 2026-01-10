"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingEvaluationService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
class TrainingEvaluationService {
    /**
     * Submit evaluation
     */
    async submitEvaluation(enrollmentId, data) {
        // Validate enrollment exists
        const enrollment = await prisma_1.default.trainingEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                training: true,
                attendance: true
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        // Check if attendance is present
        if (!enrollment.attendance || enrollment.attendance.status === 'ABSENT') {
            throw new appError_1.AppError('Cannot submit evaluation without attendance', 400);
        }
        // Validate ratings (1-5)
        if (data.trainingRating < 1 || data.trainingRating > 5) {
            throw new appError_1.AppError('Training rating must be between 1 and 5', 400);
        }
        if (data.trainerRating && (data.trainerRating < 1 || data.trainerRating > 5)) {
            throw new appError_1.AppError('Trainer rating must be between 1 and 5', 400);
        }
        if (data.employeePerformanceRating && (data.employeePerformanceRating < 1 || data.employeePerformanceRating > 5)) {
            throw new appError_1.AppError('Employee performance rating must be between 1 and 5', 400);
        }
        // Check if evaluation already exists
        const existing = await prisma_1.default.trainingEvaluation.findUnique({
            where: { enrollmentId }
        });
        // Calculate effectiveness score
        const effectivenessScore = this.calculateEffectivenessScore(data.trainingRating, data.trainerRating);
        if (existing) {
            // Update existing evaluation
            return prisma_1.default.trainingEvaluation.update({
                where: { enrollmentId },
                data: {
                    ...data,
                    effectivenessScore
                },
                include: {
                    enrollment: {
                        include: {
                            employee: true,
                            training: true
                        }
                    }
                }
            });
        }
        // Create new evaluation
        return prisma_1.default.trainingEvaluation.create({
            data: {
                enrollmentId,
                ...data,
                effectivenessScore
            },
            include: {
                enrollment: {
                    include: {
                        employee: true,
                        training: true
                    }
                }
            }
        });
    }
    /**
     * Get evaluation by enrollment ID
     */
    async getEvaluation(enrollmentId) {
        const evaluation = await prisma_1.default.trainingEvaluation.findUnique({
            where: { enrollmentId },
            include: {
                enrollment: {
                    include: {
                        employee: true,
                        training: {
                            include: {
                                trainer: true,
                                venue: true
                            }
                        }
                    }
                }
            }
        });
        if (!evaluation) {
            throw new appError_1.AppError('Evaluation not found', 404);
        }
        return evaluation;
    }
    /**
     * Get all evaluations for a training
     */
    async getTrainingEvaluations(trainingId) {
        const training = await prisma_1.default.training.findUnique({
            where: { id: trainingId },
            include: {
                enrollments: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                department: true
                            }
                        },
                        evaluation: true
                    }
                }
            }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        return training.enrollments
            .filter(e => e.evaluation)
            .map(e => ({
            employee: e.employee,
            evaluation: e.evaluation
        }));
    }
    /**
     * Submit employee performance rating (by HR/Manager/Trainer)
     */
    async submitEmployeePerformanceRating(enrollmentId, data) {
        // Validate enrollment exists
        const enrollment = await prisma_1.default.trainingEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                training: true,
                attendance: true
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        // Check if attendance is present
        if (!enrollment.attendance || enrollment.attendance.status === 'ABSENT') {
            throw new appError_1.AppError('Cannot rate employee without attendance', 400);
        }
        // Validate rating (1-5)
        if (data.employeePerformanceRating < 1 || data.employeePerformanceRating > 5) {
            throw new appError_1.AppError('Employee performance rating must be between 1 and 5', 400);
        }
        // Check if evaluation exists
        const existing = await prisma_1.default.trainingEvaluation.findUnique({
            where: { enrollmentId }
        });
        if (existing) {
            // Update existing evaluation with employee performance rating
            return prisma_1.default.trainingEvaluation.update({
                where: { enrollmentId },
                data: {
                    employeePerformanceRating: data.employeePerformanceRating,
                    employeeImprovementComments: data.employeeImprovementComments
                },
                include: {
                    enrollment: {
                        include: {
                            employee: true,
                            training: true
                        }
                    }
                }
            });
        }
        // Create new evaluation with only employee performance rating
        return prisma_1.default.trainingEvaluation.create({
            data: {
                enrollmentId,
                trainingRating: 0, // Placeholder, will be updated when employee submits their evaluation
                employeePerformanceRating: data.employeePerformanceRating,
                employeeImprovementComments: data.employeeImprovementComments
            },
            include: {
                enrollment: {
                    include: {
                        employee: true,
                        training: true
                    }
                }
            }
        });
    }
    /**
     * Calculate training effectiveness score
     */
    calculateEffectivenessScore(trainingRating, trainerRating) {
        if (trainerRating) {
            // Average of both ratings, weighted 60% training, 40% trainer
            return (trainingRating * 0.6 + trainerRating * 0.4) * 20; // Scale to 0-100
        }
        return trainingRating * 20; // Scale to 0-100
    }
}
exports.TrainingEvaluationService = TrainingEvaluationService;
