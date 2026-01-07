import { TrainingType, TrainingStatus } from '@prisma/client';

export interface CreateTrainingDTO {
  title: string;
  description?: string;
  trainingType: TrainingType;
  startDate: Date;
  endDate: Date;
  durationHours: number;
  venueId?: string;
  trainerId?: string;
  trainerName?: string;
  venueName?: string;
  meetingLink?: string;
  address?: string;
  taggedCompetencies: string[];
  maxParticipants: number;
}

export interface UpdateTrainingDTO {
  title?: string;
  description?: string;
  trainingType?: TrainingType;
  startDate?: Date;
  endDate?: Date;
  durationHours?: number;
  venueId?: string;
  trainerId?: string;
  trainerName?: string;
  venueName?: string;
  meetingLink?: string;
  address?: string;
  taggedCompetencies?: string[];
  maxParticipants?: number;
  status?: TrainingStatus;
}

export interface EnrollmentDTO {
  trainingId: string;
  employeeId: string;
  enrollmentType?: 'MANUAL' | 'AUTO' | 'SELF';
}

export interface AttendanceDTO {
  employeeId: string;
  qrData: string;
  location?: string;
}

export interface EvaluationDTO {
  trainingRating: number;
  trainingComments?: string;
  trainerRating?: number;
  trainerComments?: string;
}

export interface ReportFilterDTO {
  employeeId?: string;
  department?: string;
  competencyId?: string;
  trainingId?: string;
  trainerId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

