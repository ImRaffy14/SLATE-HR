import { AxiosError } from 'axios';
import { ErrorResponse } from '../types';
import axiosInstance from '@/lib/axios';
import {
  Training,
  TrainingEnrollment,
  TrainingAttendance,
  TrainingEvaluation,
  TrainingHoursReport,
  AttendanceSummaryReport,
  TrainerEffectivenessReport,
  TrainingCompetencyImpact
} from '@/types/training';

// ==================== Training CRUD ====================

export const createTraining = async (data: {
  title: string;
  description?: string;
  trainingType: 'ONLINE' | 'ONSITE' | 'HYBRID';
  startDate: string;
  endDate: string;
  durationHours: number;
  venueId?: string;
  trainerId?: string;
  trainerName?: string;
  venueName?: string;
  meetingLink?: string;
  address?: string;
  taggedCompetencies: string[];
  maxParticipants: number;
}) => {
  try {
    const result = await axiosInstance.post('/api/v1/trainings', data);
    return result.data.training;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getTrainings = async (filters?: {
  status?: string;
  trainingType?: string;
  startDate?: string;
  endDate?: string;
  trainerId?: string;
  venueId?: string;
  page?: number;
  limit?: number;
}): Promise<{ trainings: Training[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.trainingType) params.append('trainingType', filters.trainingType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.trainerId) params.append('trainerId', filters.trainerId);
    if (filters?.venueId) params.append('venueId', filters.venueId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const result = await axiosInstance.get(`/api/v1/trainings?${params.toString()}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getTrainingById = async (id: string): Promise<Training> => {
  try {
    const result = await axiosInstance.get(`/api/v1/trainings/${id}`);
    return result.data.training;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getTrainers = async (): Promise<any[]> => {
  try {
    const result = await axiosInstance.get('/api/v1/trainings/trainers');
    return result.data.trainers;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getVenues = async (): Promise<any[]> => {
  try {
    const result = await axiosInstance.get('/api/v1/trainings/venues');
    return result.data.venues;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const updateTraining = async (id: string, data: Partial<Training>) => {
  try {
    const result = await axiosInstance.put(`/api/v1/trainings/${id}`, data);
    return result.data.training;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const deleteTraining = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/trainings/${id}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const suggestTrainings = async (employeeId: string): Promise<Training[]> => {
  try {
    const result = await axiosInstance.get(`/api/v1/trainings/suggestions/${employeeId}`);
    return result.data.trainings;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

// ==================== Enrollment ====================

export const enrollInTraining = async (trainingId: string, employeeId: string, enrollmentType?: 'MANUAL' | 'AUTO' | 'SELF') => {
  try {
    const result = await axiosInstance.post(`/api/v1/trainings/${trainingId}/enroll`, {
      trainingId,
      employeeId,
      enrollmentType: enrollmentType || 'SELF'
    });
    return result.data.enrollment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getEmployeeTrainings = async (employeeId: string, filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ enrollments: TrainingEnrollment[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    // Increase default limit to get all enrollments
    const limit = filters?.limit || 100;
    params.append('limit', limit.toString());

    const result = await axiosInstance.get(`/api/v1/training-enrollment/employee/${employeeId}/trainings?${params.toString()}`);
    // Backend returns { status: 'success', enrollments: [...], pagination: {...} }
    // Extract enrollments and pagination from the response
    return {
      enrollments: result.data.enrollments || [],
      pagination: result.data.pagination || {}
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getTrainingEnrollments = async (trainingId: string, filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ enrollments: TrainingEnrollment[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const result = await axiosInstance.get(`/api/v1/training-enrollment/training/${trainingId}?${params.toString()}`);
    // Backend returns { status: 'success', enrollments: [...], pagination: {...} }
    // Extract enrollments and pagination from the response
    return {
      enrollments: result.data.enrollments || [],
      pagination: result.data.pagination || {}
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const approveEnrollment = async (enrollmentId: string) => {
  try {
    const result = await axiosInstance.patch(`/api/v1/training-enrollment/${enrollmentId}/approve`);
    return result.data.enrollment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const rejectEnrollment = async (enrollmentId: string, rejectionReason?: string) => {
  try {
    const result = await axiosInstance.patch(`/api/v1/training-enrollment/${enrollmentId}/reject`, {
      rejectionReason
    });
    return result.data.enrollment;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getPendingEnrollments = async (filters?: {
  trainingId?: string;
  page?: number;
  limit?: number;
}): Promise<{ enrollments: TrainingEnrollment[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.trainingId) params.append('trainingId', filters.trainingId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const result = await axiosInstance.get(`/api/v1/training-enrollment/pending?${params.toString()}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

// ==================== Attendance ====================

export const generateQRCode = async (trainingId: string): Promise<{ qrCode: string; qrCodeString: string; expiresAt: string }> => {
  try {
    const result = await axiosInstance.post(`/api/v1/trainings/${trainingId}/qr`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const scanQRCode = async (trainingId: string, employeeId: string, qrData: string, location?: string): Promise<TrainingAttendance> => {
  try {
    const result = await axiosInstance.post(`/api/v1/trainings/${trainingId}/attendance/scan`, {
      employeeId,
      qrData,
      location
    });
    return result.data.attendance;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getAttendanceList = async (trainingId: string): Promise<any[]> => {
  try {
    const result = await axiosInstance.get(`/api/v1/trainings/${trainingId}/attendance`);
    return result.data.attendanceList;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const updateAttendance = async (attendanceId: string, data: Partial<TrainingAttendance>) => {
  try {
    const result = await axiosInstance.patch(`/api/v1/training-attendance/${attendanceId}`, data);
    return result.data.attendance;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const markAttendanceManually = async (trainingId: string, enrollmentId: string, status: 'PRESENT' | 'LATE' | 'ABSENT') => {
  try {
    // First, get attendance list to find if attendance record exists
    const attendanceList = await getAttendanceList(trainingId);
    const attendanceItem = attendanceList.find((item: any) => item.enrollmentId === enrollmentId);
    
    if (!attendanceItem) {
      throw new Error('Enrollment not found');
    }

    // If attendance record exists (has id), update it
    if (attendanceItem.attendance?.id) {
      const timeIn = status === 'PRESENT' || status === 'LATE' 
        ? (attendanceItem.attendance.timeIn || new Date().toISOString())
        : undefined;
      
      return await updateAttendance(attendanceItem.attendance.id, {
        status: status as any,
        timeIn: timeIn,
        // If marking as absent, clear timeIn
        ...(status === 'ABSENT' && !attendanceItem.attendance.timeIn ? {} : {})
      });
    } else {
      // If attendance doesn't exist yet, create it using the new endpoint
      const timeIn = status !== 'ABSENT' ? new Date().toISOString() : undefined;
      
      const result = await axiosInstance.post(`/api/v1/training-attendance/enrollment/${enrollmentId}`, {
        status: status,
        timeIn: timeIn,
        location: undefined
      });
      
      return result.data.attendance;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw error instanceof Error ? error : new Error('Failed to mark attendance');
  }
};

// ==================== Evaluation ====================

export const submitEvaluation = async (enrollmentId: string, data: {
  trainingRating: number;
  trainingComments?: string;
  trainerRating?: number;
  trainerComments?: string;
}): Promise<TrainingEvaluation> => {
  try {
    const result = await axiosInstance.post(`/api/v1/training-evaluation/${enrollmentId}`, data);
    return result.data.evaluation;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const submitEmployeePerformanceRating = async (enrollmentId: string, data: {
  employeePerformanceRating: number;
  employeeImprovementComments?: string;
}): Promise<TrainingEvaluation> => {
  try {
    const result = await axiosInstance.post(`/api/v1/training-evaluation/${enrollmentId}/employee-performance`, data);
    return result.data.evaluation;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getEvaluation = async (enrollmentId: string): Promise<TrainingEvaluation> => {
  try {
    const result = await axiosInstance.get(`/api/v1/training-evaluation/${enrollmentId}`);
    return result.data.evaluation;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getTrainingEvaluations = async (trainingId: string): Promise<any[]> => {
  try {
    const result = await axiosInstance.get(`/api/v1/trainings/${trainingId}/evaluations`);
    return result.data.evaluations;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

// ==================== Reports ====================

export const getTrainingHoursReport = async (filters?: {
  trainingId?: string;
  employeeId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: TrainingHoursReport[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.trainingId) params.append('trainingId', filters.trainingId);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const result = await axiosInstance.get(`/api/v1/reports/training-hours?${params.toString()}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getAttendanceSummaryReport = async (filters?: {
  trainingId?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
}): Promise<AttendanceSummaryReport> => {
  try {
    const params = new URLSearchParams();
    if (filters?.trainingId) params.append('trainingId', filters.trainingId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.department) params.append('department', filters.department);

    const result = await axiosInstance.get(`/api/v1/reports/attendance?${params.toString()}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getCompetencyImprovementReport = async (filters?: {
  employeeId?: string;
  competencyId?: string;
  trainingId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ impacts: TrainingCompetencyImpact[]; pagination: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.competencyId) params.append('competencyId', filters.competencyId);
    if (filters?.trainingId) params.append('trainingId', filters.trainingId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const result = await axiosInstance.get(`/api/v1/reports/competency-improvement?${params.toString()}`);
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

export const getTrainerEffectivenessReport = async (filters?: {
  trainingId?: string;
  trainerId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<TrainerEffectivenessReport[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.trainingId) params.append('trainingId', filters.trainingId);
    if (filters?.trainerId) params.append('trainerId', filters.trainerId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const result = await axiosInstance.get(`/api/v1/reports/trainer-effectiveness?${params.toString()}`);
    return result.data.trainers;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const errorMsg = (axiosError.response.data as any).error || (axiosError.response.data as any).message || 'An error occurred';
      throw new Error(errorMsg);
    }
    else if (axiosError.request) throw new Error('Network error - no response from server');
    else throw new Error('Request failed to be created');
  }
};

// ==================== Legacy Support (for backward compatibility) ====================

// Keep old endpoints for backward compatibility
export const createTrainingSession = async (data: any) => {
  return createTraining(data);
};

export const getTrainingSessions = async () => {
  const result = await getTrainings();
  return result.trainings;
};

export const getTrainingSessionById = async (id: string) => {
  return getTrainingById(id);
};

export const updateTrainingSession = async (id: string, data: any) => {
  return updateTraining(id, data);
};

export const addTrainingRecord = async (data: any) => {
  // Map to new enrollment model
  return enrollInTraining(data.trainingId, data.employeeId, 'MANUAL');
};

export const updateTrainingRecord = async (id: string, data: any) => {
  return updateAttendance(id, data);
};
