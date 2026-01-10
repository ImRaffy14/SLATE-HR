// Performance Analysis Types

export interface PerformanceSummary {
  employeeId: string;
  period: string;
  trend: 'Improving' | 'Stable' | 'Declining';
  competencyGrowth: 'High' | 'Moderate' | 'Low' | 'Stagnant';
  learningActivity: 'High' | 'Moderate' | 'Low' | 'None';
  trainingAttendance: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  lastRating: number;
  skillGaps: number;
}

export interface AIAnalysisResult {
  performanceTrend: 'Improving' | 'Stable' | 'Declining';
  riskLevel: 'Low' | 'Medium' | 'High';
  keyFactors: string[];
  insightSummary: string;
  recommendations: string[];
  promotionReadiness?: number; // 0-100
  strengthAreas?: string[];
  developmentAreas?: string[];
}

export interface AIRecommendation {
  type: 'course' | 'training' | 'coaching' | 'mentoring' | 'assignment';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  linkedCourseId?: string;
  linkedTrainingId?: string;
  linkedCompetencyId?: string;
  rationale: string;
}

export interface EmployeeMetrics {
  employeeId: string;
  employeeName: string;
  department: string | null;
  position: string | null;
  
  // Performance scores
  latestPerformanceScore: number | null;
  performanceHistory: Array<{
    score: number;
    reviewDate: Date;
  }>;
  
  // Competency metrics
  avgCompetencyScore: number | null;
  competencyCount: number;
  competencyScores: Array<{
    competencyId: string;
    competencyName: string;
    finalScore: number | null;
  }>;
  
  // Learning metrics
  coursesEnrolled: number;
  coursesCompleted: number;
  courseCompletionRate: number;
  avgCourseGrade: number | null;
  
  // Training metrics
  trainingsEnrolled: number;
  trainingsAttended: number;
  trainingAttendanceRate: number;
  avgTrainingRating: number | null;
  
  // Gap analysis
  totalGaps: number;
  criticalGaps: number; // gaps >= 2 levels
}

export interface TeamAnalytics {
  managerId: string;
  teamSize: number;
  avgPerformanceScore: number;
  avgCompetencyScore: number;
  avgLearningScore: number;
  avgTrainingScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  promotionReady: number;
  needsAttention: number;
  employees: Array<{
    id: string;
    name: string;
    overallScore: number;
    riskLevel: string;
  }>;
}

export interface OrgAnalytics {
  totalEmployees: number;
  avgPerformanceScore: number;
  avgCompetencyScore: number;
  avgLearningScore: number;
  avgTrainingScore: number;
  departmentBreakdown: Array<{
    department: string;
    employeeCount: number;
    avgScore: number;
  }>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  topPerformers: Array<{
    id: string;
    name: string;
    department: string | null;
    overallScore: number;
  }>;
  needsAttention: Array<{
    id: string;
    name: string;
    department: string | null;
    overallScore: number;
    riskLevel: string;
  }>;
}

export interface SnapshotData {
  employeeId: string;
  period: string;
  performanceScore: number;
  competencyScore: number;
  learningScore: number;
  trainingScore: number;
  overallScore: number;
}

