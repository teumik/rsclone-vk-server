import { NextFunction, Request, Response } from 'express';
import tokenService from '../service/token.service';
import ApiError from '../utils/apiError';
import User from '../models/user.model';

const activateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const payload = await tokenService.validateRefreshToken(refreshToken);
      const tokenData = await tokenService.findToken(refreshToken);
      if (!payload || !tokenData) {
        throw ApiError.loginError({
          type: 'Unauthorized',
          message: 'User unauthorized',
        });
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

export default activateMiddleware;
