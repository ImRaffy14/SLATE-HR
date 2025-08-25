import express from 'express';
import users from './v1/account.routes';
import auth from './v1/auth.routes';

const router = express.Router();

// V1
router.use('/users', users);
router.use('/auth', auth);

export default router;