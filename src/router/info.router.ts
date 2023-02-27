import { Router } from 'express';
import infoController from '../controllers/info.controller';

const infoRouter = Router();

infoRouter.patch('', infoController.sendInfo);
infoRouter.get('', infoController.getInfo);

export default infoRouter;
