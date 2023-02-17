import { NextFunction, Request, Response } from 'express';

function loggerMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('logger.middleware', err);
  next(err);
}

export default loggerMiddleware;
