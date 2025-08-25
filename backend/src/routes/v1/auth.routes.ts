import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { verifyToken } from '../../middlewares/verifyToken';
import upload from '../../middlewares/multer';

const router = Router();
const authController = new AuthController();

router.post('/register', upload.single('image'), authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/profile', verifyToken, authController.getUserProfile);
router.post('/logout', authController.logoutUser);

export default router;
