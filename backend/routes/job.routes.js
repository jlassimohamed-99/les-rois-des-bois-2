import express from 'express';
import { getJobs, getJob, retryJob } from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getJobs);
router.get('/:id', protect, getJob);
router.post('/:id/retry', protect, retryJob);

export default router;

