import express from 'express';
import { env } from 'process';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { parse } from 'cookie';
import { Types } from 'mongoose';
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
import Chat from './models/chat.model';
import Message from './models/message.model';

dotenv.config();
const { DB_URL, PORT, WHITELIST } = env;
const accessDomainList = WHITELIST?.split(' ');
const { greetingMessage } = settings;

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '1.2mb', type: 'application/json' }));
app.use(express.urlencoded({ limit: '1.2mb', extended: true }));
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
  user?: string;
  chatId: string;
  message: string;
  messageId: string;
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
  socketId?: string;
}

interface IExistRequest {
  status: boolean;
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
}

interface IChat {
  members: Types.ObjectId[];
  messages: Types.ObjectId[];
  role: 'private' | 'group';
  title?: string | undefined;
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
  'chat message on': (data: ChatMessage) => void;
  'add friend': (data: IExistRequest) => void;
  'accept friend': (data: IExistRequest) => void;
  'remove friend': (data: IExistRequest) => void;
  'visit log': (data: [string, {
    visitorId: string;
    socketId: string;
  }[]][]) => void;
  'create chat': (data: IChat) => void;
}

interface ClientToServerEvents {
  login: (user: string) => void;
  logout: (user: string) => void;
  disconnect: () => void;
  'chat message emit': (data: ChatMessage) => void;
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
  visitors: Map<string, {
    visitorId: string;
    socketId: string;
  }[]>;

  constructor() {
    this.onlineUsers = new Map();
    this.visitors = new Map();
  }

  setVisitor = ({ userId, visitorId, socketId }: IVisitor) => {
    if (userId === visitorId) return;
    if (!socketId) return;
    const existVisitors = this.visitors.get(userId) || [];
    if (existVisitors.some((el) => el.visitorId === visitorId)) return;
    existVisitors.push({ visitorId, socketId });
    this.visitors.set(userId, existVisitors);
  };

  removeVisitor = ({ userId, visitorId }: IVisitor) => {
    let existVisitors = this.visitors.get(userId);
    if (!existVisitors) return;
    if (!existVisitors.some((el) => el.visitorId === visitorId)) return;
    existVisitors = existVisitors.filter((visitors) => visitors.visitorId !== visitorId);
    if (!existVisitors.length) {
      this.visitors.delete(userId);
      return;
    }
    this.visitors.set(userId, existVisitors);
  };

  removeByVisitor = (visitorId: string) => {
    Array.from(this.visitors.entries()).forEach((visitor) => {
      visitor[1].forEach((el) => {
        if (el.visitorId === visitorId) {
          this.removeVisitor({ userId: visitor[0], visitorId });
        }
      });
    });
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
    console.log(user.id, socket.id, 'socket ID');
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
    sessionState.removeByVisitor(user.id);
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
    sessionState.removeByVisitor(user.id);
    io.sockets.emit('online', { id: user.id, online: user.isOnline });
  });

  socket.on('chat message emit', async ({ chatId, message }) => {
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
      socket.to(recipient || '').emit('chat message on', {
        user: user.id, chatId, message, messageId: messageData.id,
      });
    });
    socket.emit('chat message on', {
      user: user.id, chatId, message, messageId: messageData.id,
    });
  });

  socket.on('visit in', ({ userId, visitorId }) => {
    sessionState.setVisitor({ userId, visitorId, socketId: socket.id });
    socket.emit('visit log', Array.from(sessionState.visitors.entries()));
  });

  socket.on('visit out', ({ userId, visitorId }) => {
    sessionState.removeVisitor({ userId, visitorId });
    socket.emit('visit log', Array.from(sessionState.visitors.entries()));
  });
});

server.listen(PORT || 5555, async () => { await databaseController.connectDatabase(DB_URL); });

export { sessionState, io };
