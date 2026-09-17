import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      (req as unknown as Record<RequestPart, unknown>)[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          AppError.badRequest('Validation failed', 'VALIDATION_ERROR', err.flatten().fieldErrors)
        );
        return;
      }
      next(err);
    }
  };
}
