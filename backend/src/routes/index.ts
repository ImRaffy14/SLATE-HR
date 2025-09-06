import express from 'express';
import users from './v1/account.routes';
import auth from './v1/auth.routes';
import learning from './v1/learning.routes';
import enrollment from './v1/enrollment.routes';
import competency from './v1/competency.routes';
import performance from './v1/performance.route';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// V1 Routes
router.use('/users', users);
router.use('/auth', auth);
router.use('/learning', learning);
router.use('/enrollments', enrollment);
router.use('/competency', verifyToken, competency);
router.use('/performance', performance);

export default router;
