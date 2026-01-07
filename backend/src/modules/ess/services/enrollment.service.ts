import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { LearningService } from '../../../services/learning.service';
import { TrainingEnrollmentService } from '../../training/services/enrollment.service';
import { EnrollmentType } from '@prisma/client';

export class ESSEnrollmentService {
  private learningService = new LearningService();
  private trainingEnrollmentService = new TrainingEnrollmentService();

  /**
   * Self-enroll in a course
   * Creates enrollment with EnrollmentType.SELF
   */
  async enrollInCourse(employeeId: string, courseId: string) {
    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Validate course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.status !== 'PUBLISHED') {
      throw new AppError('Cannot enroll in a course that is not published', 400);
    }

    // Check for duplicate enrollment
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        employeeId,
        courseId
      }
    });

    if (existingEnrollment) {
      throw new AppError('Employee is already enrolled in this course', 400);
    }

    // Create enrollment with SELF type
    const enrollment = await prisma.enrollment.create({
      data: {
        employeeId,
        courseId,
        enrollmentType: EnrollmentType.SELF,
        isRequired: false,
        status: 'NOT_STARTED'
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true
          }
        }
      }
    });

    return enrollment;
  }

  /**
   * Self-enroll in a training
   * Delegates to TrainingEnrollmentService with EnrollmentType.SELF
   */
  async enrollInTraining(employeeId: string, trainingId: string) {
    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Delegate to TrainingEnrollmentService with SELF type
    // This will create enrollment with PENDING status (requires approval)
    const enrollment = await this.trainingEnrollmentService.createEnrollment(
      trainingId,
      employeeId,
      EnrollmentType.SELF
    );

    return enrollment;
  }
}

