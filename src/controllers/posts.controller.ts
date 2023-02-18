import { env } from 'process';
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
    console.log('add_like');

    try {
      const { refreshToken } = req.cookies;
      const post = await postsService.addLike();
      res.json({});
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction) => {
    console.log('add_comment');

    try {
      const { refreshToken } = req.cookies;
      // const post = await postsService.addComment();
      // res.json({});
      res.json({});
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
