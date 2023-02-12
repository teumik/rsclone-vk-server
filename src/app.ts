import express, { Response, Request } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth.routers';
import connectDatabase from './database/connectToDatabase';
import errorMiddleware from './middlewares/error.middleware';
import ApiError from './utils/apiError';
import loggerMiddleware from './middlewares/logger.middleware';

dotenv.config();
const { env } = process;
const { DB_URL, PORT } = env;
const WHITELIST = env.WHITELIST?.split(' ');

const app = express();

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);

    if (!WHITELIST) {
      throw ApiError.serverError({ message: 'Problems with sites whitelist' });
    }

    if (!WHITELIST.includes(requestOrigin)) {
      const corsError = ApiError.corsError({
        type: 'InvalidURL',
        message: `${requestOrigin} is not allowed`,
      });
      return callback(corsError, true);
    }

    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use(errorMiddleware);
app.use(loggerMiddleware);

const startServer = async () => {
  if (!DB_URL) {
    throw ApiError.databaseError({ message: 'Problems with database URL' });
  }
  try {
    await connectDatabase(DB_URL);
    app.get('/', (req: Request, res: Response) => res.json('Server is work'));
    app.listen(PORT || 5555);
  } catch (error) {
    throw ApiError.serverError({});
  }
};

startServer();
