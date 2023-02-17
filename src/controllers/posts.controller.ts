import { env } from 'process';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import postsService from '../service/posts.service';

dotenv.config();

class PostsController {
  addPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      console.log('addPost', 'addPost');
      const post = await postsService.addPost();
      res.json({});
    } catch (error) {
      next(error);
    }
  };

  editPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.params;
      console.log(postId, 'editPost');
      const post = await postsService.editPost();
      res.json({});
    } catch (error) {
      next(error);
    }
  };

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.params;
      console.log(postId, 'getPost');
      const post = await postsService.getPost();
      res.json({});
    } catch (error) {
      next(error);
    }
  };

  getAllPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      console.log('getAllPost', 'getAllPost');
      const post = await postsService.getAllPost();
      res.json({});
    } catch (error) {
      next(error);
    }
  };
}

const postsController = new PostsController();

export default postsController;
