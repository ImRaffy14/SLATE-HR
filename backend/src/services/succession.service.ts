import prisma from '../config/prisma';

export class SuccessionService {
  // Create succession plan
  async createSuccessionPlanService(data: any, userId: any) {
    return await prisma.successionPlan.create({
      data: {
        employeeId: data.employeeId,
        readiness: data.assessmentForm.readinessScore,
        comments: data.assessmentForm.comments,
        developmentActions: data.assessmentForm.developmentNeeds,
        createdBy: userId,
      }
    });
  }

  // Get all succession plans
  async getAllSuccessionPlansService() {
    return await prisma.successionPlan.findMany({
      include: { employee: true, creator: true, updater: true },
    });
  }

  // Get succession plan by employee
  async getSuccessionByEmployeeService(employeeId: string) {
    return await prisma.successionPlan.findMany({
      where: { employeeId },
      include: { employee: true },
    });
  }

  // Update succession plan
  async updateSuccessionPlanService(id: string, data: any) {
    return await prisma.successionPlan.update({
      where: { id },
      data,
    });
  }

  // Delete succession plan
  async deleteSuccessionPlanService(id: string) {
    return await prisma.successionPlan.delete({
      where: { id },
    });
  }
}
