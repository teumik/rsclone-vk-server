import { env } from 'process';
import {
  CookieOptions, NextFunction, Request, Response
} from 'express';
import dotenv from 'dotenv';
import authValidate, { IUser } from '../utils/authValidate';
import authService from '../service/auth.service';

dotenv.config();
const { SITE_URL } = env;

class AuthController {
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
      const {
        email, username, password, firstName, lastName,
      }: IUser = req.body;
      const validatorData = authValidate.validate({
        email, username, password, firstName, lastName,
      });
      if (!validatorData.status) {
        res.status(400).json(validatorData);
        return;
      }
      const userData = await authService.registration({
        email, username, password, firstName, lastName,
      });
      const refreshOptions = this.getRefreshOptions(1000 * 60 * 60 * 24);
      res.status(201)
        .cookie('refreshToken', userData.refreshToken, refreshOptions)
        .set(this.getTokensHeader(userData.accessToken))
        .json(userData);
    } catch (error) {
      next(error);
    }
  };

  activation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { link } = req.params;
      const user = await authService.activation(link);
      res.redirect(`${SITE_URL}/auth/user/${user.id}`);
      res.json('Activation complete');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, username, password } = req.body;
      const userData = await authService.login({ email, username, password });
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
      const data = await authService.logout(refreshToken);
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
      const userData = await authService.refresh(refreshToken);
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
      const user = await authService.getUser(refreshToken);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await authService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };
}

const authController = new AuthController();

export default authController;
