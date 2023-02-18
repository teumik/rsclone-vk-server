import { env } from 'process';
import dotenv from 'dotenv';
import User from '../models/user.model';
import tokenService from './token.service';
import ApiError from '../utils/apiError';
import Post from '../models/posts.model';
import PostDto from '../utils/postData.dto';
import Info from '../models/info.model';

dotenv.config();

interface IPosts {
  text: string;
  file?: string[];
}

interface IFindUser {
  refreshToken: string;
  userId?: string;
  username?: string;
}

interface IAddPost extends IFindUser {
  post: IPosts;
}

interface IEditPost extends IAddPost {
  postId: string;
}

class PostsService {
  private findUser = async ({ userId, username, refreshToken }: Partial<IFindUser>) => {
    if (!refreshToken) {
      throw ApiError.loginError({
        type: 'Unauthorized',
        message: 'Refresh token not found',
      });
    }
    const tokenData = await tokenService.findRefreshToken(refreshToken);
    if (tokenData) {
      const user = await User.findById({ _id: tokenData.user });
      if (user) return user;
    }
    if (userId) {
      const userById = await User.findById({ _id: userId });
      if (userById) return userById;
    }
    if (username) {
      const userByUsername = await User.findOne({ username });
      if (userByUsername) return userByUsername;
    }
    throw ApiError.loginError({
      code: 404,
      type: 'NotFound',
      message: 'User not found',
    });
  };

  addPost = async ({
    refreshToken, userId, username, post,
  }: IAddPost) => {
    const user = await this.findUser({ refreshToken, userId, username });
    const postData = await Post.create({
      user: user.id,
      ...post,
    });
    const postDto = PostDto.getData(postData);
    user.posts.push(postData.id);
    user.save();
    return postDto;
  };

  editPost = async ({
    postId, refreshToken, userId, username, post,
  }: IEditPost) => {
    const user = await this.findUser({ refreshToken, userId, username });
    const postData = await Post.findById(postId);
    if (!postData) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    if (user.id !== postData.user.toHexString()) {
      throw ApiError.postError({
        type: 'Forbidden',
        message: 'Not access',
      });
    }
    Object.assign(postData, { ...postData, ...post });
    await postData.save();
    return postData;
  };

  removePost = async ({ postId, refreshToken }: Pick<IEditPost, 'postId' | 'refreshToken'>) => {
    const user = await (await this.findUser({ refreshToken }));
    const postData = await Post.findById(postId);
    if (!postData) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    user.posts = user.posts.filter((post) => post.toHexString() !== postData.id);
    await user.save();
    await postData.remove();
    return { status: true, type: 'Remove', postData };
  };

  addLike = async () => {
    console.log('like');
    return null;
  };

  addComment = async () => {
    console.log('comment');
    return null;
  };

  getPost = async ({ refreshToken, postId }: Pick<IEditPost, 'postId' | 'refreshToken'>) => {
    if (!postId) return null;
    const user = await this.findUser({ refreshToken });
    const postData = await Post.findById(postId);
    if (!postData) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    if (user.id !== postData.user.toHexString()) {
      throw ApiError.postError({
        type: 'Forbidden',
        message: 'Not access',
      });
    }
    const postDto = PostDto.getData(postData);
    return postDto;
  };

  getAllUserPost = async ({ refreshToken, userId }: IFindUser) => {
    const user = await (await this.findUser({ refreshToken, userId })).populate('posts');
    return user.posts;
  };

  getAllPost = async () => {
    const posts = await Post.find({});
    const promises = posts.map(async (post) => {
      const userId = post.user;
      const user = await Info.findOne({ user: userId });
      return { post, user };
    });
    const postsData = Promise.all(promises);
    return postsData;
  };
}

const postsService = new PostsService();

export default postsService;
