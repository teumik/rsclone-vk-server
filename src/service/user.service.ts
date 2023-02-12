import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import { IUser } from '../utils/authValidate';
import mailService from './mail.service';
import tokenService from './token.service';
import userDataDTO from '../utils/userData.dto';
import settings from '../utils/settings';
import ApiError from '../utils/apiError';

dotenv.config();
const { env } = process;
const { SITE_URL } = env;

export interface IUserModel {
  id?: ObjectId;
  email: string;
  username: string;
  roles?: string[];
  isActivated?: boolean;
}

class UserService {
  private prepareData = async (user: IUser) => {
    const userData = userDataDTO(user);
    const tokens = tokenService.generateToken({ ...userData });
    await tokenService.saveToken({ user: userData.id, refreshToken: tokens.refreshToken });
    return { tokens, userData };
  };

  registration = async ({ email, username, password }: IUser) => {
    const findedByEmail = await User.findOne({ email });
    const findedByUsername = await User.findOne({ username });
    const existUser = findedByEmail || findedByUsername;
    if (existUser) {
      throw ApiError.databaseError({
        code: 421,
        type: 'Duplicate',
        message: `User with '${existUser.email ?? existUser.username}' exist`,
      });
    }

    const activationLink = uuidv4();
    const hashPassword = bcrypt.hashSync(password, 8);
    const user = await User.create({
      email, username, password: hashPassword, activationLink,
    });

    await mailService.sendActivationMail(email, `${SITE_URL}/auth/activate/${activationLink}`);

    const { tokens, userData } = await this.prepareData(user);
    return { ...tokens, user: userData };
  };

  activation = async (activationLink: string) => {
    const user = await User.findOne({ activationLink });
    if (!user) {
      throw ApiError.activationError({
        code: 422,
        type: 'BrokenLink',
        message: 'Incorrect activation link',
      });
    }
    user.isActivated = true;
    user.activationLink = undefined;
    await user.save();
    return user;
  };

  login = async ({ email, username, password }: IUser) => {
    const findedByEmail = await User.findOne({ email });
    const findedByUsername = await User.findOne({ username });
    const existUser = findedByEmail || findedByUsername;
    if (!existUser) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: `User ${email || username} not found`,
      });
    }

    if (!existUser.isActivated && !settings.activationDisabled) {
      throw ApiError.loginError({
        code: 400,
        type: 'Unconfirmed',
        message: `User ${email || username} has not confirmed account`,
      });
    }

    const isPasswordValide = await bcrypt.compare(password, existUser.password);
    if (!isPasswordValide) {
      throw ApiError.loginError({
        type: 'IncorrectPassword',
        message: `User '${email || username}', has not valid password`,
      });
    }

    const { tokens, userData } = await this.prepareData(existUser);

    return { ...tokens, user: userData };
  };

  logout = async (refreshToken: string) => {
    const token = await tokenService.removeToken(refreshToken);
    if (token.deletedCount === 0) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'User unauthorized for logout',
      });
    }
    return token;
  };

  refresh = async (refreshToken: string) => {
    if (!refreshToken) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'User unauthorized',
      });
    }
    const payload = await tokenService.validateRefreshToken(refreshToken);
    const tokenData = await tokenService.findToken(refreshToken);
    if (!payload || !tokenData) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'User unauthorized',
      });
    }
    const id = tokenData.user;
    const user = await User.findById({ _id: id });
    if (!user) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
    }
    const { tokens, userData } = await this.prepareData(user);
    return { ...tokens, user: userData };
  };

  getUser = async (refreshToken: string) => {
    if (!refreshToken) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'User unauthorized',
      });
    }
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
    const userData = userDataDTO(user);
    return userData;
  };

  getUsers = async () => {
    const users = await User.find();
    if (!users) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'Users not found',
      });
    }
    const userData = users.map((user) => userDataDTO(user));
    return userData;
  };
}

const userService = new UserService();

export default userService;
