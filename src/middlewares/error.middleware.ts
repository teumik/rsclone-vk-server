import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/apiError';

function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.code).json({
      ...err,
      handled: 'error.middleware',
    });
    return next();
  }
  if (err instanceof Error) {
    res.status(418).json({
      ...err,
      message: `Not handeled in custom Error: ${err.message}`,
      handled: 'error.middleware',
    });
    return next();
  }
  return next();
}

export default errorMiddleware;
