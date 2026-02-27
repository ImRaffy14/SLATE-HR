import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

const handleError = (error: unknown): never => {
  const axiosError = error as AxiosError<ErrorResponse>;
  if (axiosError.response) throw new Error(axiosError.response.data.error);
  if (axiosError.request) throw new Error("Network error - no response from server");
  throw new Error("Request failed to be created");
};

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

export const getESSDashboard = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/dashboard`);
    return result.data.dashboard;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// CAREER PATH FUNCTIONS
// ============================================

export const getCareerPath = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/career-path`);
    return result.data.careerPath;
  } catch (error) {
    handleError(error);
  }
};

export const getCareerPathDetails = async (targetRoleId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/career-path/${targetRoleId}`);
    return result.data.careerPathDetails;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// ENROLLMENT FUNCTIONS
// ============================================

export const enrollInCourse = async (courseId: string) => {
  try {
    const result = await axiosInstance.post(`/api/v1/ess/enroll/course/${courseId}`);
    return result.data.enrollment;
  } catch (error) {
    handleError(error);
  }
};

export const enrollInTraining = async (trainingId: string) => {
  try {
    const result = await axiosInstance.post(`/api/v1/ess/enroll/training/${trainingId}`);
    return result.data.enrollment;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// ACHIEVEMENT FUNCTIONS
// ============================================

export const getAchievements = async (filters?: {
  status?: string;
  competencyId?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/achievements`, {
      params: filters,
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const uploadAchievement = async (file: File, data: {
  title: string;
  description?: string;
  competencyId?: string;
}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.competencyId) {
      formData.append('competencyId', data.competencyId);
    }

    const result = await axiosInstance.post(`/api/v1/ess/upload/achievement`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return result.data.achievement;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

export const getNotifications = async (filters?: {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/notifications`, {
      params: filters,
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const markNotificationRead = async (notificationId: string) => {
  try {
    const result = await axiosInstance.patch(`/api/v1/ess/notifications/${notificationId}/read`);
    return result.data.notification;
  } catch (error) {
    handleError(error);
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/notifications/unread-count`);
    return result.data.count;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// ATTENDANCE (MOCK) FUNCTIONS
// ============================================

export interface ESSAttendanceRecord {
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  timeIn: string | null;
  timeOut: string | null;
  source: string;
}

export const getEssAttendance = async (): Promise<ESSAttendanceRecord[]> => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/attendance`);
    return result.data.attendance || [];
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// PERFORMANCE FUNCTIONS
// ============================================

export interface ESSPerformanceSummaryResponse {
  currentRating?: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  summary?: {
    performanceTrend?: string;
    competencyGrowth?: string;
    learningActivity?: string;
    trainingAttendance?: string;
  };
  history?: {
    period: string;
    overallScore: number;
    performanceScore: number;
    competencyScore: number;
    learningScore: number;
    trainingScore: number;
  }[];
  aiInsight?: {
    strengthAreas?: string[];
    developmentAreas?: string[];
    recommendations?: string[];
  };
  recommendations?: {
    id: string;
    title: string;
    type: string;
    priority: string;
    rationale: string;
    linkedCourseId?: string;
    linkedTrainingId?: string;
  }[];
  disclaimer?: string;
  goals?: {
    id: string;
    title: string;
    status: string;
    progress: number;
  }[];
  feedback?: {
    id: string;
    type: string;
    message: string;
    date: string;
  }[];
}

export const getPerformanceSummary = async (): Promise<ESSPerformanceSummaryResponse | undefined> => {
  try {
    const result = await axiosInstance.get(`/api/v1/ess/performance-summary`);
    return result.data.performanceSummary;
  } catch (error) {
    // Return empty object if endpoint doesn't exist yet
    console.warn("Performance summary endpoint not available");
    return {};
  }
};

