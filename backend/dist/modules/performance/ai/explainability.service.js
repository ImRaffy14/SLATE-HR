"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplainabilityService = void 0;
/**
 * Explainability Service
 * Provides human-readable explanations for AI analysis results
 * This is a fallback/supplementary service that doesn't require AI calls
 */
class ExplainabilityService {
    /**
     * Generate a rule-based explanation for performance analysis
     * This provides immediate explanations without AI latency
     */
    generateExplanation(summary, analysis) {
        const explanations = [];
        const keyMetrics = [];
        // Explain performance trend
        if (analysis.performanceTrend === 'Declining') {
            explanations.push(`Performance is showing a declining trend. This was determined by comparing the latest rating of ${summary.lastRating}/5 with the overall ${summary.trend.toLowerCase()} trajectory.`);
            keyMetrics.push({
                metric: 'Performance Trend',
                value: summary.trend,
                impact: 'Negative - requires attention'
            });
        }
        else if (analysis.performanceTrend === 'Improving') {
            explanations.push(`Performance is trending positively, with a last rating of ${summary.lastRating}/5 and consistent ${summary.trend.toLowerCase()} momentum.`);
            keyMetrics.push({
                metric: 'Performance Trend',
                value: summary.trend,
                impact: 'Positive - maintain current trajectory'
            });
        }
        // Explain competency status
        if (summary.competencyGrowth === 'Stagnant' || summary.competencyGrowth === 'Low') {
            explanations.push(`Competency development shows ${summary.competencyGrowth.toLowerCase()} growth, indicating a need for targeted skill development.`);
            keyMetrics.push({
                metric: 'Competency Growth',
                value: summary.competencyGrowth,
                impact: 'Attention needed for skill development'
            });
        }
        // Explain learning activity
        if (summary.learningActivity === 'None' || summary.learningActivity === 'Low') {
            explanations.push(`Learning activity is ${summary.learningActivity.toLowerCase()}, which may be contributing to competency stagnation. Encouraging course enrollment could help.`);
            keyMetrics.push({
                metric: 'Learning Activity',
                value: summary.learningActivity,
                impact: 'May limit competency growth'
            });
        }
        else if (summary.learningActivity === 'High') {
            explanations.push(`Strong learning engagement is demonstrated through high course activity.`);
        }
        // Explain training attendance
        if (summary.trainingAttendance === 'Poor') {
            explanations.push(`Training attendance is poor, which reduces exposure to structured skill development opportunities.`);
            keyMetrics.push({
                metric: 'Training Attendance',
                value: summary.trainingAttendance,
                impact: 'Missing development opportunities'
            });
        }
        // Explain skill gaps
        if (summary.skillGaps > 0) {
            const gapSeverity = summary.skillGaps > 3 ? 'significant' : summary.skillGaps > 1 ? 'moderate' : 'minor';
            explanations.push(`${summary.skillGaps} skill gap(s) identified, representing ${gapSeverity} areas for improvement.`);
            keyMetrics.push({
                metric: 'Skill Gaps',
                value: String(summary.skillGaps),
                impact: summary.skillGaps > 3 ? 'Critical attention needed' : 'Address through targeted training'
            });
        }
        // Explain risk level determination
        const riskExplanation = this.explainRiskLevel(analysis.riskLevel, summary);
        return {
            summary: explanations.join(' '),
            keyMetrics,
            riskExplanation,
            contributingFactors: analysis.keyFactors || [],
            dataDisclaimer: 'This analysis is based on available HR data and should be used as a decision-support tool. Final decisions should incorporate human judgment and additional context.',
            confidenceFactors: this.getConfidenceFactors(summary)
        };
    }
    /**
     * Explain how risk level was determined
     */
    explainRiskLevel(riskLevel, summary) {
        const riskFactors = [];
        if (summary.trend === 'Declining') {
            riskFactors.push('declining performance trend');
        }
        if (summary.competencyGrowth === 'Stagnant') {
            riskFactors.push('stagnant competency growth');
        }
        if (summary.learningActivity === 'None' || summary.learningActivity === 'Low') {
            riskFactors.push('low learning engagement');
        }
        if (summary.trainingAttendance === 'Poor') {
            riskFactors.push('poor training attendance');
        }
        if (summary.skillGaps > 3) {
            riskFactors.push('significant skill gaps');
        }
        if (riskFactors.length === 0) {
            return `Risk level is ${riskLevel} based on overall positive indicators across performance metrics.`;
        }
        return `Risk level is ${riskLevel} primarily due to: ${riskFactors.join(', ')}.`;
    }
    /**
     * Get factors affecting analysis confidence
     */
    getConfidenceFactors(summary) {
        return [
            {
                factor: 'Performance data availability',
                status: summary.lastRating > 0 ? 'Available' : 'Limited'
            },
            {
                factor: 'Learning activity data',
                status: summary.learningActivity !== 'None' ? 'Available' : 'Limited'
            },
            {
                factor: 'Training participation data',
                status: summary.trainingAttendance !== 'Poor' ? 'Available' : 'Limited'
            },
            {
                factor: 'Competency assessment data',
                status: summary.competencyGrowth !== 'Stagnant' ? 'Available' : 'Limited'
            }
        ];
    }
    /**
     * Format AI recommendations for display
     */
    formatRecommendations(recommendations) {
        return recommendations.map((rec, index) => ({
            priority: index + 1,
            recommendation: rec.title || rec,
            rationale: rec.rationale || 'Based on identified development needs',
            type: rec.type || 'general',
            actionable: true
        }));
    }
    /**
     * Generate a bias disclaimer
     */
    getBiasDisclaimer() {
        return `
      AI ANALYSIS DISCLAIMER:
      This analysis is generated by an AI system and should be used as a decision-support tool only.
      
      Key considerations:
      • AI recommendations are advisory and require human review
      • Analysis is based on available data and may not capture all relevant context
      • Individual circumstances should be considered before taking action
      • Regular review and validation of AI outputs is recommended
      
      This system is designed to assist HR professionals, not replace human judgment.
    `.trim();
    }
}
exports.ExplainabilityService = ExplainabilityService;
