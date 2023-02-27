import { Router } from 'express';
import userController from '../controllers/user.controller';

const userRouter = Router();

userRouter.post('/friends', userController.addFriend);
userRouter.put('/friends', userController.acceptFriend);
userRouter.delete('/friends', userController.removeFriends);
userRouter.get('/friends', userController.getFriends);
userRouter.get('/friends/incomming', userController.getRequestCount);
userRouter.get('/friends/outcomming', userController.getReciveCount);
userRouter.get('/:id', userController.getUser);
userRouter.get('', userController.getAllUsers);

export default userRouter;
