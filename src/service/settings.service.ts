import { env } from 'process';
import dotenv from 'dotenv';
import { Schema } from 'mongoose';
import tokenService from './token.service';
import ApiError from '../utils/apiError';
import Settings from '../models/settings.model';
import User from '../models/user.model';

dotenv.config();

interface ISettings {
  user: Schema.Types.ObjectId;
  theme: 'system' | 'light' | 'dark';
  visibleFields: 'all' | 'birthDate' | 'friends' | 'posts';
}

class SettingsService {
  setSettings = async (refreshToken: string, settings: ISettings) => {
    const payload = await tokenService.validateRefreshToken(refreshToken);
    const tokenData = await tokenService.findRefreshToken(refreshToken);
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
    if (!user.settings) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'Seettings not found',
      });
    }
    const existSettings = await Settings.findByIdAndUpdate({ _id: user.settings }, settings, {
      returnOriginal: false,
    });
    return existSettings;
  };

  getSettings = async (refreshToken: string) => {
    const payload = await tokenService.validateRefreshToken(refreshToken);
    const tokenData = await tokenService.findRefreshToken(refreshToken);
    if (!payload || !tokenData) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'User unauthorized',
      });
    }
    let settings = await Settings.findOne({ user: tokenData.user?.toHexString() });
    if (!settings) {
      const user = await User.findById({ _id: tokenData.user });
      if (!user) {
        throw ApiError.databaseError({
          code: 404,
          type: 'NotFound',
          message: 'User not found',
        });
      }
      settings = await Settings.create({
        user,
      });
      user.settings = settings.id;
      user.save();
    }
    return settings;
  };
}

const settingsService = new SettingsService();

export default settingsService;
