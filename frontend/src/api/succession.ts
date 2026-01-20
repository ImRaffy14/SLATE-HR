import axiosInstance from "@/lib/axios";

const handleError = (error: any) => {
  if (error?.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  if (error?.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error?.request) {
    throw new Error("Network error - no response from server");
  }
  throw new Error("Request failed to be created");
};

// ============================================
// TYPES
// ============================================

export interface SuccessionDashboardOverview {
  criticalRoles: number;
  talentPoolSize: number;
  activeIDPs: number;
  readySuccessors: number;
  highRiskCandidates: number;
}

export interface SuccessionTopCandidate {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string | null;
  roleName: string;
  overallScore?: number | null;
  readinessStatus?: string | null;
}

export interface SuccessionRoleAtRisk {
  id: string;
  roleName: string;
  candidateCount: number;
  hasNoCandidates: boolean;
}

export interface SuccessionDashboardSummary {
  overview: SuccessionDashboardOverview;
  topCandidates: SuccessionTopCandidate[];
  rolesAtRisk: SuccessionRoleAtRisk[];
}

export interface TalentPoolEntry {
  id: string;
  employeeId: string;
  overallScore?: number | null;
  readinessStatus?: string | null;
  riskLevel?: string | null;
  riskFactors?: Record<string, unknown> | null;
  employee?: {
    id: string;
    name: string;
    email?: string | null;
    department?: string | null;
    position?: string | null;
    dateHired?: string | Date | null;
  } | null;
}

export interface CriticalRole {
  id: string;
  jobRoleId?: string;
  description?: string | null;
  isCritical?: boolean;
  requiredCompetencies?: Array<{ competencyId: string; requiredLevel: number; weight: number }>;
  jobRole?: { id: string; name: string };
  talentPool?: TalentPoolEntry[];
  idps?: Array<{
    id: string;
    employeeId: string;
    status?: string;
    progress?: number;
    employee?: { id: string; name: string };
  }>;
}

export interface NineBoxEmployee {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  performance: number;
  potential: number;
}

export interface NineBoxGridCell {
  label: string;
  employees: NineBoxEmployee[];
  count: number;
}

export interface NineBoxResponse {
  grid: Record<string, NineBoxGridCell>;
  totalEmployees: number;
  employeesWithScores: number;
}

export interface ReadinessSummary {
  total: number;
  readyNow: number;
  readySoon: number;
  readyLater: number;
  notReady: number;
}

export interface ReadinessReport {
  summary: ReadinessSummary;
}

export interface RiskSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  highPerformersAtRisk: number;
}

export interface RiskAnalysis {
  summary: RiskSummary;
}

export interface PromotionCandidate {
  id: string;
  employeeId: string;
  roleName: string;
  overallScore?: number | null;
  readinessStatus?: string | null;
  eligibility?: { eligible: boolean; reasons?: string[] };
  employee?: {
    id: string;
    employeeId?: string;
    name: string;
    email?: string;
    department?: string | null;
    position?: string | null;
    dateHired?: string | Date | null;
  };
}

export interface PromotionPipeline {
  summary: {
    totalCandidates: number;
    eligibleCount: number;
    notYetEligibleCount: number;
  };
  eligible: PromotionCandidate[];
  notYetEligible: PromotionCandidate[];
}

// ============================================
// CRITICAL ROLE APIs
// ============================================

