import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';

interface RequiredCompetencyInput {
  competencyId: string;
  requiredLevel: number;
  weight: number;
}

export class RoleService {
  /**
   * Create a critical role
   */
  async createCriticalRole(data: {
    jobRoleId: string;
    description?: string;
    isCritical?: boolean;
    requiredCompetencies?: RequiredCompetencyInput[];
  }, userId: string) {
    // Validate job role exists
    const jobRole = await prisma.jobRole.findUnique({
      where: { id: data.jobRoleId }
    });

    if (!jobRole) {
      throw new AppError('Job role not found', 404);
    }

    // Check if critical role already exists for this job role
    const existingRole = await prisma.criticalRole.findFirst({
      where: { jobRoleId: data.jobRoleId }
    });

    if (existingRole) {
      throw new AppError('Critical role already exists for this job role', 400);
    }

    // Validate competencies if provided
    if (data.requiredCompetencies && data.requiredCompetencies.length > 0) {
      const competencyIds = data.requiredCompetencies.map(c => c.competencyId);
      const competencies = await prisma.competency.findMany({
        where: { id: { in: competencyIds } }
      });

      if (competencies.length !== competencyIds.length) {
        throw new AppError('One or more competencies not found', 400);
      }

      // Validate weights sum to 100
      const totalWeight = data.requiredCompetencies.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight !== 100) {
        throw new AppError('Competency weights must sum to 100', 400);
      }
    }

    return prisma.criticalRole.create({
      data: {
        jobRoleId: data.jobRoleId,
        description: data.description,
        isCritical: data.isCritical ?? true,
        requiredCompetencies: data.requiredCompetencies || [],
        createdBy: userId,
      },
      include: {
        jobRole: true,
        talentPool: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                department: true,
                position: true,
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get all critical roles
   */
  async getCriticalRoles(filters?: {
    isCritical?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.isCritical !== undefined) {
      where.isCritical = filters.isCritical;
    }

    const [roles, total] = await Promise.all([
      prisma.criticalRole.findMany({
        where,
        skip,
        take: limit,
        include: {
          jobRole: true,
          talentPool: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  department: true,
                  position: true,
                }
              }
            }
          },
          idps: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.criticalRole.count({ where })
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get critical role by ID
   */
  async getCriticalRoleById(id: string) {
    const role = await prisma.criticalRole.findUnique({
      where: { id },
      include: {
        jobRole: true,
        talentPool: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                position: true,
              }
            }
          },
          orderBy: { overallScore: 'desc' }
        },
        idps: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!role) {
      throw new AppError('Critical role not found', 404);
    }

    return role;
  }

  /**
   * Update critical role
   */
  async updateCriticalRole(id: string, data: {
    description?: string;
    isCritical?: boolean;
    requiredCompetencies?: RequiredCompetencyInput[];
  }) {
    const existingRole = await prisma.criticalRole.findUnique({
      where: { id }
    });

    if (!existingRole) {
      throw new AppError('Critical role not found', 404);
    }

    // Validate competencies if provided
    if (data.requiredCompetencies && data.requiredCompetencies.length > 0) {
      const competencyIds = data.requiredCompetencies.map(c => c.competencyId);
      const competencies = await prisma.competency.findMany({
        where: { id: { in: competencyIds } }
      });

      if (competencies.length !== competencyIds.length) {
        throw new AppError('One or more competencies not found', 400);
      }

      // Validate weights sum to 100
      const totalWeight = data.requiredCompetencies.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight !== 100) {
        throw new AppError('Competency weights must sum to 100', 400);
      }
    }

    return prisma.criticalRole.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isCritical !== undefined && { isCritical: data.isCritical }),
        ...(data.requiredCompetencies !== undefined && { requiredCompetencies: data.requiredCompetencies }),
      },
      include: {
        jobRole: true,
        talentPool: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                department: true,
                position: true,
              }
            }
          }
        }
      }
    });
  }

  /**
   * Delete critical role
   */
  async deleteCriticalRole(id: string) {
    const existingRole = await prisma.criticalRole.findUnique({
      where: { id },
      include: {
        talentPool: true,
        idps: true,
      }
    });

    if (!existingRole) {
      throw new AppError('Critical role not found', 404);
    }

    // Check if there are talent pool entries or IDPs
    if (existingRole.talentPool.length > 0 || existingRole.idps.length > 0) {
      throw new AppError('Cannot delete critical role with existing talent pool members or IDPs', 400);
    }

    await prisma.criticalRole.delete({
      where: { id }
    });

    return { message: 'Critical role deleted successfully' };
  }

  /**
   * Get competencies for role mapping (helper)
   */
  async getCompetenciesForMapping() {
    return prisma.competency.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
  }
}

