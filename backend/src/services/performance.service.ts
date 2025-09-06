import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PerformanceService {
  // Analyze performance for a single employee
  async analyzeEmployeePerformanceService(employeeId: string) {
    const assessments = await prisma.competencyAssessment.findMany({
      where: { employeeId },
      include: { competency: true },
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { employeeId },
      include: { course: true },
    });

    // Rule-based scoring example
    const avgSelfScore =
      assessments.length > 0
        ? assessments.reduce((a, c) => a + c.selfScore, 0) / assessments.length
        : 0;

    const avgHrScore =
      assessments.length > 0
        ? assessments.reduce((a, c) => a + (c.hrScore ?? 0), 0) / assessments.length
        : 0;

    const completedCourses = enrollments.filter((e) => e.status === "COMPLETED").length;

    // Generate insights
    return {
      employeeId,
      avgSelfScore,
      avgHrScore,
      completedCourses,
      readiness:
        avgHrScore > 80 && completedCourses > 3
          ? "High"
          : avgHrScore > 50
          ? "Medium"
          : "Low",
    };
  }

  // Organization-wide analytics
  async getOrgPerformanceAnalyticsService() {
    const employees = await prisma.employee.findMany({
      select: { id: true, name: true },
    });

    const results = [];
    for (const emp of employees) {
      const analysis = await this.analyzeEmployeePerformanceService(emp.id);
      results.push({ employee: emp, ...analysis });
    }

    return results;
  }
}
