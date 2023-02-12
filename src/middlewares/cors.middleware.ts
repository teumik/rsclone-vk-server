import cors from 'cors';
import dotenv from 'dotenv';
import ApiError from '../utils/apiError';
import settings from '../utils/settings';

dotenv.config();
const { env } = process;
const WHITELIST = env.WHITELIST?.split(' ');
const { corsAllallowed } = settings;

const corsMiddleware = cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);
    if (!WHITELIST) {
      throw ApiError.serverError({ message: 'Problems with sites whitelist' });
    }
    if (!WHITELIST.includes(requestOrigin) && !corsAllallowed) {
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
