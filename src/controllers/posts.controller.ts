import { env } from 'process';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

class PostsController {
  addPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      res.json();
    } catch (error) {
      next(error);
    }
  };

  editPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.params;
      res.json();
    } catch (error) {
      next(error);
    }
  };

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      const { postId } = req.params;
      res.json();
    } catch (error) {
      next(error);
    }
  };

  getAllPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      res.json();
    } catch (error) {
      next(error);
    }
  };
}

const postsController = new PostsController();

export default postsController;
