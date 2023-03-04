import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/apiError';

class DatabaseController {
  connectDatabase = async (DB_URL: string | undefined) => {
    if (!DB_URL) {
      throw ApiError.serverError({
        type: 'DBUrlError',
        message: 'Database URL cannot be empty string',
      });
    }
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(DB_URL);
    } catch (error) {
      if (error instanceof Error) {
        throw ApiError.databaseError({
          code: 500,
          type: 'DBConectionError',
          message: error.message,
        });
      }
    }
  };
}

const databaseController = new DatabaseController();

export default databaseController;
