import { Router } from 'express';
import postsController from '../controllers/posts.controller';

const router = Router();

router.post('', postsController.addPost);
router.patch('', postsController.editPost);
router.delete('', postsController.removePost);
router.get('/likes', postsController.getLikes);
router.post('/likes', postsController.addLike);
router.delete('/likes', postsController.removeLike);

router.post('/comments', postsController.addComment);
router.get('/comments/:postId', postsController.getComments);
router.patch('/comments', postsController.editComment);
router.delete('/comments', postsController.removeComment);

router.get('/post/:postId', postsController.getPost);
router.get('/user/:userId', postsController.getAllUserPost);
router.get('', postsController.getAllPost);

export default router;
