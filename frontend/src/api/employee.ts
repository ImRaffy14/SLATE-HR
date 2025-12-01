import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

// Get all employees
export const getEmployees = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/employee/list`, {
    });
    return result.data.employees;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get single employee by ID
export const getEmployeeById = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/employee/${id}`, {
    });
    return result.data.employee;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Create an employee
export const createEmployee = async (data: {
  employeeId: string;
  name: string;
  email?: string;
  department?: string;
  position?: string;
  positionId?: string;
  dateHired?: string;
  status?: "ACTIVE" | "INACTIVE";
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/employee/create`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return result.data.employee;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMessage = axiosError.response.data.error || axiosError.response.data.message || "Failed to create employee";
      console.error("Create employee API error:", {
        status: axiosError.response.status,
        data: axiosError.response.data,
        error: errorMessage
      });
      throw new Error(errorMessage);
    } else if (axiosError.request) {
      throw new Error("Network error - no response from server");
    } else {
      throw new Error("Request failed to be created");
    }
  }
};

// Update an employee
export const updateEmployee = async (id: string, data: {
  employeeId?: string;
  name?: string;
  email?: string;
  department?: string;
  position?: string;
  positionId?: string;
  dateHired?: string;
  status?: "ACTIVE" | "INACTIVE";
}) => {
  try {
    const result = await axiosInstance.put(`/api/v1/employee/update/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return result.data.employee;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Delete an employee
export const deleteEmployee = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/employee/delete/${id}`, {
    });
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};