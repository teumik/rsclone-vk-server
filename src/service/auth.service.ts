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
  email: string;
  username: string;
  roles?: string[];
  isActivated?: boolean;
}

export interface ILogin {
  email?: string;
  username?: string;
  password: string;
}

class AuthService {
  private prepareData = async (user: IUserModel) => {
    const userData = UserDto.getData(user);
    const tokens = tokenService.generateToken({ ...userData });
    await tokenService.saveToken({ user: userData.id, refreshToken: tokens.refreshToken });
    return { tokens, userData };
  };

  registration = async ({
    email, username, password, firstName, lastName,
  }: IUser) => {
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
    const info = new Info({ user: undefined, firstName, lastName });
    const user = await User.create({
      email, username, password: hashPassword, activationLink, info,
    });
    info.user = user.id;
    await info.save();
    await mailService.sendActivationMail(email, `${SITE_URL}/auth/activate/${activationLink}`);
    const { tokens, userData } = await this.prepareData(user);
    return { ...tokens, user };
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

  login = async ({ email, username, password }: ILogin) => {
    const findedByEmail = await User.findOne({ email });
    const findedByUsername = await User.findOne({ username });
    const user = findedByEmail || findedByUsername;
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
    return { ...tokens, user };
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
    const userDataTransfer = UserDto.getData(user);
    const userData = await user.populate('info');
    return userData;
  };

  getAllUsers = async () => {
    const users = await User.find();
    if (!users) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'Users not found',
      });
    }
    const userDataTransfer = users.map((user) => UserDto.getData(user));
    return users;
  };
}

const authService = new AuthService();

export default authService;