import express from 'express';
import users from './v1/account.routes';
import auth from './v1/auth.routes';
import competency from './v1/competency.routes';
import competencyCategory from './v1/competencyCategory.routes';
import trainingRecommendation from './v1/trainingRecommendation.routes';
import jobRole from './v1/jobRole.routes';
import employee from './v1/employee.routes';
import learning from './v1/learning.routes';
import training from './v1/training.routes';
import trainingEnrollment from './v1/training-enrollment.routes';
import trainingAttendance from './v1/training-attendance.routes';
import trainingEvaluation from './v1/training-evaluation.routes';
import trainingReports from './v1/training-reports.routes';
import dashboard from './v1/dashboard.routes';
import ess from '../modules/ess/routes/ess.routes';
import succession from '../modules/succession/routes/succession.routes';
import performance from '../modules/performance/routes/performance.routes';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// V1 Routes
router.use('/users', users);
router.use('/auth', auth);
router.use('/competency', verifyToken, competency);
router.use('/competency-category', verifyToken, competencyCategory);
router.use('/training-recommendation', verifyToken, trainingRecommendation);
router.use('/job-role', verifyToken, jobRole);
router.use('/employee', verifyToken, employee);
router.use('/learning', verifyToken, learning);
router.use('/trainings', verifyToken, training);
router.use('/training-enrollment', verifyToken, trainingEnrollment);
router.use('/training-attendance', verifyToken, trainingAttendance);
router.use('/training-evaluation', verifyToken, trainingEvaluation);
router.use('/reports', verifyToken, trainingReports);
router.use('/dashboard', verifyToken, dashboard);
router.use('/ess', verifyToken, ess);
router.use('/succession', verifyToken, succession);
router.use('/performance', verifyToken, performance);

export default router;
    