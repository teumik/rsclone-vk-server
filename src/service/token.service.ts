import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';
import dotenv from 'dotenv';
import Token from '../models/token.model';
import { IUserModel } from './user.service';
import ApiError from '../utils/apiError';

dotenv.config();
const { env } = process;
const { SECRET_ACCESS, SECRET_REFRESH } = env;

export interface ISaveToken {
  user?: ObjectId;
  refreshToken: string;
}

class TokenService {
  generateToken = (payload: IUserModel) => {
    if (!SECRET_ACCESS || !SECRET_REFRESH) {
      throw ApiError.serverError({ message: 'Server not found secret keys' });
    }
    const accessToken = jwt.sign(payload, SECRET_ACCESS, { expiresIn: '40s' });
    const refreshToken = jwt.sign(payload, SECRET_REFRESH, { expiresIn: '60s' });
    return {
      accessToken,
      refreshToken,
    };
  };

  validateAccessToken = async (token: string) => {
    if (!SECRET_ACCESS) {
      throw ApiError.serverError({ message: 'Server not found secret keys' });
    }
    try {
      const payload = jwt.verify(token, SECRET_ACCESS);
      return payload;
    } catch (error) {
      return null;
    }
  };

  validateRefreshToken = async (token: string) => {
    if (!SECRET_REFRESH) {
      throw ApiError.serverError({ message: 'Server not found secret keys' });
    }
    try {
      const payload = jwt.verify(token, SECRET_REFRESH);
      return payload;
    } catch (error) {
      return null;
    }
  };

  saveToken = async ({ user, refreshToken }: ISaveToken) => {
    const tokenData = await Token.findOne({ user });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await Token.create({ user, refreshToken });
    return token;
  };

  removeToken = async (refreshToken: string) => {
    const tokenData = await Token.deleteOne({ refreshToken });
    return tokenData;
  };

  findToken = async (refreshToken: string) => {
    const tokenData = await Token.findOne({ refreshToken });
    return tokenData;
  };
}

const tokenService = new TokenService();

export default tokenService;
