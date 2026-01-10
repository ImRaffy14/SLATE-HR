/**
 * Succession Planning Scoring Utilities
 * 
 * Overall Score Formula:
 * (Competency Match % * 0.4) + (Performance Rating * 20 * 0.3) + (Potential Rating * 20 * 0.3)
 */

export interface RequiredCompetency {
  competencyId: string;
  requiredLevel: number;
  weight: number;
}

export interface EmployeeCompetencyScore {
  competencyId: string;
  finalScore: number | null;
}

/**
 * Calculate competency match percentage
 * Compares employee's competency scores against required competencies for a role
 */
export function calculateCompetencyMatchScore(
  requiredCompetencies: RequiredCompetency[],
  employeeCompetencies: EmployeeCompetencyScore[]
): number {
  if (requiredCompetencies.length === 0) return 100;

  let totalWeight = 0;
  let weightedScore = 0;

  for (const required of requiredCompetencies) {
    const employeeComp = employeeCompetencies.find(
      (ec) => ec.competencyId === required.competencyId
    );

    const employeeLevel = employeeComp?.finalScore 
      ? Math.min(Math.round(employeeComp.finalScore / 20), 5) // Convert 0-100 to 1-5
      : 0;

    // Calculate match ratio (capped at 100%)
    const matchRatio = Math.min(employeeLevel / required.requiredLevel, 1);
    
    weightedScore += matchRatio * required.weight;
    totalWeight += required.weight;
  }

  // Return percentage (0-100)
  return totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
}

/**
 * Normalize performance score to 0-100 scale
 * Performance score is typically 1-5 or 1-100
 */
export function normalizePerformanceScore(score: number | null | undefined): number {
  if (score === null || score === undefined) return 0;
  
  // If score is 1-5, multiply by 20 to get 0-100
  if (score <= 5) {
    return score * 20;
  }
  
  // Already 0-100, just return (capped at 100)
  return Math.min(score, 100);
}

/**
 * Normalize potential rating to 0-100 scale
 * Potential rating is 1-5 scale
 */
export function normalizePotentialScore(rating: number | null | undefined): number {
  if (rating === null || rating === undefined) return 0;
  return rating * 20; // 1-5 -> 20-100
}

/**
 * Calculate overall succession score
 * Formula: (Competency % * 0.4) + (Performance * 0.3) + (Potential * 0.3)
 */
export function calculateOverallScore(
  competencyMatchPercent: number,
  performanceScore: number,
  potentialScore: number
): number {
  const normalizedPerformance = normalizePerformanceScore(performanceScore);
  const normalizedPotential = normalizePotentialScore(potentialScore);
  
  return (
    competencyMatchPercent * 0.4 +
    normalizedPerformance * 0.3 +
    normalizedPotential * 0.3
  );
}

/**
 * Determine readiness status based on overall score and IDP progress
 */
export function determineReadinessStatus(
  overallScore: number,
  idpProgress?: number
): 'READY_NOW' | 'READY_6_MONTHS' | 'READY_1_YEAR' | 'NOT_READY' {
  const effectiveScore = idpProgress !== undefined 
    ? (overallScore * 0.7 + idpProgress * 0.3) 
    : overallScore;

  if (effectiveScore >= 85) return 'READY_NOW';
  if (effectiveScore >= 70) return 'READY_6_MONTHS';
  if (effectiveScore >= 50) return 'READY_1_YEAR';
  return 'NOT_READY';
}

/**
 * Calculate risk level based on various factors
 */
export function calculateRiskLevel(factors: {
  hasLowEngagement?: boolean;
  isHighPerformerStagnant?: boolean;
  noRecentLearning?: boolean;
  manualHRFlag?: boolean;
  performanceScore?: number;
  potentialRating?: number;
}): { riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; riskFactors: string[] } {
  const riskFactors: string[] = [];
  let riskPoints = 0;

  if (factors.hasLowEngagement) {
    riskFactors.push('Low engagement');
    riskPoints += 2;
  }

  if (factors.isHighPerformerStagnant) {
    riskFactors.push('High performer but stagnant');
    riskPoints += 3;
  }

  if (factors.noRecentLearning) {
    riskFactors.push('No recent learning activity');
    riskPoints += 1;
  }

  if (factors.manualHRFlag) {
    riskFactors.push('HR flagged');
    riskPoints += 2;
  }

  // High performer with low potential = flight risk
  if (
    factors.performanceScore && 
    factors.potentialRating && 
    factors.performanceScore >= 4 && 
    factors.potentialRating <= 2
  ) {
    riskFactors.push('High performer with low growth opportunity');
    riskPoints += 2;
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (riskPoints >= 6) {
    riskLevel = 'CRITICAL';
  } else if (riskPoints >= 4) {
    riskLevel = 'HIGH';
  } else if (riskPoints >= 2) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  return { riskLevel, riskFactors };
}

/**
 * Get 9-box grid position based on performance and potential
 * Returns position from 1-9 (bottom-left to top-right, row by row)
 */
export function get9BoxPosition(
  performanceScore: number,
  potentialRating: number
): { x: number; y: number; label: string } {
  // Normalize to 1-3 scale
  const perfLevel = performanceScore <= 2 ? 1 : performanceScore <= 3.5 ? 2 : 3;
  const potLevel = potentialRating <= 2 ? 1 : potentialRating <= 3.5 ? 2 : 3;

  const labels: Record<string, string> = {
    '1-1': 'Underperformer',
    '1-2': 'Inconsistent Player',
    '1-3': 'Rough Diamond',
    '2-1': 'Effective',
    '2-2': 'Core Player',
    '2-3': 'High Potential',
    '3-1': 'Trusted Professional',
    '3-2': 'High Performer',
    '3-3': 'Star',
  };

  return {
    x: perfLevel,
    y: potLevel,
    label: labels[`${perfLevel}-${potLevel}`] || 'Unknown',
  };
}

/**
 * Check if employee meets promotion eligibility criteria
 */
export function checkPromotionEligibility(criteria: {
  competencyThresholdMet: boolean;
  performanceAboveMinimum: boolean;
  idpCompletionPercent: number;
  minimumIdpCompletion?: number;
}): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const minimumIdp = criteria.minimumIdpCompletion ?? 80;

  if (!criteria.competencyThresholdMet) {
    reasons.push('Competency threshold not met');
  }

  if (!criteria.performanceAboveMinimum) {
    reasons.push('Performance rating below minimum');
  }

  if (criteria.idpCompletionPercent < minimumIdp) {
    reasons.push(`IDP completion below ${minimumIdp}%`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

