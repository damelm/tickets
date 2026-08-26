import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateIdParam } from '../middleware/validate.js';
import { toggleDepartmentSchema } from '../validators/departments.validators.js';
import { list, toggle } from '../controllers/departments.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', list);
router.patch('/:id/toggle', requireRole('admin'), validateIdParam(), validateBody(toggleDepartmentSchema), toggle);

export default router;
