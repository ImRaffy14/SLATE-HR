import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';

export class TrainingEvaluationService {
  /**
   * Submit evaluation
   */
  async submitEvaluation(enrollmentId: string, data: {
    trainingRating: number;
    trainingComments?: string;
    trainerRating?: number;
    trainerComments?: string;
    employeePerformanceRating?: number;
    employeeImprovementComments?: string;
  }) {
    // Validate enrollment exists
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        training: true,
        attendance: true
      }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Check if attendance is present
    if (!enrollment.attendance || enrollment.attendance.status === 'ABSENT') {
      throw new AppError('Cannot submit evaluation without attendance', 400);
    }

    // Validate ratings (1-5)
    if (data.trainingRating < 1 || data.trainingRating > 5) {
      throw new AppError('Training rating must be between 1 and 5', 400);
    }

    if (data.trainerRating && (data.trainerRating < 1 || data.trainerRating > 5)) {
      throw new AppError('Trainer rating must be between 1 and 5', 400);
    }

    if (data.employeePerformanceRating && (data.employeePerformanceRating < 1 || data.employeePerformanceRating > 5)) {
      throw new AppError('Employee performance rating must be between 1 and 5', 400);
    }

    // Check if evaluation already exists
    const existing = await prisma.trainingEvaluation.findUnique({
      where: { enrollmentId }
    });

    // Calculate effectiveness score
    const effectivenessScore = this.calculateEffectivenessScore(
      data.trainingRating,
      data.trainerRating
    );

    if (existing) {
      // Update existing evaluation
      return prisma.trainingEvaluation.update({
        where: { enrollmentId },
        data: {
          ...data,
          effectivenessScore
        },
        include: {
          enrollment: {
            include: {
              employee: true,
              training: true
            }
          }
        }
      });
    }

    // Create new evaluation
    return prisma.trainingEvaluation.create({
      data: {
        enrollmentId,
        ...data,
        effectivenessScore
      },
      include: {
        enrollment: {
          include: {
            employee: true,
            training: true
          }
        }
      }
    });
  }

  /**
   * Get evaluation by enrollment ID
   */
  async getEvaluation(enrollmentId: string) {
    const evaluation = await prisma.trainingEvaluation.findUnique({
      where: { enrollmentId },
      include: {
        enrollment: {
          include: {
            employee: true,
            training: {
              include: {
                trainer: true,
                venue: true
              }
            }
          }
        }
      }
    });

    if (!evaluation) {
      throw new AppError('Evaluation not found', 404);
    }

    return evaluation;
  }

  /**
   * Get all evaluations for a training
   */
  async getTrainingEvaluations(trainingId: string) {
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true
              }
            },
            evaluation: true
          }
        }
      }
    });

    if (!training) {
      throw new AppError('Training not found', 404);
    }

    return training.enrollments
      .filter(e => e.evaluation)
      .map(e => ({
        employee: e.employee,
        evaluation: e.evaluation
      }));
  }

  /**
   * Submit employee performance rating (by HR/Manager/Trainer)
   */
  async submitEmployeePerformanceRating(enrollmentId: string, data: {
    employeePerformanceRating: number;
    employeeImprovementComments?: string;
  }) {
    // Validate enrollment exists
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        training: true,
        attendance: true
      }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Check if attendance is present
    if (!enrollment.attendance || enrollment.attendance.status === 'ABSENT') {
      throw new AppError('Cannot rate employee without attendance', 400);
    }

    // Validate rating (1-5)
    if (data.employeePerformanceRating < 1 || data.employeePerformanceRating > 5) {
      throw new AppError('Employee performance rating must be between 1 and 5', 400);
    }

    // Check if evaluation exists
    const existing = await prisma.trainingEvaluation.findUnique({
      where: { enrollmentId }
    });

    if (existing) {
      // Update existing evaluation with employee performance rating
      return prisma.trainingEvaluation.update({
        where: { enrollmentId },
        data: {
          employeePerformanceRating: data.employeePerformanceRating,
          employeeImprovementComments: data.employeeImprovementComments
        },
        include: {
          enrollment: {
            include: {
              employee: true,
              training: true
            }
          }
        }
      });
    }

    // Create new evaluation with only employee performance rating
    return prisma.trainingEvaluation.create({
      data: {
        enrollmentId,
        trainingRating: 0, // Placeholder, will be updated when employee submits their evaluation
        employeePerformanceRating: data.employeePerformanceRating,
        employeeImprovementComments: data.employeeImprovementComments
      },
      include: {
        enrollment: {
          include: {
            employee: true,
            training: true
          }
        }
      }
    });
  }

  /**
   * Calculate training effectiveness score
   */
  private calculateEffectivenessScore(trainingRating: number, trainerRating?: number): number {
    if (trainerRating) {
      // Average of both ratings, weighted 60% training, 40% trainer
      return (trainingRating * 0.6 + trainerRating * 0.4) * 20; // Scale to 0-100
    }
    return trainingRating * 20; // Scale to 0-100
  }
}

