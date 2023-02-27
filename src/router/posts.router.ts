import { Router } from 'express';
import postsController from '../controllers/posts.controller';

const postsRouter = Router();

postsRouter.post('', postsController.addPost);
postsRouter.patch('', postsController.editPost);
postsRouter.delete('', postsController.removePost);
postsRouter.get('/likes', postsController.getLikes);
postsRouter.post('/likes', postsController.addLike);
postsRouter.delete('/likes', postsController.removeLike);

postsRouter.post('/comments', postsController.addComment);
postsRouter.get('/comments/:postId', postsController.getComments);
postsRouter.patch('/comments', postsController.editComment);
postsRouter.delete('/comments', postsController.removeComment);

postsRouter.get('/post/:postId', postsController.getPost);
postsRouter.get('/user/:userId', postsController.getAllUserPost);
postsRouter.get('', postsController.getAllPost);

export default postsRouter;
