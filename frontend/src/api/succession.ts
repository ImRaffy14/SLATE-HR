import axiosInstance from "@/lib/axios";

const handleError = (error: any) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw error;
};

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
}) => {
  try {
    const result = await axiosInstance.get("/api/v1/succession/roles", {
      params: filters,
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getCriticalRoleById = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/api/v1/succession/roles/${id}`);
    return result.data;
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

export const getCompetenciesForMapping = async () => {
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
) => {
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

export const getRankedCandidates = async (roleId: string) => {
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

export const getDashboardSummary = async () => {
  try {
    const result = await axiosInstance.get(
      "/api/v1/succession/analytics/dashboard"
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const get9BoxData = async (filters?: {
  department?: string;
  roleId?: string;
}) => {
  try {
    const result = await axiosInstance.get("/api/v1/succession/analytics/9box", {
      params: filters,
    });
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getReadinessReport = async (filters?: {
  roleId?: string;
  department?: string;
}) => {
  try {
    const result = await axiosInstance.get(
      "/api/v1/succession/analytics/readiness",
      { params: filters }
    );
    return result.data;
  } catch (error) {
    handleError(error);
  }
};

export const getRiskAnalysis = async (filters?: {
  roleId?: string;
  riskLevel?: string;
}) => {
  try {
    const result = await axiosInstance.get("/api/v1/succession/analytics/risk", {
      params: filters,
    });
    return result.data;
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
}) => {
  try {
    const result = await axiosInstance.get(
      "/api/v1/succession/promotions/pipeline",
      { params: filters }
    );
    return result.data;
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
