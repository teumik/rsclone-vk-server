import { env } from 'process';
import dotenv from 'dotenv';
import User from '../models/user.model';
import Info from '../models/info.model';
import { IUser } from '../utils/authValidate';
import ApiError from '../utils/apiError';

dotenv.config();

interface ISearch {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  hometown: string;
  school: string;
  university: string;
  birthDate: number;
}

class SearchService {
  private searchByInfo = (info: Partial<ISearch>, value: string) => {
    const checkFields = {
      id: info.id,
      firstName: info.firstName,
      lastName: info.lastName,
      fullName: info.fullName,
      hometown: info.hometown,
      school: info.school,
      university: info.university,
      birthDate: info.birthDate,
    };
    return Object.values(checkFields).some(((field) => {
      if (!field) return false;
      return field.toString().includes(value);
    }));
  };

  private searchByUser = (user: Partial<IUser>, value: string) => {
    const checkFields = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return Object.values(checkFields).some(((field) => {
      if (!field) return false;
      return field.toString().includes(value);
    }));
  };

  private findUsers = async (value: string) => {
    const users = await User.find().select('username isOnline info').populate('info');
    const searchResult = users.map(async (user) => {
      if (this.searchByUser(user, value)) return user;
      if (!user.info) return null;
      const info = await Info.findOne({ _id: user.info.id });
      if (!info) return null;
      if (this.searchByInfo(info, value)) return user;
      return null;
    });
    const resolvedResult = await Promise.all(searchResult);
    const result = resolvedResult.filter((user) => user);
    return result;
  };

  searchUsers = async (value: string) => {
    if (value === '') return [];
    if (typeof value !== 'string') {
      throw ApiError.searchError({
        type: 'IncorrectType',
        message: 'Query must be string',
      });
    }
    const users = await this.findUsers(value);
    return users;
  };
}

const searchService = new SearchService();

export default searchService;
