import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

// Get all recommendations
export const getRecommendations = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/training-recommendation/list`);
    return result.data.recommendations;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get single recommendation by ID
export const getRecommendationById = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/training-recommendation/${id}`);
    return result.data.recommendation;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get recommendations by competency
export const getRecommendationsByCompetency = async (competencyId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/training-recommendation/competency/${competencyId}`);
    return result.data.recommendations;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get recommendations by difficulty level
export const getRecommendationsByDifficulty = async (difficultyLevel: number) => {
  try {
    const result = await axiosInstance.get(`/api/v1/training-recommendation/difficulty/${difficultyLevel}`);
    return result.data.recommendations;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Create recommendation
export const createRecommendation = async (data: {
  competencyId: string;
  title: string;
  description?: string;
  link?: string;
  difficultyLevel: number;
  courseId?: string;
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/training-recommendation/create`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return result.data.recommendation;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update recommendation
export const updateRecommendation = async (id: string, data: {
  title?: string;
  description?: string;
  link?: string;
  difficultyLevel?: number;
  courseId?: string;
}) => {
  try {
    const result = await axiosInstance.put(`/api/v1/training-recommendation/update/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return result.data.recommendation;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Delete recommendation
export const deleteRecommendation = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/training-recommendation/delete/${id}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

