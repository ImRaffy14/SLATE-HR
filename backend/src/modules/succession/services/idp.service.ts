import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { IDPStatus, IDPGoalType } from '@prisma/client';

export class IDPService {
  /**
   * Create IDP for an employee
   */
  async createIDP(data: {
    employeeId: string;
    targetRoleId: string;
    autoGenerateGoals?: boolean;
  }, userId: string) {
    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Validate target role exists
    const targetRole = await prisma.criticalRole.findUnique({
      where: { id: data.targetRoleId },
      include: {
        jobRole: true
      }
    });

    if (!targetRole) {
      throw new AppError('Target role not found', 404);
    }

    // Check if IDP already exists for this employee-role combination
    const existingIDP = await prisma.individualDevelopmentPlan.findFirst({
      where: {
        employeeId: data.employeeId,
        targetRoleId: data.targetRoleId,
        status: { in: ['DRAFT', 'ACTIVE'] }
      }
    });

    if (existingIDP) {
      throw new AppError('An active IDP already exists for this employee and role', 400);
    }

    // Create IDP
    const idp = await prisma.individualDevelopmentPlan.create({
      data: {
        employeeId: data.employeeId,
        targetRoleId: data.targetRoleId,
        status: 'DRAFT',
        progress: 0,
        createdBy: userId,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          }
        },
        targetRole: {
          include: {
            jobRole: true
          }
        },
        goals: true
      }
    });

    // Auto-generate goals based on competency gaps if requested
    if (data.autoGenerateGoals) {
      await this.autoGenerateGoals(idp.id, data.employeeId, targetRole);
    }

    // Fetch updated IDP with goals
    return prisma.individualDevelopmentPlan.findUnique({
      where: { id: idp.id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          }
        },
        targetRole: {
          include: {
            jobRole: true
          }
        },
        goals: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              }
            },
            training: {
              select: {
                id: true,
                title: true,
              }
            },
            competency: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });
  }

  /**
   * Auto-generate IDP goals based on competency gaps
   */
  private async autoGenerateGoals(idpId: string, employeeId: string, targetRole: any) {
    // Get employee's current competencies
    const employeeCompetencies = await prisma.employeeCompetency.findMany({
      where: { employeeId },
      include: {
        competency: true
      }
    });

    const employeeCompMap = new Map(
      employeeCompetencies.map(ec => [ec.competencyId, ec])
    );

    // Generate goals for each required competency with a gap
    for (const reqComp of targetRole.requiredCompetencies) {
      const empComp = employeeCompMap.get(reqComp.competencyId);
      const currentLevel = empComp?.finalScore 
        ? Math.min(Math.round(empComp.finalScore / 20), 5) 
        : 1;

      if (currentLevel < reqComp.requiredLevel) {
        // Find competency details
        const competency = await prisma.competency.findUnique({
          where: { id: reqComp.competencyId }
        });

        if (!competency) continue;

        // Find recommended courses for this competency
        const recommendedCourse = await prisma.course.findFirst({
          where: {
            taggedCompetencies: { has: reqComp.competencyId },
            status: 'PUBLISHED'
          }
        });

        // Find recommended training for this competency
        const recommendedTraining = await prisma.training.findFirst({
          where: {
            taggedCompetencies: { has: reqComp.competencyId },
            status: { in: ['OPEN', 'ONGOING'] }
          }
        });

        // Create short-term goal for immediate gap
        await prisma.iDPGoal.create({
          data: {
            idpId,
            title: `Improve ${competency.name} to Level ${reqComp.requiredLevel}`,
            description: `Current level: ${currentLevel}, Required: ${reqComp.requiredLevel}`,
            goalType: currentLevel < reqComp.requiredLevel - 1 ? 'LONG_TERM' : 'SHORT_TERM',
            competencyId: reqComp.competencyId,
            courseId: recommendedCourse?.id,
            trainingId: recommendedTraining?.id,
            targetDate: new Date(Date.now() + (currentLevel < reqComp.requiredLevel - 1 ? 365 : 180) * 24 * 60 * 60 * 1000),
          }
        });
      }
    }
  }

  /**
   * Get employee's IDP(s)
   */
  async getEmployeeIDPs(employeeId: string, filters?: {
    status?: IDPStatus;
    targetRoleId?: string;
  }) {
    const where: any = { employeeId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.targetRoleId) {
      where.targetRoleId = filters.targetRoleId;
    }

    const idps = await prisma.individualDevelopmentPlan.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          }
        },
        targetRole: {
          include: {
            jobRole: true
          }
        },
        goals: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              }
            },
            training: {
              select: {
                id: true,
                title: true,
              }
            },
            competency: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: [
            { goalType: 'asc' },
            { targetDate: 'asc' }
          ]
        },
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return idps;
  }

  /**
   * Get IDP by ID
   */
  async getIDPById(idpId: string) {
    const idp = await prisma.individualDevelopmentPlan.findUnique({
      where: { id: idpId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
          }
        },
        targetRole: {
          include: {
            jobRole: true
          }
        },
        goals: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
              }
            },
            training: {
              select: {
                id: true,
                title: true,
                status: true,
              }
            },
            competency: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: [
            { completed: 'asc' },
            { goalType: 'asc' },
            { targetDate: 'asc' }
          ]
        },
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!idp) {
      throw new AppError('IDP not found', 404);
    }

    return idp;
  }

  /**
   * Update IDP status
   */
  async updateIDPStatus(idpId: string, status: IDPStatus) {
    const idp = await prisma.individualDevelopmentPlan.findUnique({
      where: { id: idpId }
    });

    if (!idp) {
      throw new AppError('IDP not found', 404);
    }

    return prisma.individualDevelopmentPlan.update({
      where: { id: idpId },
      data: { status },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          }
        },
        targetRole: {
          include: {
            jobRole: true
          }
        },
        goals: true
      }
    });
  }

  /**
   * Add goal to IDP
   */
  async addGoal(idpId: string, data: {
    title: string;
    description?: string;
    goalType: IDPGoalType;
    targetDate?: Date;
    courseId?: string;
    trainingId?: string;
    competencyId?: string;
  }) {
    const idp = await prisma.individualDevelopmentPlan.findUnique({
      where: { id: idpId }
    });

    if (!idp) {
      throw new AppError('IDP not found', 404);
    }

    // Validate course if provided
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId }
      });
      if (!course) {
        throw new AppError('Course not found', 404);
      }
    }

    // Validate training if provided
    if (data.trainingId) {
      const training = await prisma.training.findUnique({
        where: { id: data.trainingId }
      });
      if (!training) {
        throw new AppError('Training not found', 404);
      }
    }

    // Validate competency if provided
    if (data.competencyId) {
      const competency = await prisma.competency.findUnique({
        where: { id: data.competencyId }
      });
      if (!competency) {
        throw new AppError('Competency not found', 404);
      }
    }

    const goal = await prisma.iDPGoal.create({
      data: {
        idpId,
        ...data,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        },
        training: {
          select: {
            id: true,
            title: true,
          }
        },
        competency: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Recalculate IDP progress
    await this.recalculateIDPProgress(idpId);

    return goal;
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, progress: number, completed?: boolean) {
    const goal = await prisma.iDPGoal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const isCompleted = completed ?? progress >= 100;

    const updatedGoal = await prisma.iDPGoal.update({
      where: { id: goalId },
      data: {
        progress: Math.min(progress, 100),
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        },
        training: {
          select: {
            id: true,
            title: true,
          }
        },
        competency: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Recalculate IDP progress
    await this.recalculateIDPProgress(goal.idpId);

    return updatedGoal;
  }

  /**
   * Delete goal
   */
  async deleteGoal(goalId: string) {
    const goal = await prisma.iDPGoal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    await prisma.iDPGoal.delete({
      where: { id: goalId }
    });

    // Recalculate IDP progress
    await this.recalculateIDPProgress(goal.idpId);

    return { message: 'Goal deleted successfully' };
  }

  /**
   * Recalculate IDP overall progress
   */
  async recalculateIDPProgress(idpId: string) {
    const goals = await prisma.iDPGoal.findMany({
      where: { idpId }
    });

    if (goals.length === 0) {
      await prisma.individualDevelopmentPlan.update({
        where: { id: idpId },
        data: { progress: 0 }
      });
      return;
    }

    const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
    const averageProgress = totalProgress / goals.length;

    const allCompleted = goals.every(g => g.completed);

    await prisma.individualDevelopmentPlan.update({
      where: { id: idpId },
      data: {
        progress: averageProgress,
        status: allCompleted ? 'COMPLETED' : undefined
      }
    });
  }

  /**
   * Sync IDP goal progress with course/training completion
   */
  async syncGoalProgressFromLearning(employeeId: string) {
    // Get all active IDPs for employee
    const idps = await prisma.individualDevelopmentPlan.findMany({
      where: {
        employeeId,
        status: { in: ['DRAFT', 'ACTIVE'] }
      },
      include: {
        goals: true
      }
    });

    for (const idp of idps) {
      for (const goal of idp.goals) {
        // Check course enrollment progress
        if (goal.courseId) {
          const enrollment = await prisma.enrollment.findFirst({
            where: {
              employeeId,
              courseId: goal.courseId
            }
          });

          if (enrollment) {
            const progress = enrollment.completionPercentage;
            const completed = enrollment.status === 'COMPLETED';

            if (progress !== goal.progress || completed !== goal.completed) {
              await prisma.iDPGoal.update({
                where: { id: goal.id },
                data: {
                  progress,
                  completed,
                  completedAt: completed ? new Date() : null
                }
              });
            }
          }
        }

        // Check training enrollment
        if (goal.trainingId) {
          const trainingEnrollment = await prisma.trainingEnrollment.findFirst({
            where: {
              employeeId,
              trainingId: goal.trainingId
            },
            include: {
              attendance: true,
              training: true
            }
          });

          if (trainingEnrollment) {
            const attended = trainingEnrollment.attendance?.status === 'PRESENT';
            const trainingCompleted = trainingEnrollment.training.status === 'COMPLETED';

            if (attended && trainingCompleted && !goal.completed) {
              await prisma.iDPGoal.update({
                where: { id: goal.id },
                data: {
                  progress: 100,
                  completed: true,
                  completedAt: new Date()
                }
              });
            }
          }
        }
      }

      // Recalculate IDP progress
      await this.recalculateIDPProgress(idp.id);
    }

    return { message: 'IDP goals synced with learning progress' };
  }
}

