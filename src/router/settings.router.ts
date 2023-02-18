import { Router } from 'express';
import settingsController from '../controllers/settings.controller';

const router = Router();

router.patch('', settingsController.setSettings);
router.get('', settingsController.getSettings);

export default router;
