"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
const scoring_utils_1 = require("../utils/scoring.utils");
class CandidateService {
    /**
     * Add employee to talent pool for a critical role
     */
    async addToTalentPool(roleId, employeeId, notes) {
        // Validate critical role exists
        const criticalRole = await prisma_1.default.criticalRole.findUnique({
            where: { id: roleId }
        });
        if (!criticalRole) {
            throw new appError_1.AppError('Critical role not found', 404);
        }
        // Validate employee exists
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Check if already in talent pool
        const existing = await prisma_1.default.talentPool.findUnique({
            where: {
                roleId_employeeId: {
                    roleId,
                    employeeId
                }
            }
        });
        if (existing) {
            throw new appError_1.AppError('Employee is already in the talent pool for this role', 400);
        }
        // Calculate initial scores
        const scores = await this.calculateCandidateScores(roleId, employeeId);
        return prisma_1.default.talentPool.create({
            data: {
                roleId,
                employeeId,
                notes,
                ...scores,
            },
            include: {
                role: {
                    include: {
                        jobRole: true
                    }
                },
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        position: true,
                    }
                }
            }
        });
    }
    /**
     * Get ranked candidates for a critical role
     */
    async getRankedCandidates(roleId) {
        const criticalRole = await prisma_1.default.criticalRole.findUnique({
            where: { id: roleId },
            include: {
                jobRole: true
            }
        });
        if (!criticalRole) {
            throw new appError_1.AppError('Critical role not found', 404);
        }
        const candidates = await prisma_1.default.talentPool.findMany({
            where: { roleId },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        name: true,
                        email: true,
                        department: true,
                        position: true,
                        dateHired: true,
                    }
                }
            },
            orderBy: { overallScore: 'desc' }
        });
        return {
            role: criticalRole,
            candidates,
            totalCandidates: candidates.length,
        };
    }
    /**
     * Remove employee from talent pool
     */
    async removeFromTalentPool(talentPoolId) {
        const existing = await prisma_1.default.talentPool.findUnique({
            where: { id: talentPoolId }
        });
        if (!existing) {
            throw new appError_1.AppError('Talent pool entry not found', 404);
        }
        await prisma_1.default.talentPool.delete({
            where: { id: talentPoolId }
        });
        return { message: 'Removed from talent pool successfully' };
    }
    /**
     * Rate employee's potential
     */
    async ratePotential(employeeId, rating, comments, assessorId) {
        // Validate employee exists
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Validate rating is 1-5
        if (rating < 1 || rating > 5) {
            throw new appError_1.AppError('Rating must be between 1 and 5', 400);
        }
        // Create potential rating
        const potentialRating = await prisma_1.default.potentialRating.create({
            data: {
                employeeId,
                rating,
                comments,
                assessedBy: assessorId,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                assessor: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        // Recalculate scores for all talent pool entries for this employee
        await this.recalculateEmployeeScores(employeeId);
        return potentialRating;
    }
    /**
     * Get employee's candidate score and details
     */
    async getCandidateScore(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId },
            include: {
                competencies: {
                    include: {
                        competency: true
                    }
                },
                performance: {
                    orderBy: { reviewDate: 'desc' },
                    take: 1
                },
                potentialRatings: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                talentPools: {
                    include: {
                        role: {
                            include: {
                                jobRole: true
                            }
                        }
                    }
                },
                idps: {
                    include: {
                        targetRole: {
                            include: {
                                jobRole: true
                            }
                        },
                        goals: true
                    }
                }
            }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        const latestPerformance = employee.performance[0];
        const latestPotential = employee.potentialRatings[0];
        return {
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                department: employee.department,
                position: employee.position,
            },
            competencies: employee.competencies.map(c => ({
                competencyId: c.competencyId,
                competencyName: c.competency.name,
                selfRating: c.selfRating,
                managerRating: c.managerRating,
                finalScore: c.finalScore,
            })),
            performance: latestPerformance ? {
                score: latestPerformance.score,
                reviewDate: latestPerformance.reviewDate,
                feedback: latestPerformance.feedback,
            } : null,
            potential: latestPotential ? {
                rating: latestPotential.rating,
                comments: latestPotential.comments,
                assessedAt: latestPotential.createdAt,
            } : null,
            talentPools: employee.talentPools.map(tp => ({
                id: tp.id,
                roleName: tp.role.jobRole.name,
                overallScore: tp.overallScore,
                competencyScore: tp.competencyScore,
                performanceScore: tp.performanceScore,
                potentialScore: tp.potentialScore,
                readinessStatus: tp.readinessStatus,
                riskLevel: tp.riskLevel,
                riskFactors: tp.riskFactors,
            })),
            idps: employee.idps.map(idp => ({
                id: idp.id,
                targetRoleName: idp.targetRole.jobRole.name,
                status: idp.status,
                progress: idp.progress,
                goalCount: idp.goals.length,
                completedGoals: idp.goals.filter(g => g.completed).length,
            })),
        };
    }
    /**
     * Calculate candidate scores for a specific role
     */
    async calculateCandidateScores(roleId, employeeId) {
        const criticalRole = await prisma_1.default.criticalRole.findUnique({
            where: { id: roleId }
        });
        if (!criticalRole) {
            throw new appError_1.AppError('Critical role not found', 404);
        }
        // Get employee competencies
        const employeeCompetencies = await prisma_1.default.employeeCompetency.findMany({
            where: { employeeId }
        });
        // Get latest performance
        const latestPerformance = await prisma_1.default.performance.findFirst({
            where: { employeeId },
            orderBy: { reviewDate: 'desc' }
        });
        // Get latest potential rating
        const latestPotential = await prisma_1.default.potentialRating.findFirst({
            where: { employeeId },
            orderBy: { createdAt: 'desc' }
        });
        // Calculate competency match score
        const competencyScore = (0, scoring_utils_1.calculateCompetencyMatchScore)(criticalRole.requiredCompetencies, employeeCompetencies.map(ec => ({
            competencyId: ec.competencyId,
            finalScore: ec.finalScore,
        })));
        const performanceScore = (0, scoring_utils_1.normalizePerformanceScore)(latestPerformance?.score);
        const potentialScore = latestPotential?.rating ? latestPotential.rating * 20 : 0;
        const overallScore = (0, scoring_utils_1.calculateOverallScore)(competencyScore, latestPerformance?.score || 0, latestPotential?.rating || 0);
        // Get IDP progress for this role
        const idp = await prisma_1.default.individualDevelopmentPlan.findFirst({
            where: {
                employeeId,
                targetRoleId: roleId,
            }
        });
        const readinessStatus = (0, scoring_utils_1.determineReadinessStatus)(overallScore, idp?.progress);
        // Calculate risk
        const enrollments = await prisma_1.default.enrollment.findMany({
            where: { employeeId },
            orderBy: { enrolledAt: 'desc' },
            take: 1
        });
        const lastLearningActivity = enrollments[0]?.lastActivity || enrollments[0]?.enrolledAt;
        const noRecentLearning = !lastLearningActivity ||
            (Date.now() - new Date(lastLearningActivity).getTime()) > 90 * 24 * 60 * 60 * 1000; // 90 days
        const { riskLevel, riskFactors } = (0, scoring_utils_1.calculateRiskLevel)({
            noRecentLearning,
            performanceScore: latestPerformance?.score,
            potentialRating: latestPotential?.rating,
        });
        return {
            overallScore,
            competencyScore,
            performanceScore,
            potentialScore,
            readinessStatus,
            riskLevel,
            riskFactors,
        };
    }
    /**
     * Recalculate scores for all talent pool entries for an employee
     */
    async recalculateEmployeeScores(employeeId) {
        const talentPoolEntries = await prisma_1.default.talentPool.findMany({
            where: { employeeId }
        });
        for (const entry of talentPoolEntries) {
            const scores = await this.calculateCandidateScores(entry.roleId, employeeId);
            await prisma_1.default.talentPool.update({
                where: { id: entry.id },
                data: scores
            });
        }
    }
    /**
     * Recalculate scores for all candidates in a role's talent pool
     */
    async recalculateRoleScores(roleId) {
        const talentPoolEntries = await prisma_1.default.talentPool.findMany({
            where: { roleId }
        });
        for (const entry of talentPoolEntries) {
            const scores = await this.calculateCandidateScores(roleId, entry.employeeId);
            await prisma_1.default.talentPool.update({
                where: { id: entry.id },
                data: scores
            });
        }
        return { message: `Recalculated scores for ${talentPoolEntries.length} candidates` };
    }
    /**
     * Get potential rating history for an employee
     */
    async getPotentialRatingHistory(employeeId) {
        const ratings = await prisma_1.default.potentialRating.findMany({
            where: { employeeId },
            include: {
                assessor: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return ratings;
    }
}
exports.CandidateService = CandidateService;
