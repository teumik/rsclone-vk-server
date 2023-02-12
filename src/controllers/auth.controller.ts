import {
  CookieOptions, NextFunction, Request, Response
} from 'express';
import dotenv from 'dotenv';
import authValidate, { IUser } from '../utils/authValidate';
import userService from '../service/user.service';
import settings from '../utils/settings';

dotenv.config();
const { env } = process;
const { SITE_URL } = env;

class AuthController {
  private activationSwitcher = (req: Request) => {
    const activation = req.header('Activation');
    if (activation) {
      settings.activationDisabled = activation !== 'true';
    }
  };

  private getRefreshOptions = (time: number): CookieOptions => ({
    maxAge: time,
    expires: time ? new Date(Date.now() + time) : new Date(1),
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  });

  private getTokensHeader(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Access-Control-Allow-Credentials': true,
    };
  }

  registration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, username, password }: IUser = req.body;

      const validatorData = authValidate.validate({ email, username, password });
      if (!validatorData.status) {
        res.status(400).json(validatorData);
      }

      const userData = await userService.registration({ email, username, password });
      const refreshOptions = this.getRefreshOptions(1000 * 60 * 60 * 24);

      res.status(201)
        .cookie('refreshToken', userData.refreshToken, refreshOptions)
        .set(this.getTokensHeader(userData.refreshToken))
        .json(userData);
    } catch (error) {
      next(error);
    }
  };

  activation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activationLink = req.params.link;
      const user = await userService.activation(activationLink);
      res.redirect(`${SITE_URL}/auth/user/${user.id}`);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.activationSwitcher(req);

      const { email, username, password } = req.body;
      const userData = await userService.login({ email, username, password });
      const refreshOptions = this.getRefreshOptions(1000 * 60 * 60 * 24);
      res.status(201)
        .cookie('refreshToken', userData.refreshToken, refreshOptions)
        .set(this.getTokensHeader(userData.accessToken))
        .json(userData);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const data = await userService.logout(refreshToken);
      const refreshOptions = this.getRefreshOptions(0);
      res.cookie('refreshToken', '', refreshOptions);
      res.status(200).json({
        status: data.deletedCount === 1,
        type: 'Logout',
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      const refreshOptions = this.getRefreshOptions(1000 * 60 * 60 * 24);
      res.status(201)
        .cookie('refreshToken', userData.refreshToken, refreshOptions)
        .set(this.getTokensHeader(userData.accessToken))
        .json(userData);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const user = await userService.getUser(refreshToken);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };
}

const authController = new AuthController();

export default authController;
