import dotenv from 'dotenv';
import { Schema } from 'mongoose';
import tokenService from './token.service';
import User from '../models/user.model';
import Info from '../models/info.model';
import ApiError from '../utils/apiError';

dotenv.config();

interface IData {
  user: string;
  avatar: string;
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
  birthDate: string;
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

type TField = [a: string, b: string];

class InfoService {
  private isExistProp = (prop: string) => {
    const reference = {
      avatar: '',
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

  private imageChecker = (image: string) => {
    const base64 = image.toString().split(',')[1];
    const stats = image.toString().split(',')[0].split(';');
    const encode = stats[1];
    const type = stats[0].split(':')[1];
    const fileType = type.split('/')[0];
    const ext = type.split('/')[1];
    const maxSize = 1024 * 5120;
    if (encode !== 'base64') {
      throw ApiError.imageError({
        type: 'NotBase64',
        message: 'Encode not base64',
      });
    }
    if (fileType !== 'image') {
      throw ApiError.imageError({
        type: 'BadType',
        message: 'File is not image',
      });
    }
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!validExtensions.includes(ext)) {
      throw ApiError.imageError({
        type: 'BadExt',
        message: `Allowed extension: ${validExtensions.join(', ')}`,
      });
    }
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.byteLength > maxSize) {
      throw ApiError.imageError({
        code: 413,
        type: 'TooLarge',
        message: `Size is equal ${buffer.byteLength}`,
      });
    }
  };

  private checkLength = (value: string, length: number) => {
    const isLengthLess = (n: number) => value.length <= n;
    return isLengthLess(length);
  };

  private fieldValidate = (field: TField) => {
    const [key, value] = field;
    const removePair = [key, ''];
    if (!this.isExistProp(key)) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'Field not found',
      });
    }
    if (value === null || value === '') return removePair;
    const isKey = (k: string) => key === k;
    if (isKey('avatar')) this.imageChecker(value);
    if (isKey('firstName')) this.checkLength(value, 20);
    if (isKey('lastName')) this.checkLength(value, 20);
    if (isKey('status')) this.checkLength(value, 140);
    if (isKey('hometown')) this.checkLength(value, 30);
    if (isKey('university')) this.checkLength(value, 50);
    if (isKey('interests')) this.checkLength(value, 140);
    if (isKey('lifePosition')) this.checkLength(value, 140);
    if (isKey('favoriteMusic')) this.checkLength(value, 140);
    if (isKey('favoriteBooks')) this.checkLength(value, 140);
    if (isKey('favoriteFilms')) this.checkLength(value, 140);
    return field;
  };

  private removeFalseFields = (infoData: TData) => Object.fromEntries(
    Object.entries(infoData)
      .map((field) => this.fieldValidate(field))
  );

  private findByToken = async (refreshToken: string) => {
    const tokenData = await tokenService.findRefreshToken(refreshToken);
    if (!tokenData) {
      throw ApiError.loginError({
        code: 404,
        type: 'NotFound',
        message: 'Token not found',
      });
    }
    const user = await User.findById({ _id: tokenData.user });
    if (!user) {
      throw ApiError.loginError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
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
      throw ApiError.loginError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
    }
    const { info } = await user.populate('info');
    if (!info) {
      throw ApiError.infoError({
        code: 404,
        type: 'NotFound',
        message: 'Info field not found',
      });
    }
    const infoById = await Info.findOne({ _id: info.id });
    if (!infoById) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'Info not found',
      });
    }

    Object.assign(infoById, {
      ...validInfoData,
      fullName: `${validInfoData.firstName} ${validInfoData.lastName}`,
    });
    await infoById.save();
    return infoById;
  };

  getInfo = async (refreshToken: string) => {
    const user = await this.findByToken(refreshToken);
    const infoData = await Info.findOne({ user: user.id }).select('-__v -fullName -_id');
    return infoData;
  };
}

const infoService = new InfoService();

export default infoService;