export const createCriticalRole = async (data: {
  jobRoleId: string;
  description?: string;
  isCritical?: boolean;
  requiredCompetencies?: Array<{
    competencyId: string;
    requiredLevel: number;
    weight: number;
  }>;
}) => {
  try {
    const result = await axiosInstance.post("/api/v1/succession/roles", data);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCriticalRoles = async (filters?: {
  isCritical?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ roles: CriticalRole[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  try {
    const result = await axiosInstance.get("/api/v1/succession/roles", {
      params: filters,
    });
    return result.data as { roles: CriticalRole[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };
  } catch (error) {
    handleError(error);
  }
};

export const getCriticalRoleById = async (id: string): Promise<{ role: CriticalRole }> => {
  try {
    const result = await axiosInstance.get(`/api/v1/succession/roles/${id}`);
    return result.data as { role: CriticalRole };
  } catch (error) {
    handleError(error);
  }
};

export const updateCriticalRole = async (
  id: string,
  data: {
    description?: string;
    isCritical?: boolean;
    requiredCompetencies?: Array<{
      competencyId: string;
      requiredLevel: number;
      weight: number;
    }>;
  }
) => {
  try {
    const result = await axiosInstance.put(`/api/v1/succession/roles/${id}`, data);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCriticalRole = async (id: string) => {
  try {
    const result = await axiosInstance.delete(`/api/v1/succession/roles/${id}`);
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCompetenciesForMapping = async (): Promise<{ competencies: any[] }> => {
  try {
    const result = await axiosInstance.get("/api/v1/succession/competencies");
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// TALENT POOL & CANDIDATE APIs
// ============================================

export const addToTalentPool = async (
  roleId: string,
  data: { employeeId: string; notes?: string }
): Promise<any> => {
  try {
    const result = await axiosInstance.post(
      `/api/v1/succession/roles/${roleId}/talent-pool`,
      data
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getRankedCandidates = async (roleId: string): Promise<any> => {
  try {
    const result = await axiosInstance.get(
      `/api/v1/succession/roles/${roleId}/candidates`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const removeFromTalentPool = async (talentPoolId: string) => {
  try {
    const result = await axiosInstance.delete(
      `/api/v1/succession/talent-pool/${talentPoolId}`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const recalculateRoleScores = async (roleId: string) => {
  try {
    const result = await axiosInstance.post(
      `/api/v1/succession/roles/${roleId}/recalculate`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const ratePotential = async (
  employeeId: string,
  data: { rating: number; comments?: string }
) => {
  try {
    const result = await axiosInstance.post(
      `/api/v1/succession/candidates/${employeeId}/evaluate`,
      data
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCandidateScore = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(
      `/api/v1/succession/candidates/${employeeId}/score`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getPotentialRatingHistory = async (employeeId: string) => {
  try {
    const result = await axiosInstance.get(
      `/api/v1/succession/candidates/${employeeId}/potential-history`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// IDP APIs
// ============================================

export const createIDP = async (
  employeeId: string,
  data: { targetRoleId: string; autoGenerateGoals?: boolean }
) => {
  try {
    const result = await axiosInstance.post(
      `/api/v1/succession/idp/${employeeId}`,
      data
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getEmployeeIDPs = async (
  employeeId: string,
  filters?: { status?: string; targetRoleId?: string }
) => {
  try {
    const result = await axiosInstance.get(
      `/api/v1/succession/idp/${employeeId}`,
      { params: filters }
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getIDPById = async (idpId: string) => {
  try {
    const result = await axiosInstance.get(
      `/api/v1/succession/idp/detail/${idpId}`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateIDPStatus = async (idpId: string, status: string) => {
  try {
    const result = await axiosInstance.patch(
      `/api/v1/succession/idp/${idpId}/status`,
      { status }
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const addIDPGoal = async (
  idpId: string,
  data: {
    title: string;
    description?: string;
    goalType: "SHORT_TERM" | "LONG_TERM";
    targetDate?: string;
    courseId?: string;
    trainingId?: string;
    competencyId?: string;
  }
) => {
  try {
    const result = await axiosInstance.post(
      `/api/v1/succession/idp/${idpId}/goals`,
      data
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateGoalProgress = async (
  goalId: string,
  data: { progress: number; completed?: boolean }
) => {
  try {
    const result = await axiosInstance.patch(
      `/api/v1/succession/idp/goals/${goalId}/progress`,
      data
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteIDPGoal = async (goalId: string) => {
  try {
    const result = await axiosInstance.delete(
      `/api/v1/succession/idp/goals/${goalId}`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const syncIDPProgress = async (employeeId: string) => {
  try {
    const result = await axiosInstance.post(
      `/api/v1/succession/idp/${employeeId}/sync`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// ANALYTICS APIs
// ============================================

export const getDashboardSummary = async (): Promise<SuccessionDashboardSummary> => {
  try {
    const result = await axiosInstance.get(
      "/api/v1/succession/analytics/dashboard"
    );
    return result.data as SuccessionDashboardSummary;
  } catch (error) {
    handleError(error);
  }
};

export const get9BoxData = async (filters?: {
  department?: string;
  roleId?: string;
}): Promise<NineBoxResponse> => {
  try {
    const result = await axiosInstance.get("/api/v1/succession/analytics/9box", {
      params: filters,
    });
    return result.data as NineBoxResponse;
  } catch (error) {
    handleError(error);
  }
};

export const getReadinessReport = async (filters?: {
  roleId?: string;
  department?: string;
}): Promise<ReadinessReport> => {
  try {
    const result = await axiosInstance.get(
      "/api/v1/succession/analytics/readiness",
      { params: filters }
    );
    return result.data as ReadinessReport;
  } catch (error) {
    handleError(error);
  }
};

export const getRiskAnalysis = async (filters?: {
  roleId?: string;
  riskLevel?: string;
}): Promise<RiskAnalysis> => {
  try {
    const result = await axiosInstance.get("/api/v1/succession/analytics/risk", {
      params: filters,
    });
    return result.data as RiskAnalysis;
  } catch (error) {
    handleError(error);
  }
};

// ============================================
// PROMOTION APIs
// ============================================

export const getPromotionPipeline = async (filters?: {
  roleId?: string;
  department?: string;
  minScore?: number;
}): Promise<PromotionPipeline> => {
  try {
    const result = await axiosInstance.get(
      "/api/v1/succession/promotions/pipeline",
      { params: filters }
    );
    return result.data as PromotionPipeline;
  } catch (error) {
    handleError(error);
  }
};

export const getNewlyEligibleCandidates = async (since?: string) => {
  try {
    const result = await axiosInstance.get(
      "/api/v1/succession/promotions/newly-eligible",
      { params: { since } }
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getPromotionReport = async (roleId: string) => {
  try {
    const result = await axiosInstance.get(
      `/api/v1/succession/promotions/report/${roleId}`
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const sendPromotionAlert = async (data: {
  employeeId: string;
  roleId: string;
  message?: string;
}) => {
  try {
    const result = await axiosInstance.post(
      "/api/v1/succession/promotions/notify",
      data
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};
