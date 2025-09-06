import axios, { AxiosError } from "axios";
import { ErrorResponse } from "../types";

const urlAPI = import.meta.env.VITE_SERVER_URL;

// Analyze single employee performance
export const analyzeEmployeePerformance = async (employeeId: string) => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/performance/employee/${employeeId}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Organization-wide performance analytics
export const getOrgPerformanceAnalytics = async () => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/performance/organization`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};
