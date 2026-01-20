import { AxiosError } from "axios";
import { ErrorResponse } from "../types";
import axiosInstance from "@/lib/axios";

const handleError = (error: unknown): never => {
  const axiosError = error as AxiosError<ErrorResponse>;
  if (axiosError.response) throw new Error(axiosError.response.data.error);
  if (axiosError.request) throw new Error("Network error - no response from server");
  throw new Error("Request failed to be created");
};

// ============================================
// COURSE FUNCTIONS
// ============================================

export const getCourses = async (filters?: {
  status?: string;
  categoryId?: string;
  competencyId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/courses`, {
      params: filters,
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCourseById = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/courses/${id}`);
    return result.data.course;
  } catch (error) {
    handleError(error);
  }
};

export const createCourse = async (data: any) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/courses`, data);
    return result.data.course;
  } catch (error) {
    handleError(error);
  }
};

export const updateCourse = async (id: string, data: any) => {
  try {
    const result = await axiosInstance.put(`/api/v1/learning/courses/${id}`, data);
    return result.data.course;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCourse = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/learning/courses/${id}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// MATERIAL FUNCTIONS
// ============================================

export const addMaterial = async (courseId: string, data: {
  type: string;
  url: string;
  title: string;
  description?: string;
  order?: number;
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/courses/${courseId}/materials`, data);
    return result.data.material;
  } catch (error) {
    handleError(error);
  }
};

export const uploadMaterial = async (courseId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const result = await axiosInstance.post(`/api/v1/learning/courses/${courseId}/materials/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return result.data.material;
  } catch (error) {
    handleError(error);
  }
};

export const updateMaterial = async (id: string, data: {
  title?: string;
  description?: string;
  order?: number;
}) => {
  try {
    const result = await axiosInstance.put(`/api/v1/learning/materials/${id}`, data);
    return result.data.material;
  } catch (error) {
    handleError(error);
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/learning/materials/${id}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// QUIZ FUNCTIONS
// ============================================

export const createQuiz = async (courseId: string, data: {
  title: string;
  description?: string;
  totalPoints: number;
  passingScore: number;
  timeLimit?: number;
  allowRetake?: boolean;
  questions: Array<{
    question: string;
    questionType: string;
    points: number;
    order?: number;
    choices: Array<{ text: string; isCorrect: boolean }>;
    correctAnswer: string;
  }>;
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/courses/${courseId}/quizzes`, data);
    return result.data.quiz;
  } catch (error) {
    handleError(error);
  }
};

export const getQuiz = async (id: string, enrollmentId?: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/quizzes/${id}`, {
      params: { enrollmentId },
    });
    return result.data.quiz;
  } catch (error) {
    handleError(error);
  }
};

export const updateQuiz = async (id: string, data: any) => {
  try {
    const result = await axiosInstance.put(`/api/v1/learning/quizzes/${id}`, data);
    return result.data.quiz;
  } catch (error) {
    handleError(error);
  }
};

export const deleteQuiz = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/learning/quizzes/${id}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const submitQuiz = async (quizId: string, enrollmentId: string, answers: Array<{
  questionId: string;
  answer: string;
}>) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/quizzes/${quizId}/submit`, {
      enrollmentId,
      answers,
    });
    return result.data.attempt;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// ENROLLMENT FUNCTIONS
// ============================================

export const enrollEmployee = async (data: {
  employeeId: string;
  courseId: string;
  isRequired?: boolean;
}) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/enrollments`, data);
    return result.data.enrollment;
  } catch (error) {
    handleError(error);
  }
};

export const autoEnrollBasedOnGap = async (employeeId: string) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/enrollments/auto-enroll`, {
      employeeId,
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllEnrollments = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/enrollments`);
    return result.data.enrollments;
  } catch (error) {
    handleError(error);
  }
};

export const getEmployeeEnrollments = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/enrollments/employee/${employeeId}`);
    return result.data.enrollments;
  } catch (error) {
    handleError(error);
  }
};

export const getEnrollmentDetails = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/enrollments/${id}`);
    return result.data.enrollment || result.data.content;
  } catch (error) {
    handleError(error);
  }
};

export const updateEnrollmentProgress = async (id: string) => {
  try {
    const result = await axiosInstance.patch(`/api/v1/learning/enrollments/${id}/progress`, {});
    return result.data.enrollment;
  } catch (error) {
    handleError(error);
  }
};

export const completeCourse = async (id: string) => {
  try {
    const result = await axiosInstance.patch(`/api/v1/learning/enrollments/${id}/complete`, {});
    return result.data.enrollment;
  } catch (error) {
    handleError(error);
  }
};

// Feedback
export const addFeedback = async (courseId: string, rating: number, comment?: string) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/feedback`, { courseId, rating, comment });
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
    const result = await axiosInstance.get(`/api/v1/learning/feedback/${courseId}`);
    return result.data.feedback;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) throw new Error(axiosError.response.data.error);
    else if (axiosError.request) throw new Error("Network error - no response from server");
    else throw new Error("Request failed to be created");
  }
};

export const deleteEnrollment = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/learning/enrollments/${id}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// PROGRESS FUNCTIONS
// ============================================

export const getEmployeeProgress = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/progress/${employeeId}`);
    return result.data.progress;
  } catch (error) {
    handleError(error);
  }
};

export const markMaterialComplete = async (materialId: string, enrollmentId: string, timeSpent?: number) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/materials/${materialId}/complete`, {
      enrollmentId,
      timeSpent,
    });
    return result.data.progress;
  } catch (error) {
    handleError(error);
  }
};

export const getCourseContent = async (enrollmentId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/enrollments/${enrollmentId}/content`);
    return result.data.content;
  } catch (error) {
    handleError(error);
  }
};

export const getQuizAttempt = async (quizId: string, enrollmentId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/quizzes/${quizId}/attempt`, {
      params: { enrollmentId },
    });
    return result.data.attempt;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// CERTIFICATE FUNCTIONS
// ============================================

export const generateCertificate = async (enrollmentId: string) => {
  try {
    const result = await axiosInstance.post(`/api/v1/learning/enrollments/${enrollmentId}/certificate`, {}, {
      responseType: 'blob', // Important: handle binary data (PDF)
    });
    
    // Create blob URL and trigger download
    const blob = new Blob([result.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = result.headers['content-disposition'];
    let filename = 'Certificate.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    // Return success indicator
    return { success: true, message: 'Certificate generated and downloaded successfully' };
  } catch (error) {
    handleError(error);
  }
};

export const getCertificate = async (enrollmentId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/certificates/${enrollmentId}`);
    return result.data.certificate;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// REPORTING FUNCTIONS
// ============================================

export const getCompletionReport = async (filters?: {
  employeeId?: string;
  courseId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/reports/completion`, {
      params: filters,
    });
    return result.data.report;
  } catch (error) {
    handleError(error);
  }
};

export const getLearningHoursReport = async (filters?: {
  employeeId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/reports/learning-hours`, {
      params: filters,
    });
    return result.data.report;
  } catch (error) {
    handleError(error);
  }
};

export const getCourseAnalytics = async () => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/reports/analytics`);
    return result.data.analytics;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getRecommendedCourses = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/learning/recommended/${employeeId}`);
    return result.data.courses;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// LEGACY FUNCTIONS (kept for backward compatibility)
// ============================================

export const updateEnrollmentStatus = async (id: string, status: string) => {
  try {
    const result = await axiosInstance.patch(`/api/v1/learning/enrollments/${id}/progress`, {});
    return result.data.enrollment;
  } catch (error) {
    handleError(error);
  }
};