import { env } from 'process';
import dotenv from 'dotenv';
import User from '../models/user.model';
import Info from '../models/info.model';
// import { IUser } from '../utils/authValidate';
import ApiError from '../utils/apiError';

dotenv.config();

// interface ISearch {
//   id: string;
//   firstName: string;
//   lastName: string;
//   fullName: string;
//   hometown: string;
//   school: string;
//   university: string;
//   birthDate: string;
// }

class SearchService {
  // private searchByInfo = (info: Partial<ISearch>, value: RegExp) => {
  //   const checkFields = {
  //     id: info.id,
  //     firstName: info.firstName,
  //     lastName: info.lastName,
  //     fullName: info.fullName,
  //     hometown: info.hometown,
  //     school: info.school,
  //     university: info.university,
  //     birthDate: info.birthDate,
  //   };
  //   return Object.values(checkFields).some(((field) => value.test(field || '')));
  // };

  // private searchByUser = (user: Partial<IUser>, value: RegExp) => {
  //   const checkFields = {
  //     id: user.id,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //   };
  //   return Object.values(checkFields).some(((field) => value.test(field || '')));
  // };

  private findUsers = async (value: string) => {
    const regex = new RegExp(value, 'i');
    const users = await User
      .find({
        username: regex,
      })
      .select('username isOnline info')
      .populate({
        path: 'info',
        select: 'avatar fullName hometown -_id',
      });
    const infos = await Info.find({
      $or: [
        { fullName: { $regex: regex } },
        { hometown: { $regex: regex } },
      ],
    })
      .select('user -_id')
      .populate({
        path: 'user',
        select: 'username isOnline info',
        populate: {
          path: 'info',
          select: 'avatar fullName -_id',
        },
      });
    const idx = users.map((el) => el.id);
    const infosData = infos.map((el) => el.user);
    const result = [...users, ...infosData.filter((el) => !idx.includes(el?.id))];

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
