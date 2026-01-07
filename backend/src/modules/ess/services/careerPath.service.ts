import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { CompetencyService } from '../../../services/competency.service';

export class CareerPathService {
  private competencyService = new CompetencyService();

  /**
   * Get career path for employee - all potential next roles with readiness scores
   */
  async getCareerPath(employeeId: string) {
    // Get employee with current job role
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        jobRole: true,
        competencies: {
          include: {
            competency: true
          }
        }
      }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const currentJobRoleId = employee.positionId;

    // Get all job roles (potential next roles)
    const allJobRoles = await prisma.jobRole.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Get employee competencies
    const employeeCompetencies = await this.competencyService.getEmployeeCompetencies(employeeId);

    // Calculate readiness for each job role
    const careerPaths = await Promise.all(
      allJobRoles.map(async (jobRole) => {
        // Skip current job role
        if (jobRole.id === currentJobRoleId) {
          return null;
        }

        const readiness = await this.calculateReadiness(
          employeeId,
          jobRole.id,
          employeeCompetencies
        );

        return {
          jobRoleId: jobRole.id,
          jobRoleName: jobRole.name,
          jobRoleDescription: jobRole.description,
          readinessScore: readiness.readinessPercentage,
          competenciesMet: readiness.competenciesMet,
          competenciesTotal: readiness.competenciesTotal
        };
      })
    );

    // Filter out null values (current job role)
    return {
      currentJobRole: employee.jobRole,
      careerPaths: careerPaths.filter(cp => cp !== null)
    };
  }

  /**
   * Get detailed career path for a specific target role
   */
  async getCareerPathDetails(employeeId: string, targetRoleId: string) {
    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        jobRole: true
      }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Get target job role
    const targetJobRole = await prisma.jobRole.findUnique({
      where: { id: targetRoleId }
    });

    if (!targetJobRole) {
      throw new AppError('Target job role not found', 404);
    }

    // Get employee competencies
    const employeeCompetencies = await this.competencyService.getEmployeeCompetencies(employeeId);

    // Calculate detailed readiness
    const readiness = await this.calculateReadiness(
      employeeId,
      targetRoleId,
      employeeCompetencies
    );

    // Get required competencies with details
    const requiredCompetencies = await this.getRequiredCompetenciesForRole(targetRoleId);

    // Map employee competencies to required competencies
    const competencyComparison = requiredCompetencies.map(reqComp => {
      const employeeComp = employeeCompetencies.find(
        ec => ec.competencyId === reqComp.id
      );

      // Calculate current level from finalScore
      let currentLevel = 0;
      if (employeeComp && employeeComp.finalScore !== null && employeeComp.finalScore !== undefined) {
        // Map finalScore to level (assuming 1-5 scale)
        // This is a simplified mapping - adjust based on your scoring system
        const score = employeeComp.finalScore;
        if (score >= 90) currentLevel = 5;
        else if (score >= 70) currentLevel = 4;
        else if (score >= 50) currentLevel = 3;
        else if (score >= 30) currentLevel = 2;
        else if (score > 0) currentLevel = 1;
      }

      // Get required level from competency levels (assuming level 5 is the highest)
      const requiredLevel = reqComp.levels.length; // Default to highest level
      
      // Or use a specific logic to determine required level based on job role
      // For now, using the highest level as required

      const gap = requiredLevel - currentLevel;
      const isMet = currentLevel >= requiredLevel;

      return {
        competencyId: reqComp.id,
        competencyName: reqComp.name,
        competencyDescription: reqComp.description,
        requiredLevel,
        currentLevel,
        gap,
        isMet,
        employeeCompetency: employeeComp ? {
          selfRating: employeeComp.selfRating,
          managerRating: employeeComp.managerRating,
          finalScore: employeeComp.finalScore
        } : null
      };
    });

    return {
      currentJobRole: employee.jobRole,
      targetJobRole: {
        id: targetJobRole.id,
        name: targetJobRole.name,
        description: targetJobRole.description
      },
      readinessScore: readiness.readinessPercentage,
      competenciesMet: readiness.competenciesMet,
      competenciesTotal: readiness.competenciesTotal,
      competencyComparison
    };
  }

  /**
   * Calculate readiness percentage for a job role
   */
  private async calculateReadiness(
    employeeId: string,
    jobRoleId: string,
    employeeCompetencies: any[]
  ): Promise<{
    readinessPercentage: number;
    competenciesMet: number;
    competenciesTotal: number;
  }> {
    // Get required competencies for the job role
    const requiredCompetencies = await this.getRequiredCompetenciesForRole(jobRoleId);

    if (requiredCompetencies.length === 0) {
      return {
        readinessPercentage: 0,
        competenciesMet: 0,
        competenciesTotal: 0
      };
    }

    // Calculate how many competencies are met
    let competenciesMet = 0;

    for (const reqComp of requiredCompetencies) {
      const employeeComp = employeeCompetencies.find(
        ec => ec.competencyId === reqComp.id
      );

      if (employeeComp && employeeComp.finalScore !== null && employeeComp.finalScore !== undefined) {
        // Calculate current level from finalScore
        const score = employeeComp.finalScore;
        let currentLevel = 0;
        if (score >= 90) currentLevel = 5;
        else if (score >= 70) currentLevel = 4;
        else if (score >= 50) currentLevel = 3;
        else if (score >= 30) currentLevel = 2;
        else if (score > 0) currentLevel = 1;

        const requiredLevel = reqComp.levels.length; // Using highest level as required
        if (currentLevel >= requiredLevel) {
          competenciesMet++;
        }
      }
    }

    const readinessPercentage = Math.round(
      (competenciesMet / requiredCompetencies.length) * 100
    );

    return {
      readinessPercentage,
      competenciesMet,
      competenciesTotal: requiredCompetencies.length
    };
  }

  /**
   * Get required competencies for a job role
   * (via CompetencyCategory.jobRoleIds)
   */
  private async getRequiredCompetenciesForRole(jobRoleId: string) {
    // Find all competency categories that apply to this job role
    const categories = await prisma.competencyCategory.findMany({
      where: {
        jobRoleIds: {
          has: jobRoleId
        }
      },
      include: {
        competencies: true
      }
    });

    // Get all competencies from these categories
    const competencyIds = new Set<string>();
    categories.forEach(category => {
      category.competencies.forEach(comp => {
        competencyIds.add(comp.id);
      });
    });

    // Fetch full competency details with levels
    const competencies = await prisma.competency.findMany({
      where: {
        id: {
          in: Array.from(competencyIds)
        }
      }
    });

    return competencies;
  }
}

