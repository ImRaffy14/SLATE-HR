import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { TrainingStatus, AttendanceStatus } from '@prisma/client';

export class CompetencyUpdateService {
  /**
   * Process competency updates when training is completed
   * Triggered when: Training status = COMPLETED, Attendance = PRESENT/LATE, Evaluation submitted
   */
  async processCompetencyUpdate(trainingId: string) {
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          where: {
            status: 'APPROVED',
            attendance: {
              status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.LATE] }
            },
            evaluation: {
              isNot: null
            }
          },
          include: {
            employee: true,
            attendance: true,
            evaluation: {
              select: {
                id: true,
                enrollmentId: true,
                trainingRating: true,
                trainingComments: true,
                trainerRating: true,
                trainerComments: true,
                employeePerformanceRating: true,
                employeeImprovementComments: true,
                effectivenessScore: true,
                submittedAt: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });

    if (!training) {
      throw new AppError('Training not found', 404);
    }

    if (training.status !== TrainingStatus.COMPLETED) {
      throw new AppError('Training must be completed to process competency updates', 400);
    }

    if (training.taggedCompetencies.length === 0) {
      return { message: 'No competencies tagged to this training', updated: 0 };
    }

    const updates = [];

    for (const enrollment of training.enrollments) {
      // Only process if attendance is present/late and evaluation exists
      if (!enrollment.attendance || !enrollment.evaluation) {
        continue;
      }

      if (enrollment.attendance.status !== AttendanceStatus.PRESENT &&
          enrollment.attendance.status !== AttendanceStatus.LATE) {
        continue;
      }

      // Process each tagged competency
      for (const competencyId of training.taggedCompetencies) {
        // Calculate effectiveness score considering employee performance rating
        const effectivenessScore = this.calculateEffectivenessScoreWithPerformanceRating(
          enrollment.evaluation?.effectivenessScore || 0,
          enrollment.evaluation?.employeePerformanceRating || undefined
        );
        
        const update = await this.updateEmployeeCompetency(
          enrollment.employeeId,
          competencyId,
          trainingId,
          effectivenessScore,
          enrollment.evaluation?.employeePerformanceRating || undefined
        );
        if (update) {
          updates.push(update);
        }
      }
    }

    return {
      message: `Processed ${updates.length} competency updates`,
      updated: updates.length,
      updates
    };
  }

  /**
   * Calculate effectiveness score considering employee performance rating
   */
  private calculateEffectivenessScoreWithPerformanceRating(
    baseEffectivenessScore: number,
    employeePerformanceRating?: number | null
  ): number {
    if (!employeePerformanceRating) {
      return baseEffectivenessScore;
    }
    
    // Weight: 60% base effectiveness, 40% employee performance rating
    // Employee performance rating (1-5) scaled to 0-100
    const performanceScore = (employeePerformanceRating / 5) * 100;
    return (baseEffectivenessScore * 0.6) + (performanceScore * 0.4);
  }

  /**
   * Update employee competency based on training completion
   */
  private async updateEmployeeCompetency(
    employeeId: string,
    competencyId: string,
    trainingId: string,
    effectivenessScore: number,
    employeePerformanceRating?: number | null
  ) {
    // Get employee competency record
    const employeeCompetency = await prisma.employeeCompetency.findFirst({
      where: {
        employeeId,
        competencyId
      },
      include: {
        competency: true
      }
    });

    if (!employeeCompetency) {
      // Create new employee competency record
      const competency = await prisma.competency.findUnique({
        where: { id: competencyId }
      });

      if (!competency) {
        return null;
      }

      // Calculate new level based on effectiveness score
      // Effectiveness score is 0-100, map to 1-5 level
      const newLevel = Math.min(5, Math.max(1, Math.ceil(effectivenessScore / 20)));

      // Create employee competency
      await prisma.employeeCompetency.create({
        data: {
          employeeId,
          competencyId,
          selfRating: newLevel,
          finalScore: newLevel * (competency.weight / 100)
        }
      });

      // Create impact record
      await prisma.trainingCompetencyImpact.create({
        data: {
          trainingId,
          employeeId,
          competencyId,
          previousLevel: 0,
          newLevel,
          improvement: newLevel
        }
      });

      return { employeeId, competencyId, previousLevel: 0, newLevel, improvement: newLevel };
    }

    // Calculate current level from finalScore
    const currentLevel = employeeCompetency.finalScore
      ? Math.min(5, Math.max(1, Math.ceil((employeeCompetency.finalScore / (employeeCompetency.competency.weight / 100)))))
      : 0;

    // Calculate new level based on effectiveness score
    const newLevel = Math.min(5, Math.max(1, Math.ceil(effectivenessScore / 20)));

    // Only update if there's improvement
    if (newLevel > currentLevel) {
      const improvement = newLevel - currentLevel;

      // Update employee competency
      await prisma.employeeCompetency.update({
        where: { id: employeeCompetency.id },
        data: {
          selfRating: newLevel,
          finalScore: newLevel * (employeeCompetency.competency.weight / 100)
        }
      });

      // Create impact record
      await prisma.trainingCompetencyImpact.create({
        data: {
          trainingId,
          employeeId,
          competencyId,
          previousLevel: currentLevel,
          newLevel,
          improvement
        }
      });

      // Recalculate gap analysis
      await this.recalculateGapAnalysis(employeeId, competencyId);

      return { employeeId, competencyId, previousLevel: currentLevel, newLevel, improvement };
    }

    return null;
  }

  /**
   * Recalculate gap analysis for an employee competency
   */
  private async recalculateGapAnalysis(employeeId: string, competencyId: string) {
    const employeeCompetency = await prisma.employeeCompetency.findFirst({
      where: {
        employeeId,
        competencyId
      },
      include: {
        competency: true
      }
    });

    if (!employeeCompetency) {
      return;
    }

    // Get required level (highest level in competency)
    const requiredLevel = employeeCompetency.competency.levels.length > 0
      ? Math.max(...employeeCompetency.competency.levels.map(l => l.levelNumber))
      : 5;

    // Calculate current level
    let currentLevel = 1;
    if (employeeCompetency.finalScore !== null) {
      const normalizedScore = employeeCompetency.finalScore / (employeeCompetency.competency.weight / 100);
      currentLevel = Math.max(1, Math.min(5, Math.round(normalizedScore)));
    }

    const gap = requiredLevel - currentLevel;

    // Update or create gap analysis
    const existingGap = await prisma.gapAnalysis.findFirst({
      where: {
        employeeId,
        competencyId
      }
    });

    if (existingGap) {
      await prisma.gapAnalysis.update({
        where: { id: existingGap.id },
        data: {
          requiredLevel,
          currentLevel,
          gap
        }
      });
    } else {
      await prisma.gapAnalysis.create({
        data: {
          employeeId,
          competencyId,
          requiredLevel,
          currentLevel,
          gap
        }
      });
    }
  }
}

