import { Router } from 'express';
import postsController from '../controllers/posts.controller';

const router = Router();

router.post('', postsController.addPost);
router.post('/:postId/edit', postsController.editPost);
router.get('/:postId', postsController.getPost);
router.get('', postsController.getAllPost);

export default router;
