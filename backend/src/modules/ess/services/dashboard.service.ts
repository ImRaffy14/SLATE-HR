import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';
import { CompetencyService } from '../../../services/competency.service';
import { LearningService } from '../../../services/learning.service';
import { TrainingEnrollmentService } from '../../training/services/enrollment.service';
import { EmployeeService } from '../../../services/employee.service';

export class DashboardService {
  private competencyService = new CompetencyService();
  private learningService = new LearningService();
  private trainingEnrollmentService = new TrainingEnrollmentService();
  private employeeService = new EmployeeService();

  /**
   * Get aggregated dashboard data for an employee
   */
  async getEmployeeDashboard(employeeId: string) {
    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Fetch all data in parallel
    const [
      employeeData,
      competencies,
      gapAnalysis,
      allEnrollments,
      recommendedCourses,
      trainingEnrollments,
      successionPlan
    ] = await Promise.all([
      this.employeeService.getEmployeeByIdService(employeeId),
      this.competencyService.getEmployeeCompetencies(employeeId),
      this.competencyService.getGapAnalysis(employeeId),
      this.learningService.getEmployeeEnrollmentsService(employeeId),
      this.learningService.getRecommendedCoursesService(employeeId),
      this.trainingEnrollmentService.getEmployeeTrainings(employeeId),
      prisma.successionPlan.findFirst({
        where: { employeeId },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    // Verify employee data exists (should not be null since we checked earlier, but TypeScript needs this)
    if (!employeeData) {
      throw new AppError('Employee not found', 404);
    }

    // Filter ongoing courses (status IN_PROGRESS)
    const ongoingCourses = allEnrollments.filter(
      enrollment => enrollment.status === 'IN_PROGRESS'
    );

    // Filter ongoing trainings (status APPROVED and training status ONGOING)
    const ongoingTrainings = trainingEnrollments.enrollments?.filter(
      enrollment => 
        enrollment.status === 'APPROVED' && 
        enrollment.training.status === 'ONGOING'
    ) || [];

    // Calculate gap summary
    const gapSummary = Array.isArray(gapAnalysis) ? {
      totalGaps: gapAnalysis.length,
      criticalGaps: gapAnalysis.filter(g => g.gap > 2).length,
      moderateGaps: gapAnalysis.filter(g => g.gap === 2).length,
      minorGaps: gapAnalysis.filter(g => g.gap === 1).length,
      gaps: gapAnalysis.map(g => ({
        competencyId: g.competencyId,
        competencyName: g.competency.name,
        requiredLevel: g.requiredLevel,
        currentLevel: g.currentLevel,
        gap: g.gap
      }))
    } : {
      totalGaps: 0,
      criticalGaps: 0,
      moderateGaps: 0,
      minorGaps: 0,
      gaps: []
    };

    // Calculate competency scores summary
    const competencyScores = competencies.map(ec => ({
      competencyId: ec.competencyId,
      competencyName: ec.competency.name,
      categoryName: ec.competency.category.name,
      selfRating: ec.selfRating,
      managerRating: ec.managerRating,
      finalScore: ec.finalScore
    }));

    // Get recommended trainings (from gap analysis recommendations)
    const recommendedTrainingIds = Array.isArray(gapAnalysis)
      ? gapAnalysis
          .filter(g => g.recommendations && g.recommendations.length > 0)
          .flatMap(g => g.recommendations)
          .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates
      : [];

    // Fetch recommended trainings if any
    const recommendedTrainings = recommendedTrainingIds.length > 0
      ? await prisma.training.findMany({
          where: {
            id: { in: recommendedTrainingIds },
            status: { in: ['OPEN', 'ONGOING'] }
          },
          include: {
            venue: true,
            trainer: true
          }
        })
      : [];

    return {
      employee: {
        id: employeeData.id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position,
        jobRole: employeeData.jobRole
      },
      competencyScores,
      gapSummary,
      ongoingCourses: ongoingCourses.map(enrollment => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        status: enrollment.status,
        completionPercentage: enrollment.completionPercentage,
        enrolledAt: enrollment.enrolledAt
      })),
      ongoingTrainings: ongoingTrainings.map(enrollment => ({
        id: enrollment.id,
        trainingId: enrollment.trainingId,
        trainingTitle: enrollment.training.title,
        status: enrollment.status,
        trainingStatus: enrollment.training.status,
        startDate: enrollment.training.startDate,
        endDate: enrollment.training.endDate,
        enrolledAt: enrollment.enrolledAt
      })),
      recommendedCourses: recommendedCourses.map(course => ({
        id: course.id,
        courseId: course.courseId,
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        estimatedHours: course.estimatedHours,
        isEnrolled: course.enrollments && course.enrollments.length > 0
      })),
      recommendedTrainings: recommendedTrainings.map(training => ({
        id: training.id,
        trainingId: training.trainingId,
        title: training.title,
        description: training.description,
        trainingType: training.trainingType,
        startDate: training.startDate,
        endDate: training.endDate,
        durationHours: training.durationHours
      })),
      readinessScore: successionPlan?.readiness || null,
      successionPlan: successionPlan ? {
        readiness: successionPlan.readiness,
        comments: successionPlan.comments,
        developmentActions: successionPlan.developmentActions,
        updatedAt: successionPlan.updatedAt
      } : null
    };
  }
}

