import { Router } from 'express';
import { login, logout, me } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/authValidators';
import { requireAuth } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/login', loginRateLimiter, validate(loginSchema, 'body'), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
