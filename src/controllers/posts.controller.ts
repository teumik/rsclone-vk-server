import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import postsService from '../service/posts.service';

dotenv.config();

class PostsController {
  addPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { userId, username, post } = req.body;
      const postData = await postsService.addPost({
        refreshToken, userId, username, post,
      });
      res.json(postData);
    } catch (error) {
      next(error);
    }
  };

  editPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const {
        postId, userId, username, post,
      } = req.body;
      const postData = await postsService.editPost({
        postId, refreshToken, userId, username, post,
      });
      res.json(postData);
    } catch (error) {
      next(error);
    }
  };

  removePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.body;
      const post = await postsService.removePost({ postId, refreshToken });
      res.json(post);
    } catch (error) {
      next(error);
    }
  };

  addLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.body;
      const likeData = await postsService.addLike({ postId, refreshToken });
      res.json(likeData);
    } catch (error) {
      next(error);
    }
  };

  removeLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.body;
      const likeData = await postsService.removeLike({ postId, refreshToken });
      res.json(likeData);
    } catch (error) {
      next(error);
    }
  };

  getLikes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const likes = await postsService.getLikes({ refreshToken });
      res.json(likes);
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { comment, postId } = req.body;
      const commentData = await postsService.addComment({ refreshToken, postId, comment });
      res.json(commentData);
    } catch (error) {
      next(error);
    }
  };

  editComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { commentId, comment } = req.body;
      const commentData = await postsService.editComment({ refreshToken, commentId, comment });
      res.json(commentData);
    } catch (error) {
      next(error);
    }
  };

  removeComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { commentId, postId } = req.body;
      const commentData = await postsService.removeComment({ refreshToken, postId, commentId });
      res.json(commentData);
    } catch (error) {
      next(error);
    }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const comments = await postsService.getComments({ postId });
      res.json(comments);
    } catch (error) {
      next(error);
    }
  };

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.params;
      const postData = await postsService.getPost({ refreshToken, postId });
      res.json(postData);
    } catch (error) {
      next(error);
    }
  };

  getAllUserPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { userId } = req.params;
      const posts = await postsService.getAllUserPost({ refreshToken, userId });
      res.json(posts);
    } catch (error) {
      next(error);
    }
  };

  getAllPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await postsService.getAllPost();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  };
}

const postsController = new PostsController();

export default postsController;
