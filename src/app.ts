import { env } from 'process';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
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

dotenv.config();
const { DB_URL, PORT } = env;
const { greetingMessage } = settings;

const app = express();

app.use(express.json());
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
app.use(loggerMiddleware);
app.use(errorMiddleware);
app.listen(PORT || 5555, async () => { await databaseController.connectDatabase(DB_URL); });

app.post('/test-image', (req, res, next) => {
  console.log(req);
  console.log(req.body);
  res.json({ message: 'get it' });
});
