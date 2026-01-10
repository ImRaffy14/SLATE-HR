import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

// Helper function to handle errors
const handleError = (error: unknown) => {
  const axiosError = error as AxiosError<ErrorResponse>;
  if (axiosError.response) throw new Error(axiosError.response.data.error);
  else if (axiosError.request) throw new Error("Network error - no response from server");
  else throw new Error("Request failed to be created");
};

// =============================================
// DATA AGGREGATION ENDPOINTS
// =============================================

// Sync all employee performance snapshots
export const syncPerformanceSnapshots = async () => {
  try {
    const result = await axiosInstance.post('/api/v1/performance/sync');
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get all employees with latest metrics
export const getAllEmployeesWithMetrics = async () => {
  try {
    const result = await axiosInstance.get('/api/v1/performance/employees');
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get employee performance history
export const getEmployeeHistory = async (employeeId: string, limit?: number) => {
  try {
    const result = await axiosInstance.get(`/api/v1/performance/employee/${employeeId}/history`, {
      params: { limit }
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get employee metrics
export const getEmployeeMetrics = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/performance/employee/${employeeId}/metrics`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Create snapshot for employee
export const createEmployeeSnapshot = async (employeeId: string, period?: string) => {
  try {
    const result = await axiosInstance.post(`/api/v1/performance/employee/${employeeId}/snapshot`, { period });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// =============================================
// AI ANALYSIS ENDPOINTS
// =============================================

// Analyze employee performance with AI
export const analyzeEmployeeWithAI = async (employeeId: string, forceRefresh = false) => {
  try {
    const result = await axiosInstance.post(`/api/v1/performance/ai/analyze/${employeeId}`, { forceRefresh });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get AI-generated recommendations
export const getAIRecommendations = async (employeeId: string, forceRefresh = false) => {
  try {
    const result = await axiosInstance.get(`/api/v1/performance/ai/recommendations/${employeeId}`, {
      params: { refresh: forceRefresh }
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get quick recommendations (without AI)
export const getQuickRecommendations = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/performance/ai/quick-recommendations/${employeeId}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get explainable AI output
export const getExplainableAI = async (employeeId: string, includeAI = false) => {
  try {
    const result = await axiosInstance.get(`/api/v1/performance/ai/explain/${employeeId}`, {
      params: { includeAI }
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get all cached insights
export const getAllInsights = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/performance/ai/insights/${employeeId}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Assess risk for employee
export const assessEmployeeRisk = async (employeeId: string, forceRefresh = false) => {
  try {
    const result = await axiosInstance.post(`/api/v1/performance/ai/risk/${employeeId}`, { forceRefresh });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Analyze trend
export const analyzeEmployeeTrend = async (employeeId: string, forceRefresh = false) => {
  try {
    const result = await axiosInstance.post(`/api/v1/performance/ai/trend/${employeeId}`, { forceRefresh });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Cleanup expired insights
export const cleanupExpiredInsights = async () => {
  try {
    const result = await axiosInstance.post('/api/v1/performance/ai/cleanup');
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// =============================================
// ANALYTICS ENDPOINTS
// =============================================

// Get team analytics for specific manager
export const getTeamAnalytics = async (managerId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/performance/analytics/team/${managerId}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get team analytics for logged-in manager
export const getMyTeamAnalytics = async () => {
  try {
    const result = await axiosInstance.get('/api/v1/performance/analytics/my-team');
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get organization-wide analytics (HR)
export const getOrgAnalytics = async () => {
  try {
    const result = await axiosInstance.get('/api/v1/performance/analytics/hr');
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// Get dashboard summary
export const getDashboardSummary = async () => {
  try {
    const result = await axiosInstance.get('/api/v1/performance/analytics/dashboard');
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// =============================================
// TYPES
// =============================================

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
  promotionReadiness?: number;
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

export interface EmployeeWithMetrics {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  latestPerformanceScore: number | null;
  latestSnapshot: {
    id: string;
    period: string;
    performanceScore: number;
    competencyScore: number;
    learningScore: number;
    trainingScore: number;
    overallScore: number;
  } | null;
  latestInsight: {
    analysisResult: AIAnalysisResult;
    generatedAt: string;
  } | null;
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
