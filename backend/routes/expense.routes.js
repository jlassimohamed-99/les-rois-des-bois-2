import express from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

export default router;

