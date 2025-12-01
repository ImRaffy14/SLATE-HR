import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

// Get all competencies (optionally filter by job role ID or employee ID)
export const getCompetencies = async (jobRoleId?: string, employeeId?: string) => {
  try {
    const params = new URLSearchParams();
    if (jobRoleId) params.append("jobRoleId", jobRoleId);
    if (employeeId) params.append("employeeId", employeeId);
    
    const queryString = params.toString();
    const url = `/api/v1/competency/list${queryString ? `?${queryString}` : ""}`;
    
    const result = await axiosInstance.get(url);
    return result.data.competencies;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get single competency by ID
export const getCompetencyById = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/competency/${id}`);
    return result.data.competency;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Create a competency
export const createCompetency = async (data: {
  name: string;
  description?: string;
  categoryId: string;
  levels: Array<{ levelNumber: number; title: string; definition: string }>;
  weight: number;
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/competency/create`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return result.data.competency;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update a competency
export const updateCompetency = async (id: string, data: {
  name?: string;
  description?: string;
  categoryId?: string;
  levels?: Array<{ levelNumber: number; title: string; definition: string }>;
  weight?: number;
}) => {
  try {
    const result = await axiosInstance.put(`/api/v1/competency/update/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return result.data.competency;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Delete a competency
export const deleteCompetency = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/competency/delete/${id}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Assign competency to employee
export const assignCompetencyToEmployee = async (data: {
  employeeId: string;
  competencyId: string;
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/competency/assign`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return result.data.assignment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update self-rating
export const updateSelfRating = async (id: string, selfRating: number) => {
  try {
    const result = await axiosInstance.put(`/api/v1/competency/self-rating/${id}`, {
      selfRating
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return result.data.employeeCompetency;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update manager rating
export const updateManagerRating = async (id: string, managerRating: number, notes?: string) => {
  try {
    const result = await axiosInstance.put(`/api/v1/competency/manager-rating/${id}`, {
      managerRating,
      notes
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return result.data.employeeCompetency;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Upload attachment
export const uploadAttachment = async (id: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await axiosInstance.post(`/api/v1/competency/upload/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return result.data.employeeCompetency;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get employee competencies
export const getEmployeeCompetencies = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/competency/employee/${employeeId}`);
    return result.data.competencies;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Run gap analysis
export const runGapAnalysis = async (data: {
  employeeId: string;
  competencyId: string;
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/competency/gap-analysis`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return result.data.gapAnalysis;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get gap analysis
export const getGapAnalysis = async (employeeId: string, competencyId?: string) => {
  try {
    const params = competencyId ? `?competencyId=${competencyId}` : '';
    const result = await axiosInstance.get(`/api/v1/competency/gap-analysis/${employeeId}${params}`);
    return result.data.gapAnalysis;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Generate gap report
export const generateGapReport = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/competency/gap-report/${employeeId}`);
    return result.data.report;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get recommendations for employee
export const getRecommendations = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/competency/recommendations/${employeeId}`);
    return result.data.recommendations;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get analytics
export const getAnalytics = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/competency/analytics`);
    return result.data.analytics;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get suggested competencies for employee based on job role
export const getSuggestedCompetencies = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/competency/suggest/${employeeId}`);
    return result.data.suggested;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Batch update manager ratings
export const batchUpdateManagerRatings = async (
  employeeId: string,
  ratings: Array<{ competencyId: string; rating: number; notes?: string }>
) => {
  try {
    const result = await axiosInstance.put(
      `/api/v1/competency/batch-ratings`,
      {
        employeeId,
        ratings,
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return result.data.employeeCompetencies;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Legacy: Add assessment (deprecated, kept for backward compatibility)
export const addAssessment = async (data: any) => {
  try {
    const result = await axiosInstance.post(`/api/v1/competency/assessment`, data);
    return result.data.assessment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};
