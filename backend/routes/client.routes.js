import express from 'express';
import {
  getPublicProducts,
  getPublicProduct,
  getPublicCategories,
  getPublicCategory,
  getPublicSpecialProducts,
  getPublicSpecialProduct,
  getTopSellingProducts,
  getNewProducts,
} from '../controllers/client.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/products', getPublicProducts);
router.get('/products/:id', getPublicProduct);
router.get('/categories', getPublicCategories);
router.get('/categories/:id', getPublicCategory);
router.get('/special-products', getPublicSpecialProducts);
router.get('/special-products/:id', getPublicSpecialProduct);
router.get('/products/top-selling', getTopSellingProducts);
router.get('/products/new', getNewProducts);

export default router;

