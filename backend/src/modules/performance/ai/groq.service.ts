import Groq from 'groq-sdk';
import prisma from '../../../config/prisma';
import { PerformanceSummary, AIAnalysisResult } from '../types/performance.types';
import {
  performanceAnalysisPrompt,
  trendAnalysisPrompt,
  riskAssessmentPrompt,
  recommendationPrompt,
  explainabilityPrompt
} from './prompts';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.3-70b-versatile';
const CACHE_HOURS = 24; // How long to cache AI insights

export class GroqService {
  /**
   * Send a prompt to Groq and get a JSON response
   */
  private async sendPrompt(prompt: string): Promise<any> {
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
      } catch (parseError) {
        console.error('Failed to parse Groq response:', responseText);
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error: any) {
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
  private async getCachedInsight(employeeId: string, analysisType: string): Promise<any | null> {
    const cached = await prisma.aIInsight.findFirst({
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
  private async storeInsight(
    employeeId: string,
    analysisType: string,
    result: any,
    prompt: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_HOURS);

    // Anonymize prompt for storage (remove any accidental PII)
    const sanitizedPrompt = prompt.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');

    await prisma.aIInsight.create({
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
  async analyzePerformance(
    employeeId: string,
    summary: PerformanceSummary,
    forceRefresh = false
  ): Promise<AIAnalysisResult> {
    // Check cache first
    if (!forceRefresh) {
      const cached = await this.getCachedInsight(employeeId, 'FULL');
      if (cached) {
        return cached as AIAnalysisResult;
      }
    }

    const prompt = performanceAnalysisPrompt(summary);
    const result = await this.sendPrompt(prompt);

    // Store for caching and audit
    await this.storeInsight(employeeId, 'FULL', result, prompt);

    return result as AIAnalysisResult;
  }

  /**
   * Analyze performance trend over time
   */
  async analyzeTrend(
    employeeId: string,
    history: Array<{ period: string; overallScore: number }>,
    forceRefresh = false
  ) {
    if (!forceRefresh) {
      const cached = await this.getCachedInsight(employeeId, 'TREND');
      if (cached) return cached;
    }

    const prompt = trendAnalysisPrompt(history);
    const result = await this.sendPrompt(prompt);

    await this.storeInsight(employeeId, 'TREND', result, prompt);

    return result;
  }

  /**
   * Assess risk level
   */
  async assessRisk(
    employeeId: string,
    summary: PerformanceSummary,
    forceRefresh = false
  ) {
    if (!forceRefresh) {
      const cached = await this.getCachedInsight(employeeId, 'RISK');
      if (cached) return cached;
    }

    const prompt = riskAssessmentPrompt(summary);
    const result = await this.sendPrompt(prompt);

    await this.storeInsight(employeeId, 'RISK', result, prompt);

    return result;
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(
    employeeId: string,
    summary: PerformanceSummary,
    forceRefresh = false
  ) {
    if (!forceRefresh) {
      const cached = await this.getCachedInsight(employeeId, 'RECOMMENDATION');
      if (cached) return cached;
    }

    // Get available courses and trainings for context
    const [courses, trainings] = await Promise.all([
      prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        select: { title: true },
        take: 20
      }),
      prisma.training.findMany({
        where: { status: { in: ['OPEN', 'ONGOING'] } },
        select: { title: true },
        take: 20
      })
    ]);

    const prompt = recommendationPrompt(
      summary,
      courses.map(c => c.title),
      trainings.map(t => t.title)
    );
    const result = await this.sendPrompt(prompt);

    await this.storeInsight(employeeId, 'RECOMMENDATION', result, prompt);

    return result;
  }

  /**
   * Get explainable AI output
   */
  async explainAnalysis(
    employeeId: string,
    summary: PerformanceSummary,
    analysisResult: any
  ) {
    const prompt = explainabilityPrompt(summary, analysisResult);
    const result = await this.sendPrompt(prompt);

    // Don't cache explanations - they're generated on demand
    return result;
  }

  /**
   * Get all insights for an employee
   */
  async getAllInsights(employeeId: string) {
    const insights = await prisma.aIInsight.findMany({
      where: {
        employeeId,
        expiresAt: { gt: new Date() }
      },
      orderBy: { generatedAt: 'desc' }
    });

    const byType: Record<string, any> = {};
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
    const result = await prisma.aIInsight.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    return result.count;
  }
}

