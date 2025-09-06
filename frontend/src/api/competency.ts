import axios, { AxiosError } from "axios";
import { ErrorResponse } from "../types";

const urlAPI = import.meta.env.VITE_SERVER_URL;

// Get all competencies
export const getCompetencies = async () => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/competency/list`);
    return result.data.competencies;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Create a competency
export const createCompetency = async (data: any) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/competency/create`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
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
export const updateCompetency = async (id: string, data: { name: string; description?: string; role: string }) => {
  try {
    const result = await axios.put(`${urlAPI}/api/v1/competency/update/${id}`, data);
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
    const result = await axios.delete(`${urlAPI}/api/v1/competency/delete/${id}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Competency assessments
export const addAssessment = async (data: any) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/competency/assessment`, data, {
      withCredentials: true
    });
    return result.data.assessment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};
