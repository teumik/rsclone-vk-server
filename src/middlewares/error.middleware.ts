/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/apiError';

function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
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
