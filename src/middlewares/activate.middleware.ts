import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/apiError';
import User from '../models/user.model';
import { ILogin } from '../service/auth.service';

const activateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findUser = async ({ email, username }: Omit<ILogin, 'password'>) => {
      let user;
      if (username) {
        user = await User.findOne({ username });
        if (user) return user;
      }
      if (email) {
        user = await User.findOne({ email });
        if (user) return user;
      }
      if (!user) {
        user = await User.findOne({ email: username || email });
      }
      return user;
    };
    const { email, username } = req.body;
    if (email || username) {
      const user = await findUser({ email, username });
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
    next();
  } catch (error) {
    next(error);
  }
};

export default activateMiddleware;
