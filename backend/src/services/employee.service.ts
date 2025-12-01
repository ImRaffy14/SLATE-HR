import prisma from "../config/prisma";
import { AppError } from "../utils/appError";

export class EmployeeService {
  async getEmployeesService() {
    return prisma.employee.findMany({
      include: {
        jobRole: true,
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
        jobRole: true,
        competencies: true,
        enrollments: true,
        trainings: true,
        performance: true,
        succession: true,
      },
    });
  }

  async createEmployeeService(data: any) {
    // Validate required fields
    if (!data.employeeId || !data.name) {
      throw new AppError("Employee ID and name are required", 400);
    }

    // Check for duplicate employeeId
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: data.employeeId }
    });

    if (existingEmployee) {
      throw new AppError(`Employee with ID ${data.employeeId} already exists`, 400);
    }

    // Clean up data - remove empty strings and invalid positionId
    const cleanData: any = {
      employeeId: data.employeeId.trim(),
      name: data.name.trim(),
      status: data.status || "ACTIVE",
    };

    if (data.email?.trim()) {
      cleanData.email = data.email.trim();
    }
    if (data.department?.trim()) {
      cleanData.department = data.department.trim();
    }
    if (data.position?.trim()) {
      cleanData.position = data.position.trim();
    }
    if (data.dateHired) {
      cleanData.dateHired = new Date(data.dateHired);
    }

    // Only include positionId if it's a valid non-empty string
    if (data.positionId && data.positionId.trim() !== "") {
      // Validate that the job role exists
      const jobRole = await prisma.jobRole.findUnique({
        where: { id: data.positionId.trim() }
      });
      if (!jobRole) {
        throw new AppError("Invalid job role ID", 400);
      }
      cleanData.positionId = data.positionId.trim();
    }

    return prisma.employee.create({
      data: cleanData,
      include: {
        jobRole: true,
      },
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
