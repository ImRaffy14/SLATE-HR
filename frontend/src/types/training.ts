export enum TrainingType {
  ONLINE = 'ONLINE',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID'
}

export enum TrainingStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TrainingEnrollmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT'
}

export interface Venue {
  id: string;
  name: string;
  address?: string;
  capacity?: number;
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  expertise: string[];
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Training {
  id: string;
  trainingId: string;
  title: string;
  description?: string;
  trainingType: TrainingType;
  startDate: string;
  endDate: string;
  durationHours: number;
  venueId?: string;
  trainerId?: string;
  taggedCompetencies: string[];
  maxParticipants: number;
  status: TrainingStatus;
  qrCode?: string;
  qrCodeExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  venue?: Venue;
  trainer?: Trainer;
  enrollments?: TrainingEnrollment[];
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  updater?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TrainingEnrollment {
  id: string;
  trainingId: string;
  employeeId: string;
  status: TrainingEnrollmentStatus;
  enrollmentType: 'MANUAL' | 'AUTO' | 'SELF';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  training?: Training;
  employee?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    position?: string;
  };
  attendance?: TrainingAttendance;
  evaluation?: TrainingEvaluation;
}

export interface TrainingAttendance {
  id: string;
  enrollmentId: string;
  status: AttendanceStatus;
  timeIn?: string;
  timeOut?: string;
  location?: string;
  qrScannedAt?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  enrollment?: TrainingEnrollment;
}

export interface TrainingEvaluation {
  id: string;
  enrollmentId: string;
  trainingRating: number;
  trainingComments?: string;
  trainerRating?: number;
  trainerComments?: string;
  effectivenessScore?: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  enrollment?: TrainingEnrollment;
}

export interface TrainingCompetencyImpact {
  id: string;
  trainingId: string;
  employeeId: string;
  competencyId: string;
  previousLevel: number;
  newLevel: number;
  improvement: number;
  createdAt: string;
  training?: Training;
  employee?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  competency?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    };
  };
}

export interface TrainingHoursReport {
  employee: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  totalHours: number;
  trainingCount: number;
  trainings: Array<{
    trainingId: string;
    title: string;
    hours: number;
    completedAt: string;
  }>;
}

export interface AttendanceSummaryReport {
  summary: {
    total: number;
    present: number;
    late: number;
    absent: number;
    attendanceRate: string;
  };
  details: Array<{
    employee: {
      id: string;
      name: string;
      department?: string;
    };
    training: {
      id: string;
      title: string;
      startDate: string;
      endDate: string;
    };
    status: AttendanceStatus;
    timeIn?: string;
    timeOut?: string;
  }>;
}

export interface TrainerEffectivenessReport {
  trainer: Trainer;
  totalTrainings: number;
  totalEvaluations: number;
  averageTrainingRating: number;
  averageTrainerRating: number;
  averageEffectivenessScore: number;
}

