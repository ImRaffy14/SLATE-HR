import { Request, Response } from 'express';
import { TrainingEvaluationService } from '../services/evaluation.service';
import { asyncHandler } from '../../../utils/asyncHandler';

export class TrainingEvaluationController {
  private evaluationService = new TrainingEvaluationService();

  // Submit evaluation
  submitEvaluation = asyncHandler(async (req: Request, res: Response) => {
    const evaluation = await this.evaluationService.submitEvaluation(req.params.enrollmentId, req.body);
    res.status(201).json({ status: 'success', evaluation });
  });

  // Get evaluation
  getEvaluation = asyncHandler(async (req: Request, res: Response) => {
    const evaluation = await this.evaluationService.getEvaluation(req.params.enrollmentId);
    res.status(200).json({ status: 'success', evaluation });
  });

  // Get all evaluations for a training
  getTrainingEvaluations = asyncHandler(async (req: Request, res: Response) => {
    const evaluations = await this.evaluationService.getTrainingEvaluations(req.params.id);
    res.status(200).json({ status: 'success', evaluations });
  });

  // Submit employee performance rating (by HR/Manager/Trainer)
  submitEmployeePerformanceRating = asyncHandler(async (req: Request, res: Response) => {
    const evaluation = await this.evaluationService.submitEmployeePerformanceRating(req.params.enrollmentId, req.body);
    res.status(201).json({ status: 'success', evaluation });
  });
}

