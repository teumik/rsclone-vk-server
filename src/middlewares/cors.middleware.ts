import cors from 'cors';
import dotenv from 'dotenv';
import ApiError from '../utils/apiError';

dotenv.config();
const { env } = process;
const WHITELIST = env.WHITELIST?.split(' ');

const corsMiddleware = cors({
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
});

export default corsMiddleware;
