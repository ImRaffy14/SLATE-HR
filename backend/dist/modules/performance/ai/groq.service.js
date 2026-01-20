"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const prisma_1 = __importDefault(require("../../../config/prisma"));
const prompts_1 = require("./prompts");
// Initialize Groq client
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY
});
const MODEL = 'llama-3.3-70b-versatile';
const CACHE_HOURS = 24; // How long to cache AI insights
class GroqService {
    /**
     * Send a prompt to Groq and get a JSON response
     */
    async sendPrompt(prompt) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an HR analytics AI assistant. Always respond with valid JSON only, no markdown or additional text.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: MODEL,
                temperature: 0.3, // Lower temperature for more consistent outputs
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            });
            const responseText = completion.choices[0]?.message?.content || '{}';
            try {
                return JSON.parse(responseText);
            }
            catch (parseError) {
                console.error('Failed to parse Groq response:', responseText);
                throw new Error('Invalid JSON response from AI');
            }
        }
        catch (error) {
            // Handle rate limiting
            if (error.status === 429) {
                throw new Error('AI service rate limit exceeded. Please try again later.');
            }
            // Handle API key issues
            if (error.status === 401) {
                throw new Error('AI service authentication failed. Please check API configuration.');
            }
            throw error;
        }
    }
    /**
     * Check if a valid cached insight exists
     */
    async getCachedInsight(employeeId, analysisType) {
        const cached = await prisma_1.default.aIInsight.findFirst({
            where: {
                employeeId,
                analysisType,
                expiresAt: { gt: new Date() }
            },
            orderBy: { generatedAt: 'desc' }
        });
        return cached?.analysisResult ?? null;
    }
    /**
     * Store AI insight in database
     */
    async storeInsight(employeeId, analysisType, result, prompt) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + CACHE_HOURS);
        // Anonymize prompt for storage (remove any accidental PII)
        const sanitizedPrompt = prompt.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');
        await prisma_1.default.aIInsight.create({
            data: {
                employeeId,
                analysisType,
                analysisResult: result,
                promptUsed: sanitizedPrompt.substring(0, 1000), // Truncate for storage
                modelUsed: MODEL,
                expiresAt
            }
        });
    }
    /**
     * Perform full performance analysis
     */
    async analyzePerformance(employeeId, summary, forceRefresh = false) {
        // Check cache first
        if (!forceRefresh) {
            const cached = await this.getCachedInsight(employeeId, 'FULL');
            if (cached) {
                return cached;
            }
        }
        const prompt = (0, prompts_1.performanceAnalysisPrompt)(summary);
        const result = await this.sendPrompt(prompt);
        // Store for caching and audit
        await this.storeInsight(employeeId, 'FULL', result, prompt);
        return result;
    }
    /**
     * Analyze performance trend over time
     */
    async analyzeTrend(employeeId, history, forceRefresh = false) {
        if (!forceRefresh) {
            const cached = await this.getCachedInsight(employeeId, 'TREND');
            if (cached)
                return cached;
        }
        const prompt = (0, prompts_1.trendAnalysisPrompt)(history);
        const result = await this.sendPrompt(prompt);
        await this.storeInsight(employeeId, 'TREND', result, prompt);
        return result;
    }
    /**
     * Assess risk level
     */
    async assessRisk(employeeId, summary, forceRefresh = false) {
        if (!forceRefresh) {
            const cached = await this.getCachedInsight(employeeId, 'RISK');
            if (cached)
                return cached;
        }
        const prompt = (0, prompts_1.riskAssessmentPrompt)(summary);
        const result = await this.sendPrompt(prompt);
        await this.storeInsight(employeeId, 'RISK', result, prompt);
        return result;
    }
    /**
     * Generate personalized recommendations
     */
    async generateRecommendations(employeeId, summary, forceRefresh = false) {
        if (!forceRefresh) {
            const cached = await this.getCachedInsight(employeeId, 'RECOMMENDATION');
            if (cached)
                return cached;
        }
        // Get available courses and trainings for context
        const [courses, trainings] = await Promise.all([
            prisma_1.default.course.findMany({
                where: { status: 'PUBLISHED' },
                select: { title: true },
                take: 20
            }),
            prisma_1.default.training.findMany({
                where: { status: { in: ['OPEN', 'ONGOING'] } },
                select: { title: true },
                take: 20
            })
        ]);
        const prompt = (0, prompts_1.recommendationPrompt)(summary, courses.map(c => c.title), trainings.map(t => t.title));
        const result = await this.sendPrompt(prompt);
        await this.storeInsight(employeeId, 'RECOMMENDATION', result, prompt);
        return result;
    }
    /**
     * Get explainable AI output
     */
    async explainAnalysis(employeeId, summary, analysisResult) {
        const prompt = (0, prompts_1.explainabilityPrompt)(summary, analysisResult);
        const result = await this.sendPrompt(prompt);
        // Don't cache explanations - they're generated on demand
        return result;
    }
    /**
     * Get all insights for an employee
     */
    async getAllInsights(employeeId) {
        const insights = await prisma_1.default.aIInsight.findMany({
            where: {
                employeeId,
                expiresAt: { gt: new Date() }
            },
            orderBy: { generatedAt: 'desc' }
        });
        const byType = {};
        for (const insight of insights) {
            if (!byType[insight.analysisType]) {
                byType[insight.analysisType] = insight;
            }
        }
        return byType;
    }
    /**
     * Clear expired insights
     */
    async cleanupExpiredInsights() {
        const result = await prisma_1.default.aIInsight.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
        return result.count;
    }
}
exports.GroqService = GroqService;
