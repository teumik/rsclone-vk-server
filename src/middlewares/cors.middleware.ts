import { env } from 'process';
import cors from 'cors';
import dotenv from 'dotenv';
import ApiError from '../utils/apiError';
import settings from '../utils/settings';

dotenv.config();
const { WHITELIST } = env;
const { corsAllallowed } = settings;

const corsMiddleware = cors({
  origin: (requestOrigin, callback) => {
    if (!WHITELIST) {
      throw ApiError.serverError({ message: 'Problems with sites whitelist' });
    }
    const accessDomainList = WHITELIST.split(' ');
    if (!requestOrigin) return callback(null, true);
    if (!accessDomainList.includes(requestOrigin) && !corsAllallowed) {
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
