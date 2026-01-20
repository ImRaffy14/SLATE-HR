"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingRecommendationService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
class TrainingRecommendationService {
    // Create recommendation
    async createRecommendation(data) {
        // Validate competency exists
        const competency = await prisma_1.default.competency.findUnique({
            where: { id: data.competencyId }
        });
        if (!competency) {
            throw new appError_1.AppError('Competency not found', 404);
        }
        // Validate difficulty level (1-5)
        if (data.difficultyLevel < 1 || data.difficultyLevel > 5) {
            throw new appError_1.AppError('Difficulty level must be between 1 and 5', 400);
        }
        // Clean up courseId - convert empty string to null
        const courseId = data.courseId && data.courseId.trim() !== "" ? data.courseId.trim() : null;
        // Validate course exists if courseId provided
        if (courseId) {
            const course = await prisma_1.default.course.findUnique({
                where: { id: courseId }
            });
            if (!course) {
                throw new appError_1.AppError('Course not found', 404);
            }
        }
        return prisma_1.default.trainingRecommendation.create({
            data: {
                competencyId: data.competencyId,
                title: data.title,
                description: data.description,
                link: data.link,
                difficultyLevel: data.difficultyLevel,
                courseId: courseId,
            },
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });
    }
    // Get all recommendations
    async getRecommendations() {
        return prisma_1.default.trainingRecommendation.findMany({
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    // Get recommendations by competency
    async getRecommendationsByCompetency(competencyId) {
        const competency = await prisma_1.default.competency.findUnique({
            where: { id: competencyId }
        });
        if (!competency) {
            throw new appError_1.AppError('Competency not found', 404);
        }
        return prisma_1.default.trainingRecommendation.findMany({
            where: {
                competencyId: competencyId
            },
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            },
            orderBy: {
                difficultyLevel: 'asc'
            }
        });
    }
    // Get recommendations by difficulty level
    async getRecommendationsByDifficulty(difficultyLevel) {
        if (difficultyLevel < 1 || difficultyLevel > 5) {
            throw new appError_1.AppError('Difficulty level must be between 1 and 5', 400);
        }
        return prisma_1.default.trainingRecommendation.findMany({
            where: {
                difficultyLevel: difficultyLevel
            },
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    // Get single recommendation by ID
    async getRecommendationById(id) {
        const recommendation = await prisma_1.default.trainingRecommendation.findUnique({
            where: { id },
            include: {
                competency: {
                    include: {
                        category: true
                    }
                },
                course: true
            }
        });
        if (!recommendation) {
            throw new appError_1.AppError('Training recommendation not found', 404);
        }
        return recommendation;
    }
    // Update recommendation
    async updateRecommendation(id, data) {
        const recommendation = await prisma_1.default.trainingRecommendation.findUnique({
            where: { id }
        });
        if (!recommendation) {
            throw new appError_1.AppError('Training recommendation not found', 404);
        }
        // Validate difficulty level if provided
        if (data.difficultyLevel !== undefined) {
            if (data.difficultyLevel < 1 || data.difficultyLevel > 5) {
                throw new appError_1.AppError('Difficulty level must be between 1 and 5', 400);
            }
        }
        // Clean up courseId - convert empty string to null
        let courseId = data.courseId;
        if (courseId !== undefined) {
            courseId = courseId && courseId.trim() !== "" ? courseId.trim() : null;
        }
        // Validate course exists if courseId provided
        if (courseId) {
            const course = await prisma_1.default.course.findUnique({
                where: { id: courseId }
            });
            if (!course) {
                throw new appError_1.AppError('Course not found', 404);
            }
        }
        return prisma_1.default.trainingRecommendation.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.link !== undefined && { link: data.link }),
                ...(data.difficultyLevel !== undefined && { difficultyLevel: data.difficultyLevel }),
                ...(courseId !== undefined && { courseId: courseId }),
            },
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });
    }
    // Delete recommendation
    async deleteRecommendation(id) {
        const recommendation = await prisma_1.default.trainingRecommendation.findUnique({
            where: { id }
        });
        if (!recommendation) {
            throw new appError_1.AppError('Training recommendation not found', 404);
        }
        return prisma_1.default.trainingRecommendation.delete({
            where: { id }
        });
    }
}
exports.TrainingRecommendationService = TrainingRecommendationService;
