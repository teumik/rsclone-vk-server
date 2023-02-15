import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/add', userController.addFriend);
router.post('/accept', userController.acceptFriend);
router.get('/incount', userController.getRequestCount);
router.get('/outcount', userController.getReciveCount);
router.get('/friends', userController.getFriends);

export default router;
