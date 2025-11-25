import express from 'express';
import {
  getPublicProducts,
  getPublicProduct,
  getPublicCategories,
  getPublicCategory,
  getPublicSpecialProducts,
  getPublicSpecialProduct,
} from '../controllers/client.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/products', getPublicProducts);
router.get('/products/:id', getPublicProduct);
router.get('/categories', getPublicCategories);
router.get('/categories/:id', getPublicCategory);
router.get('/special-products', getPublicSpecialProducts);
router.get('/special-products/:id', getPublicSpecialProduct);

export default router;

