import prisma from '../config/prisma';
import { AppError } from '../utils/appError';

export class JobRoleService {
  // Create job role
  async createJobRole(data: { name: string; description?: string }) {
    // Check for duplicate name (case-insensitive)
    const existingJobRole = await prisma.jobRole.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
    });

    if (existingJobRole) {
      throw new AppError('Job role with this name already exists', 400);
    }

    return prisma.jobRole.create({
      data: {
        name: data.name,
        description: data.description,
      }
    });
  }

  // Get all job roles
  async getJobRoles() {
    return prisma.jobRole.findMany({
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  // Get single job role by ID
  async getJobRoleById(id: string) {
    const jobRole = await prisma.jobRole.findUnique({
      where: { id },
      include: {
        employees: true
      }
    });

    if (!jobRole) {
      throw new AppError('Job role not found', 404);
    }

    return jobRole;
  }

  // Update job role
  async updateJobRole(id: string, data: { name?: string; description?: string }) {
    const jobRole = await prisma.jobRole.findUnique({
      where: { id }
    });

    if (!jobRole) {
      throw new AppError('Job role not found', 404);
    }

    // Check for duplicate name if name is being updated
    if (data.name && data.name !== jobRole.name) {
      const existingJobRole = await prisma.jobRole.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: 'insensitive'
          },
          NOT: {
            id: id
          }
        }
      });

      if (existingJobRole) {
        throw new AppError('Job role with this name already exists', 400);
      }
    }

    return prisma.jobRole.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
  }

  // Delete job role
  async deleteJobRole(id: string) {
    const jobRole = await prisma.jobRole.findUnique({
      where: { id },
      include: {
        employees: true
      }
    });

    if (!jobRole) {
      throw new AppError('Job role not found', 404);
    }

    // Check if job role has employees
    if (jobRole.employees.length > 0) {
      throw new AppError(
        `Cannot delete job role. It has ${jobRole.employees.length} employee(s) assigned. Please reassign them first.`,
        400
      );
    }

    return prisma.jobRole.delete({
      where: { id }
    });
  }
}

