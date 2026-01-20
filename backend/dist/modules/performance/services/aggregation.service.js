"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class AggregationService {
    /**
     * Get comprehensive metrics for a single employee
     */
    async getEmployeeMetrics(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId },
            include: {
                performance: {
                    orderBy: { reviewDate: 'desc' },
                    take: 10 // Last 10 reviews for trend analysis
                },
                competencies: {
                    include: {
                        competency: {
                            select: { id: true, name: true }
                        }
                    }
                },
                enrollments: {
                    include: {
                        course: { select: { title: true } }
                    }
                },
                trainingEnrollments: {
                    where: { status: 'APPROVED' },
                    include: {
                        attendance: true,
                        evaluation: true
                    }
                },
                gapAnalyses: true
            }
        });
        if (!employee) {
            throw new Error('Employee not found');
        }
        // Calculate performance metrics
        const latestPerformanceScore = employee.performance[0]?.score ?? null;
        const performanceHistory = employee.performance.map(p => ({
            score: p.score,
            reviewDate: p.reviewDate
        }));
        // Calculate competency metrics
        const competencyScores = employee.competencies.map(ec => ({
            competencyId: ec.competencyId,
            competencyName: ec.competency.name,
            finalScore: ec.finalScore
        }));
        const validCompetencyScores = competencyScores.filter(c => c.finalScore !== null);
        const avgCompetencyScore = validCompetencyScores.length > 0
            ? validCompetencyScores.reduce((sum, c) => sum + (c.finalScore || 0), 0) / validCompetencyScores.length
            : null;
        // Calculate learning metrics
        const coursesEnrolled = employee.enrollments.length;
        const coursesCompleted = employee.enrollments.filter(e => e.status === 'COMPLETED').length;
        const courseCompletionRate = coursesEnrolled > 0 ? (coursesCompleted / coursesEnrolled) * 100 : 0;
        const completedWithGrade = employee.enrollments.filter(e => e.finalGrade !== null);
        const avgCourseGrade = completedWithGrade.length > 0
            ? completedWithGrade.reduce((sum, e) => sum + (e.finalGrade || 0), 0) / completedWithGrade.length
            : null;
        // Calculate training metrics
        const trainingsEnrolled = employee.trainingEnrollments.length;
        const trainingsAttended = employee.trainingEnrollments.filter(te => te.attendance?.status === 'PRESENT' || te.attendance?.status === 'LATE').length;
        const trainingAttendanceRate = trainingsEnrolled > 0 ? (trainingsAttended / trainingsEnrolled) * 100 : 0;
        const evaluationsWithRating = employee.trainingEnrollments.filter(te => te.evaluation?.trainingRating);
        const avgTrainingRating = evaluationsWithRating.length > 0
            ? evaluationsWithRating.reduce((sum, te) => sum + (te.evaluation?.trainingRating || 0), 0) / evaluationsWithRating.length
            : null;
        // Gap analysis
        const totalGaps = employee.gapAnalyses.length;
        const criticalGaps = employee.gapAnalyses.filter(g => g.gap >= 2).length;
        return {
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            position: employee.position,
            latestPerformanceScore,
            performanceHistory,
            avgCompetencyScore,
            competencyCount: employee.competencies.length,
            competencyScores,
            coursesEnrolled,
            coursesCompleted,
            courseCompletionRate,
            avgCourseGrade,
            trainingsEnrolled,
            trainingsAttended,
            trainingAttendanceRate,
            avgTrainingRating,
            totalGaps,
            criticalGaps
        };
    }
    /**
     * Generate a performance summary for AI analysis
     * This method produces anonymized, aggregated data safe for AI prompts
     */
    async generatePerformanceSummary(employeeId) {
        const metrics = await this.getEmployeeMetrics(employeeId);
        // Determine performance trend
        let trend = 'Stable';
        if (metrics.performanceHistory.length >= 2) {
            const recent = metrics.performanceHistory.slice(0, 3);
            const avgRecent = recent.reduce((sum, p) => sum + p.score, 0) / recent.length;
            const older = metrics.performanceHistory.slice(3, 6);
            if (older.length > 0) {
                const avgOlder = older.reduce((sum, p) => sum + p.score, 0) / older.length;
                if (avgRecent > avgOlder + 0.5)
                    trend = 'Improving';
                else if (avgRecent < avgOlder - 0.5)
                    trend = 'Declining';
            }
        }
        // Determine competency growth
        let competencyGrowth = 'Stagnant';
        if (metrics.avgCompetencyScore !== null) {
            if (metrics.avgCompetencyScore >= 80)
                competencyGrowth = 'High';
            else if (metrics.avgCompetencyScore >= 60)
                competencyGrowth = 'Moderate';
            else if (metrics.avgCompetencyScore >= 40)
                competencyGrowth = 'Low';
        }
        // Determine learning activity
        let learningActivity = 'None';
        if (metrics.courseCompletionRate >= 80)
            learningActivity = 'High';
        else if (metrics.courseCompletionRate >= 50)
            learningActivity = 'Moderate';
        else if (metrics.courseCompletionRate > 0)
            learningActivity = 'Low';
        // Determine training attendance
        let trainingAttendance = 'Poor';
        if (metrics.trainingAttendanceRate >= 90)
            trainingAttendance = 'Excellent';
        else if (metrics.trainingAttendanceRate >= 70)
            trainingAttendance = 'Good';
        else if (metrics.trainingAttendanceRate >= 50)
            trainingAttendance = 'Moderate';
        // Get current period
        const now = new Date();
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        const period = `${now.getFullYear()}-Q${quarter}`;
        return {
            employeeId,
            period,
            trend,
            competencyGrowth,
            learningActivity,
            trainingAttendance,
            lastRating: metrics.latestPerformanceScore || 0,
            skillGaps: metrics.totalGaps
        };
    }
    /**
     * Create or update a performance snapshot for an employee
     */
    async createSnapshot(employeeId, period) {
        const metrics = await this.getEmployeeMetrics(employeeId);
        // Calculate period if not provided
        if (!period) {
            const now = new Date();
            const quarter = Math.ceil((now.getMonth() + 1) / 3);
            period = `${now.getFullYear()}-Q${quarter}`;
        }
        // Normalize scores to 0-100
        const performanceScore = (metrics.latestPerformanceScore ?? 3) * 20; // 1-5 -> 20-100
        const competencyScore = metrics.avgCompetencyScore ?? 50;
        const learningScore = metrics.courseCompletionRate;
        const trainingScore = metrics.trainingAttendanceRate;
        // Calculate overall score (weighted average)
        const overallScore = performanceScore * 0.35 +
            competencyScore * 0.30 +
            learningScore * 0.20 +
            trainingScore * 0.15;
        // Check if snapshot exists for this period
        const existingSnapshot = await prisma_1.default.performanceSnapshot.findFirst({
            where: { employeeId, period }
        });
        if (existingSnapshot) {
            await prisma_1.default.performanceSnapshot.update({
                where: { id: existingSnapshot.id },
                data: {
                    performanceScore,
                    competencyScore,
                    learningScore,
                    trainingScore,
                    overallScore
                }
            });
        }
        else {
            await prisma_1.default.performanceSnapshot.create({
                data: {
                    employeeId,
                    period,
                    performanceScore,
                    competencyScore,
                    learningScore,
                    trainingScore,
                    overallScore
                }
            });
        }
        return {
            employeeId,
            period,
            performanceScore,
            competencyScore,
            learningScore,
            trainingScore,
            overallScore
        };
    }
    /**
     * Sync all employee snapshots for current period
     */
    async syncAllSnapshots() {
        const employees = await prisma_1.default.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true }
        });
        let synced = 0;
        let failed = 0;
        for (const emp of employees) {
            try {
                await this.createSnapshot(emp.id);
                synced++;
            }
            catch (error) {
                console.error(`Failed to sync snapshot for employee ${emp.id}:`, error);
                failed++;
            }
        }
        return { synced, failed };
    }
    /**
     * Get employee performance history (snapshots over time)
     */
    async getEmployeeHistory(employeeId, limit = 12) {
        const snapshots = await prisma_1.default.performanceSnapshot.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return snapshots;
    }
    /**
     * Get all active employees with their latest metrics
     */
    async getAllEmployeesWithMetrics() {
        const employees = await prisma_1.default.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                performance: {
                    orderBy: { reviewDate: 'desc' },
                    take: 1
                },
                performanceSnapshots: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                aiInsights: {
                    where: {
                        analysisType: 'FULL',
                        expiresAt: { gt: new Date() }
                    },
                    orderBy: { generatedAt: 'desc' },
                    take: 1
                }
            }
        });
        return employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            department: emp.department,
            position: emp.position,
            latestPerformanceScore: emp.performance[0]?.score ?? null,
            latestSnapshot: emp.performanceSnapshots[0] ?? null,
            latestInsight: emp.aiInsights[0] ?? null
        }));
    }
}
exports.AggregationService = AggregationService;
