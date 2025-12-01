import prisma from '../config/prisma';
import { AppError } from '../utils/appError';

export class TrainingRecommendationService {
  // Create recommendation
  async createRecommendation(data: {
    competencyId: string;
    title: string;
    description?: string;
    link?: string;
    difficultyLevel: number;
    courseId?: string;
  }) {
    // Validate competency exists
    const competency = await prisma.competency.findUnique({
      where: { id: data.competencyId }
    });

    if (!competency) {
      throw new AppError('Competency not found', 404);
    }

    // Validate difficulty level (1-5)
    if (data.difficultyLevel < 1 || data.difficultyLevel > 5) {
      throw new AppError('Difficulty level must be between 1 and 5', 400);
    }

    // Clean up courseId - convert empty string to null
    const courseId = data.courseId && data.courseId.trim() !== "" ? data.courseId.trim() : null;

    // Validate course exists if courseId provided
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new AppError('Course not found', 404);
      }
    }

    return prisma.trainingRecommendation.create({
      data: {
        competencyId: data.competencyId,
        title: data.title,
        description: data.description,
        link: data.link,
        difficultyLevel: data.difficultyLevel,
        courseId: courseId,
      },
      include: {
        competency: {
          select: {
            id: true,
            name: true,
          }
        },
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });
  }

  // Get all recommendations
  async getRecommendations() {
    return prisma.trainingRecommendation.findMany({
      include: {
        competency: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get recommendations by competency
  async getRecommendationsByCompetency(competencyId: string) {
    const competency = await prisma.competency.findUnique({
      where: { id: competencyId }
    });

    if (!competency) {
      throw new AppError('Competency not found', 404);
    }

    return prisma.trainingRecommendation.findMany({
      where: {
        competencyId: competencyId
      },
      include: {
        competency: {
          select: {
            id: true,
            name: true,
          }
        },
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        difficultyLevel: 'asc'
      }
    });
  }

  // Get recommendations by difficulty level
  async getRecommendationsByDifficulty(difficultyLevel: number) {
    if (difficultyLevel < 1 || difficultyLevel > 5) {
      throw new AppError('Difficulty level must be between 1 and 5', 400);
    }

    return prisma.trainingRecommendation.findMany({
      where: {
        difficultyLevel: difficultyLevel
      },
      include: {
        competency: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get single recommendation by ID
  async getRecommendationById(id: string) {
    const recommendation = await prisma.trainingRecommendation.findUnique({
      where: { id },
      include: {
        competency: {
          include: {
            category: true
          }
        },
        course: true
      }
    });

    if (!recommendation) {
      throw new AppError('Training recommendation not found', 404);
    }

    return recommendation;
  }

  // Update recommendation
  async updateRecommendation(id: string, data: {
    title?: string;
    description?: string;
    link?: string;
    difficultyLevel?: number;
    courseId?: string;
  }) {
    const recommendation = await prisma.trainingRecommendation.findUnique({
      where: { id }
    });

    if (!recommendation) {
      throw new AppError('Training recommendation not found', 404);
    }

    // Validate difficulty level if provided
    if (data.difficultyLevel !== undefined) {
      if (data.difficultyLevel < 1 || data.difficultyLevel > 5) {
        throw new AppError('Difficulty level must be between 1 and 5', 400);
      }
    }

    // Clean up courseId - convert empty string to null
    let courseId: string | null | undefined = data.courseId;
    if (courseId !== undefined) {
      courseId = courseId && courseId.trim() !== "" ? courseId.trim() : null;
    }

    // Validate course exists if courseId provided
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new AppError('Course not found', 404);
      }
    }

    return prisma.trainingRecommendation.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.difficultyLevel !== undefined && { difficultyLevel: data.difficultyLevel }),
        ...(courseId !== undefined && { courseId: courseId }),
      },
      include: {
        competency: {
          select: {
            id: true,
            name: true,
          }
        },
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });
  }

  // Delete recommendation
  async deleteRecommendation(id: string) {
    const recommendation = await prisma.trainingRecommendation.findUnique({
      where: { id }
    });

    if (!recommendation) {
      throw new AppError('Training recommendation not found', 404);
    }

    return prisma.trainingRecommendation.delete({
      where: { id }
    });
  }
}

