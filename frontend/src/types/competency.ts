// Proficiency Level Type
export interface ProficiencyLevel {
  levelNumber: number; // 1-5
  title: string;
  definition: string;
}

// Job Role Type
export interface JobRole {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  employees?: Array<{
    id: string;
    name: string;
    employeeId: string;
  }>;
}

// Competency Category Type
export interface CompetencyCategory {
  id: string;
  name: string;
  description?: string;
  jobRoleIds: string[];
  createdAt: string;
  updatedAt: string;
  competencies?: Array<{
    id: string;
    name: string;
    weight?: number;
  }>;
}

// Competency Type
export interface Competency {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: CompetencyCategory;
  levels: ProficiencyLevel[];
  weight: number; // 1-100
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  creator?: {
    id: string;
    name: string;
  };
  updater?: {
    id: string;
    name: string;
  };
  employeeCompetencies?: EmployeeCompetency[];
}

// Employee Competency Type
export interface EmployeeCompetency {
  id: string;
  employeeId: string;
  competencyId: string;
  employee?: {
    id: string;
    name: string;
    employeeId: string;
    position?: string;
    positionId?: string;
  };
  competency?: Competency;
  selfRating?: number; // 1-5
  managerRating?: number; // 1-5
  finalScore?: number; // calculated: (selfRating * 0.3 + managerRating * 0.7) * weight
  attachments: string[]; // array of file URLs
  updatedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Gap Analysis Type
export interface GapAnalysis {
  id: string;
  employeeId: string;
  competencyId: string;
  employee?: {
    id: string;
    name: string;
    employeeId: string;
  };
  competency?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    };
  };
  requiredLevel: number;
  currentLevel: number;
  gap: number; // requiredLevel - currentLevel
  recommendations: string[]; // array of recommendation IDs
  createdAt: string;
}

// Training Recommendation Type
export interface TrainingRecommendation {
  id: string;
  competencyId: string;
  competency?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    };
  };
  title: string;
  description?: string;
  link?: string;
  difficultyLevel: number; // 1-5
  courseId?: string;
  course?: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Gap Report Type
export interface GapReport {
  employee: {
    id: string;
    name: string;
    employeeId: string;
    department?: string;
    position?: string;
  };
  summary: {
    totalCompetencies: number;
    totalGaps: number;
    criticalGaps: number;
    averageGap: number;
  };
  gaps: GapAnalysis[];
  gapsByCategory: Record<string, {
    category: string;
    gaps: GapAnalysis[];
    totalGaps: number;
    criticalGaps: number;
  }>;
}

// Analytics Type (updated for new structure)
export interface CompetencyAnalytics {
  skillGapsByCategory: Array<{
    category: string;
    gaps: number;
    total: number;
  }>;
  competencyRadarData: Array<{
    skill: string;
    current: number;
    required: number;
  }>;
  totalProficient: number;
  totalCriticalGaps: number;
  totalAssessed: number;
}

// Form Data Types
export interface CompetencyFormData {
  name: string;
  description?: string;
  categoryId: string;
  levels: ProficiencyLevel[];
  weight: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  jobRoleIds: string[];
}

export interface JobRoleFormData {
  name: string;
  description?: string;
}

export interface EmployeeCompetencyFormData {
  employeeId: string;
  competencyId: string;
  selfRating?: number;
  managerRating?: number;
  notes?: string;
}

export interface RecommendationFormData {
  competencyId: string;
  title: string;
  description?: string;
  link?: string;
  difficultyLevel: number;
  courseId?: string;
}

