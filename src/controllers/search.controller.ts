import { env } from 'process';
import {
  NextFunction, Request, Response
} from 'express';
import dotenv from 'dotenv';
import searchService from '../service/search.service';

dotenv.config();

class SearchController {
  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value } = req.body;
      const users = await searchService.searchUsers(value);
      res.json(users);
    } catch (error) {
      next(error);
    }
  };
}

const searchController = new SearchController();

export default searchController;
