"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetencyService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
const validation_1 = require("../utils/validation");
const fileUpload_service_1 = require("./fileUpload.service");
class CompetencyService {
    // Create competency with validations
    async createCompetencyService(data, userId) {
        // Validate category exists
        const category = await prisma_1.default.competencyCategory.findUnique({
            where: { id: data.categoryId }
        });
        if (!category) {
            throw new appError_1.AppError('Category not found', 404);
        }
        // Validate weight
        (0, validation_1.validateWeight)(data.weight);
        // Validate proficiency levels
        (0, validation_1.validateProficiencyLevels)(data.levels);
        // Check for duplicate competency name in same category
        const existingCompetency = await prisma_1.default.competency.findFirst({
            where: {
                name: {
                    equals: data.name,
                    mode: 'insensitive'
                },
                categoryId: data.categoryId
            }
        });
        if (existingCompetency) {
            throw new appError_1.AppError('Competency with this name already exists in this category', 400);
        }
        return prisma_1.default.competency.create({
            data: {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                levels: data.levels,
                weight: data.weight,
                createdBy: userId,
            },
            include: {
                category: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
    }
    // Get all competencies (optionally filter by job role ID)
    async getCompetenciesService(jobRoleId) {
        // If jobRoleId is provided, first get categories that match the job role
        let categoryIds;
        if (jobRoleId) {
            const matchingCategories = await prisma_1.default.competencyCategory.findMany({
                where: {
                    jobRoleIds: {
                        has: jobRoleId
                    }
                },
                select: { id: true }
            });
            categoryIds = matchingCategories.map(cat => cat.id);
        }
        const whereClause = categoryIds && categoryIds.length > 0
            ? {
                categoryId: {
                    in: categoryIds
                }
            }
            : jobRoleId ? { categoryId: { in: [] } } : undefined; // Empty result if jobRole provided but no categories match
        return prisma_1.default.competency.findMany({
            where: whereClause,
            include: {
                category: true,
                employeeCompetencies: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                employeeId: true,
                            }
                        }
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                updater: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    // Get competencies by employee's positionId
    async getCompetenciesByEmployeePosition(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId },
            select: { positionId: true }
        });
        if (!employee || !employee.positionId) {
            // If employee has no positionId, return all competencies
            return this.getCompetenciesService();
        }
        return this.getCompetenciesService(employee.positionId);
    }
    // Get competencies by job role ID
    async getCompetenciesByJobRoleId(jobRoleId) {
        return this.getCompetenciesService(jobRoleId);
    }
    // Get single competency by ID
    async getCompetencyById(id) {
        const competency = await prisma_1.default.competency.findUnique({
            where: { id },
            include: {
                category: true,
                employeeCompetencies: {
                    include: {
                        employee: true
                    }
                },
                recommendations: true
            }
        });
        if (!competency) {
            throw new appError_1.AppError('Competency not found', 404);
        }
        return competency;
    }
    // Update competency
    async updateCompetencyService(id, data, userId) {
        const competency = await prisma_1.default.competency.findUnique({
            where: { id }
        });
        if (!competency) {
            throw new appError_1.AppError('Competency not found', 404);
        }
        // Validate category if provided
        if (data.categoryId) {
            const category = await prisma_1.default.competencyCategory.findUnique({
                where: { id: data.categoryId }
            });
            if (!category) {
                throw new appError_1.AppError('Category not found', 404);
            }
        }
        // Validate weight if provided
        if (data.weight !== undefined) {
            (0, validation_1.validateWeight)(data.weight);
        }
        // Validate levels if provided
        if (data.levels) {
            (0, validation_1.validateProficiencyLevels)(data.levels);
        }
        // Check for duplicate name if name is being updated
        if (data.name && data.name !== competency.name) {
            const categoryIdToCheck = data.categoryId || competency.categoryId;
            const existingCompetency = await prisma_1.default.competency.findFirst({
                where: {
                    name: {
                        equals: data.name,
                        mode: 'insensitive'
                    },
                    categoryId: categoryIdToCheck,
                    NOT: {
                        id: id
                    }
                }
            });
            if (existingCompetency) {
                throw new appError_1.AppError('Competency with this name already exists in this category', 400);
            }
        }
        return prisma_1.default.competency.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.categoryId && { categoryId: data.categoryId }),
                ...(data.levels && { levels: data.levels }),
                ...(data.weight !== undefined && { weight: data.weight }),
                updatedBy: userId,
            },
            include: {
                category: true,
                employeeCompetencies: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        });
    }
    // Delete competency
    async deleteCompetencyService(id) {
        const competency = await prisma_1.default.competency.findUnique({
            where: { id },
            include: {
                employeeCompetencies: true
            }
        });
        if (!competency) {
            throw new appError_1.AppError('Competency not found', 404);
        }
        // Check for EmployeeCompetency dependencies
        if (competency.employeeCompetencies.length > 0) {
            throw new appError_1.AppError(`Cannot delete competency. It has ${competency.employeeCompetencies.length} employee assessment(s). Please remove them first.`, 400);
        }
        return prisma_1.default.competency.delete({
            where: { id }
        });
    }
    // Calculate final score (HR-only rating system)
    calculateFinalScore(managerRating, weight) {
        if (managerRating === null) {
            return null;
        }
        // Final score = managerRating * weight / 100
        return managerRating * (weight / 100);
    }
    // Assign competency to employee
    async assignCompetencyToEmployee(data) {
        // Validate employee exists
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: data.employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Validate competency exists
        const competency = await prisma_1.default.competency.findUnique({
            where: { id: data.competencyId }
        });
        if (!competency) {
            throw new appError_1.AppError('Competency not found', 404);
        }
        // Check if already assigned
        const existing = await prisma_1.default.employeeCompetency.findFirst({
            where: {
                employeeId: data.employeeId,
                competencyId: data.competencyId
            }
        });
        if (existing) {
            throw new appError_1.AppError('Competency already assigned to this employee', 400);
        }
        return prisma_1.default.employeeCompetency.create({
            data: {
                employeeId: data.employeeId,
                competencyId: data.competencyId,
                updatedBy: data.updatedBy,
            },
            include: {
                employee: true,
                competency: {
                    include: {
                        category: true
                    }
                }
            }
        });
    }
    // Update self-rating (deprecated - kept for backward compatibility, will be removed in future ESS integration)
    async updateSelfRating(id, selfRating) {
        (0, validation_1.validateRating)(selfRating, 'Self-rating');
        const employeeCompetency = await prisma_1.default.employeeCompetency.findUnique({
            where: { id },
            include: {
                competency: true
            }
        });
        if (!employeeCompetency) {
            throw new appError_1.AppError('Employee competency record not found', 404);
        }
        // Self-rating is stored but not used in final score calculation
        // Final score is calculated only from manager rating
        const finalScore = this.calculateFinalScore(employeeCompetency.managerRating, employeeCompetency.competency.weight);
        const updated = await prisma_1.default.employeeCompetency.update({
            where: { id },
            data: {
                selfRating,
                finalScore,
            },
            include: {
                employee: true,
                competency: {
                    include: {
                        category: true
                    }
                }
            }
        });
        // Auto-run gap analysis after score update
        await this.runGapAnalysis(employeeCompetency.employeeId, employeeCompetency.competencyId);
        return updated;
    }
    // Update manager rating
    async updateManagerRating(id, managerRating, updatedBy, notes) {
        (0, validation_1.validateRating)(managerRating, 'Manager rating');
        const employeeCompetency = await prisma_1.default.employeeCompetency.findUnique({
            where: { id },
            include: {
                competency: true
            }
        });
        if (!employeeCompetency) {
            throw new appError_1.AppError('Employee competency record not found', 404);
        }
        // Final score is calculated only from manager rating
        const finalScore = this.calculateFinalScore(managerRating, employeeCompetency.competency.weight);
        const updated = await prisma_1.default.employeeCompetency.update({
            where: { id },
            data: {
                managerRating,
                finalScore,
                notes,
                updatedBy,
            },
            include: {
                employee: true,
                competency: {
                    include: {
                        category: true
                    }
                }
            }
        });
        // Auto-run gap analysis after score update
        await this.runGapAnalysis(employeeCompetency.employeeId, employeeCompetency.competencyId);
        return updated;
    }
    // Upload attachment
    async uploadAttachment(id, file) {
        const employeeCompetency = await prisma_1.default.employeeCompetency.findUnique({
            where: { id },
            include: {
                competency: true
            }
        });
        if (!employeeCompetency) {
            throw new appError_1.AppError('Employee competency record not found', 404);
        }
        // Upload file to Cloudinary
        const uploadResult = await (0, fileUpload_service_1.uploadFile)(file.buffer, 'competency-attachments', file.mimetype);
        // Add URL to attachments array
        const updatedAttachments = [...(employeeCompetency.attachments || []), uploadResult.url];
        const updated = await prisma_1.default.employeeCompetency.update({
            where: { id },
            data: {
                attachments: updatedAttachments,
            },
            include: {
                employee: true,
                competency: true
            }
        });
        // Auto-check if certificate is relevant and potentially boost score
        // This is a simplified check - can be enhanced with keyword matching
        // For now, we'll just notify that HR should review
        // In a real system, you might want to add a flag for HR review
        return updated;
    }
    // Get employee competencies
    async getEmployeeCompetencies(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        return prisma_1.default.employeeCompetency.findMany({
            where: {
                employeeId: employeeId
            },
            include: {
                competency: {
                    include: {
                        category: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
    }
    // Get suggested competencies for employee based on their job role
    async getSuggestedCompetenciesForEmployee(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId },
            include: {
                jobRole: true
            }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        if (!employee.positionId) {
            // If employee has no job role, return empty array
            return [];
        }
        // Get all categories that include this employee's job role
        const categories = await prisma_1.default.competencyCategory.findMany({
            where: {
                jobRoleIds: {
                    has: employee.positionId
                }
            },
            include: {
                competencies: {
                    include: {
                        employeeCompetencies: {
                            where: {
                                employeeId: employeeId
                            }
                        }
                    }
                }
            }
        });
        // Get already assigned competency IDs
        const assignedCompetencyIds = await prisma_1.default.employeeCompetency.findMany({
            where: {
                employeeId: employeeId
            },
            select: {
                competencyId: true
            }
        });
        const assignedIds = new Set(assignedCompetencyIds.map(ec => ec.competencyId));
        // Group suggested competencies by category
        const suggestedByCategory = categories.map(category => ({
            category: {
                id: category.id,
                name: category.name,
                description: category.description
            },
            competencies: category.competencies
                .filter(comp => !assignedIds.has(comp.id))
                .map(comp => ({
                id: comp.id,
                name: comp.name,
                description: comp.description,
                weight: comp.weight,
                levels: comp.levels
            }))
        })).filter(group => group.competencies.length > 0);
        return suggestedByCategory;
    }
    // Batch update manager ratings for multiple competencies
    async batchUpdateManagerRatings(data) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: data.employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Validate all competencies exist and belong to the employee
        const employeeCompetencyIds = await prisma_1.default.employeeCompetency.findMany({
            where: {
                employeeId: data.employeeId,
                competencyId: {
                    in: data.ratings.map(r => r.competencyId)
                }
            },
            include: {
                competency: true
            }
        });
        if (employeeCompetencyIds.length !== data.ratings.length) {
            throw new appError_1.AppError('One or more competencies are not assigned to this employee', 400);
        }
        // Validate all ratings
        for (const rating of data.ratings) {
            (0, validation_1.validateRating)(rating.rating, 'Manager rating');
        }
        // Update all ratings in a transaction
        const updated = await Promise.all(data.ratings.map(async (rating) => {
            const employeeCompetency = employeeCompetencyIds.find(ec => ec.competencyId === rating.competencyId);
            if (!employeeCompetency) {
                throw new appError_1.AppError(`Competency ${rating.competencyId} not found for employee`, 404);
            }
            const finalScore = this.calculateFinalScore(rating.rating, employeeCompetency.competency.weight);
            return prisma_1.default.employeeCompetency.update({
                where: { id: employeeCompetency.id },
                data: {
                    managerRating: rating.rating,
                    finalScore,
                    notes: rating.notes,
                    updatedBy: data.updatedBy,
                },
                include: {
                    employee: true,
                    competency: {
                        include: {
                            category: true
                        }
                    }
                }
            });
        }));
        // Run gap analysis for all updated competencies
        await Promise.all(data.ratings.map(rating => this.runGapAnalysis(data.employeeId, rating.competencyId)));
        return updated;
    }
    // Run gap analysis
    async runGapAnalysis(employeeId, competencyId) {
        const employeeCompetency = await prisma_1.default.employeeCompetency.findFirst({
            where: {
                employeeId,
                competencyId
            },
            include: {
                competency: true
            }
        });
        if (!employeeCompetency) {
            throw new appError_1.AppError('Employee competency record not found', 404);
        }
        // Get required level from competency (highest level number)
        const requiredLevel = employeeCompetency.competency.levels.length > 0
            ? Math.max(...employeeCompetency.competency.levels.map(l => l.levelNumber))
            : 5; // Default to 5 if no levels defined
        // Derive current level from finalScore
        // Map finalScore (0-5 range after weight) to level 1-5
        let currentLevel = 1;
        if (employeeCompetency.finalScore !== null) {
            // Normalize finalScore back to 1-5 scale (assuming weight was applied)
            const normalizedScore = employeeCompetency.finalScore / (employeeCompetency.competency.weight / 100);
            currentLevel = Math.max(1, Math.min(5, Math.round(normalizedScore)));
        }
        const gap = requiredLevel - currentLevel;
        // Find or update gap analysis
        const existingGap = await prisma_1.default.gapAnalysis.findFirst({
            where: {
                employeeId,
                competencyId
            }
        });
        if (existingGap) {
            // Update existing gap analysis
            const updated = await prisma_1.default.gapAnalysis.update({
                where: { id: existingGap.id },
                data: {
                    requiredLevel,
                    currentLevel,
                    gap,
                }
            });
            // Link recommendations if gap > 0
            if (gap > 0) {
                await this.linkRecommendationsToGap(updated.id, competencyId, currentLevel);
            }
            return updated;
        }
        else {
            // Create new gap analysis
            const created = await prisma_1.default.gapAnalysis.create({
                data: {
                    employeeId,
                    competencyId,
                    requiredLevel,
                    currentLevel,
                    gap,
                    recommendations: [],
                },
                include: {
                    competency: true,
                    employee: true
                }
            });
            // Link recommendations if gap > 0
            if (gap > 0) {
                await this.linkRecommendationsToGap(created.id, competencyId, currentLevel);
            }
            return created;
        }
    }
    // Get gap analysis
    async getGapAnalysis(employeeId, competencyId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        if (competencyId) {
            const gapAnalysis = await prisma_1.default.gapAnalysis.findFirst({
                where: {
                    employeeId,
                    competencyId
                },
                include: {
                    competency: {
                        include: {
                            category: true
                        }
                    }
                }
            });
            // Fetch recommendation details if recommendations exist
            if (gapAnalysis && gapAnalysis.recommendations && gapAnalysis.recommendations.length > 0) {
                const recommendationDetails = await prisma_1.default.trainingRecommendation.findMany({
                    where: {
                        id: {
                            in: gapAnalysis.recommendations
                        }
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
                return {
                    ...gapAnalysis,
                    recommendationDetails
                };
            }
            return gapAnalysis;
        }
        const gapAnalyses = await prisma_1.default.gapAnalysis.findMany({
            where: {
                employeeId
            },
            include: {
                competency: {
                    include: {
                        category: true
                    }
                }
            },
            orderBy: {
                gap: 'desc'
            }
        });
        // Fetch recommendation details for all gaps
        const gapAnalysesWithRecommendations = await Promise.all(gapAnalyses.map(async (gap) => {
            if (gap.recommendations && gap.recommendations.length > 0) {
                const recommendationDetails = await prisma_1.default.trainingRecommendation.findMany({
                    where: {
                        id: {
                            in: gap.recommendations
                        }
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
                return {
                    ...gap,
                    recommendationDetails
                };
            }
            return {
                ...gap,
                recommendationDetails: []
            };
        }));
        return gapAnalysesWithRecommendations;
    }
    // Generate gap report
    async generateGapReport(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId },
            include: {
                competencies: {
                    include: {
                        competency: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Run gap analysis for all competencies
        const gapAnalyses = await Promise.all(employee.competencies.map((ec) => this.runGapAnalysis(employeeId, ec.competencyId)));
        const gaps = await prisma_1.default.gapAnalysis.findMany({
            where: {
                employeeId
            },
            include: {
                competency: {
                    include: {
                        category: true,
                        recommendations: true
                    }
                }
            }
        });
        // Calculate summary statistics
        const totalGaps = gaps.filter(g => g.gap > 0).length;
        const criticalGaps = gaps.filter(g => g.gap >= 2).length;
        const totalCompetencies = gaps.length;
        return {
            employee: {
                id: employee.id,
                name: employee.name,
                employeeId: employee.employeeId,
                department: employee.department,
                position: employee.position,
            },
            summary: {
                totalCompetencies,
                totalGaps,
                criticalGaps,
                averageGap: gaps.length > 0
                    ? gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length
                    : 0,
            },
            gaps: gaps.map(gap => ({
                ...gap,
                recommendations: gap.recommendations.map(recId => {
                    // In a real implementation, you'd fetch the actual recommendation
                    // For now, return the ID
                    return recId;
                })
            })),
            gapsByCategory: gaps.reduce((acc, gap) => {
                const categoryName = gap.competency.category.name;
                if (!acc[categoryName]) {
                    acc[categoryName] = {
                        category: categoryName,
                        gaps: [],
                        totalGaps: 0,
                        criticalGaps: 0,
                    };
                }
                acc[categoryName].gaps.push(gap);
                if (gap.gap > 0) {
                    acc[categoryName].totalGaps++;
                }
                if (gap.gap >= 2) {
                    acc[categoryName].criticalGaps++;
                }
                return acc;
            }, {})
        };
    }
    // Get recommendations for employee
    async getRecommendations(employeeId) {
        const gaps = await this.getGapAnalysis(employeeId);
        if (!Array.isArray(gaps) || gaps.length === 0) {
            return [];
        }
        // Get all recommendations for competencies with gaps
        const competencyIds = gaps
            .filter(g => g.gap > 0)
            .map(g => g.competencyId);
        if (competencyIds.length === 0) {
            return [];
        }
        const recommendations = await prisma_1.default.trainingRecommendation.findMany({
            where: {
                competencyId: {
                    in: competencyIds
                }
            },
            include: {
                competency: {
                    include: {
                        category: true
                    }
                },
                course: true
            },
            orderBy: {
                difficultyLevel: 'asc'
            }
        });
        // Group by competency and match with gap level
        return recommendations.map(rec => {
            const gap = gaps.find(g => g.competencyId === rec.competencyId);
            return {
                ...rec,
                gap: gap?.gap || 0,
                currentLevel: gap?.currentLevel || 0,
                requiredLevel: gap?.requiredLevel || 0,
            };
        });
    }
    // Link recommendations to gap
    async linkRecommendationsToGap(gapAnalysisId, competencyId, currentLevel) {
        // Get recommendations that match the competency and are appropriate for the current level
        const recommendations = await prisma_1.default.trainingRecommendation.findMany({
            where: {
                competencyId,
                difficultyLevel: {
                    lte: currentLevel + 1 // Recommendations should be at or slightly above current level
                }
            }
        });
        const recommendationIds = recommendations.map(r => r.id);
        if (recommendationIds.length > 0) {
            await prisma_1.default.gapAnalysis.update({
                where: { id: gapAnalysisId },
                data: {
                    recommendations: recommendationIds
                }
            });
        }
    }
    // Legacy method for backward compatibility (analytics)
    async getAnalyticsService() {
        const competencies = await prisma_1.default.competency.findMany({
            include: {
                category: true,
                employeeCompetencies: {
                    include: {
                        employee: true
                    }
                }
            }
        });
        const analytics = competencies.reduce((acc, comp) => {
            const categoryName = comp.category?.name || "Uncategorized";
            // Initialize category if not exists
            if (!acc.skillGapsByCategory[categoryName]) {
                acc.skillGapsByCategory[categoryName] = { gaps: 0, total: 0 };
            }
            comp.employeeCompetencies.forEach((ec) => {
                const managerRating = ec.managerRating || 0;
                const selfRating = ec.selfRating || 0;
                const finalScore = ec.finalScore || 0;
                acc.skillGapsByCategory[categoryName].total++;
                acc.totalAssessed++;
                // Get required level from competency
                const requiredLevel = comp.levels.length > 0
                    ? Math.max(...comp.levels.map(l => l.levelNumber))
                    : 5;
                // Derive current level from finalScore
                const normalizedScore = finalScore / (comp.weight / 100);
                const currentLevel = Math.max(1, Math.min(5, Math.round(normalizedScore)));
                // Gap count
                if (requiredLevel > currentLevel) {
                    acc.skillGapsByCategory[categoryName].gaps++;
                }
                // Totals for overall analytics
                if (currentLevel >= requiredLevel) {
                    acc.totalProficient++;
                }
                // Gap detected
                if (requiredLevel - currentLevel >= 2) {
                    acc.totalCriticalGaps++;
                }
            });
            // Radar data
            if (comp.employeeCompetencies.length > 0) {
                const avgCurrent = comp.employeeCompetencies.reduce((sum, ec) => {
                    const normalizedScore = (ec.finalScore || 0) / (comp.weight / 100);
                    return sum + Math.max(1, Math.min(5, Math.round(normalizedScore)));
                }, 0) / comp.employeeCompetencies.length;
                const avgRequired = comp.levels.length > 0
                    ? Math.max(...comp.levels.map(l => l.levelNumber))
                    : 5;
                acc.competencyRadarData.push({
                    skill: comp.name,
                    current: avgCurrent,
                    required: avgRequired
                });
            }
            return acc;
        }, {
            skillGapsByCategory: {},
            competencyRadarData: [],
            totalProficient: 0,
            totalCriticalGaps: 0,
            totalAssessed: 0
        });
        return {
            skillGapsByCategory: Object.entries(analytics.skillGapsByCategory).map(([category, data]) => ({
                category,
                gaps: data.gaps,
                total: data.total
            })),
            competencyRadarData: analytics.competencyRadarData,
            totalProficient: analytics.totalProficient,
            totalCriticalGaps: analytics.totalCriticalGaps,
            totalAssessed: analytics.totalAssessed
        };
    }
}
exports.CompetencyService = CompetencyService;
