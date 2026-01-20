"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
const client_1 = require("@prisma/client");
const competencyUpdate_service_1 = require("./competencyUpdate.service");
class TrainingService {
    constructor() {
        this.competencyUpdateService = new competencyUpdate_service_1.CompetencyUpdateService();
    }
    /**
     * Create a new training
     */
    async createTraining(data, userId) {
        // Generate trainingId automatically
        const year = new Date().getFullYear();
        const lastTraining = await prisma_1.default.training.findFirst({
            where: {
                trainingId: {
                    startsWith: `TRN-${year}-`
                }
            },
            orderBy: {
                trainingId: 'desc'
            }
        });
        let trainingId;
        if (lastTraining) {
            const lastNumber = parseInt(lastTraining.trainingId.split('-')[2] || '0');
            trainingId = `TRN-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
        }
        else {
            trainingId = `TRN-${year}-001`;
        }
        // Validate dates
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            throw new appError_1.AppError('End date must be after start date', 400);
        }
        // Validate venue exists if provided
        if (data.venueId) {
            const venue = await prisma_1.default.venue.findUnique({
                where: { id: data.venueId }
            });
            if (!venue) {
                throw new appError_1.AppError('Venue not found', 404);
            }
        }
        // Validate trainer exists if provided
        if (data.trainerId) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { id: data.trainerId }
            });
            if (!trainer) {
                throw new appError_1.AppError('Trainer not found', 404);
            }
        }
        // Validate competencies exist
        if (data.taggedCompetencies.length > 0) {
            const competencies = await prisma_1.default.competency.findMany({
                where: {
                    id: { in: data.taggedCompetencies }
                }
            });
            if (competencies.length !== data.taggedCompetencies.length) {
                throw new appError_1.AppError('One or more competencies not found', 404);
            }
        }
        // Check for duplicate trainingId (shouldn't happen with auto-generation, but check anyway)
        const existing = await prisma_1.default.training.findUnique({
            where: { trainingId }
        });
        if (existing) {
            // If duplicate found, generate next number
            const lastNumber = parseInt(trainingId.split('-')[2] || '0');
            trainingId = `TRN-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
        }
        // Check for schedule conflicts (same trainer or venue at overlapping times)
        await this.validateSchedule(data.trainerId, data.venueId, data.startDate, data.endDate);
        return prisma_1.default.training.create({
            data: {
                ...data,
                trainingId,
                createdBy: userId,
                status: client_1.TrainingStatus.DRAFT
            },
            include: {
                venue: true,
                trainer: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
    /**
     * Get all trainings with filters
     */
    async getTrainings(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.trainingType) {
            where.trainingType = filters.trainingType;
        }
        if (filters?.trainerId) {
            where.trainerId = filters.trainerId;
        }
        if (filters?.venueId) {
            where.venueId = filters.venueId;
        }
        if (filters?.startDate || filters?.endDate) {
            where.OR = [];
            if (filters.startDate) {
                where.OR.push({
                    startDate: { gte: filters.startDate }
                });
            }
            if (filters.endDate) {
                where.OR.push({
                    endDate: { lte: filters.endDate }
                });
            }
        }
        const [trainings, total] = await Promise.all([
            prisma_1.default.training.findMany({
                where,
                skip,
                take: limit,
                include: {
                    venue: true,
                    trainer: true,
                    enrollments: {
                        select: {
                            id: true,
                            status: true
                        }
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    startDate: 'asc'
                }
            }),
            prisma_1.default.training.count({ where })
        ]);
        return {
            trainings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get training by ID
     */
    async getTrainingById(id) {
        const training = await prisma_1.default.training.findUnique({
            where: { id },
            include: {
                venue: true,
                trainer: true,
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
                        attendance: true,
                        evaluation: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                updater: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        return training;
    }
    /**
     * Update training
     */
    async updateTraining(id, data, userId) {
        const training = await prisma_1.default.training.findUnique({
            where: { id }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        // Validate dates if both provided
        if (data.startDate && data.endDate) {
            if (new Date(data.startDate) >= new Date(data.endDate)) {
                throw new appError_1.AppError('End date must be after start date', 400);
            }
        }
        else if (data.startDate && training.endDate) {
            if (new Date(data.startDate) >= new Date(training.endDate)) {
                throw new appError_1.AppError('End date must be after start date', 400);
            }
        }
        else if (data.endDate && training.startDate) {
            if (new Date(training.startDate) >= new Date(data.endDate)) {
                throw new appError_1.AppError('End date must be after start date', 400);
            }
        }
        // Validate venue if provided
        if (data.venueId) {
            const venue = await prisma_1.default.venue.findUnique({
                where: { id: data.venueId }
            });
            if (!venue) {
                throw new appError_1.AppError('Venue not found', 404);
            }
        }
        // Validate trainer if provided
        if (data.trainerId) {
            const trainer = await prisma_1.default.trainer.findUnique({
                where: { id: data.trainerId }
            });
            if (!trainer) {
                throw new appError_1.AppError('Trainer not found', 404);
            }
        }
        // Validate competencies if provided
        if (data.taggedCompetencies && data.taggedCompetencies.length > 0) {
            const competencies = await prisma_1.default.competency.findMany({
                where: {
                    id: { in: data.taggedCompetencies }
                }
            });
            if (competencies.length !== data.taggedCompetencies.length) {
                throw new appError_1.AppError('One or more competencies not found', 404);
            }
        }
        // Check schedule conflicts if dates/trainer/venue changed
        if (data.startDate || data.endDate || data.trainerId || data.venueId) {
            const startDate = data.startDate || training.startDate;
            const endDate = data.endDate || training.endDate;
            const trainerId = data.trainerId || training.trainerId;
            const venueId = data.venueId || training.venueId;
            await this.validateSchedule(trainerId, venueId, startDate, endDate, id);
        }
        const updated = await prisma_1.default.training.update({
            where: { id },
            data: {
                ...data,
                updatedBy: userId
            },
            include: {
                venue: true,
                trainer: true,
                creator: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        // If status changed to COMPLETED, trigger competency updates
        if (data.status === client_1.TrainingStatus.COMPLETED && training.status !== client_1.TrainingStatus.COMPLETED) {
            // Run asynchronously to not block the response
            this.competencyUpdateService.processCompetencyUpdate(id).catch(err => {
                console.error('Error processing competency updates:', err);
            });
        }
        return updated;
    }
    /**
     * Delete training
     */
    async deleteTraining(id) {
        const training = await prisma_1.default.training.findUnique({
            where: { id },
            include: {
                enrollments: true
            }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        // Prevent deletion if there are enrollments
        if (training.enrollments.length > 0) {
            throw new appError_1.AppError('Cannot delete training with existing enrollments', 400);
        }
        return prisma_1.default.training.delete({
            where: { id }
        });
    }
    /**
     * Validate schedule - check for overlapping trainings
     */
    async validateSchedule(trainerId, venueId, startDate, endDate, excludeTrainingId) {
        const where = {
            OR: [
                {
                    AND: [
                        { startDate: { lte: new Date(endDate) } },
                        { endDate: { gte: new Date(startDate) } }
                    ]
                }
            ]
        };
        if (excludeTrainingId) {
            where.id = { not: excludeTrainingId };
        }
        // Check trainer conflicts
        if (trainerId) {
            const trainerConflicts = await prisma_1.default.training.findFirst({
                where: {
                    ...where,
                    trainerId,
                    status: { not: client_1.TrainingStatus.CANCELLED }
                }
            });
            if (trainerConflicts) {
                throw new appError_1.AppError('Trainer has a conflicting training scheduled', 400);
            }
        }
        // Check venue conflicts
        if (venueId) {
            const venueConflicts = await prisma_1.default.training.findFirst({
                where: {
                    ...where,
                    venueId,
                    status: { not: client_1.TrainingStatus.CANCELLED }
                }
            });
            if (venueConflicts) {
                throw new appError_1.AppError('Venue has a conflicting training scheduled', 400);
            }
        }
    }
    /**
     * Auto-suggest trainings for an employee based on gap competencies
     */
    async suggestTrainingsForEmployee(employeeId) {
        // Get employee's gap analyses
        const gapAnalyses = await prisma_1.default.gapAnalysis.findMany({
            where: {
                employeeId,
                gap: { gt: 0 } // Only gaps > 0
            },
            include: {
                competency: true
            }
        });
        if (gapAnalyses.length === 0) {
            return [];
        }
        const gapCompetencyIds = gapAnalyses.map(ga => ga.competencyId);
        // Find trainings that match any gap competency
        const trainings = await prisma_1.default.training.findMany({
            where: {
                status: { in: [client_1.TrainingStatus.OPEN, client_1.TrainingStatus.ONGOING] },
                taggedCompetencies: {
                    hasSome: gapCompetencyIds
                },
                startDate: { gte: new Date() } // Only future trainings
            },
            include: {
                venue: true,
                trainer: true,
                enrollments: {
                    select: {
                        id: true,
                        status: true
                    }
                }
            }
        });
        // Score and sort by relevance (number of matching competencies)
        const scoredTrainings = trainings.map(training => {
            const matchingCompetencies = training.taggedCompetencies.filter(compId => gapCompetencyIds.includes(compId));
            const enrolledCount = training.enrollments.filter(e => e.status === 'APPROVED').length;
            const hasSpace = enrolledCount < training.maxParticipants;
            return {
                ...training,
                relevanceScore: matchingCompetencies.length,
                matchingCompetencies,
                enrolledCount,
                hasSpace
            };
        });
        // Sort by relevance score (descending) and filter out full trainings
        return scoredTrainings
            .filter(t => t.hasSpace)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
}
exports.TrainingService = TrainingService;
