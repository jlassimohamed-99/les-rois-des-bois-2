import express from 'express';
import { getExpenses, createExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);

export default router;

