import { env } from 'process';
import { Schema } from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import tokenService from './token.service';
import Friends from '../models/friends.model';

dotenv.config();

interface IUserData {
  friendId: Schema.Types.ObjectId;
  username: string;
}

interface IUserAuthData extends IUserData {
  refreshToken: string;
}

interface IFriendsValidate {
  friendId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
}

class UserService {
  private findFriend = async ({ friendId, username }: IUserData) => {
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
    const tokenData = await tokenService.findToken(refreshToken);
    if (!tokenData) {
      throw new Error('Tokent not found "findUsers"');
    }
    const user = await User.findById({ _id: tokenData.user });
    if (!user) {
      throw new Error('User not found "findUsers"');
    }
    return user;
  };

  private findUsers = async ({ friendId, username, refreshToken }: IUserAuthData) => {
    const user = await this.findCurrentUser(refreshToken);
    const friend = await this.findFriend({ friendId, username });
    if (!friend) {
      throw new Error('Friend not found "findUsers"');
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
    const { friends } = await this.findCurrentUser(refreshToken);
    const promiseData = friends.map((friend) => User.findById({ _id: friend.friendId }));
    const friendsData = await Promise.all(promiseData);
    return friendsData;
  };

  getRequestCount = async (refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    return { count: user.pendingRequest.length };
  };

  getReciveCount = async (refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    return { count: user.outgoingRequest.length };
  };

  addFriend = async ({ friendId, username, refreshToken }: IUserAuthData) => {
    const { user, friend } = await this.findUsers({ friendId, username, refreshToken });
    const existRequest = this.hasExistRequest({ userId: user.id, friendId: friend.id });
    if (!existRequest) {
      throw new Error('Request exist "addFriend"');
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
      throw new Error('Request does not exist "acceptFriend"');
    }
    const existFriends = user.friends.find((el) => el.friendId?.toString() === friend.id);
    if (existFriends) {
      throw new Error('Friend exist in user "acceptFriend"');
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
}

const userService = new UserService();

export default userService;
