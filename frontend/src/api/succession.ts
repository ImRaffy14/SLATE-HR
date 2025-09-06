import axios, { AxiosError } from "axios";
import { ErrorResponse } from "../types";

const urlAPI = import.meta.env.VITE_SERVER_URL;

// ==================== Succession Planning APIs ====================

// Get all succession plans
export const getSuccessionPlans = async () => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/succession/list`);
    return result.data.plans;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get a succession plan by ID
export const getSuccessionPlanById = async (id: string) => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/succession/${id}`);
    return result.data.plan;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Create a new succession plan
export const createSuccessionPlan = async (data: {
  employeeId: string;
  potentialSuccessorId: string;
  readinessLevel: string;
  notes?: string;
}) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/succession`, data);
    return result.data.plan;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update a succession plan
export const updateSuccessionPlan = async (id: string, data: {
  potentialSuccessorId?: string;
  readinessLevel?: string;
  notes?: string;
}) => {
  try {
    const result = await axios.put(`${urlAPI}/api/v1/succession/${id}`, data);
    return result.data.plan;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Delete a succession plan
export const deleteSuccessionPlan = async (id: string) => {
  try {
    const result = await axios.delete(`${urlAPI}/api/v1/succession/${id}`);
    return result.data.message;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};
