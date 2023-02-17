import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/friends/add', userController.addFriend);
router.post('/friends/accept', userController.acceptFriend);
router.post('/friends/remove', userController.removeFriends);
router.get('/friends/incount', userController.getRequestCount);
router.get('/friends/outcount', userController.getReciveCount);
router.get('/friends', userController.getFriends);
router.get('/:id', userController.getUser);
router.get('', userController.getAllUsers);

export default router;
