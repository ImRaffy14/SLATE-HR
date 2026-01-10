import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import {
  calculateCompetencyMatchScore,
  calculateOverallScore,
  determineReadinessStatus,
  calculateRiskLevel,
  normalizePerformanceScore,
} from '../utils/scoring.utils';

export class CandidateService {
  /**
   * Add employee to talent pool for a critical role
   */
  async addToTalentPool(roleId: string, employeeId: string, notes?: string) {
    // Validate critical role exists
    const criticalRole = await prisma.criticalRole.findUnique({
      where: { id: roleId }
    });

    if (!criticalRole) {
      throw new AppError('Critical role not found', 404);
    }

    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Check if already in talent pool
    const existing = await prisma.talentPool.findUnique({
      where: {
        roleId_employeeId: {
          roleId,
          employeeId
        }
      }
    });

    if (existing) {
      throw new AppError('Employee is already in the talent pool for this role', 400);
    }

    // Calculate initial scores
    const scores = await this.calculateCandidateScores(roleId, employeeId);

    return prisma.talentPool.create({
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
  async getRankedCandidates(roleId: string) {
    const criticalRole = await prisma.criticalRole.findUnique({
      where: { id: roleId },
      include: {
        jobRole: true
      }
    });

    if (!criticalRole) {
      throw new AppError('Critical role not found', 404);
    }

    const candidates = await prisma.talentPool.findMany({
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
  async removeFromTalentPool(talentPoolId: string) {
    const existing = await prisma.talentPool.findUnique({
      where: { id: talentPoolId }
    });

    if (!existing) {
      throw new AppError('Talent pool entry not found', 404);
    }

    await prisma.talentPool.delete({
      where: { id: talentPoolId }
    });

    return { message: 'Removed from talent pool successfully' };
  }

  /**
   * Rate employee's potential
   */
  async ratePotential(employeeId: string, rating: number, comments: string | undefined, assessorId: string) {
    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Validate rating is 1-5
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Create potential rating
    const potentialRating = await prisma.potentialRating.create({
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
  async getCandidateScore(employeeId: string) {
    const employee = await prisma.employee.findUnique({
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
      throw new AppError('Employee not found', 404);
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
  private async calculateCandidateScores(roleId: string, employeeId: string) {
    const criticalRole = await prisma.criticalRole.findUnique({
      where: { id: roleId }
    });

    if (!criticalRole) {
      throw new AppError('Critical role not found', 404);
    }

    // Get employee competencies
    const employeeCompetencies = await prisma.employeeCompetency.findMany({
      where: { employeeId }
    });

    // Get latest performance
    const latestPerformance = await prisma.performance.findFirst({
      where: { employeeId },
      orderBy: { reviewDate: 'desc' }
    });

    // Get latest potential rating
    const latestPotential = await prisma.potentialRating.findFirst({
      where: { employeeId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate competency match score
    const competencyScore = calculateCompetencyMatchScore(
      criticalRole.requiredCompetencies,
      employeeCompetencies.map(ec => ({
        competencyId: ec.competencyId,
        finalScore: ec.finalScore,
      }))
    );

    const performanceScore = normalizePerformanceScore(latestPerformance?.score);
    const potentialScore = latestPotential?.rating ? latestPotential.rating * 20 : 0;

    const overallScore = calculateOverallScore(
      competencyScore,
      latestPerformance?.score || 0,
      latestPotential?.rating || 0
    );

    // Get IDP progress for this role
    const idp = await prisma.individualDevelopmentPlan.findFirst({
      where: {
        employeeId,
        targetRoleId: roleId,
      }
    });

    const readinessStatus = determineReadinessStatus(overallScore, idp?.progress);

    // Calculate risk
    const enrollments = await prisma.enrollment.findMany({
      where: { employeeId },
      orderBy: { enrolledAt: 'desc' },
      take: 1
    });

    const lastLearningActivity = enrollments[0]?.lastActivity || enrollments[0]?.enrolledAt;
    const noRecentLearning = !lastLearningActivity || 
      (Date.now() - new Date(lastLearningActivity).getTime()) > 90 * 24 * 60 * 60 * 1000; // 90 days

    const { riskLevel, riskFactors } = calculateRiskLevel({
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
  async recalculateEmployeeScores(employeeId: string) {
    const talentPoolEntries = await prisma.talentPool.findMany({
      where: { employeeId }
    });

    for (const entry of talentPoolEntries) {
      const scores = await this.calculateCandidateScores(entry.roleId, employeeId);
      await prisma.talentPool.update({
        where: { id: entry.id },
        data: scores
      });
    }
  }

  /**
   * Recalculate scores for all candidates in a role's talent pool
   */
  async recalculateRoleScores(roleId: string) {
    const talentPoolEntries = await prisma.talentPool.findMany({
      where: { roleId }
    });

    for (const entry of talentPoolEntries) {
      const scores = await this.calculateCandidateScores(roleId, entry.employeeId);
      await prisma.talentPool.update({
        where: { id: entry.id },
        data: scores
      });
    }

    return { message: `Recalculated scores for ${talentPoolEntries.length} candidates` };
  }

  /**
   * Get potential rating history for an employee
   */
  async getPotentialRatingHistory(employeeId: string) {
    const ratings = await prisma.potentialRating.findMany({
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

