import express from 'express';
import { login, register, getMe, changePassword, getCashierById } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
// Public endpoint for cashiers (no token required)
router.get('/cashier/:cashierId', getCashierById);

export default router;

