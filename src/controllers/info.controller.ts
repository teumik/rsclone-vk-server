import { env } from 'process';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import infoService from '../service/info.service';

dotenv.config();

class InfoController {
  sendInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { userId, username, infoData } = req.body;
      const info = await infoService.sendInfo({
        refreshToken, userId, username, infoData,
      });
      res.json(info);
    } catch (error) {
      next(error);
    }
  };

  getInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const info = await infoService.getInfo(refreshToken);
      res.json(info);
    } catch (error) {
      next(error);
    }
  };
}

const infoController = new InfoController();

export default infoController;
