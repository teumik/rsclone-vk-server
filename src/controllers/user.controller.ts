import { env } from 'process';
import {
  NextFunction, Request, Response
} from 'express';
import dotenv from 'dotenv';
import userService from '../service/user.service';

dotenv.config();

class UserController {
  getFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const friends = await userService.getFriends(refreshToken);
      res.json(friends);
    } catch (error) {
      next(error);
    }
  };

  getRequestCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const count = await userService.getRequestCount(refreshToken);
      res.json(count);
    } catch (error) {
      next(error);
    }
  };

  getReciveCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const count = await userService.getReciveCount(refreshToken);
      res.json(count);
    } catch (error) {
      next(error);
    }
  };

  removeFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendId, username } = req.body;
      const { refreshToken } = req.cookies;
      const response = await userService.removeFriends({ friendId, username, refreshToken });
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  addFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendId, username } = req.body;
      const { refreshToken } = req.cookies;
      const { user, friend } = await userService.addFriend({ friendId, username, refreshToken });
      res.json({ user, friend });
    } catch (error) {
      next(error);
    }
  };

  acceptFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendId, username } = req.body;
      const { refreshToken } = req.cookies;
      const friendsData = await userService.acceptFriend({ friendId, username, refreshToken });
      res.json(friendsData);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { id } = req.params;
      const user = await userService.getUser(refreshToken, id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };
}

const userController = new UserController();

export default userController;
