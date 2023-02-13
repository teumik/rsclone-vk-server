import { Router } from 'express';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';
import activateMiddleware from '../middlewares/activate.middleware';

const router = Router();

router.post('/registration', authController.registration);
router.post('/login', activateMiddleware, authController.login);
router.get('/logout', authController.logout);
router.get('/refresh', authController.refresh);
router.get('/activate/:link', authController.activation);
router.get('/user/:id', activateMiddleware, authMiddleware, authController.getUser);
router.get('/users', activateMiddleware, authMiddleware, authController.getAllUsers);

export default router;
