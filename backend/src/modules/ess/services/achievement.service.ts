import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { uploadFile, validateFileType, validateFileSize } from '../../../services/fileUpload.service';

export class AchievementService {
  /**
   * Upload achievement/certificate for an employee
   */
  async uploadAchievement(
    employeeId: string,
    file: Express.Multer.File,
    data: {
      title: string;
      description?: string;
      competencyId?: string;
    }
  ) {
    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Validate file
    validateFileType(file);
    validateFileSize(file, 10 * 1024 * 1024); // 10MB max

    // Validate competency if provided
    if (data.competencyId) {
      const competency = await prisma.competency.findUnique({
        where: { id: data.competencyId }
      });

      if (!competency) {
        throw new AppError('Competency not found', 404);
      }
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadFile(
      file.buffer,
      'ess-achievements',
      file.mimetype
    );

    // Create achievement upload record
    const achievement = await prisma.achievementUpload.create({
      data: {
        employeeId,
        title: data.title,
        description: data.description,
        fileUrl: uploadResult.url,
        competencyId: data.competencyId || null,
        status: 'Pending' // Requires HR/Manager approval
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        competency: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return achievement;
  }

  /**
   * Get employee's achievement uploads
   */
  async getEmployeeAchievements(
    employeeId: string,
    filters?: {
      status?: string;
      competencyId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      employeeId
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.competencyId) {
      where.competencyId = filters.competencyId;
    }

    const [achievements, total] = await Promise.all([
      prisma.achievementUpload.findMany({
        where,
        skip,
        take: limit,
        include: {
          competency: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.achievementUpload.count({ where })
    ]);

    return {
      achievements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

