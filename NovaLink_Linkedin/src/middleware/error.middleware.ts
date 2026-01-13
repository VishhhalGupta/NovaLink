import { Request, Response, NextFunction } from 'express';
import { ApiError, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  Logger.error('Error occurred:', err);

  if (err instanceof ApiError) {
    return errorResponse(res, err.message, err.statusCode, err.stack);
  }

  // Default error
  return errorResponse(res, 'Internal Server Error', 500, err.message);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
