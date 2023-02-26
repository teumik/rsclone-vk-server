import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/friends', userController.addFriend);
router.put('/friends', userController.acceptFriend);
router.delete('/friends', userController.removeFriends);
router.get('/friends', userController.getFriends);
router.get('/friends/incomming', userController.getRequestCount);
router.get('/friends/outcomming', userController.getReciveCount);
router.get('/:id', userController.getUser);
router.get('', userController.getAllUsers);

export default router;
