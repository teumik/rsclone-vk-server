import { Router } from 'express';
import infoController from '../controllers/info.controller';

const router = Router();

router.patch('', infoController.sendInfo);
router.get('', infoController.getInfo);

export default router;
