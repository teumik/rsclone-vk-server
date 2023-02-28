import express from 'express';
import { env } from 'process';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
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
import Comments from './models/comments.model';
import Post from './models/posts.model';
import { IComment, IPosts } from './service/posts.service';

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

interface IOnline {
  id: string;
  online: boolean;
}

interface ISuccessConnect {
  connection: boolean;
}

interface CommentMessage {
  comment: {
    user: Types.ObjectId;
    post: Types.ObjectId;
    text?: string;
  };
  post: IPosts;
}

interface ServerToClientEvents {
  online: (message: IOnline) => void;
  successConnect: (message: ISuccessConnect) => void;
  error: (message: ApiError) => void;
  comment: (message: CommentMessage) => void;
}

interface ClientToServerEvents {
  login: (user: string) => void;
  logout: (user: string) => void;
  disconnect: () => void;

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

// const findUserByToken = async (refreshToken: string) => {
//   const tokenData = await tokenService.findRefreshToken(refreshToken);
//   if (!tokenData) return null;
//   const user = await User.findById({ _id: tokenData.user });
//   if (!user) return null;
//   return user;
// };

// io.use(async (socket, next) => {
//   const { cookie } = socket.handshake.headers;
//   if (!cookie) {
//     const error = ApiError.loginError({
//       type: 'EmptyCookie',
//       message: 'Cookie is empty',
//     });
//     socket.emit('error', error);
//     return;
//   }
//   const { refreshToken } = parse(cookie);
//   if (!refreshToken) {
//     const error = ApiError.loginError({
//       type: 'Unauthorized',
//       message: 'Refresh token not provided',
//     });
//     socket.emit('error', error);
//     return;
//   }
//   await findUserByToken(refreshToken);
//   next();
// });

const sockets: Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData>[] = [];

io.on('connection', async (socket) => {
  // const { roomId, userName } = socket.handshake.query;
  socket.on('login', (message) => {
    sockets.push(socket);
    // const { cookie } = socket.handshake.headers;
    // const { refreshToken } = parse(cookie || '');
    // console.log({ refreshToken, message });
  });
  // console.log(sockets[0]);
  // sockets[0].emit('comment', '12312s1s121212');
  // if (!cookie) {
  //   const error = ApiError.loginError({
  //     type: 'EmptyCookie',
  //     message: 'Cookie is empty',
  //   });
  //   socket.emit('error', error);
  //   return;
  // }
  // const { refreshToken } = parse(cookie);
  // const user = await findUserByToken(refreshToken);
  // if (!user) return;
  // if (user) {
  //   socket.emit('successConnect', {
  //     connection: true,
  //   });
  // }

  // socket.on('login', async () => {
  //   console.log(user.username);
  //   if (!user.isOnline) {
  //     user.isOnline = true;
  //     await user.save();
  //   }
  //   console.log({ online: user.isOnline });
  //   socket.emit('online', { id: user.id, online: user.isOnline });
  // });
  // socket.on('logout', async () => {
  //   if (user.isOnline) {
  //     user.isOnline = false;
  //     await user.save();
  //   }
  //   console.log({ online: user.isOnline });
  //   socket.emit('online', { id: user.id, online: user.isOnline });
  // });
  // socket.on('disconnect', async () => {
  //   if (user.isOnline) {
  //     user.isOnline = false;
  //     await user.save();
  //   }
  //   console.log({ online: user.isOnline });
  //   socket.emit('online', { id: user.id, online: user.isOnline });
  // });
});

server.listen(PORT || 5555, async () => { await databaseController.connectDatabase(DB_URL); });

export default sockets;
