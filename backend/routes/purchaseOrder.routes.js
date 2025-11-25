import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePOStatus,
} from '../controllers/purchaseOrder.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getPurchaseOrders);
router.get('/:id', protect, getPurchaseOrder);
router.post('/', protect, createPurchaseOrder);
router.put('/:id/status', protect, updatePOStatus);

export default router;

