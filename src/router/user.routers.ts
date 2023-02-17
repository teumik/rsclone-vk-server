import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/add', userController.addFriend);
router.post('/accept', userController.acceptFriend);
router.post('/remove', userController.removeFriends);
router.get('/incount', userController.getRequestCount);
router.get('/outcount', userController.getReciveCount);
router.get('/friends', userController.getFriends);
router.get('/id/:id', userController.getUser);
router.get('/all', userController.getAllUsers);

export default router;
