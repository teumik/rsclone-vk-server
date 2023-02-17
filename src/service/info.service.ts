import { env } from 'process';
import dotenv from 'dotenv';
import { Schema } from 'mongoose';
import tokenService from './token.service';
import User from '../models/user.model';
import Info from '../models/info.model';

dotenv.config();

interface IData {
  user: Schema.Types.ObjectId;
  icon: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  familyStatus: string;
  hometown: string;
  school: string;
  university: string;
  interests: string;
  lifePosition: string;
  favoriteMusic: string;
  favoriteBooks: string;
  favoriteFilms: string;
  birthDate: number;
}

type TData = Partial<IData>;

interface IUserData {
  userId: Schema.Types.ObjectId;
  username: string;
}

interface IUserAuthData extends IUserData {
  refreshToken: string;
}

interface IInfoData extends IUserAuthData {
  infoData: TData;
}

type TField = [a: string, b: string | number | Schema.Types.ObjectId];

class InfoService {
  private isExistProp = (prop: string) => {
    const reference = {
      icon: '',
      firstName: '',
      lastName: '',
      status: '',
      familyStatus: '',
      hometown: '',
      school: '',
      university: '',
      interests: '',
      lifePosition: '',
      favoriteMusic: '',
      favoriteBooks: '',
      favoriteFilms: '',
      birthDate: '',
    };
    return prop in reference;
  };

  private fieldValidate = (field: TField) => {
    const [key, value] = field;
    const removePair = [key, ''];

    if (!this.isExistProp(key)) return removePair;
    if (value === null || value === '') return removePair;
    if (key === 'birthDate' && typeof value === 'number') {
      return value > Date.now() ? removePair : field;
    }
    return field;
  };

  private removeFalseFields = (infoData: TData) => Object.fromEntries(
    Object.entries(infoData)
      .map((field) => this.fieldValidate(field))
  );

  private findByToken = async (refreshToken: string) => {
    const tokenData = await tokenService.findRefreshToken(refreshToken);
    if (!tokenData) {
      throw new Error('Tokent not found "findByToken"');
    }
    const user = await User.findById({ _id: tokenData.user });
    if (!user) {
      throw new Error('User not found "findByToken"');
    }
    return user;
  };

  private findUser = async ({ userId, username, refreshToken }: IUserAuthData) => {
    if (userId) {
      const userById = await User.findById({ _id: userId });
      return userById;
    }
    if (username) {
      const userByUsername = await User.findOne({ username });
      return userByUsername;
    }
    if (refreshToken) {
      const userByToken = await this.findByToken(refreshToken);
      return userByToken;
    }
    return null;
  };

  sendInfo = async ({
    refreshToken, userId, username, infoData,
  }: IInfoData) => {
    const user = await this.findUser({ refreshToken, userId, username });
    const validInfoData = this.removeFalseFields(infoData);
    if (!user) {
      throw new Error('User not found "sendInfo"');
    }
    const { info } = await user.populate('info');
    if (!info) {
      throw new Error('Info field not found "sendInfo"');
    }
    const infoById = await Info.findOne({ _id: info.id });
    if (!infoById) {
      throw new Error('Info document not found "sendInfo"');
    }
    console.log(infoData);

    Object.assign(infoById, {
      ...validInfoData,
      fullName: `${validInfoData.firstName} ${validInfoData.lastName}`,
    });
    await infoById.save();
    return infoById;
  };

  getInfo = async (refreshToken: string) => {
    const user = await this.findByToken(refreshToken);
    const { info } = await user.populate('info');
    return info;
  };
}

const infoService = new InfoService();

export default infoService;
