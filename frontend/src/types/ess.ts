// ============================================
// ESS TYPES
// ============================================

export interface ESSDashboard {
  employee: {
    id: string;
    name: string;
    email?: string;
    department?: string;
    position?: string;
    jobRole?: {
      id: string;
      name: string;
      description?: string;
    } | null;
  };
  competencyScores: Array<{
    competencyId: string;
    competencyName: string;
    categoryName: string;
    selfRating?: number;
    managerRating?: number;
    finalScore?: number;
  }>;
  gapSummary: {
    totalGaps: number;
    criticalGaps: number;
    moderateGaps: number;
    minorGaps: number;
    gaps: Array<{
      competencyId: string;
      competencyName: string;
      requiredLevel: number;
      currentLevel: number;
      gap: number;
    }>;
  };
  ongoingCourses: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    status: string;
    completionPercentage: number;
    enrolledAt: string;
  }>;
  ongoingTrainings: Array<{
    id: string;
    trainingId: string;
    trainingTitle: string;
    status: string;
    trainingStatus: string;
    startDate: string;
    endDate: string;
    enrolledAt: string;
  }>;
  recommendedCourses: Array<{
    id: string;
    courseId: string;
    title: string;
    description?: string;
    category?: {
      id: string;
      name: string;
    } | null;
    duration: number;
    estimatedHours: number;
    isEnrolled: boolean;
  }>;
  recommendedTrainings: Array<{
    id: string;
    trainingId: string;
    title: string;
    description?: string;
    trainingType: string;
    startDate: string;
    endDate: string;
    durationHours: number;
  }>;
  succession: {
    talentPools: Array<{
      id: string;
      roleName: string;
      overallScore: number | null;
      readinessStatus: string;
      riskLevel: string | null;
    }>;
    idps: Array<{
      id: string;
      targetRoleName: string;
      status: string;
      progress: number;
      totalGoals: number;
      completedGoals: number;
    }>;
    readinessScore: number | null;
  };
}

export interface CareerPath {
  currentJobRole: {
    id: string;
    name: string;
    description?: string;
  } | null;
  careerPaths: Array<{
    jobRoleId: string;
    jobRoleName: string;
    jobRoleDescription?: string;
    readinessScore: number;
    competenciesMet: number;
    competenciesTotal: number;
  }>;
}

export interface CareerPathDetails {
  currentJobRole: {
    id: string;
    name: string;
    description?: string;
  } | null;
  targetJobRole: {
    id: string;
    name: string;
    description?: string;
  };
  readinessScore: number;
  competenciesMet: number;
  competenciesTotal: number;
  competencyComparison: Array<{
    competencyId: string;
    competencyName: string;
    competencyDescription?: string;
    requiredLevel: number;
    currentLevel: number;
    gap: number;
    isMet: boolean;
    employeeCompetency: {
      selfRating?: number;
      managerRating?: number;
      finalScore?: number;
    } | null;
  }>;
}

export interface AchievementUpload {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  fileUrl: string;
  competencyId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  competency?: {
    id: string;
    name: string;
  } | null;
}

export interface Notification {
  id: string;
  employeeId: string;
  type: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

