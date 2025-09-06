import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

type CompetencyData = {
  name: string;
  category: string;
  description?: string;
  requiredLevel: number;
  role: string;
  certificationExpiry?: Date;
};

type AssessmentData = {
  employeeId: string;
  competencyId: string;
  currentLevel: number;
  requiredLevel: number;
  selfScore: number;
  hrScore?: number;
  notes?: string;
};

export class CompetencyService {
  // Create
  async createCompetencyService(data: CompetencyData, userId: string) {
    return prisma.competency.create({
      data: {
        ...data,
        createdBy: {
          connect: {
            id: userId
          }
        }
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
            employee: true
          }
        }
      },
    });

    return competencies.map(comp => ({
      ...comp,
      assessments: comp.assessments.map(assessment => ({
        ...assessment,
        gap: assessment.requiredLevel - assessment.currentLevel
      }))
    }));
  }

  // Update
  async updateCompetencyService(id: string, data: Partial<CompetencyData>, userId: string) {
    return prisma.competency.update({
      where: { id },
      data: {
        ...data,
        updatedBy: {
          connect: {
            id: userId
          }
        }
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
  async addAssessmentService(data: AssessmentData) {    
    return prisma.competencyAssessment.create({
      data: {
        ...data,
        currentLevel: data.currentLevel,
        requiredLevel: data.requiredLevel,
        gap: data.requiredLevel - data.currentLevel,
        lastAssessed: new Date(),
      },
      include: {
        employee: true,
        competency: true
      }
    });
  }

  // Analytics: get comprehensive analytics data
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

    const analytics = competencies.reduce((acc, comp) => {
      const category = comp.category || 'Uncategorized';
      
      // Initialize category if not exists
      if (!acc.skillGapsByCategory[category]) {
        acc.skillGapsByCategory[category] = { gaps: 0, total: 0 };
      }
      
      // Update gaps and totals
      comp.assessments.forEach(assessment => {
        acc.skillGapsByCategory[category].total++;
        if ((assessment.requiredLevel || 0) > (assessment.currentLevel || 0)) {
          acc.skillGapsByCategory[category].gaps++;
        }
      });
      
      // Update competency radar data
      const assessments = comp.assessments;
      if (assessments.length > 0) {
        const avgCurrent = assessments.reduce((sum, a) => sum + (a.currentLevel || 0), 0) / assessments.length;
        const avgRequired = assessments.reduce((sum, a) => sum + (a.requiredLevel || 0), 0) / assessments.length;
        
        acc.competencyRadarData.push({
          skill: comp.name,
          current: avgCurrent,
          required: avgRequired
        });
      }
      
      // Update role distribution
      const role = comp.role;
      acc.roleDistribution[role] = (acc.roleDistribution[role] || 0) + 1;
      
      return acc;
    }, {
      skillGapsByCategory: {} as Record<string, { gaps: number; total: number }>,
      competencyRadarData: [] as Array<{ skill: string; current: number; required: number }>,
      roleDistribution: {} as Record<string, number>
    });
    
    return {
      skillGapsByCategory: Object.entries(analytics.skillGapsByCategory).map(([category, data]) => ({
        category,
        gaps: data.gaps,
        total: data.total
      })),
      competencyRadarData: analytics.competencyRadarData,
      roleDistribution: Object.entries(analytics.roleDistribution).map(([name, value]) => ({
        name,
        value
      }))
    };
  }
  }