import express from 'express';
import {
  getSpecialProducts,
  getSpecialProduct,
  createSpecialProduct,
  updateSpecialProduct,
  deleteSpecialProduct,
  generateCombinations,
} from '../controllers/specialProduct.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getSpecialProducts);
router.get('/:id', getSpecialProduct);
router.post('/generate-combinations', protect, generateCombinations);
router.post('/', protect, createSpecialProduct);
router.put('/:id', protect, updateSpecialProduct);
router.delete('/:id', protect, deleteSpecialProduct);

export default router;

