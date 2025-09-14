import axios, { AxiosError } from "axios";
import { ErrorResponse } from "../types";

const urlAPI = import.meta.env.VITE_SERVER_URL;

// ---------------- Training Sessions ----------------

// Create a training session
export const createTrainingSession = async (data: any) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/training/session`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return result.data.sessions;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get all training sessions
export const getTrainingSessions = async () => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/training/session`, {
      withCredentials: true,
    });
    return result.data.sessions;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get a training session by ID
export const getTrainingSessionById = async (id: string) => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/training/session/${id}`, {
      withCredentials: true,
    });
    return result.data.session;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update a training session
export const updateTrainingSession = async (id: string, data: any) => {
  try {
    const result = await axios.put(
      `${urlAPI}/api/v1/training/session/${id}`,
      data,
      {
        withCredentials: true,
      }
    );
    return result.data.session;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Delete a training session
export const deleteTrainingSession = async (id: string) => {
  try {
    const result = await axios.delete(
      `${urlAPI}/api/v1/training/session/${id}`,
      {
        withCredentials: true,
      }
    );
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// ---------------- Training Records ----------------

// Add a training record
export const addTrainingRecord = async (data: any) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/training/record`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return result.data.record;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get records by training session
export const getRecordsBySession = async (trainingId: string) => {
  try {
    const result = await axios.get(
      `${urlAPI}/api/v1/training/record/session/${trainingId}`,
      {
        withCredentials: true,
      }
    );
    return result.data.records;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Get records by employee
export const getRecordsByEmployee = async (employeeId: string) => {
  try {
    const result = await axios.get(
      `${urlAPI}/api/v1/training/record/employee/${employeeId}`,
      {
        withCredentials: true,
      }
    );
    return result.data.records;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Update a training record
export const updateTrainingRecord = async (id: string, data: any) => {
  try {
    const result = await axios.put(
      `${urlAPI}/api/v1/training/record/${id}`,
      data,
      {
        withCredentials: true,
      }
    );
    return result.data.record;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request)
      throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};
