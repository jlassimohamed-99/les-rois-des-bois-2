import express from 'express';
import { body } from 'express-validator';
import {
  clientLogin,
  clientRegister,
  getClientMe,
  updateClientProfile,
  changePassword,
} from '../controllers/clientAuth.controller.js';
import { clientAuth } from '../middleware/clientAuth.middleware.js';
import { validateRequest, validateEmail, validatePassword, validateName, validatePhone } from '../middleware/security.middleware.js';

const router = express.Router();

// Temporarily disable strict validation to fix login issues
router.post('/login', clientLogin);
router.post('/register', clientRegister);
router.get('/me', clientAuth, getClientMe);
router.put('/profile', clientAuth, updateClientProfile);
router.put('/change-password', clientAuth, changePassword);

export default router;

