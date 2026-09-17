import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../services/authService';
import { AUTH_COOKIE_NAME, cookieOptions } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { User } from '../models/User';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const { token, user } = await authenticate(email, password);

  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
  res.status(200).json({
    success: true,
    data: { user },
    message: 'Login successful',
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
  res.status(200).json({ success: true, data: null, message: 'Logged out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Not authenticated', 'AUTH_REQUIRED');
  }
  const user = await User.findById(req.user.sub).select('name email');
  if (!user) {
    throw AppError.unauthorized('User no longer exists', 'USER_NOT_FOUND');
  }
  res.status(200).json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email } },
  });
});
