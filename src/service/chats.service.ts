import { env } from 'process';
import dotenv from 'dotenv';
import ApiError from '../utils/apiError';
import tokenService from './token.service';
import User from '../models/user.model';
import Chat from '../models/chat.model';
import Message from '../models/message.model';

dotenv.config();

interface BaseChat {
  members: string[];
  friendId: string;
  message: string;
  files: string[];
  role: 'private' | 'group';
  refreshToken: 'string';
  title?: string;
}

class ChatsService {
  private findCurrentUser = async (refreshToken: string) => {
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
      throw ApiError.databaseError({
        code: 404,
        type: 'NotFound',
        message: 'User not found',
      });
    }
    return user;
  };

  createChat = async ({
    friendId, message, files, role, members, refreshToken, title,
  }: BaseChat) => {
    const user = await this.findCurrentUser(refreshToken);
    const existChat = await Chat.findOne({
      $or: [
        { members: [user.id, friendId] },
        { members: [friendId, user.id] },
      ],
      $and: [{ role: 'private' }],
    });
    if (existChat) {
      throw ApiError.chatError({
        code: 421,
        type: 'Duplicate',
        message: 'Chat exist',
      });
    }
    const messageDocument = new Message({
      user: user.id,
      message,
    });
    const chatDocument = new Chat({
      members: role === 'group' ? [user.id, ...members] : [user.id, friendId],
      role,
    });
    messageDocument.chat = chatDocument.id;
    if (role === 'group') {
      chatDocument.title = title || `Group chat ${chatDocument.id}`;
    }
    if (message) {
      chatDocument.messages.push(messageDocument.id);
    }
    if (files) {
      messageDocument.files.push(...files);
    }
    await chatDocument.save();
    if (message || files) {
      await messageDocument.save();
    }
    await chatDocument.populate({
      path: 'members',
      select: 'username info',
      populate: {
        path: 'info',
        select: 'fullName avatar -_id',
      },
    });
    await chatDocument.populate({
      path: 'messages',
      select: '-__v',
      populate: {
        path: 'user',
        select: 'username info',
        populate: {
          path: 'info',
          select: 'fullName avatar -_id',
        },
      },
    });
    return chatDocument;
  };

  removeChat = async (chatId: string, refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    const chat = await Chat.findById({
      _id: chatId,
    });
    if (!chat) {
      throw ApiError.chatError({
        code: 404,
        type: 'NotFound',
        message: 'Chat not found',
      });
    }
    const isAccess = chat.members.some((member) => member.id.toString('hex') === user.id);
    if (!isAccess) {
      throw ApiError.chatError({
        code: 403,
        type: 'NoAccess',
        message: 'You not include in this chat',
      });
    }
    await Message.deleteMany({ chat: chatId });
    await chat.remove();
    return { status: true, type: 'Delete', chat };
  };

  renameChat = async (chatId: string, title: string, refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    const chat = await Chat.findById({
      _id: chatId,
      role: 'group',
    })
      .select('-__v')
      .populate({
        path: 'members',
        select: 'username info',
        populate: {
          path: 'info',
          select: 'fullName avatar -_id',
        },
      }).populate({
        path: 'messages',
        select: '-__v',
        populate: {
          path: 'user',
          select: 'username info',
          populate: {
            path: 'info',
            select: 'fullName avatar -_id',
          },
        },
      });
    if (!chat) {
      throw ApiError.chatError({
        code: 404,
        type: 'NotFound',
        message: 'Chat not found',
      });
    }
    const isAccess = chat.members.some((member) => member.id.toString('hex') === user.id);
    if (!isAccess) {
      throw ApiError.chatError({
        code: 403,
        type: 'NoAccess',
        message: 'You not include in this chat',
      });
    }
    chat.title = title;
    await chat.save();
    return chat;
  };

  getChatById = async (chatId: string, refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    const chat = await Chat.findById({
      _id: chatId,
    })
      .select('-__v')
      .populate({
        path: 'members',
        select: 'username info',
        populate: {
          path: 'info',
          select: 'fullName avatar -_id',
        },
      }).populate({
        path: 'messages',
        select: '-__v',
        populate: {
          path: 'user',
          select: 'username info',
          populate: {
            path: 'info',
            select: 'fullName avatar -_id',
          },
        },
      });
    if (!chat) {
      throw ApiError.chatError({
        code: 404,
        type: 'NotFound',
        message: 'Chat not found',
      });
    }
    const isAccess = chat.members.some((member) => member.id.toString('hex') === user.id);
    if (!isAccess) {
      throw ApiError.chatError({
        code: 403,
        type: 'NoAccess',
        message: 'You not include in this chat',
      });
    }
    return chat;
  };

  getChats = async (refreshToken: string) => {
    const user = await this.findCurrentUser(refreshToken);
    const chats = await Chat.find({
      members: user.id,
    }).populate({
      path: 'members',
      select: 'username info',
      populate: {
        path: 'info',
        select: 'fullName avatar -_id',
      },
    });
    return chats;
  };
}

const chatsService = new ChatsService();

export default chatsService;
