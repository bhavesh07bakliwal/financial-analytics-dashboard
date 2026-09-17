import { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE_NAME, verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { AuthTokenPayload } from '../types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const bearerHeader = req.headers.authorization;
    const bearerToken = bearerHeader?.startsWith('Bearer ') ? bearerHeader.slice(7) : undefined;
    const token = req.cookies?.[AUTH_COOKIE_NAME] ?? bearerToken;

    if (!token) {
      throw AppError.unauthorized('Authentication required', 'AUTH_REQUIRED');
    }

    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(AppError.unauthorized('Session expired or invalid', 'SESSION_EXPIRED'));
  }
}
