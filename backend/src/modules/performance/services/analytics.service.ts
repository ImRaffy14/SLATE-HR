import prisma from '../../../config/prisma';
import { TeamAnalytics, OrgAnalytics } from '../types/performance.types';
import { AggregationService } from './aggregation.service';
import { GroqService } from '../ai/groq.service';

export class PerformanceAnalyticsService {
  private aggregationService: AggregationService;
  private groqService: GroqService;

  constructor() {
    this.aggregationService = new AggregationService();
    this.groqService = new GroqService();
  }

  /**
   * Get team analytics for a manager
   */
  async getTeamAnalytics(managerId: string): Promise<TeamAnalytics> {
    // Get manager's department/team
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: {
        employee: true
      }
    });

    if (!manager?.employee?.department) {
      throw new Error('Manager department not found');
    }

    const department = manager.employee.department;

    // Get all employees in the department
    const employees = await prisma.employee.findMany({
      where: {
        department,
        status: 'ACTIVE'
      },
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

    // Calculate aggregated metrics
    let totalPerformance = 0;
    let totalCompetency = 0;
    let totalLearning = 0;
    let totalTraining = 0;
    let performanceCount = 0;
    let snapshotCount = 0;

    const riskDistribution = { low: 0, medium: 0, high: 0 };
    let promotionReady = 0;
    let needsAttention = 0;

    const employeeData = employees.map(emp => {
      const snapshot = emp.performanceSnapshots[0];
      const insight = emp.aiInsights[0]?.analysisResult as any;
      const perfScore = emp.performance[0]?.score;

      if (perfScore) {
        totalPerformance += perfScore * 20; // Normalize to 0-100
        performanceCount++;
      }

      if (snapshot) {
        totalCompetency += snapshot.competencyScore;
        totalLearning += snapshot.learningScore;
        totalTraining += snapshot.trainingScore;
        snapshotCount++;
      }

      // Determine risk level
      let riskLevel = 'low';
      if (insight?.riskLevel) {
        riskLevel = insight.riskLevel.toLowerCase();
      } else if (snapshot) {
        if (snapshot.overallScore < 50) riskLevel = 'high';
        else if (snapshot.overallScore < 70) riskLevel = 'medium';
      }

      if (riskLevel === 'low') riskDistribution.low++;
      else if (riskLevel === 'medium') riskDistribution.medium++;
      else riskDistribution.high++;

      // Check promotion readiness
      if (insight?.promotionReadiness >= 75 || (snapshot && snapshot.overallScore >= 85)) {
        promotionReady++;
      }

      // Check if needs attention
      if (riskLevel === 'high' || (snapshot && snapshot.overallScore < 50)) {
        needsAttention++;
      }

      return {
        id: emp.id,
        name: emp.name,
        overallScore: snapshot?.overallScore || 0,
        riskLevel
      };
    });

    return {
      managerId,
      teamSize: employees.length,
      avgPerformanceScore: performanceCount > 0 ? totalPerformance / performanceCount : 0,
      avgCompetencyScore: snapshotCount > 0 ? totalCompetency / snapshotCount : 0,
      avgLearningScore: snapshotCount > 0 ? totalLearning / snapshotCount : 0,
      avgTrainingScore: snapshotCount > 0 ? totalTraining / snapshotCount : 0,
      riskDistribution,
      promotionReady,
      needsAttention,
      employees: employeeData
    };
  }

  /**
   * Get organization-wide analytics for HR
   */
  async getOrgAnalytics(): Promise<OrgAnalytics> {
    const employees = await prisma.employee.findMany({
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

    // Calculate overall metrics
    let totalPerformance = 0;
    let totalCompetency = 0;
    let totalLearning = 0;
    let totalTraining = 0;
    let performanceCount = 0;
    let snapshotCount = 0;

    const riskDistribution = { low: 0, medium: 0, high: 0 };
    const departmentData: Map<string, { count: number; totalScore: number }> = new Map();

    interface ProcessedEmployee {
      id: string;
      name: string;
      department: string | null;
      overallScore: number;
      riskLevel: string;
    }

    const processedEmployees: ProcessedEmployee[] = [];

    for (const emp of employees) {
      const snapshot = emp.performanceSnapshots[0];
      const insight = emp.aiInsights[0]?.analysisResult as any;
      const perfScore = emp.performance[0]?.score;

      if (perfScore) {
        totalPerformance += perfScore * 20;
        performanceCount++;
      }

      if (snapshot) {
        totalCompetency += snapshot.competencyScore;
        totalLearning += snapshot.learningScore;
        totalTraining += snapshot.trainingScore;
        snapshotCount++;
      }

      // Risk level
      let riskLevel = 'low';
      if (insight?.riskLevel) {
        riskLevel = insight.riskLevel.toLowerCase();
      } else if (snapshot) {
        if (snapshot.overallScore < 50) riskLevel = 'high';
        else if (snapshot.overallScore < 70) riskLevel = 'medium';
      }

      if (riskLevel === 'low') riskDistribution.low++;
      else if (riskLevel === 'medium') riskDistribution.medium++;
      else riskDistribution.high++;

      // Department breakdown
      const dept = emp.department || 'Unassigned';
      const deptData = departmentData.get(dept) || { count: 0, totalScore: 0 };
      deptData.count++;
      deptData.totalScore += snapshot?.overallScore || 0;
      departmentData.set(dept, deptData);

      processedEmployees.push({
        id: emp.id,
        name: emp.name,
        department: emp.department,
        overallScore: snapshot?.overallScore || 0,
        riskLevel
      });
    }

    // Sort for top performers and needs attention
    const sorted = [...processedEmployees].sort((a, b) => b.overallScore - a.overallScore);
    const topPerformers = sorted.slice(0, 10).filter(e => e.overallScore >= 70);
    const needsAttention = sorted
      .filter(e => e.riskLevel === 'high' || e.overallScore < 50)
      .slice(0, 10);

    // Format department breakdown
    const departmentBreakdown = Array.from(departmentData.entries()).map(([dept, data]) => ({
      department: dept,
      employeeCount: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0
    }));

    return {
      totalEmployees: employees.length,
      avgPerformanceScore: performanceCount > 0 ? totalPerformance / performanceCount : 0,
      avgCompetencyScore: snapshotCount > 0 ? totalCompetency / snapshotCount : 0,
      avgLearningScore: snapshotCount > 0 ? totalLearning / snapshotCount : 0,
      avgTrainingScore: snapshotCount > 0 ? totalTraining / snapshotCount : 0,
      departmentBreakdown,
      riskDistribution,
      topPerformers,
      needsAttention
    };
  }

  /**
   * Get performance insights summary for dashboard
   */
  async getDashboardSummary() {
    const [orgAnalytics, recentInsights] = await Promise.all([
      this.getOrgAnalytics(),
      prisma.aIInsight.findMany({
        where: {
          analysisType: 'FULL',
          expiresAt: { gt: new Date() }
        },
        orderBy: { generatedAt: 'desc' },
        take: 50,
        include: {
          employee: {
            select: { name: true, department: true }
          }
        }
      })
    ]);

    // Calculate AI insights distribution
    const insightsByRisk = { low: 0, medium: 0, high: 0 };
    const insightsByTrend = { improving: 0, stable: 0, declining: 0 };

    for (const insight of recentInsights) {
      const result = insight.analysisResult as any;
      
      const risk = result?.riskLevel?.toLowerCase() || 'medium';
      if (risk === 'low') insightsByRisk.low++;
      else if (risk === 'medium') insightsByRisk.medium++;
      else insightsByRisk.high++;

      const trend = result?.performanceTrend?.toLowerCase() || 'stable';
      if (trend === 'improving') insightsByTrend.improving++;
      else if (trend === 'stable') insightsByTrend.stable++;
      else insightsByTrend.declining++;
    }

    return {
      ...orgAnalytics,
      aiInsightsSummary: {
        totalAnalyzed: recentInsights.length,
        byRisk: insightsByRisk,
        byTrend: insightsByTrend
      },
      recentHighRiskEmployees: recentInsights
        .filter(i => (i.analysisResult as any)?.riskLevel === 'High')
        .slice(0, 5)
        .map(i => ({
          employeeId: i.employeeId,
          employeeName: i.employee.name,
          department: i.employee.department,
          insight: (i.analysisResult as any)?.insightSummary
        }))
    };
  }
}

