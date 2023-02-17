import { NextFunction, Request, Response } from 'express';
import tokenService from '../service/token.service';
import ApiError from '../utils/apiError';
import User from '../models/user.model';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const error = (message: string) => ApiError.loginError({
      type: 'Unauthorized',
      message,
    });

    const { email, username } = req.body;
    if (email || username) {
      const findedByEmail = await User.findOne({ email });
      const findedByUsername = await User.findOne({ username });
      const user = findedByEmail || findedByUsername;
      if (!user) {
        throw ApiError.databaseError({
          code: 404,
          type: 'NotFound',
          message: `User ${email || username} not found`,
        });
      }
      if (!user.isActivated) {
        throw ApiError.loginError({
          code: 400,
          type: 'Unconfirmed',
          message: `User ${email || username} has not confirmed account`,
        });
      }
      next();
      return;
    }

    const { authorization } = req.headers;
    const accessToken = authorization?.split(' ')[1];
    if (!accessToken) {
      throw error('Access token not provided');
    }
    if (accessToken !== 'undefined') {
      const payload = await tokenService.validateAccessToken(accessToken);
      if (!payload) {
        throw error('Access token not valid');
      }
      if (typeof payload === 'string') {
        throw error('Access token not valid');
      }
      const user = await User.findById({ _id: payload.id });
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
      next();
      return;
    }

    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const payload = await tokenService.validateRefreshToken(refreshToken);
      const tokenData = await tokenService.findRefreshToken(refreshToken);
      if (!tokenData) {
        throw error('Refresh token does not exist');
      }
      if (!payload) {
        throw error('Refresh token not valid');
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
      next();
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
