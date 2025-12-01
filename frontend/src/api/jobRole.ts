import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

// Get all job roles
export const getJobRoles = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/job-role/list`);
    return result.data.jobRoles;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get single job role by ID
export const getJobRoleById = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/job-role/${id}`);
    return result.data.jobRole;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Create job role
export const createJobRole = async (data: { name: string; description?: string }) => {
  try {
    const result = await axiosInstance.post(`/api/v1/job-role/create`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return result.data.jobRole;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update job role
export const updateJobRole = async (id: string, data: { name?: string; description?: string }) => {
  try {
    const result = await axiosInstance.put(`/api/v1/job-role/update/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return result.data.jobRole;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Delete job role
export const deleteJobRole = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/job-role/delete/${id}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

