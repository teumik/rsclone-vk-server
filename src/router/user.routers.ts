import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/add', userController.addFriend);
router.post('/accept', userController.acceptFriend);
router.get('/count', userController.getRequestCount);
router.get('/friends', userController.getFriends);

export default router;
