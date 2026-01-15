import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

// Types for Admin Dashboard
export interface KPIData {
  totalEmployees: number;
  publishedCourses: number;
  activeTrainings: number;
  totalCompetencies: number;
  successionPool: number;
  totalLearningHours: number;
}

export interface DepartmentData {
  name: string;
  employees: number;
}

export interface TrainingProgressData {
  month: string;
  completed: number;
  scheduled: number;
}

export interface CompetencyDistribution {
  name: string;
  value: number;
  color: string;
}

export interface LearningTrendData {
  month: string;
  enrollments: number;
  completions: number;
}

export interface SuccessionReadinessData {
  status: string;
  count: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'training' | 'learning' | 'competency' | 'succession' | 'employee';
  message: string;
  time: string;
  status: 'completed' | 'pending' | 'scheduled';
}

export interface ChartData {
  employeesByDepartment: DepartmentData[];
  trainingProgress: TrainingProgressData[];
  competencyDistribution: CompetencyDistribution[];
  learningTrends: LearningTrendData[];
  successionReadiness: SuccessionReadinessData[];
}

export interface AdminDashboardData {
  kpis: KPIData;
  charts: ChartData;
  recentActivity: RecentActivity[];
}

const handleError = (error: unknown): never => {
  const axiosError = error as AxiosError<ErrorResponse>;
  if (axiosError.response) throw new Error(axiosError.response.data.error || (axiosError.response.data as any).message);
  else if (axiosError.request) throw new Error("Network error - no response from server");
  else throw new Error("Request failed to be created");
};

/**
 * Get Admin Dashboard data
 * Aggregates data from all modules for the admin overview
 */
export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  try {
    const result = await axiosInstance.get(`/api/v1/dashboard/admin`);
    return result.data.dashboard;
  } catch (error) {
    handleError(error);
    throw error; // TypeScript needs this
  }
};

