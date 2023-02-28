import { Request, Response } from 'express';
import ApiError from '../utils/apiError';

function errorMiddleware(err: Error, req: Request, res: Response) {
  if (err instanceof ApiError) {
    res.status(err.code).json({
      ...err,
      message: err.message,
      handled: 'error.middleware',
    });
    return;
  }
  res.json(err);
}

export default errorMiddleware;
