import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { checkPromotionEligibility, calculateCompetencyMatchScore } from '../utils/scoring.utils';

export class PromotionService {
  /**
   * Get promotion pipeline - employees eligible for promotion
   */
  async getPromotionPipeline(filters?: {
    roleId?: string;
    department?: string;
    minScore?: number;
  }) {
    const where: any = {
      readinessStatus: { in: ['READY_NOW', 'READY_6_MONTHS'] }
    };
    
    if (filters?.roleId) {
      where.roleId = filters.roleId;
    }
    
    if (filters?.minScore) {
      where.overallScore = { gte: filters.minScore };
    }

    const candidates = await prisma.talentPool.findMany({
      where,
      include: {
        role: {
          include: {
            jobRole: true
          }
        },
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
      orderBy: [
        { readinessStatus: 'asc' },
        { overallScore: 'desc' }
      ]
    });

    // Filter by department if specified
    const filtered = filters?.department
      ? candidates.filter(c => c.employee.department === filters.department)
      : candidates;

    // Check eligibility for each candidate
    const eligibilityChecks = await Promise.all(
      filtered.map(async (candidate) => {
        const eligibility = await this.checkCandidateEligibility(candidate);
        return {
          ...candidate,
          eligibility,
        };
      })
    );

    // Separate by eligibility
    const eligible = eligibilityChecks.filter(c => c.eligibility.eligible);
    const notYetEligible = eligibilityChecks.filter(c => !c.eligibility.eligible);

    return {
      summary: {
        totalCandidates: filtered.length,
        eligibleCount: eligible.length,
        notYetEligibleCount: notYetEligible.length,
      },
      eligible: eligible.map(c => ({
        id: c.id,
        employeeId: c.employeeId,
        employee: c.employee,
        roleName: c.role.jobRole.name,
        overallScore: c.overallScore,
        readinessStatus: c.readinessStatus,
        eligibility: c.eligibility,
      })),
      notYetEligible: notYetEligible.map(c => ({
        id: c.id,
        employeeId: c.employeeId,
        employee: c.employee,
        roleName: c.role.jobRole.name,
        overallScore: c.overallScore,
        readinessStatus: c.readinessStatus,
        eligibility: c.eligibility,
      })),
    };
  }

  /**
   * Check individual candidate's promotion eligibility
   */
  private async checkCandidateEligibility(talentPool: any) {
    const employeeId = talentPool.employeeId;
    const roleId = talentPool.roleId;

    // Get critical role with requirements
    const criticalRole = await prisma.criticalRole.findUnique({
      where: { id: roleId }
    });

    if (!criticalRole) {
      return { eligible: false, reasons: ['Critical role not found'] };
    }

    // Get employee competencies
    const employeeCompetencies = await prisma.employeeCompetency.findMany({
      where: { employeeId }
    });

    // Calculate competency match
    const competencyMatchPercent = calculateCompetencyMatchScore(
      criticalRole.requiredCompetencies,
      employeeCompetencies.map(ec => ({
        competencyId: ec.competencyId,
        finalScore: ec.finalScore,
      }))
    );

    // Get latest performance
    const latestPerformance = await prisma.performance.findFirst({
      where: { employeeId },
      orderBy: { reviewDate: 'desc' }
    });

    // Get IDP progress
    const idp = await prisma.individualDevelopmentPlan.findFirst({
      where: {
        employeeId,
        targetRoleId: roleId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      }
    });

    const competencyThresholdMet = competencyMatchPercent >= 80;
    const performanceAboveMinimum = (latestPerformance?.score || 0) >= 3;
    const idpCompletionPercent = idp?.progress || 0;

    return checkPromotionEligibility({
      competencyThresholdMet,
      performanceAboveMinimum,
      idpCompletionPercent,
      minimumIdpCompletion: 80,
    });
  }

  /**
   * Send promotion notification/alert
   */
  async sendPromotionAlert(data: {
    employeeId: string;
    roleId: string;
    message?: string;
  }) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const criticalRole = await prisma.criticalRole.findUnique({
      where: { id: data.roleId },
      include: {
        jobRole: true
      }
    });

    if (!criticalRole) {
      throw new AppError('Critical role not found', 404);
    }

    // Check if candidate is in talent pool for this role
    const talentPool = await prisma.talentPool.findUnique({
      where: {
        roleId_employeeId: {
          roleId: data.roleId,
          employeeId: data.employeeId
        }
      }
    });

    if (!talentPool) {
      throw new AppError('Employee is not in the talent pool for this role', 400);
    }

    // Create notification
    const defaultMessage = `Congratulations! You have been identified as a promotion candidate for ${criticalRole.jobRole.name}.`;

    const notification = await prisma.notification.create({
      data: {
        employeeId: data.employeeId,
        type: 'PROMOTION_READY',
        message: data.message || defaultMessage,
        metadata: {
          roleId: data.roleId,
          roleName: criticalRole.jobRole.name,
          talentPoolId: talentPool.id,
        }
      }
    });

    return {
      notification,
      message: 'Promotion alert sent successfully'
    };
  }

  /**
   * Get employees who recently became eligible for promotion
   */
  async getNewlyEligibleCandidates(sinceDate?: Date) {
    const since = sinceDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Get candidates who recently reached READY_NOW status
    const candidates = await prisma.talentPool.findMany({
      where: {
        readinessStatus: 'READY_NOW',
        updatedAt: { gte: since }
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
            employeeId: true,
            name: true,
            email: true,
            department: true,
            position: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Filter to only include those who meet eligibility criteria
    const eligibleCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const eligibility = await this.checkCandidateEligibility(candidate);
        if (eligibility.eligible) {
          return {
            ...candidate,
            eligibility,
          };
        }
        return null;
      })
    );

    return eligibleCandidates.filter(c => c !== null);
  }

  /**
   * Generate promotion report for a specific role
   */
  async getPromotionReport(roleId: string) {
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

    const detailedCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const eligibility = await this.checkCandidateEligibility(candidate);
        
        // Get IDP
        const idp = await prisma.individualDevelopmentPlan.findFirst({
          where: {
            employeeId: candidate.employeeId,
            targetRoleId: roleId
          },
          include: {
            goals: true
          }
        });

        // Get latest potential rating
        const potential = await prisma.potentialRating.findFirst({
          where: { employeeId: candidate.employeeId },
          orderBy: { createdAt: 'desc' }
        });

        return {
          employee: candidate.employee,
          scores: {
            overall: candidate.overallScore,
            competency: candidate.competencyScore,
            performance: candidate.performanceScore,
            potential: candidate.potentialScore,
          },
          readinessStatus: candidate.readinessStatus,
          riskLevel: candidate.riskLevel,
          riskFactors: candidate.riskFactors,
          eligibility,
          idp: idp ? {
            id: idp.id,
            status: idp.status,
            progress: idp.progress,
            totalGoals: idp.goals.length,
            completedGoals: idp.goals.filter(g => g.completed).length,
          } : null,
          latestPotentialRating: potential?.rating,
        };
      })
    );

    return {
      role: {
        id: criticalRole.id,
        name: criticalRole.jobRole.name,
        description: criticalRole.description,
        requiredCompetencies: criticalRole.requiredCompetencies.length,
      },
      summary: {
        totalCandidates: candidates.length,
        readyNow: candidates.filter(c => c.readinessStatus === 'READY_NOW').length,
        eligible: detailedCandidates.filter(c => c.eligibility.eligible).length,
        withIDPs: detailedCandidates.filter(c => c.idp !== null).length,
        highRisk: candidates.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length,
      },
      candidates: detailedCandidates,
    };
  }
}

