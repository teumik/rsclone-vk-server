import {
  NextFunction, Request, Response
} from 'express';
import dotenv from 'dotenv';
import chatsService from '../service/chats.service';

dotenv.config();

class ChatsController {
  createChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        friendId, message, files, role, members, title,
      } = req.body;
      const { refreshToken } = req.cookies;
      const chatData = await chatsService.createChat({
        friendId, message, files, role, refreshToken, members, title,
      });
      res.json(chatData);
    } catch (error) {
      next(error);
    }
  };

  removeChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const { refreshToken } = req.cookies;
      const chatData = await chatsService.removeChat(chatId, refreshToken);
      res.json(chatData);
    } catch (error) {
      next(error);
    }
  };

  renameChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const { title } = req.body;
      const { refreshToken } = req.cookies;
      const chatData = await chatsService.renameChat(chatId, title, refreshToken);
      res.json(chatData);
    } catch (error) {
      next(error);
    }
  };

  getChatById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const { refreshToken } = req.cookies;
      const chat = await chatsService.getChatById(chatId, refreshToken);
      res.json(chat);
    } catch (error) {
      next(error);
    }
  };

  getChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const chats = await chatsService.getChats(refreshToken);
      res.json(chats);
    } catch (error) {
      next(error);
    }
  };
}

const chatsController = new ChatsController();

export default chatsController;
