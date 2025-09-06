import prisma from "../config/prisma";
import { EnrollmentStatus } from "@prisma/client";

export class LearningService {
  // ==============================
  // COURSES
  // ==============================
  async getCoursesService() {
    return prisma.course.findMany({
      include: {
        enrollments: true,
      },
    });
  }

  async getCourseByIdService(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { employee: true },
        },
      },
    });
  }

  async createCourseService(data: any, userId: string) {
    return prisma.course.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async updateCourseService(id: string, data: any, userId: string) {
    return prisma.course.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  async deleteCourseService(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }

  // ==============================
  // ENROLLMENTS
  // ==============================
  async enrollEmployeeService(courseId: string, employeeId: string) {
    return prisma.enrollment.create({
      data: {
        courseId,
        employeeId,
      },
    });
  }

  async updateEnrollmentStatusService(id: string, status: EnrollmentStatus, progress: number) {
    return prisma.enrollment.update({
      where: { id },
      data: {
        status,
        progress,
        lastActivity: new Date(),
      },
    });
  }

  // ==============================
  // FEEDBACK
  // ==============================
  async addFeedbackService(courseId: string, employeeId: string, rating: number, comment?: string) {
    return prisma.courseFeedback.create({
      data: {
        courseId,
        employeeId,
        rating,
        comment,
      },
    });
  }

  async getCourseFeedbackService(courseId: string) {
    return prisma.courseFeedback.findMany({
      where: { courseId },
      include: {
        employee: true,
      },
    });
  }
}
