import { Types } from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import tokenService from './token.service';
import Friends from '../models/friends.model';
import ApiError from '../utils/apiError';
import { IUserModel } from './auth.service';

dotenv.config();

interface IUserData {
  friendId: string;
  username: string;
}

interface IUserAuthData extends IUserData {
  refreshToken: string;
}

interface IFriendsValidate {
  friendId: Types.ObjectId;
  userId: Types.ObjectId;
}

class UserService {
  private findFriend = async ({ friendId, username }: Partial<IUserData>) => {
    if (friendId) {
      const friendById = await User.findById({ _id: friendId });
      return friendById;
    }
    if (username) {
      const friendByUsername = await User.findOne({ username });
      return friendByUsername;
    }
    return null;
  };

  private findCurrentUser = async (refreshToken: string) => {
    const payload = await tokenService.validateRefreshToken(refreshToken);
    const tokenData = await tokenService.findRefreshToken(refreshToken);
    if (!payload) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'User unauthorized',
      });
    }
    if (!tokenData) {
      throw ApiError.loginError({
        code: 404,
        type: 'NotFound',
        message: 'Token not found',
      });
    }
    const user = await User.findById({ _id: tokenData.user });
    if (!user) {
      throw ApiError.friendError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
    }
    return user;
  };

  private findUsers = async ({ friendId, username, refreshToken }: IUserAuthData) => {
    const user = await this.findCurrentUser(refreshToken);
    const friend = await this.findFriend({ friendId, username });
    if (!user) {
      throw ApiError.friendError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
    }
    if (!friend) {
      throw ApiError.friendError({
        code: 404,
        type: 'NotFound',
        message: 'Friend not found',
      });
    }
    if (user.id === friend.id) {
      throw ApiError.friendError({
        type: 'SelfAdd',
        message: 'Do not play with yourself',
      });
    }
    return { user, friend };
  };

  private hasExistRequest = async ({ userId, friendId }: IFriendsValidate) => {
    const existFriends = await Friends.findOne({
      requester: userId, recipient: friendId,
    }) || await Friends.findOne({
      recipient: userId, requester: friendId,
    });
    return existFriends;
  };

  getFriends = async (refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    await user.populate({
      path: 'friends',
      select: 'friendId',
      populate: {
        path: 'friendId',
        select: 'username',
        populate: {
          path: 'info',
          select: 'fullName avatar -_id',
        },
      },
    });
    return user.friends.map((el) => el.friendId);
  };

  getRequestCount = async (refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    await user.populate({
      path: 'pendingRequest',
      select: 'requester status -_id',
      populate: {
        path: 'requester',
        select: 'username info',
        populate: {
          path: 'info',
          select: 'fullName avatar -_id',
        },
      },
    });
    return { id: user.id, incomming: user.pendingRequest };
  };

  getReciveCount = async (refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    await user.populate({
      path: 'outgoingRequest',
      select: 'recipient status -_id',
      populate: {
        path: 'recipient',
        select: 'username info',
        populate: {
          path: 'info',
          select: 'fullName avatar -_id',
        },
      },
    });
    return { id: user.id, outcomming: user.outgoingRequest };
  };

  removeFriends = async ({ friendId, username, refreshToken }: IUserAuthData) => {
    const { user, friend } = await this.findUsers({ friendId, username, refreshToken });
    const existRequest = await this.hasExistRequest({ userId: user.id, friendId: friend.id });
    if (!existRequest) {
      throw ApiError.friendError({
        code: 404,
        type: 'NotFound',
        message: 'Request does not exist',
      });
    }
    user.outgoingRequest = user.outgoingRequest.filter((el) => (
      el.toHexString() !== existRequest.id
    ));
    user.pendingRequest = user.pendingRequest.filter((el) => (
      el.toHexString() !== existRequest.id
    ));
    friend.outgoingRequest = friend.outgoingRequest.filter((el) => (
      el.toHexString() !== existRequest.id
    ));
    friend.pendingRequest = friend.pendingRequest.filter((el) => (
      el.toHexString() !== existRequest.id
    ));
    user.pendingRequest.push(existRequest.id);
    friend.outgoingRequest.push(existRequest.id);
    user.friends = user.friends.filter((el) => el.friendId?.toHexString() !== friendId);
    friend.friends = friend.friends.filter((el) => el.friendId?.toHexString() !== friendId);
    await existRequest.remove();
    await friend.save();
    await user.save();
    return { status: true, type: 'Remove friend request' };
  };

  addFriend = async ({ friendId, username, refreshToken }: IUserAuthData) => {
    const { user, friend } = await this.findUsers({ friendId, username, refreshToken });
    const existRequest = await this.hasExistRequest({ userId: user.id, friendId: friend.id });
    if (existRequest) {
      throw ApiError.friendError({
        code: 421,
        type: 'Duplicate',
        message: 'Request exist',
      });
    }
    const friendData = await Friends.create({
      requester: user.id,
      recipient: friend.id,
    });
    user.outgoingRequest.push(friendData.id);
    friend.pendingRequest.push(friendData.id);
    await user.save();
    await friend.save();
    return { user, friend };
  };

  acceptFriend = async ({ friendId, username, refreshToken }: IUserAuthData) => {
    const { user, friend } = await this.findUsers({ friendId, username, refreshToken });
    const existRequest = await this.hasExistRequest({ userId: user.id, friendId: friend.id });
    if (!existRequest) {
      throw ApiError.friendError({
        code: 404,
        type: 'NotFound',
        message: 'Request does not exist',
      });
    }
    const existFriends = user.friends.find((el) => el.friendId?.toString() === friend.id);
    if (existFriends) {
      throw ApiError.friendError({
        code: 421,
        type: 'Duplicate',
        message: 'Friend exist in user',
      });
    }
    existRequest.status = true;
    user.pendingRequest = user.pendingRequest.filter((el) => el.id.toString('hex') !== existRequest.id);
    friend.outgoingRequest = friend.outgoingRequest.filter((el) => el.id.toString('hex') !== existRequest.id);
    user.friends.push({
      friendDocument: existRequest.id,
      friendId: existRequest.requester,
    });
    friend.friends.push({
      friendDocument: existRequest.id,
      friendId: existRequest.recipient,
    });
    await friend.save();
    await user.save();
    await existRequest.save();
    return existRequest;
  };

  private getFriendStatus = async (user: IUserModel, id: string) => {
    const friendsList = await User.findById({ _id: id })
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
    if (friendsList.friends.some((el) => el.friendId?.toHexString() === user.id)) {
      return { user, friendStatus: 0 };
    }
    const { outgoingRequest } = friendsList;
    if (outgoingRequest.some((el) => (
      JSON.parse(JSON.stringify(el)).recipient === user.id
    ))) {
      return { user, friendStatus: 1 };
    }
    const { pendingRequest } = friendsList;
    if (pendingRequest.some((el) => (
      JSON.parse(JSON.stringify(el)).requester === user.id
    ))) {
      return { user, friendStatus: 2 };
    }
    return { user };
  };

  getUser = async (refreshToken: string, id: string) => {
    const payload = await tokenService.validateRefreshToken(refreshToken);
    const tokenData = await tokenService.findRefreshToken(refreshToken);
    if (!payload || !tokenData) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'User unauthorized',
      });
    }
    const userData = tokenData.user;
    if (!userData) {
      throw ApiError.loginError({
        code: 404,
        type: 'NotFound',
        message: 'Token not found',
      });
    }
    if (id !== userData.toHexString()) {
      const friendShip = await Friends.findOne({
        $or: [
          { requester: userData, recipient: id },
          { requester: id, recipient: userData },
        ],
      });
      if (!friendShip || !friendShip.status) {
        const friendData = await User.findById({ _id: id })
          .select('username isOnline info friends')
          .populate({
            path: 'info',
            select: '-__v -_id',
          })
          .populate({
            path: 'friends.friendId',
            select: 'info username isOnline',
            populate: {
              path: 'info',
              select: 'fullName -_id',
            },
          });
        if (!friendData) {
          throw ApiError.databaseError({
            code: 404,
            type: 'NotFound',
            message: 'Other user not found',
          });
        }
        const data = await this.getFriendStatus(friendData, userData.toHexString());
        return data;
      }
    }
    const user = await User.findById({ _id: id })
      .select('id username isOnline info posts friends')
      .populate({
        path: 'posts',
        select: '-__v',
      })
      .populate({
        path: 'friends.friendId',
        select: 'info username isOnline',
        populate: {
          path: 'info',
          select: 'fullName -_id',
        },
      })
      .populate({
        path: 'info',
        select: '-fullName -__v -_id',
      });
    if (!user) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
    }
    const data = await this.getFriendStatus(user, userData.toHexString());
    return data;
  };

  getAllUsers = async () => {
    const users = await User.find({})
      .populate('info')
      .select('id username isOnline info');

    if (!users) {
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'Users not found',
      });
    }
    return users;
  };
}

const userService = new UserService();

export default userService;
