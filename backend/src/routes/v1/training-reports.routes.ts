import express from 'express';
import { TrainingReportController } from '../../modules/training/controllers/report.controller';
import { bearerAuth } from '../../middlewares/bearerAuth';

const router = express.Router();
const reportController = new TrainingReportController();

// Report endpoints
router.get('/training-hours', bearerAuth, reportController.getTrainingHoursReport);
router.get('/attendance', bearerAuth, reportController.getAttendanceSummaryReport);
router.get('/competency-improvement', bearerAuth, reportController.getCompetencyImprovementReport);
router.get('/trainer-effectiveness', bearerAuth, reportController.getTrainerEffectivenessReport);

export default router;

