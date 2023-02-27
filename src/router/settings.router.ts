import { Router } from 'express';
import settingsController from '../controllers/settings.controller';

const settingsRouter = Router();

settingsRouter.patch('', settingsController.setSettings);
settingsRouter.get('', settingsController.getSettings);

export default settingsRouter;
