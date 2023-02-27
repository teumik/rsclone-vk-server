import { Router } from 'express';
import searchController from '../controllers/search.controller';

const searchRouter = Router();

searchRouter.post('', searchController.searchUsers);

export default searchRouter;
