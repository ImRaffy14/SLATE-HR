import axios, { AxiosError } from "axios";
import { ErrorResponse } from "../types";

const urlAPI = import.meta.env.VITE_SERVER_URL;

// Get all employees
export const getEmployees = async () => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/employee/list`, {
      withCredentials: true
    });
    return result.data.employees;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};
