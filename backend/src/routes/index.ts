import express from 'express';
import users from './v1/account.routes';
import auth from './v1/auth.routes';
import learning from './v1/learning.routes';
import enrollment from './v1/enrollment.routes';
import competency from './v1/competency.routes';
import performance from './v1/performance.route';
import employee from './v1/employee.routes';
import training from './v1/training.routes';
import succession from './v1/succession.route';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// V1 Routes
router.use('/users', users);
router.use('/auth', auth);
router.use('/learning', verifyToken, learning);
router.use('/enrollments', verifyToken, enrollment);
router.use('/competency', verifyToken, competency);
router.use('/performance', performance);
router.use('/employee', verifyToken, employee);
router.use('/training', verifyToken, training);
router.use('/succession', verifyToken, succession);

export default router;
    