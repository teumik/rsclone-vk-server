import { NextFunction, Request, Response } from 'express';
import tokenService from '../service/token.service';
import ApiError from '../utils/apiError';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const error = ApiError.loginError({
      type: 'Unauthorize',
      message: 'Token does not exist, user unauthorized',
    });

    const { authorization } = req.headers;
    if (!authorization) {
      throw error;
    }

    const accessToken = authorization?.split(' ')[1];
    if (!accessToken) {
      throw error;
    }

    const userData = await tokenService.validateAccessToken(accessToken);
    if (!userData) {
      throw error;
    }

    req.body.user = userData;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
