import { env } from 'process';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth.routers';
import userRouter from './router/user.routers';
import infoRouter from './router/info.routers';
import searchRouter from './router/search.routers';
import settingsRouter from './router/settings.routers';
import errorMiddleware from './middlewares/error.middleware';
import loggerMiddleware from './middlewares/logger.middleware';
import corsMiddleware from './middlewares/cors.middleware';
import settings from './utils/settings';
import databaseController from './database/connectToDatabase';
import authMiddleware from './middlewares/auth.middleware';

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
app.use(authMiddleware);
app.use('/user', userRouter);
app.use('/info', infoRouter);
app.use('/search', searchRouter);
app.use('/settings', settingsRouter);
app.use(loggerMiddleware);
app.use(errorMiddleware);
app.listen(PORT || 5555, async () => { await databaseController.connectDatabase(DB_URL); });
