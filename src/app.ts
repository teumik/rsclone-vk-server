import { env } from 'process';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth.routers';
import userRouter from './router/user.routers';
import errorMiddleware from './middlewares/error.middleware';
import loggerMiddleware from './middlewares/logger.middleware';
import corsMiddleware from './middlewares/cors.middleware';
import settings from './utils/settings';
import databaseController from './database/connectToDatabase';

dotenv.config();
const { DB_URL, PORT } = env;
const { greetingMessage } = settings;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.get('/', (req, res) => res.send(greetingMessage));
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.get('/clear', async (req, res, next) => { await databaseController.dropAllCollections(req, res, next); });
app.use(errorMiddleware);
app.use(loggerMiddleware);
app.listen(PORT || 5555, async () => { await databaseController.connectDatabase(DB_URL); });
