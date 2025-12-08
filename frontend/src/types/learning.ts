// ============================================
// ENUMS
// ============================================

export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum MaterialType {
  PDF = "PDF",
  FILE = "FILE",
  VIDEO = "VIDEO",
  YOUTUBE = "YOUTUBE",
}

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
}

export enum EnrollmentType {
  MANUAL = "MANUAL",
  AUTO = "AUTO",
  SELF = "SELF",
}

export enum EnrollmentStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// ============================================
// TYPES
// ============================================

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  type: MaterialType;
  url: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  questionType: QuestionType;
  points: number;
  order: number;
  choices: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  totalPoints: number;
  passingScore: number;
  timeLimit?: number;
  allowRetake: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
  existingAttempt?: QuizAttempt;
}

export interface QuizAttempt {
  id: string;
  enrollmentId: string;
  quizId: string;
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    points: number;
  }>;
  score: number;
  totalPoints: number;
  passed: boolean;
  submittedAt: string;
  locked: boolean;
  quiz?: Quiz;
}

export interface Course {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  categoryId?: string;
  taggedCompetencies: string[];
  status: CourseStatus;
  duration: number;
  estimatedHours: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  category?: CourseCategory;
  materials?: CourseMaterial[];
  quizzes?: Quiz[];
  enrollments?: Enrollment[];
  creator?: {
    id: string;
    name: string;
    email?: string;
  };
  updater?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface Enrollment {
  id: string;
  employeeId: string;
  courseId: string;
  status: EnrollmentStatus;
  progress: number; // legacy
  completionPercentage: number;
  finalGrade?: number;
  enrollmentType: EnrollmentType;
  isRequired: boolean;
  enrolledAt: string;
  completedAt?: string;
  failedAt?: string;
  lastActivity?: string;
  employee?: {
    id: string;
    name: string;
    email?: string;
    department?: string;
  };
  course?: Course;
  quizAttempts?: QuizAttempt[];
  progressRecords?: EmployeeCourseProgress[];
  certificate?: Certificate;
}

export interface EmployeeCourseProgress {
  id: string;
  enrollmentId: string;
  materialId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number; // in minutes
  lastAccessedAt?: string;
  material?: CourseMaterial;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  certificateNumber: string;
  pdfUrl: string;
  issuedAt: string;
  expiresAt?: string;
  enrollment?: Enrollment;
}

export interface CourseFeedback {
  id: string;
  employeeId: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface CourseFormData {
  courseId: string;
  title: string;
  description?: string;
  categoryId?: string;
  taggedCompetencies: string[];
  status: CourseStatus;
  duration: number;
  estimatedHours: number;
  isRequired: boolean;
}

export interface MaterialFormData {
  type: MaterialType;
  url: string;
  title: string;
  description?: string;
  order?: number;
}

export interface QuizFormData {
  title: string;
  description?: string;
  totalPoints: number;
  passingScore: number;
  timeLimit?: number;
  allowRetake: boolean;
  questions: Array<{
    question: string;
    questionType: QuestionType;
    points: number;
    order?: number;
    choices: Array<{ text: string; isCorrect: boolean }>;
    correctAnswer: string;
  }>;
}

export interface EnrollmentFormData {
  employeeId: string;
  courseId: string;
  isRequired?: boolean;
}

// ============================================
// REPORT TYPES
// ============================================

export interface CompletionReport {
  totalCompleted: number;
  totalPassed: number;
  totalFailed: number;
  averageScore: number;
  enrollments: Enrollment[];
}

export interface LearningHoursReport {
  employeeHours: Array<{
    employee: {
      id: string;
      name: string;
      department?: string;
    };
    totalHours: number;
  }>;
  departmentHours: Record<string, number>;
  totalHours: number;
}

export interface CourseAnalytics {
  all: Array<{
    course: {
      id: string;
      title: string;
      courseId: string;
    };
    totalEnrollments: number;
    completed: number;
    failed: number;
    inProgress: number;
    averageScore: number;
    difficulty: string;
    completionRate: number;
  }>;
  mostEnrolled: Array<any>;
  mostCompleted: Array<any>;
  mostFailed: Array<any>;
}

// ============================================
// PROGRESS TYPES
// ============================================

export interface ProgressData {
  percentage: number;
  materialsProgress: number;
  quizzesProgress: number;
  completedMaterials: number;
  totalMaterials: number;
  passedQuizzes: number;
  totalQuizzes: number;
}

export interface EmployeeProgress {
  enrollment: Enrollment;
  progress: ProgressData;
}

