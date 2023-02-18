import { Router } from 'express';
import postsController from '../controllers/posts.controller';

const router = Router();

router.post('', postsController.addPost);
router.patch('', postsController.editPost);
router.delete('', postsController.removePost);
router.post('/likes', postsController.addLike); // ?
router.delete('/likes', postsController.addLike); // ?
router.post('/comments', postsController.addComment); // ?
router.delete('/comments', postsController.addComment); // ?
router.get('/post/:postId', postsController.getPost);
router.get('/user/:userId', postsController.getAllUserPost);
router.get('', postsController.getAllPost);

export default router;
