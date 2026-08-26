import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery, validateIdParam } from '../middleware/validate.js';
import { listUsersQuerySchema, createUserSchema, updateUserSchema } from '../validators/users.validators.js';
import { list, create, update } from '../controllers/users.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', validateQuery(listUsersQuerySchema), list);
router.post('/', validateBody(createUserSchema), create);
router.patch('/:id', validateIdParam(), validateBody(updateUserSchema), update);

export default router;
