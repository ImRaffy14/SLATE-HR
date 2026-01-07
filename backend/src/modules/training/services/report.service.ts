import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';

export class TrainingReportService {
  /**
   * Get training hours per employee
   */
  async getTrainingHoursReport(filters?: {
    trainingId?: string;
    employeeId?: string;
    department?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'COMPLETED',
      enrollments: {
        some: {
          status: 'APPROVED',
          attendance: {
            status: { in: ['PRESENT', 'LATE'] }
          }
        }
      }
    };

    if (filters?.trainingId) {
      where.id = filters.trainingId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];
      if (filters.startDate) {
        where.AND.push({ startDate: { gte: filters.startDate } });
      }
      if (filters.endDate) {
        where.AND.push({ endDate: { lte: filters.endDate } });
      }
    }

    if (filters?.employeeId) {
      where.enrollments = {
        ...where.enrollments,
        some: {
          ...where.enrollments.some,
          employeeId: filters.employeeId
        }
      };
    }

    // Get trainings with enrollments
    const trainings = await prisma.training.findMany({
      where,
      include: {
        enrollments: {
          where: {
            status: 'APPROVED',
            attendance: {
              status: { in: ['PRESENT', 'LATE'] }
            }
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true
              }
            }
          }
        }
      }
    });

    // Aggregate by employee
    const employeeHours: Record<string, {
      employee: any;
      totalHours: number;
      trainingCount: number;
      trainings: any[];
    }> = {};

    trainings.forEach(training => {
      training.enrollments.forEach(enrollment => {
        const empId = enrollment.employee.id;
        if (!employeeHours[empId]) {
          employeeHours[empId] = {
            employee: enrollment.employee,
            totalHours: 0,
            trainingCount: 0,
            trainings: []
          };
        }

        // Filter by department if provided
        if (filters?.department && enrollment.employee.department !== filters.department) {
          return;
        }

        employeeHours[empId].totalHours += training.durationHours;
        employeeHours[empId].trainingCount += 1;
        employeeHours[empId].trainings.push({
          trainingId: training.id,
          title: training.title,
          hours: training.durationHours,
          completedAt: training.endDate
        });
      });
    });

    const results = Object.values(employeeHours);
    const total = results.length;

    // Paginate
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get attendance summary report
   */
  async getAttendanceSummaryReport(filters?: {
    trainingId?: string;
    startDate?: Date;
    endDate?: Date;
    department?: string;
  }) {
    // If trainingId is provided, get all enrollments for that training (like attendance tab does)
    if (filters?.trainingId) {
      const training = await prisma.training.findUnique({
        where: { id: filters.trainingId },
        include: {
          enrollments: {
            where: {
              status: 'APPROVED'
            },
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  department: true
                }
              },
              attendance: true,
              evaluation: {
                select: {
                  employeePerformanceRating: true,
                  employeeImprovementComments: true
                }
              }
            }
          }
        }
      });

      if (!training) {
        return {
          summary: {
            total: 0,
            present: 0,
            late: 0,
            absent: 0,
            attendanceRate: '0.00'
          },
          details: []
        };
      }

      // Map enrollments to attendance format (default to ABSENT if no attendance record)
      const attendanceData = training.enrollments.map(enrollment => ({
        enrollment,
        employee: enrollment.employee,
        training: {
          id: training.id,
          title: training.title,
          startDate: training.startDate,
          endDate: training.endDate
        },
        attendance: enrollment.attendance || {
          status: 'ABSENT' as const,
          timeIn: null,
          timeOut: null
        },
        evaluation: enrollment.evaluation
      }));

      // Filter by department if provided
      const filtered = filters?.department
        ? attendanceData.filter(a => a.employee.department === filters.department)
        : attendanceData;

      // Aggregate by status
      const summary = {
        total: filtered.length,
        present: filtered.filter(a => a.attendance.status === 'PRESENT').length,
        late: filtered.filter(a => a.attendance.status === 'LATE').length,
        absent: filtered.filter(a => a.attendance.status === 'ABSENT').length,
        attendanceRate: filtered.length > 0
          ? ((filtered.filter(a => a.attendance.status === 'PRESENT' || a.attendance.status === 'LATE').length / filtered.length) * 100).toFixed(2)
          : '0.00'
      };

      return {
        summary,
        details: filtered.map(a => ({
          employee: a.employee,
          training: a.training,
          status: a.attendance.status,
          timeIn: a.attendance.timeIn,
          timeOut: a.attendance.timeOut,
          performanceRating: a.evaluation?.employeePerformanceRating,
          improvementComments: a.evaluation?.employeeImprovementComments
        }))
      };
    }

    // Original logic for date range filtering (when no specific trainingId)
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.enrollment = {
        training: {
          AND: []
        }
      };
      if (filters.startDate) {
        where.enrollment.training.AND.push({ startDate: { gte: filters.startDate } });
      }
      if (filters.endDate) {
        where.enrollment.training.AND.push({ endDate: { lte: filters.endDate } });
      }
    }

    const attendances = await prisma.trainingAttendance.findMany({
      where,
      include: {
        enrollment: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                department: true
              }
            },
            training: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true
              }
            },
            evaluation: {
              select: {
                employeePerformanceRating: true,
                employeeImprovementComments: true
              }
            }
          }
        }
      }
    });

    // Filter by department if provided
    const filtered = filters?.department
      ? attendances.filter(a => a.enrollment.employee.department === filters.department)
      : attendances;

    // Aggregate by status
    const summary = {
      total: filtered.length,
      present: filtered.filter(a => a.status === 'PRESENT').length,
      late: filtered.filter(a => a.status === 'LATE').length,
      absent: filtered.filter(a => a.status === 'ABSENT').length,
      attendanceRate: filtered.length > 0
        ? ((filtered.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length / filtered.length) * 100).toFixed(2)
        : '0.00'
    };

    return {
      summary,
      details: filtered.map(a => ({
        employee: a.enrollment.employee,
        training: a.enrollment.training,
        status: a.status,
        timeIn: a.timeIn,
        timeOut: a.timeOut,
        performanceRating: a.enrollment.evaluation?.employeePerformanceRating,
        improvementComments: a.enrollment.evaluation?.employeeImprovementComments
      }))
    };
  }

  /**
   * Get competency improvement report
   */
  async getCompetencyImprovementReport(filters?: {
    employeeId?: string;
    competencyId?: string;
    trainingId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.competencyId) {
      where.competencyId = filters.competencyId;
    }

    if (filters?.trainingId) {
      where.trainingId = filters.trainingId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.training = {
        AND: []
      };
      if (filters.startDate) {
        where.training.AND.push({ startDate: { gte: filters.startDate } });
      }
      if (filters.endDate) {
        where.training.AND.push({ endDate: { lte: filters.endDate } });
      }
    }

    const [impacts, total] = await Promise.all([
      prisma.trainingCompetencyImpact.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true
            }
          },
          competency: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.trainingCompetencyImpact.count({ where })
    ]);

    // Fetch evaluation data for each impact to get performance ratings
    const impactsWithRatings = await Promise.all(
      impacts.map(async (impact) => {
        const enrollment = await prisma.trainingEnrollment.findFirst({
          where: {
            trainingId: impact.trainingId,
            employeeId: impact.employeeId,
            status: 'APPROVED'
          },
          include: {
            evaluation: {
              select: {
                employeePerformanceRating: true,
                employeeImprovementComments: true
              }
            }
          }
        });

        return {
          ...impact,
          performanceRating: enrollment?.evaluation?.employeePerformanceRating,
          improvementComments: enrollment?.evaluation?.employeeImprovementComments
        };
      })
    );

    return {
      impacts: impactsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get trainer effectiveness report
   */
  async getTrainerEffectivenessReport(filters?: {
    trainingId?: string;
    trainerId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {
      status: 'COMPLETED',
      enrollments: {
        some: {
          evaluation: {
            isNot: null
          }
        }
      }
    };

    if (filters?.trainingId) {
      where.id = filters.trainingId;
    }

    if (filters?.trainerId) {
      where.trainerId = filters.trainerId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];
      if (filters.startDate) {
        where.AND.push({ startDate: { gte: filters.startDate } });
      }
      if (filters.endDate) {
        where.AND.push({ endDate: { lte: filters.endDate } });
      }
    }

    const trainings = await prisma.training.findMany({
      where,
      include: {
        trainer: true,
        enrollments: {
          include: {
            employee: {
              select: {
                id: true,
                name: true
              }
            },
            evaluation: true
          }
        }
      }
    });

    // Aggregate by trainer
    const trainerStats: Record<string, {
      trainer: any;
      totalTrainings: number;
      totalEvaluations: number;
      averageTrainingRating: number;
      averageTrainerRating: number;
      averageEffectivenessScore: number;
    }> = {};

    trainings.forEach((training: any) => {
      if (!training.trainer) return;

      const trainerId = training.trainer.id;
      if (!trainerStats[trainerId]) {
        trainerStats[trainerId] = {
          trainer: training.trainer,
          totalTrainings: 0,
          totalEvaluations: 0,
          averageTrainingRating: 0,
          averageTrainerRating: 0,
          averageEffectivenessScore: 0
        };
      }

      trainerStats[trainerId].totalTrainings += 1;

      const evaluations = training.enrollments
        .map((e: any) => e.evaluation)
        .filter((e: any) => e !== null);
      
      if (evaluations.length > 0) {
        trainerStats[trainerId].totalEvaluations += evaluations.length;

        const trainingRatings = evaluations.map((e: any) => e.trainingRating);
        const trainerRatings = evaluations.map((e: any) => e.trainerRating).filter((r: any) => r !== null) as number[];
        const effectivenessScores = evaluations.map((e: any) => e.effectivenessScore).filter((s: any) => s !== null) as number[];

        trainerStats[trainerId].averageTrainingRating = trainingRatings.reduce((a: number, b: number) => a + b, 0) / trainingRatings.length;
        if (trainerRatings.length > 0) {
          trainerStats[trainerId].averageTrainerRating = trainerRatings.reduce((a: number, b: number) => a + b, 0) / trainerRatings.length;
        }
        if (effectivenessScores.length > 0) {
          trainerStats[trainerId].averageEffectivenessScore = effectivenessScores.reduce((a: number, b: number) => a + b, 0) / effectivenessScores.length;
        }
      }
    });

    return Object.values(trainerStats);
  }
}

