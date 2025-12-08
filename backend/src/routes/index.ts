import express from 'express';
import users from './v1/account.routes';
import auth from './v1/auth.routes';
import competency from './v1/competency.routes';
import competencyCategory from './v1/competencyCategory.routes';
import trainingRecommendation from './v1/trainingRecommendation.routes';
import jobRole from './v1/jobRole.routes';
import employee from './v1/employee.routes';
import learning from './v1/learning.routes';
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


export default router;
    