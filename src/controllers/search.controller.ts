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
      const { refreshToken } = req.cookies;
      const users = await searchService.searchUsers(value, refreshToken);
      res.json(users);
    } catch (error) {
      next(error);
    }
  };
}

const searchController = new SearchController();

export default searchController;
