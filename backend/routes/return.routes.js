import express from 'express';
import {
  getReturns,
  createReturn,
  approveReturn,
  restockItems,
} from '../controllers/return.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getReturns);
router.post('/', protect, createReturn);
router.put('/:id/approve', protect, approveReturn);
router.post('/:id/restock', protect, restockItems);

export default router;

