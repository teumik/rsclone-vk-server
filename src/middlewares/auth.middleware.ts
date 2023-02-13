import { NextFunction, Request, Response } from 'express';
import tokenService from '../service/token.service';
import ApiError from '../utils/apiError';
import User from '../models/user.model';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const error = ApiError.loginError({
      type: 'Unauthorized',
      message: 'Token does not exist, user unauthorized',
    });

    const { authorization } = req.headers;
    const { refreshToken } = req.cookies;

    if (!authorization && !refreshToken) {
      throw error;
    }

    if (authorization) {
      const accessToken = authorization?.split(' ')[1];
      if (!accessToken) {
        throw error;
      }
      const userData = await tokenService.validateAccessToken(accessToken);
      if (!userData) {
        throw error;
      }
      next();
      return;
    }

    if (refreshToken) {
      const payload = await tokenService.validateRefreshToken(refreshToken);
      const tokenData = await tokenService.findToken(refreshToken);
      if (!payload || !tokenData) {
        throw error;
      }
      const user = await User.findById({ _id: tokenData.user });
      if (!user) {
        throw ApiError.databaseError({
          code: 404,
          type: 'NotFound',
          message: 'User not found',
        });
      }
      if (!user.isActivated) {
        throw ApiError.loginError({
          code: 400,
          type: 'Unconfirmed',
          message: 'User has not confirmed account',
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
