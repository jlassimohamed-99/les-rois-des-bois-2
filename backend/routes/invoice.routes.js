import express from 'express';
import { getInvoices, getInvoice, createInvoice, recordPayment, getPayments, generatePDF, sendEmail } from '../controllers/invoice.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoice);
router.get('/:id/pdf', protect, generatePDF);
router.post('/', protect, createInvoice);
router.post('/:id/payments', protect, recordPayment);
router.post('/:id/send-email', protect, sendEmail);
router.get('/:id/payments', protect, getPayments);

export default router;

