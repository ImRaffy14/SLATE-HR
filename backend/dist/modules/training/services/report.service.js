"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingReportService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class TrainingReportService {
    /**
     * Get training hours per employee
     */
    async getTrainingHoursReport(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            status: 'COMPLETED',
            enrollments: {
                some: {
                    status: 'APPROVED',
                    attendance: {
                        status: { in: ['PRESENT', 'LATE'] }
                    }
                }
            }
        };
        if (filters?.startDate || filters?.endDate) {
            where.AND = [];
            if (filters.startDate) {
                where.AND.push({ startDate: { gte: filters.startDate } });
            }
            if (filters.endDate) {
                where.AND.push({ endDate: { lte: filters.endDate } });
            }
        }
        if (filters?.employeeId) {
            where.enrollments = {
                ...where.enrollments,
                some: {
                    ...where.enrollments.some,
                    employeeId: filters.employeeId
                }
            };
        }
        // Get trainings with enrollments
        const trainings = await prisma_1.default.training.findMany({
            where,
            include: {
                enrollments: {
                    where: {
                        status: 'APPROVED',
                        attendance: {
                            status: { in: ['PRESENT', 'LATE'] }
                        }
                    },
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                department: true
                            }
                        }
                    }
                }
            }
        });
        // Aggregate by employee
        const employeeHours = {};
        trainings.forEach(training => {
            training.enrollments.forEach(enrollment => {
                const empId = enrollment.employee.id;
                if (!employeeHours[empId]) {
                    employeeHours[empId] = {
                        employee: enrollment.employee,
                        totalHours: 0,
                        trainingCount: 0,
                        trainings: []
                    };
                }
                // Filter by department if provided
                if (filters?.department && enrollment.employee.department !== filters.department) {
                    return;
                }
                employeeHours[empId].totalHours += training.durationHours;
                employeeHours[empId].trainingCount += 1;
                employeeHours[empId].trainings.push({
                    trainingId: training.id,
                    title: training.title,
                    hours: training.durationHours,
                    completedAt: training.endDate
                });
            });
        });
        const results = Object.values(employeeHours);
        const total = results.length;
        // Paginate
        const paginatedResults = results.slice(skip, skip + limit);
        return {
            data: paginatedResults,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get attendance summary report
     */
    async getAttendanceSummaryReport(filters) {
        const where = {};
        if (filters?.trainingId) {
            where.trainingId = filters.trainingId;
        }
        if (filters?.startDate || filters?.endDate) {
            where.training = {
                AND: []
            };
            if (filters.startDate) {
                where.training.AND.push({ startDate: { gte: filters.startDate } });
            }
            if (filters.endDate) {
                where.training.AND.push({ endDate: { lte: filters.endDate } });
            }
        }
        const attendances = await prisma_1.default.trainingAttendance.findMany({
            where,
            include: {
                enrollment: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                department: true
                            }
                        },
                        training: {
                            select: {
                                id: true,
                                title: true,
                                startDate: true,
                                endDate: true
                            }
                        }
                    }
                }
            }
        });
        // Filter by department if provided
        const filtered = filters?.department
            ? attendances.filter(a => a.enrollment.employee.department === filters.department)
            : attendances;
        // Aggregate by status
        const summary = {
            total: filtered.length,
            present: filtered.filter(a => a.status === 'PRESENT').length,
            late: filtered.filter(a => a.status === 'LATE').length,
            absent: filtered.filter(a => a.status === 'ABSENT').length,
            attendanceRate: filtered.length > 0
                ? ((filtered.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length / filtered.length) * 100).toFixed(2)
                : '0.00'
        };
        return {
            summary,
            details: filtered.map(a => ({
                employee: a.enrollment.employee,
                training: a.enrollment.training,
                status: a.status,
                timeIn: a.timeIn,
                timeOut: a.timeOut
            }))
        };
    }
    /**
     * Get competency improvement report
     */
    async getCompetencyImprovementReport(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.employeeId) {
            where.employeeId = filters.employeeId;
        }
        if (filters?.competencyId) {
            where.competencyId = filters.competencyId;
        }
        if (filters?.trainingId) {
            where.trainingId = filters.trainingId;
        }
        if (filters?.startDate || filters?.endDate) {
            where.training = {
                AND: []
            };
            if (filters.startDate) {
                where.training.AND.push({ startDate: { gte: filters.startDate } });
            }
            if (filters.endDate) {
                where.training.AND.push({ endDate: { lte: filters.endDate } });
            }
        }
        const [impacts, total] = await Promise.all([
            prisma_1.default.trainingCompetencyImpact.findMany({
                where,
                skip,
                take: limit,
                include: {
                    training: {
                        select: {
                            id: true,
                            title: true,
                            startDate: true,
                            endDate: true
                        }
                    },
                    employee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true
                        }
                    },
                    competency: {
                        select: {
                            id: true,
                            name: true,
                            category: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma_1.default.trainingCompetencyImpact.count({ where })
        ]);
        return {
            impacts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get trainer effectiveness report
     */
    async getTrainerEffectivenessReport(filters) {
        const where = {
            status: 'COMPLETED',
            enrollments: {
                some: {
                    evaluation: {
                        isNot: null
                    }
                }
            }
        };
        if (filters?.trainerId) {
            where.trainerId = filters.trainerId;
        }
        if (filters?.startDate || filters?.endDate) {
            where.AND = [];
            if (filters.startDate) {
                where.AND.push({ startDate: { gte: filters.startDate } });
            }
            if (filters.endDate) {
                where.AND.push({ endDate: { lte: filters.endDate } });
            }
        }
        const trainings = await prisma_1.default.training.findMany({
            where,
            include: {
                trainer: true,
                enrollments: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        evaluation: true
                    }
                }
            }
        });
        // Aggregate by trainer
        const trainerStats = {};
        trainings.forEach((training) => {
            if (!training.trainer)
                return;
            const trainerId = training.trainer.id;
            if (!trainerStats[trainerId]) {
                trainerStats[trainerId] = {
                    trainer: training.trainer,
                    totalTrainings: 0,
                    totalEvaluations: 0,
                    averageTrainingRating: 0,
                    averageTrainerRating: 0,
                    averageEffectivenessScore: 0
                };
            }
            trainerStats[trainerId].totalTrainings += 1;
            const evaluations = training.enrollments
                .map((e) => e.evaluation)
                .filter((e) => e !== null);
            if (evaluations.length > 0) {
                trainerStats[trainerId].totalEvaluations += evaluations.length;
                const trainingRatings = evaluations.map((e) => e.trainingRating);
                const trainerRatings = evaluations.map((e) => e.trainerRating).filter((r) => r !== null);
                const effectivenessScores = evaluations.map((e) => e.effectivenessScore).filter((s) => s !== null);
                trainerStats[trainerId].averageTrainingRating = trainingRatings.reduce((a, b) => a + b, 0) / trainingRatings.length;
                if (trainerRatings.length > 0) {
                    trainerStats[trainerId].averageTrainerRating = trainerRatings.reduce((a, b) => a + b, 0) / trainerRatings.length;
                }
                if (effectivenessScores.length > 0) {
                    trainerStats[trainerId].averageEffectivenessScore = effectivenessScores.reduce((a, b) => a + b, 0) / effectivenessScores.length;
                }
            }
        });
        return Object.values(trainerStats);
    }
}
exports.TrainingReportService = TrainingReportService;
