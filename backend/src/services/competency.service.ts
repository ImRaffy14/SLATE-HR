import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';


export class CompetencyService {
  // Create
  async createCompetencyService(data: any, userId: string) {
    return prisma.competency.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        assessments: {
          include: {
            employee: true
          }
        }
      }
    });
  }

  // Read
  async getCompetenciesService() {
    const competencies = await prisma.competency.findMany({
      include: {
        assessments: {
          include: {
            employee: true,
          },
        },
      },
    });

    return competencies.map((comp) => {
      // Compute average selfScore for this competency
      const totalSelfScore = comp.assessments.reduce(
        (sum, a) => sum + a.selfScore,
        0
      );
      const avgSelfScore =
        comp.assessments.length > 0
          ? totalSelfScore / comp.assessments.length
          : 0;

      return {
        ...comp,
        assessments: comp.assessments.map((assessment) => ({
          ...assessment,
          gap: assessment.hrScore - assessment.selfScore,
        })),
        averageCurrentLevel: {
          requiredLevel: comp.requiredLevel,
          averageSelfScore: avgSelfScore,
        },
      };
    });
  }


  // Update
  async updateCompetencyService(id: string, data: any, userId: string) {
    return prisma.competency.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId
      },
      include: {
        assessments: {
          include: {
            employee: true
          }
        }
      }
    });
  }

  // Delete
  async deleteCompetencyService(id: string) {
    return prisma.competency.delete({ 
      where: { id },
      include: {
        assessments: true
      }
    });
  }

  // Add assessment
  async addAssessmentService(data: any) {    
    return prisma.competencyAssessment.create({
      data: {
        competencyId: data.competencyId,
        employeeId: data.employeeId,
        selfScore: data.currentLevel,
        hrScore: data.requiredLevel,
      },
      include: {
        employee: true,
        competency: true
      }
    });
  }

  async getAnalyticsService() {
    const competencies = await prisma.competency.findMany({
      include: {
        assessments: {
          include: {
            employee: true
          }
        }
      }
    });

    const analytics = competencies.reduce(
      (acc, comp) => {
        const category = comp.category || "Uncategorized";

        // Initialize category if not exists
        if (!acc.skillGapsByCategory[category]) {
          acc.skillGapsByCategory[category] = { gaps: 0, total: 0 };
        }

        comp.assessments.forEach((assessment) => {
          const hrScore = assessment.hrScore || 0;
          const selfScore = assessment.selfScore || 0;

          acc.skillGapsByCategory[category].total++;
          acc.totalAssessed++; // count all assessments

          // Gap count
          if (hrScore < selfScore) {
            acc.skillGapsByCategory[category].gaps++;
          }

          // Totals for overall analytics
          if (selfScore >= hrScore) {
            acc.totalProficient++;
          }
          // Gap detected
          if (hrScore - selfScore >= 2) {
            acc.totalCriticalGaps++; // big enough gap
          }
        });

        // Radar data
        if (comp.assessments.length > 0) {
          const avgCurrent =
            comp.assessments.reduce((sum, a) => sum + (a.hrScore || 0), 0) /
            comp.assessments.length;
          const avgRequired =
            comp.assessments.reduce((sum, a) => sum + (a.selfScore || 0), 0) /
            comp.assessments.length;

          acc.competencyRadarData.push({
            skill: comp.name,
            current: avgCurrent,
            required: avgRequired
          });
        }

        return acc;
      },
      {
        skillGapsByCategory: {} as Record<string, { gaps: number; total: number }>,
        competencyRadarData: [] as Array<{
          skill: string;
          current: number;
          required: number;
        }>,
        totalProficient: 0,
        totalCriticalGaps: 0,
        totalAssessed: 0
      }
    );

    return {
      skillGapsByCategory: Object.entries(analytics.skillGapsByCategory).map(
        ([category, data]) => ({
          category,
          gaps: data.gaps,
          total: data.total
        })
      ),
      competencyRadarData: analytics.competencyRadarData,
      totalProficient: analytics.totalProficient,
      totalCriticalGaps: analytics.totalCriticalGaps,
      totalAssessed: analytics.totalAssessed
    };
  }
}