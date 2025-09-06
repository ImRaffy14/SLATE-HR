import prisma from '../config/prisma'

export class EnrollmentService {
  // Create new enrollment
  async createEnrollmentService(employeeId: string, courseId: string) {
    return await prisma.enrollment.create({
      data: {
        employeeId,
        courseId,
      },
    });
  }

  // Get enrollments by course
  async getEnrollmentsByCourseService(courseId: string) {
    return await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        employee: true,
        course: true,
      },
    });
  }

  // Get enrollments by employee
  async getEnrollmentsByEmployeeService(employeeId: string) {
    return await prisma.enrollment.findMany({
      where: { employeeId },
      include: {
        course: true,
      },
    });
  }

  // Update enrollment
  async updateEnrollmentService(id: string, data: any) {
    return await prisma.enrollment.update({
      where: { id },
      data,
    });
  }

  // Delete enrollment
  async deleteEnrollmentService(id: string) {
    return await prisma.enrollment.delete({
      where: { id },
    });
  }
}
