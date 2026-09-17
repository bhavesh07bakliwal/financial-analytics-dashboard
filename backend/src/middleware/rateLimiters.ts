import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(AppError.tooMany('Too many login attempts. Please try again later.', 'LOGIN_RATE_LIMITED'));
  },
});
