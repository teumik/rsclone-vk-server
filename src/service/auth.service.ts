import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import { IUser } from '../utils/authValidate';
import mailService from './mail.service';
import tokenService from './token.service';
import UserDto from '../utils/userData.dto';
import ApiError from '../utils/apiError';
import Info from '../models/info.model';

dotenv.config();
const { env } = process;
const { SITE_URL } = env;

export interface IUserModel {
  id?: ObjectId;
  email?: string;
  username: string;
  isActivated?: boolean;
  isOnline?: boolean;
}

export interface ILogin {
  email?: string;
  username?: string;
  password: string;
}

class AuthService {
  private prepareData = async (user: IUserModel) => {
    const userData = UserDto.getData(user);
    const tokens = tokenService.generateToken(userData);
    await tokenService.saveToken({ user: userData.id, refreshToken: tokens.refreshToken });
    return { tokens, userData };
  };

  registration = async ({
    email, username, password, firstName, lastName,
  }: IUser) => {
    const findedByEmail = await User.findOne({ email });
    const findedByUsername = await User.findOne({ username });
    if (findedByEmail) {
      throw ApiError.databaseError({
        code: 421,
        type: 'Duplicate',
        message: `User with '${email}' exist`,
      });
    }
    if (findedByUsername) {
      throw ApiError.databaseError({
        code: 421,
        type: 'Duplicate',
        message: `User with '${username}' exist`,
      });
    }
    const activationLink = uuidv4();
    const hashPassword = bcrypt.hashSync(password, 8);
    const info = new Info({
      user: undefined, firstName, lastName, fullName: `${firstName} ${lastName}`,
    });
    const user = await User.create({
      email, username, password: hashPassword, activationLink, info: info.id,
    });
    info.user = user.id;
    await info.save();
    await mailService.sendActivationMail(email, `${SITE_URL}/auth/activate/${activationLink}`);
    const { tokens, userData } = await this.prepareData(user);
    return { ...tokens, userData };
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
    const userData = UserDto.getData(user);
    return userData;
  };

  private findUser = async ({ email, username }: Omit<ILogin, 'password'>) => {
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

  login = async ({ email, username, password }: ILogin) => {
    const user = await this.findUser({ email, username });
    if (!user) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: `User ${email || username} not found`,
      });
    }
    const isPasswordValide = await bcrypt.compare(password, user.password);
    if (!isPasswordValide) {
      throw ApiError.loginError({
        type: 'IncorrectPassword',
        message: `User '${email || username}', has not valid password`,
      });
    }
    await user.populate({
      path: 'info',
      select: 'fullName',
    });
    const { tokens, userData } = await this.prepareData(user);
    return { ...tokens, user };
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
    const tokenData = await tokenService.findRefreshToken(refreshToken);
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
    return { ...tokens, userData };
  };
}

const authService = new AuthService();

export default authService;
