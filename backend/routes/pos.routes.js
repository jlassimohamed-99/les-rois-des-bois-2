import express from 'express';
import {
  getStoreDashboard,
  getSales,
  createSale,
  getPOSProducts,
  createPOSOrder,
  generatePOSInvoice,
} from '../controllers/pos.controller.js';
import { protect, protectPOS } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/store/:storeId/dashboard', protect, getStoreDashboard);
router.get('/sales', protectPOS, getSales);
router.post('/sales', protectPOS, createSale);

// New POS routes - accessible by admin and cashiers
router.get('/products', protectPOS, getPOSProducts);
router.post('/order', protectPOS, createPOSOrder);
router.post('/invoice/:orderId', protectPOS, generatePOSInvoice);

export default router;

