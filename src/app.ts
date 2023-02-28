import express from 'express';
import { env } from 'process';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { parse } from 'cookie';
import { Document, Types } from 'mongoose';
import authRouter from './router/auth.router';
import userRouter from './router/user.router';
import infoRouter from './router/info.router';
import searchRouter from './router/search.router';
import settingsRouter from './router/settings.router';
import postsRouter from './router/posts.router';
import errorMiddleware from './middlewares/error.middleware';
import loggerMiddleware from './middlewares/logger.middleware';
import corsMiddleware from './middlewares/cors.middleware';
import settings from './utils/settings';
import databaseController from './database/connectToDatabase';
import accessMiddleware from './middlewares/access.middleware';
import activateMiddleware from './middlewares/activate.middleware';
import chatsRouter from './router/chats.router';
import ApiError from './utils/apiError';
import tokenService from './service/token.service';
import User from './models/user.model';
import { IPosts } from './service/posts.service';
import { IUser } from './utils/authValidate';
import Chat from './models/chat.model';
import Message from './models/message.model';
import Post from './models/posts.model';

dotenv.config();
const { DB_URL, PORT, WHITELIST } = env;
const accessDomainList = WHITELIST?.split(' ');
const { greetingMessage } = settings;

const app = express();
const upload = multer();
const server = createServer(app);

app.use(express.json({ limit: '5mb', type: 'application/json' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use(corsMiddleware);
app.get('/', (req, res) => res.send(greetingMessage));
app.get('/clear', async (req, res, next) => { await databaseController.dropAllCollections(req, res, next); });
app.use('/auth', authRouter);
app.use(accessMiddleware);
app.use(activateMiddleware);
app.use('/user', userRouter);
app.use('/info', infoRouter);
app.use('/search', searchRouter);
app.use('/settings', settingsRouter);
app.use('/posts', postsRouter);
app.use('/chats', chatsRouter);
app.use(loggerMiddleware);
app.use(errorMiddleware);

app.post('/image_loader', upload.single('image'), async (req, res, next) => {
  res.json(req.file);
});

interface IUserStatus extends IUser {
  isOnline: boolean;
}

interface IOnline {
  id: string;
  online: boolean;
}

interface ISuccessConnect {
  connection: boolean;
}

interface IComment {
  user: Types.ObjectId;
  post: Types.ObjectId;
  text?: string;
}

interface ICommentMessage {
  comment: {
    user: Types.ObjectId;
    post: Types.ObjectId;
    text?: string;
  };
  post: IPosts;
}

interface ChatMessage {
  chatId: string;
  message: string;
}

interface IPost {
  user: Types.ObjectId;
  date: Date;
  text: string;
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  files: string[];
  isEdit: boolean;
  lastEdit?: Date;
}

interface ILike {
  post: Types.ObjectId;
  user: Types.ObjectId;
}

interface IVisitor {
  userId: string;
  visitorId: string;
}

interface ServerToClientEvents {
  online: (message: IOnline) => void;
  error: (message: ApiError) => void;
  'add post': (postData: IPost) => void;
  'edit post': (postData: IPost) => void;
  'remove post': (postData: IPost) => void;
  'add like': (likeData: ILike) => void;
  'remove like': (likeData: ILike) => void;
  'success connect': (message: ISuccessConnect) => void;
  'add comment': (message: ICommentMessage) => void;
  'edit comment': (message: IComment) => void;
  'remove comment': (message: ICommentMessage) => void;
  'chat message': (data: ChatMessage) => void;
}

interface ClientToServerEvents {
  login: (user: string) => void;
  logout: (user: string) => void;
  disconnect: () => void;
  'chat message': (data: ChatMessage) => void;
  'visit in': ({ userId, visitorId }: IVisitor) => void;
  'visit out': ({ userId, visitorId }: IVisitor) => void;
}

interface InterServerEvents {
  example: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: accessDomainList,
    credentials: true,
  },
  serveClient: false,
});

const findRefreshToken = async (refresh: string) => {
  const tokenData = await tokenService.validateRefreshToken(refresh);
  if (typeof tokenData === 'string') return null;
  if (!tokenData) return null;
  const userData = await User.findById(tokenData.id);
  return userData;
};

const findAccessToken = async (access: string) => {
  const tokenData = await tokenService.validateAccessToken(access);
  if (typeof tokenData === 'string') return null;
  if (!tokenData) return null;
  const userData = await User.findById(tokenData.id);
  return userData;
};

class SessionState {
  onlineUsers: Map<string, string>;
  visitors: Map<string, string[]>;
  constructor() {
    this.onlineUsers = new Map();
    this.visitors = new Map();
  }

  setVisitor = (userId: string, visitorId: string) => {
    const existVisitors = this.visitors.get(userId);
    if (!existVisitors) return;
    if (existVisitors.includes(visitorId)) return;
    existVisitors.push(visitorId);
    this.visitors.set(userId, existVisitors);
  };

  removeVisitor = (userId: string, visitorId: string) => {
    const existVisitors = this.visitors.get(userId);
    if (!existVisitors) return;
    if (!existVisitors.includes(visitorId)) return;
    existVisitors.filter((visitors) => visitors !== visitorId);
    this.visitors.set(userId, existVisitors);
  };
}

const sessionState = new SessionState();

io.on('connection', async (socket) => {
  socket.on('login', async (accessToken) => {
    const user = await findAccessToken(accessToken);
    if (!user) return;
    if (!user.isOnline) {
      user.isOnline = true;
      await user.save();
    }
    sessionState.onlineUsers.set(user.id, socket.id);
    io.sockets.emit('online', { id: user.id, online: user.isOnline });
  });

  socket.on('logout', async () => {
    const { cookie } = socket.handshake.headers;
    const { refreshToken } = parse(cookie || '');
    const user = await findRefreshToken(refreshToken);
    if (!user) return;
    if (user.isOnline) {
      user.isOnline = false;
      await user.save();
    }
    sessionState.onlineUsers.delete(user.id);
    io.sockets.emit('online', { id: user.id, online: user.isOnline });
  });

  socket.on('disconnect', async () => {
    const { cookie } = socket.handshake.headers;
    const { refreshToken } = parse(cookie || '');
    const user = await findRefreshToken(refreshToken);
    if (!user) return;
    if (user.isOnline) {
      user.isOnline = false;
      await user.save();
    }
    sessionState.onlineUsers.delete(user.id);
    io.sockets.emit('online', { id: user.id, online: user.isOnline });
  });

  socket.on('chat message', async ({ chatId, message }) => {
    const { cookie } = socket.handshake.headers;
    const { refreshToken } = parse(cookie || '');
    const user = await findRefreshToken(refreshToken);
    const chat = await Chat.findById(chatId);
    if (!user) return;
    if (!chat) return;
    const messageData = await Message.create({
      chat: chat.id,
      user: user.id,
      message,
    });
    chat.messages.push(messageData.id);
    await chat.save();
    chat.members.forEach((member) => {
      const recipient = sessionState.onlineUsers.get(member.toHexString());
      if (!recipient || member.toHexString() === user.id) return;
      socket.to(recipient).emit('chat message', { chatId, message });
    });
  });

  // socket.on('visit in', () => { });
});

server.listen(PORT || 5555, async () => { await databaseController.connectDatabase(DB_URL); });

export { sessionState, io };
