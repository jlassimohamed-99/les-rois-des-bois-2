import express from 'express';
import {
  clientLogin,
  clientRegister,
  getClientMe,
  updateClientProfile,
  changePassword,
} from '../controllers/clientAuth.controller.js';
import { clientAuth } from '../middleware/clientAuth.middleware.js';

const router = express.Router();

router.post('/login', clientLogin);
router.post('/register', clientRegister);
router.get('/me', clientAuth, getClientMe);
router.put('/profile', clientAuth, updateClientProfile);
router.put('/change-password', clientAuth, changePassword);

export default router;

