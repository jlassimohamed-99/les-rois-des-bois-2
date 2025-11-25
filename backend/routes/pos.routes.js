import express from 'express';
import { getStoreDashboard, getSales, createSale } from '../controllers/pos.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/store/:storeId/dashboard', protect, getStoreDashboard);
router.get('/sales', protect, getSales);
router.post('/sales', protect, createSale);

export default router;

