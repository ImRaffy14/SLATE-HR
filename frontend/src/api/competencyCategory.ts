import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

// Get all categories (optionally filter by job role ID or employee ID)
export const getCategories = async (jobRoleId?: string, employeeId?: string) => {
  try {
    const params = new URLSearchParams();
    if (jobRoleId) params.append("jobRoleId", jobRoleId);
    if (employeeId) params.append("employeeId", employeeId);
    
    const queryString = params.toString();
    const url = `/api/v1/competency-category/list${queryString ? `?${queryString}` : ""}`;
    
    const result = await axiosInstance.get(url, {
    });
    return result.data.categories;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get single category by ID
export const getCategoryById = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/competency-category/${id}`, {
    });
    return result.data.category;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Create category
export const createCategory = async (data: { name: string; description?: string; jobRoleIds?: string[] }) => {
  try {
    const result = await axiosInstance.post(`/api/v1/competency-category/create`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    return result.data.category;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update category
export const updateCategory = async (id: string, data: { name?: string; description?: string; jobRoleIds?: string[] }) => {
  try {
    const result = await axiosInstance.put(`/api/v1/competency-category/update/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    return result.data.category;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Delete category
export const deleteCategory = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/competency-category/delete/${id}`, {
      withCredentials: true
    });
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

