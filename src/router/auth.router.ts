import { Router } from 'express';
import authController from '../controllers/auth.controller';
import activateMiddleware from '../middlewares/activate.middleware';
import refreshMiddleware from '../middlewares/refresh.middleware';

const authRouter = Router();

authRouter.post('/registration', authController.registration);
authRouter.get('/logout', authController.logout);
authRouter.get('/activate/:link', authController.activation);
authRouter.post('/login', activateMiddleware, authController.login);
authRouter.get('/refresh', refreshMiddleware, authController.refresh);

export default authRouter;
