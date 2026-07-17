import { Router } from 'express';
import { login, logout, getImageKitAuth } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/imagekit-auth', protect, getImageKitAuth);

export default router;
