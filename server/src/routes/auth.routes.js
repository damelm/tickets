import { Router } from 'express';
import { login, googleLogin } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, googleLoginSchema } from '../validators/auth.validators.js';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/google', validateBody(googleLoginSchema), googleLogin);

export default router;
