import prisma from "../config/prisma";

export class EmployeeService {
  async getEmployeesService() {
    return prisma.employee.findMany({
      include: {
        competencies: true,
        enrollments: true,
        trainings: true,
        performance: true,
        succession: true,
      },
    });
  }

  async getEmployeeByIdService(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        competencies: true,
        enrollments: true,
        trainings: true,
        performance: true,
        succession: true,
      },
    });
  }

  async createEmployeeService(data: any) {
    return prisma.employee.create({
      data,
    });
  }

  async updateEmployeeService(id: string, data: any) {
    return prisma.employee.update({
      where: { id },
      data,
    });
  }

  async deleteEmployeeService(id: string) {
    return prisma.employee.delete({
      where: { id },
    });
  }
}
