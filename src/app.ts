import express, { Response, Request } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth.routers';
import connectDatabase from './database/connectToDatabase';
import errorMiddleware from './middlewares/error.middleware';
import loggerMiddleware from './middlewares/logger.middleware';
import corsMiddleware from './middlewares/cors.middleware';
import settings from './utils/settings';

dotenv.config();
const { env } = process;
const { DB_URL, PORT } = env;
const { greetingMessage } = settings;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.listen(PORT || 5555, async () => { await connectDatabase(DB_URL); });
app.get('/', (req: Request, res: Response) => res.send(greetingMessage));
app.use('/auth', authRouter);
app.use(errorMiddleware);
app.use(loggerMiddleware);
