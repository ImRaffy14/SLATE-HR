import express from 'express';
import { TrainingEvaluationController } from '../../modules/training/controllers/evaluation.controller';
import { bearerAuth } from '../../middlewares/bearerAuth';

const router = express.Router();
const evaluationController = new TrainingEvaluationController();

// Evaluation endpoints
router.post('/:enrollmentId', bearerAuth, evaluationController.submitEvaluation);
router.get('/:enrollmentId', bearerAuth, evaluationController.getEvaluation);
router.post('/:enrollmentId/employee-performance', bearerAuth, evaluationController.submitEmployeePerformanceRating);

export default router;

