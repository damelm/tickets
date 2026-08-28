import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { get } from '../controllers/stats.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', get);

export default router;
