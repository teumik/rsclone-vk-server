import { Router } from 'express';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.post('/registration', authController.registration);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/refresh', authController.refresh);
router.get('/activate/:link', authController.activation);
router.get('/user', authMiddleware, authController.getUser);
router.get('/users', authMiddleware, authController.getAllUsers);

export default router;
