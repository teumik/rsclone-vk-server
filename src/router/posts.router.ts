import { Router } from 'express';
import postsController from '../controllers/posts.controller';

const router = Router();

router.post('/add', postsController.addPost);
router.post('/edit', postsController.editPost);
router.get('/post/:id', postsController.getPost);
router.get('', postsController.getAllPost);

export default router;
