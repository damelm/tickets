import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settings.validators.js';
import { get, update } from '../controllers/settings.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', get);
router.patch('/', validateBody(updateSettingsSchema), update);

export default router;
