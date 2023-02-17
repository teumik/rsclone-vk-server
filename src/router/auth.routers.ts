import { Router } from 'express';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';
import activateMiddleware from '../middlewares/activate.middleware';

const router = Router();

router.post('/registration', authController.registration);
router.get('/logout', authController.logout);
router.get('/activate/:link', authController.activation);
router.post('/login', activateMiddleware, authController.login);
router.get('/refresh', authMiddleware, authController.refresh);

export default router;
