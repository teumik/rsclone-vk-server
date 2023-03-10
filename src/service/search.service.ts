import dotenv from 'dotenv';
import User from '../models/user.model';
import Info from '../models/info.model';
import ApiError from '../utils/apiError';
import tokenService from './token.service';

dotenv.config();

class SearchService {
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
          select: 'avatar fullName hometown -_id',
        },
      });
    const idx = users.map((el) => el.id);
    const infosData = infos.map((el) => el.user);
    const result = [...users, ...infosData.filter((el) => !idx.includes(el?.id))];

    return result;
  };

  private findUserId = async (refreshToken: string) => {
    const tokenData = await tokenService.findRefreshToken(refreshToken);
    if (!tokenData) {
      throw ApiError.loginError({
        code: 404,
        type: 'NotFound',
        message: 'Token not found',
      });
    }
    return tokenData.user;
  };

  searchUsers = async (value: string, refreshToken: string) => {
    if (value === '') return [];
    if (typeof value !== 'string') {
      throw ApiError.searchError({
        type: 'IncorrectType',
        message: 'Query must be string',
      });
    }
    const userId = await this.findUserId(refreshToken);
    const friendsList = await User.findById({ _id: userId })
      .select('friends outgoingRequest pendingRequest')
      .populate({
        path: 'outgoingRequest pendingRequest',
      });
    if (!friendsList) {
      throw ApiError.friendError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
    }
    const users = await this.findUsers(value);
    const usersData = users.map((userData) => {
      if (!userData) return userData;
      if (friendsList.friends.some((el) => el.friendId?.toHexString() === userData?.id)) {
        return { user: userData, friendStatus: 0 };
      }
      const { outgoingRequest } = friendsList;
      if (outgoingRequest.some((el) => JSON.parse(JSON.stringify(el)).recipient === userData?.id)) {
        return { user: userData, friendStatus: 1 };
      }
      const { pendingRequest } = friendsList;
      if (pendingRequest.some((el) => JSON.parse(JSON.stringify(el)).requester === userData?.id)) {
        return { user: userData, friendStatus: 2 };
      }
      return { user: userData };
    });
    return usersData;
  };
}

const searchService = new SearchService();

export default searchService;
