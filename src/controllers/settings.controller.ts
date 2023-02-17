import { env } from 'process';
import {
  NextFunction, Request, Response
} from 'express';
import dotenv from 'dotenv';
import settingsService from '../service/settings.service';

dotenv.config();

class SettingsController {
  setSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const settings = req.body;
      const settingsData = await settingsService.setSettings(refreshToken, settings);
      res.json(settingsData);
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const settingsData = await settingsService.getSettings(refreshToken);
      res.json(settingsData);
    } catch (error) {
      next(error);
    }
  };
}

const settingsController = new SettingsController();

export default settingsController;
