import { PerformanceSummary } from '../types/performance.types';

/**
 * Performance Analysis Prompt
 * Generates AI insights from aggregated performance data
 * NOTE: No personally identifiable information (PII) is included
 */
export const performanceAnalysisPrompt = (summary: PerformanceSummary): string => `
You are an HR analytics assistant helping to analyze employee performance data. Based on the following anonymized metrics, provide a structured analysis.

EMPLOYEE PERFORMANCE SUMMARY:
- Performance Trend: ${summary.trend}
- Competency Growth: ${summary.competencyGrowth}
- Learning Activity: ${summary.learningActivity}
- Training Attendance: ${summary.trainingAttendance}
- Last Performance Rating: ${summary.lastRating}/5
- Number of Skill Gaps: ${summary.skillGaps}

Analyze this data and respond ONLY with a valid JSON object (no markdown, no code blocks, no additional text):
{
  "performanceTrend": "Improving" | "Stable" | "Declining",
  "riskLevel": "Low" | "Medium" | "High",
  "keyFactors": ["list", "of", "contributing", "factors"],
  "insightSummary": "A 2-3 sentence explanation of the analysis",
  "recommendations": ["specific", "actionable", "recommendations"],
  "promotionReadiness": 0-100,
  "strengthAreas": ["identified", "strengths"],
  "developmentAreas": ["areas", "needing", "development"]
}

Rules:
1. Base your analysis solely on the provided metrics
2. Be objective and constructive
3. Provide actionable recommendations
4. Consider the relationship between metrics (e.g., low learning activity may explain competency stagnation)
5. Risk level should reflect overall performance health
`;

/**
 * Trend Analysis Prompt
 * For analyzing performance trends over time
 */
export const trendAnalysisPrompt = (
  history: Array<{ period: string; overallScore: number }>
): string => `
You are an HR analytics assistant. Analyze the following performance score history and identify trends.

PERFORMANCE HISTORY (newest to oldest):
${history.map(h => `- ${h.period}: ${h.overallScore.toFixed(1)}/100`).join('\n')}

Respond ONLY with a valid JSON object:
{
  "trendDirection": "Upward" | "Downward" | "Stable" | "Volatile",
  "trendStrength": "Strong" | "Moderate" | "Weak",
  "patternObserved": "description of any patterns noticed",
  "projectedTrajectory": "where performance is heading if trend continues",
  "interventionUrgency": "None" | "Low" | "Medium" | "High"
}
`;

/**
 * Risk Assessment Prompt
 * For assessing employee risk of performance decline or attrition
 */
export const riskAssessmentPrompt = (summary: PerformanceSummary): string => `
You are an HR analytics assistant focused on risk assessment. Evaluate potential risks based on these metrics.

EMPLOYEE METRICS:
- Performance Trend: ${summary.trend}
- Competency Growth: ${summary.competencyGrowth}
- Learning Activity: ${summary.learningActivity}
- Training Attendance: ${summary.trainingAttendance}
- Last Rating: ${summary.lastRating}/5
- Skill Gaps: ${summary.skillGaps}

Respond ONLY with a valid JSON object:
{
  "overallRisk": "Low" | "Medium" | "High" | "Critical",
  "riskFactors": [
    {
      "factor": "description of risk factor",
      "severity": "Low" | "Medium" | "High",
      "mitigation": "suggested action to address"
    }
  ],
  "attentionNeeded": true | false,
  "priorityActions": ["immediate", "actions", "recommended"],
  "monitoringFrequency": "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly"
}
`;

/**
 * Recommendation Generation Prompt
 * For generating specific development recommendations
 */
export const recommendationPrompt = (
  summary: PerformanceSummary,
  availableCourses: string[],
  availableTrainings: string[]
): string => `
You are an HR learning advisor. Generate personalized development recommendations.

EMPLOYEE PROFILE:
- Performance Trend: ${summary.trend}
- Competency Growth: ${summary.competencyGrowth}
- Learning Activity: ${summary.learningActivity}
- Training Attendance: ${summary.trainingAttendance}
- Skill Gaps: ${summary.skillGaps}

AVAILABLE LEARNING RESOURCES:
Courses: ${availableCourses.length > 0 ? availableCourses.join(', ') : 'Various courses available'}
Trainings: ${availableTrainings.length > 0 ? availableTrainings.join(', ') : 'Various trainings available'}

Respond ONLY with a valid JSON object:
{
  "recommendations": [
    {
      "type": "course" | "training" | "coaching" | "mentoring" | "assignment",
      "title": "recommendation title",
      "description": "what this involves",
      "priority": "High" | "Medium" | "Low",
      "rationale": "why this is recommended",
      "expectedOutcome": "what improvement is expected"
    }
  ],
  "developmentFocus": "primary area to focus on",
  "timeline": "suggested development timeline",
  "successMetrics": ["how", "to", "measure", "success"]
}
`;

/**
 * Explainability Prompt
 * For generating human-readable explanations of AI analysis
 */
export const explainabilityPrompt = (
  summary: PerformanceSummary,
  analysisResult: any
): string => `
You are an HR communication specialist. Explain the following AI-generated analysis in clear, professional language suitable for HR managers.

ORIGINAL METRICS:
- Performance Trend: ${summary.trend}
- Competency Growth: ${summary.competencyGrowth}
- Learning Activity: ${summary.learningActivity}
- Training Attendance: ${summary.trainingAttendance}
- Last Rating: ${summary.lastRating}/5
- Skill Gaps: ${summary.skillGaps}

AI ANALYSIS RESULT:
${JSON.stringify(analysisResult, null, 2)}

Respond ONLY with a valid JSON object:
{
  "summary": "A clear 3-4 sentence summary of the analysis in plain English",
  "keyPoints": [
    {
      "metric": "which metric this relates to",
      "observation": "what was observed",
      "implication": "what this means for the employee"
    }
  ],
  "actionableInsights": [
    "Clear action item 1",
    "Clear action item 2"
  ],
  "confidenceNote": "A brief note about the confidence level of this analysis"
}
`;

