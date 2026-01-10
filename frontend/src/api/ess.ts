import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

const handleError = (error: unknown): never => {
  const axiosError = error as AxiosError<ErrorResponse>;
  if (axiosError.response) throw new Error(axiosError.response.data.error || axiosError.response.data.message);
  else if (axiosError.request) throw new Error("Network error - no response from server");
  else throw new Error("Request failed to be created");
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

