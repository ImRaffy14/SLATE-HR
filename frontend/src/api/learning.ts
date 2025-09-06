import axios, { AxiosError } from "axios";
import { ErrorResponse } from "../types";

const urlAPI = import.meta.env.VITE_SERVER_URL;

// Courses
export const getCourses = async () => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/learning/courses`);
    return result.data.courses;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

export const getCourseById = async (id: string) => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/learning/courses/${id}`);
    return result.data.course;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

export const createCourse = async (data: FormData) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/learning/courses`, data);
    return result.data.course;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

export const updateCourse = async (id: string, data: FormData) => {
  try {
    const result = await axios.put(`${urlAPI}/api/v1/learning/courses/${id}`, data);
    return result.data.course;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

export const deleteCourse = async (id: string) => {
  try {
    const result = await axios.delete(`${urlAPI}/api/v1/learning/courses/${id}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Enrollments
export const enrollEmployee = async (data: { employeeId: string; courseId: string }) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/learning/enrollments`, data);
    return result.data.enrollment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

export const updateEnrollmentStatus = async (id: string, status: string) => {
  try {
    const result = await axios.put(`${urlAPI}/api/v1/learning/enrollments/${id}`, { status });
    return result.data.enrollment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

// Feedback
export const addFeedback = async (courseId: string, rating: number, comment?: string) => {
  try {
    const result = await axios.post(`${urlAPI}/api/v1/learning/feedback`, { courseId, rating, comment });
    return result.data.feedback;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

export const getCourseFeedback = async (courseId: string) => {
  try {
    const result = await axios.get(`${urlAPI}/api/v1/learning/feedback/${courseId}`);
    return result.data.feedback;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};
