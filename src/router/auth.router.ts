import { Router } from 'express';
import authController from '../controllers/auth.controller';
import activateMiddleware from '../middlewares/activate.middleware';
import refreshMiddleware from '../middlewares/refresh.middleware';

const router = Router();

router.post('/registration', authController.registration);
router.get('/logout', authController.logout);
router.get('/activate/:link', authController.activation);
router.post('/login', activateMiddleware, authController.login);
router.get('/refresh', refreshMiddleware, authController.refresh);

export default router;
