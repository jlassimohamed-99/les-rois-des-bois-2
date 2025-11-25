import express from 'express';
import { login, register, getMe, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

export default router;

