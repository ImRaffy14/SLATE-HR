import prisma from '../../../config/prisma';
import { AIRecommendation } from '../types/performance.types';
import { AggregationService } from './aggregation.service';
import { GroqService } from '../ai/groq.service';

export class RecommendationsService {
  private aggregationService: AggregationService;
  private groqService: GroqService;

  constructor() {
    this.aggregationService = new AggregationService();
    this.groqService = new GroqService();
  }

  /**
   * Get AI-generated recommendations for an employee
   */
  async getRecommendations(employeeId: string, forceRefresh = false) {
    const summary = await this.aggregationService.generatePerformanceSummary(employeeId);
    const aiRecommendations = await this.groqService.generateRecommendations(
      employeeId,
      summary,
      forceRefresh
    );

    // Map AI recommendations to actual courses and trainings
    const mappedRecommendations = await this.mapToResources(
      employeeId,
      aiRecommendations.recommendations || []
    );

    return {
      employeeId,
      generatedAt: new Date(),
      developmentFocus: aiRecommendations.developmentFocus,
      timeline: aiRecommendations.timeline,
      successMetrics: aiRecommendations.successMetrics,
      recommendations: mappedRecommendations
    };
  }

  /**
   * Map AI recommendations to actual courses/trainings in the system
   */
  private async mapToResources(
    employeeId: string,
    recommendations: any[]
  ): Promise<AIRecommendation[]> {
    const mappedRecs: AIRecommendation[] = [];

    // Get employee's gaps to help match courses
    const gaps = await prisma.gapAnalysis.findMany({
      where: { employeeId },
      include: {
        competency: {
          select: { id: true, name: true }
        }
      }
    });

    const gapCompetencyIds = gaps.map(g => g.competencyId);

    // Get available courses that match competency gaps
    const relevantCourses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        taggedCompetencies: { hasSome: gapCompetencyIds }
      },
      select: {
        id: true,
        title: true,
        description: true,
        taggedCompetencies: true
      }
    });

    // Get available trainings that match competency gaps
    const relevantTrainings = await prisma.training.findMany({
      where: {
        status: { in: ['OPEN', 'ONGOING'] },
        taggedCompetencies: { hasSome: gapCompetencyIds }
      },
      select: {
        id: true,
        title: true,
        description: true,
        taggedCompetencies: true
      }
    });

    // Get employee's current enrollments to avoid duplicates
    const currentEnrollments = await prisma.enrollment.findMany({
      where: { employeeId },
      select: { courseId: true }
    });
    const enrolledCourseIds = new Set(currentEnrollments.map(e => e.courseId));

    const currentTrainingEnrollments = await prisma.trainingEnrollment.findMany({
      where: { employeeId },
      select: { trainingId: true }
    });
    const enrolledTrainingIds = new Set(currentTrainingEnrollments.map(e => e.trainingId));

    // Process each AI recommendation
    for (const rec of recommendations) {
      const mappedRec: AIRecommendation = {
        type: rec.type || 'general',
        title: rec.title,
        description: rec.description || '',
        priority: rec.priority || 'Medium',
        rationale: rec.rationale || rec.expectedOutcome || ''
      };

      // Try to match with actual resources
      if (rec.type === 'course' || rec.title?.toLowerCase().includes('course')) {
        // Find best matching course not already enrolled
        const matchedCourse = relevantCourses.find(
          c => !enrolledCourseIds.has(c.id) &&
               (c.title.toLowerCase().includes(rec.title?.toLowerCase() || '') ||
                rec.title?.toLowerCase().includes(c.title.toLowerCase()))
        );

        if (matchedCourse) {
          mappedRec.linkedCourseId = matchedCourse.id;
          mappedRec.title = matchedCourse.title;
          mappedRec.description = matchedCourse.description || mappedRec.description;
        } else if (relevantCourses.length > 0) {
          // Use first available relevant course not enrolled
          const available = relevantCourses.find(c => !enrolledCourseIds.has(c.id));
          if (available) {
            mappedRec.linkedCourseId = available.id;
            mappedRec.title = available.title;
            mappedRec.description = available.description || mappedRec.description;
          }
        }
      }

      if (rec.type === 'training' || rec.title?.toLowerCase().includes('training')) {
        // Find best matching training not already enrolled
        const matchedTraining = relevantTrainings.find(
          t => !enrolledTrainingIds.has(t.id) &&
               (t.title.toLowerCase().includes(rec.title?.toLowerCase() || '') ||
                rec.title?.toLowerCase().includes(t.title.toLowerCase()))
        );

        if (matchedTraining) {
          mappedRec.linkedTrainingId = matchedTraining.id;
          mappedRec.title = matchedTraining.title;
          mappedRec.description = matchedTraining.description || mappedRec.description;
        } else if (relevantTrainings.length > 0) {
          // Use first available relevant training not enrolled
          const available = relevantTrainings.find(t => !enrolledTrainingIds.has(t.id));
          if (available) {
            mappedRec.linkedTrainingId = available.id;
            mappedRec.title = available.title;
            mappedRec.description = available.description || mappedRec.description;
          }
        }
      }

      mappedRecs.push(mappedRec);
    }

    // Add courses for unfilled gaps if not enough recommendations
    if (mappedRecs.length < 3 && gaps.length > 0) {
      for (const gap of gaps) {
        if (mappedRecs.length >= 5) break;

        const courseForGap = relevantCourses.find(
          c => c.taggedCompetencies.includes(gap.competencyId) &&
               !enrolledCourseIds.has(c.id) &&
               !mappedRecs.some(r => r.linkedCourseId === c.id)
        );

        if (courseForGap) {
          mappedRecs.push({
            type: 'course',
            title: courseForGap.title,
            description: courseForGap.description || '',
            priority: gap.gap >= 2 ? 'High' : 'Medium',
            linkedCourseId: courseForGap.id,
            linkedCompetencyId: gap.competencyId,
            rationale: `Addresses skill gap in ${gap.competency.name} (${gap.gap} level gap)`
          });
        }
      }
    }

    // Sort by priority
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    mappedRecs.sort((a, b) => 
      (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    );

    return mappedRecs;
  }

  /**
   * Get quick recommendations without AI (based on gap analysis only)
   */
  async getQuickRecommendations(employeeId: string) {
    const gaps = await prisma.gapAnalysis.findMany({
      where: { employeeId },
      include: {
        competency: {
          select: { id: true, name: true }
        }
      },
      orderBy: { gap: 'desc' }
    });

    const recommendations: AIRecommendation[] = [];

    for (const gap of gaps.slice(0, 5)) {
      // Find courses for this competency
      const course = await prisma.course.findFirst({
        where: {
          status: 'PUBLISHED',
          taggedCompetencies: { has: gap.competencyId }
        }
      });

      if (course) {
        recommendations.push({
          type: 'course',
          title: course.title,
          description: course.description || '',
          priority: gap.gap >= 2 ? 'High' : 'Medium',
          linkedCourseId: course.id,
          linkedCompetencyId: gap.competencyId,
          rationale: `Recommended to address ${gap.competency.name} skill gap`
        });
      }

      // Find trainings for this competency
      const training = await prisma.training.findFirst({
        where: {
          status: { in: ['OPEN', 'ONGOING'] },
          taggedCompetencies: { has: gap.competencyId }
        }
      });

      if (training) {
        recommendations.push({
          type: 'training',
          title: training.title,
          description: training.description || '',
          priority: gap.gap >= 2 ? 'High' : 'Medium',
          linkedTrainingId: training.id,
          linkedCompetencyId: gap.competencyId,
          rationale: `Hands-on training to improve ${gap.competency.name}`
        });
      }
    }

    return recommendations;
  }
}

