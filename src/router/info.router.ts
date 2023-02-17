import { Router } from 'express';
import infoController from '../controllers/info.controller';

const router = Router();

router.post('/edit', infoController.sendInfo);
router.get('', infoController.getInfo);

export default router;
