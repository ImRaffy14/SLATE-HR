import { Competency, EmployeeCompetency, ProficiencyLevel, GapAnalysis } from "@/types/competency";

/**
 * Calculate the highest required level from proficiency levels
 */
export const getRequiredLevel = (competency: Competency): number => {
  if (!competency.levels || competency.levels.length === 0) {
    return 5; // Default to 5 if no levels defined
  }
  return Math.max(...competency.levels.map(level => level.levelNumber));
};

/**
 * Calculate current level from finalScore (derived from manager rating only)
 */
export const getCurrentLevel = (employeeCompetency: EmployeeCompetency, competency: Competency): number => {
  // Use manager rating directly if available, otherwise derive from finalScore
  if (employeeCompetency.managerRating !== null && employeeCompetency.managerRating !== undefined) {
    return employeeCompetency.managerRating;
  }
  
  if (employeeCompetency.finalScore === null || employeeCompetency.finalScore === undefined) {
    return 1; // Default to 1 if no score
  }
  
  // Normalize finalScore back to 1-5 scale (assuming weight was applied)
  const normalizedScore = employeeCompetency.finalScore / (competency.weight / 100);
  return Math.max(1, Math.min(5, Math.round(normalizedScore)));
};

/**
 * Calculate gap for an employee competency
 */
export const calculateGap = (employeeCompetency: EmployeeCompetency, competency: Competency): number => {
  const requiredLevel = getRequiredLevel(competency);
  const currentLevel = getCurrentLevel(employeeCompetency, competency);
  return requiredLevel - currentLevel;
};

/**
 * Get average self-rating for a competency (deprecated - kept for backward compatibility)
 * @deprecated Self-rating is no longer used in final score calculation
 */
export const getAverageSelfRating = (competency: Competency): number => {
  // Return 0 as self-rating is no longer used
  return 0;
};

/**
 * Get average manager-rating for a competency
 */
export const getAverageManagerRating = (competency: Competency): number => {
  if (!competency.employeeCompetencies || competency.employeeCompetencies.length === 0) {
    return 0;
  }
  
  const total = competency.employeeCompetencies.reduce((sum, ec) => {
    return sum + (ec.managerRating || 0);
  }, 0);
  
  return total / competency.employeeCompetencies.length;
};

/**
 * Get average final score for a competency (based on manager ratings only)
 */
export const getAverageFinalScore = (competency: Competency): number => {
  if (!competency.employeeCompetencies || competency.employeeCompetencies.length === 0) {
    return 0;
  }
  
  // Calculate average from manager ratings only
  const ratingsWithScores = competency.employeeCompetencies.filter(
    ec => ec.managerRating !== null && ec.managerRating !== undefined
  );
  
  if (ratingsWithScores.length === 0) {
    return 0;
  }
  
  const total = ratingsWithScores.reduce((sum, ec) => {
    return sum + (ec.finalScore || 0);
  }, 0);
  
  return total / ratingsWithScores.length;
};

/**
 * Transform competency for display (add calculated fields)
 */
export const transformCompetencyForDisplay = (competency: Competency) => {
  const requiredLevel = getRequiredLevel(competency);
  const avgManagerRating = getAverageManagerRating(competency);
  const avgFinalScore = getAverageFinalScore(competency);
  
  // Calculate average current level from manager ratings
  const ratingsWithScores = competency.employeeCompetencies?.filter(
    ec => ec.managerRating !== null && ec.managerRating !== undefined
  ) || [];
  
  const avgCurrentLevel = ratingsWithScores.length > 0
    ? ratingsWithScores.reduce((sum, ec) => {
        const currentLevel = getCurrentLevel(ec, competency);
        return sum + currentLevel;
      }, 0) / ratingsWithScores.length
    : 0;
  
  return {
    ...competency,
    requiredLevel,
    averageCurrentLevel: {
      requiredLevel,
      averageManagerRating: avgManagerRating,
      averageFinalScore: avgFinalScore,
      averageCurrentLevel: avgCurrentLevel,
    },
    // Transform employeeCompetencies to include gaps
    employeeCompetencies: competency.employeeCompetencies?.map(ec => ({
      ...ec,
      gap: calculateGap(ec, competency),
      currentLevel: getCurrentLevel(ec, competency),
    })) || [],
  };
};

/**
 * Validate proficiency levels
 */
export const validateProficiencyLevels = (levels: ProficiencyLevel[]): { valid: boolean; error?: string } => {
  if (!levels || levels.length === 0) {
    return { valid: false, error: "At least one proficiency level is required" };
  }
  
  // Check for unique level numbers
  const levelNumbers = levels.map(level => level.levelNumber);
  const uniqueLevelNumbers = new Set(levelNumbers);
  
  if (levelNumbers.length !== uniqueLevelNumbers.size) {
    return { valid: false, error: "Proficiency levels must have unique level numbers" };
  }
  
  // Check that all levels are between 1-5
  for (const level of levels) {
    if (level.levelNumber < 1 || level.levelNumber > 5) {
      return { valid: false, error: "Proficiency level numbers must be between 1 and 5" };
    }
    
    if (!level.title || level.title.trim() === "") {
      return { valid: false, error: "Each proficiency level must have a title" };
    }
    
    if (!level.definition || level.definition.trim() === "") {
      return { valid: false, error: "Each proficiency level must have a definition" };
    }
  }
  
  return { valid: true };
};

/**
 * Validate weight
 */
export const validateWeight = (weight: number): { valid: boolean; error?: string } => {
  if (weight < 1 || weight > 100) {
    return { valid: false, error: "Weight must be between 1 and 100" };
  }
  return { valid: true };
};

/**
 * Validate rating
 */
export const validateRating = (rating: number | null | undefined): { valid: boolean; error?: string } => {
  if (rating === null || rating === undefined) {
    return { valid: true }; // Allow null/undefined for optional ratings
  }
  
  if (rating < 1 || rating > 5) {
    return { valid: false, error: "Rating must be between 1 and 5" };
  }
  
  if (!Number.isInteger(rating)) {
    return { valid: false, error: "Rating must be an integer" };
  }
  
  return { valid: true };
};

/**
 * Get gap badge color based on gap value
 */
export const getGapBadgeColor = (gap: number): string => {
  if (gap <= 0) return "bg-green-600 text-white";
  if (gap <= 1) return "bg-yellow-600 text-white";
  if (gap <= 2) return "bg-orange-600 text-white";
  return "bg-red-600 text-white";
};

/**
 * Get proficiency level by number
 */
export const getProficiencyLevel = (competency: Competency, levelNumber: number): ProficiencyLevel | undefined => {
  return competency.levels.find(level => level.levelNumber === levelNumber);
};

/**
 * Sort proficiency levels by level number
 */
export const sortProficiencyLevels = (levels: ProficiencyLevel[]): ProficiencyLevel[] => {
  return [...levels].sort((a, b) => a.levelNumber - b.levelNumber);
};

