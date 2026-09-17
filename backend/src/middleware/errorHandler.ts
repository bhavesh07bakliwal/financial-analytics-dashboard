import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiErrorBody } from '../types';
import { env } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const body: ApiErrorBody = {
      success: false,
      message: err.message,
      error: { code: err.code, details: err.details },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown/unexpected error - never leak internals in production.
  if (!env.isProduction) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const body: ApiErrorBody = {
    success: false,
    message: 'An unexpected error occurred',
    error: { code: 'INTERNAL_ERROR' },
  };
  res.status(500).json(body);
}
