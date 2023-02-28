import { NextFunction, Request, Response } from 'express';

function loggerMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  // eslint-disable-next-line no-console
  console.error('logger.middleware', err);
  next(err);
}

export default loggerMiddleware;
