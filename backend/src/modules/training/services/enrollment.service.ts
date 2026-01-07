import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { TrainingEnrollmentStatus, EnrollmentType } from '@prisma/client';

export class TrainingEnrollmentService {
  /**
   * Create enrollment (self or manual)
   * If enrollmentType is MANUAL (HR/Admin enrollment), auto-approve
   */
  async createEnrollment(
    trainingId: string,
    employeeId: string,
    enrollmentType: EnrollmentType = EnrollmentType.SELF,
    approvedBy?: string // For manual enrollment, this is the HR/Admin user ID
  ) {
    // Check training exists
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          where: {
            status: { in: [TrainingEnrollmentStatus.PENDING, TrainingEnrollmentStatus.APPROVED] }
          }
        }
      }
    });

    if (!training) {
      throw new AppError('Training not found', 404);
    }

    // Check if training is open for enrollment
    if (training.status !== 'OPEN' && training.status !== 'ONGOING') {
      throw new AppError('Training is not open for enrollment', 400);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.trainingEnrollment.findFirst({
      where: {
        trainingId,
        employeeId,
        status: { not: TrainingEnrollmentStatus.CANCELLED }
      }
    });

    if (existingEnrollment) {
      throw new AppError('Employee is already enrolled in this training', 400);
    }

    // Check max participants
    const approvedCount = training.enrollments.filter(
      e => e.status === TrainingEnrollmentStatus.APPROVED
    ).length;

    if (approvedCount >= training.maxParticipants) {
      throw new AppError('Training is full', 400);
    }

    // For manual enrollment (HR/Admin), auto-approve
    const status = enrollmentType === EnrollmentType.MANUAL 
      ? TrainingEnrollmentStatus.APPROVED 
      : TrainingEnrollmentStatus.PENDING;

    // Create enrollment
    const enrollment = await prisma.trainingEnrollment.create({
      data: {
        trainingId,
        employeeId,
        enrollmentType,
        status,
        ...(status === TrainingEnrollmentStatus.APPROVED && approvedBy ? {
          approvedBy,
          approvedAt: new Date()
        } : {})
      },
      include: {
        training: {
          include: {
            venue: true,
            trainer: true
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      }
    });

    return enrollment;
  }

  /**
   * Get employee's trainings
   */
  async getEmployeeTrainings(employeeId: string, filters?: {
    status?: TrainingEnrollmentStatus;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      employeeId
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    const [enrollments, total] = await Promise.all([
      prisma.trainingEnrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: {
            include: {
              venue: true,
              trainer: true
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              position: true,
              employeeId: true
            }
          },
          attendance: true,
          evaluation: true
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      }),
      prisma.trainingEnrollment.count({ where })
    ]);

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Approve enrollment
   */
  async approveEnrollment(enrollmentId: string, approvedBy: string) {
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        training: {
          include: {
            enrollments: {
              where: {
                status: TrainingEnrollmentStatus.APPROVED
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.status !== TrainingEnrollmentStatus.PENDING) {
      throw new AppError('Enrollment is not pending', 400);
    }

    // Check max participants
    const approvedCount = enrollment.training.enrollments.length;
    if (approvedCount >= enrollment.training.maxParticipants) {
      throw new AppError('Training is full', 400);
    }

    return prisma.trainingEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: TrainingEnrollmentStatus.APPROVED,
        approvedBy,
        approvedAt: new Date()
      },
      include: {
        training: true,
        employee: true
      }
    });
  }

  /**
   * Reject enrollment
   */
  async rejectEnrollment(enrollmentId: string, approvedBy: string, rejectionReason?: string) {
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.status !== TrainingEnrollmentStatus.PENDING) {
      throw new AppError('Enrollment is not pending', 400);
    }

    return prisma.trainingEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: TrainingEnrollmentStatus.REJECTED,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason
      },
      include: {
        training: true,
        employee: true
      }
    });
  }

  /**
   * Get all enrollments for a training
   */
  async getTrainingEnrollments(trainingId: string, filters?: {
    status?: TrainingEnrollmentStatus;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const skip = (page - 1) * limit;

    const where: any = {
      trainingId
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    const [enrollments, total] = await Promise.all([
      prisma.trainingEnrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: {
            include: {
              venue: true,
              trainer: true
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              position: true
            }
          },
          attendance: true,
          evaluation: true
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      }),
      prisma.trainingEnrollment.count({ where })
    ]);

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get pending enrollments
   */
  async getPendingEnrollments(filters?: {
    trainingId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: TrainingEnrollmentStatus.PENDING
    };

    if (filters?.trainingId) {
      where.trainingId = filters.trainingId;
    }

    const [enrollments, total] = await Promise.all([
      prisma.trainingEnrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: {
            include: {
              venue: true,
              trainer: true
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              position: true
            }
          }
        },
        orderBy: {
          enrolledAt: 'asc'
        }
      }),
      prisma.trainingEnrollment.count({ where })
    ]);

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

