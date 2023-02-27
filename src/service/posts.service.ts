import { env } from 'process';
import dotenv from 'dotenv';
import User from '../models/user.model';
import tokenService from './token.service';
import ApiError from '../utils/apiError';
import Post from '../models/posts.model';
import PostDto from '../utils/postData.dto';
import Likes from '../models/likes.model';
import Comments from '../models/comments.model';

dotenv.config();

export interface IPosts {
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

export interface IComment {
  refreshToken: string;
  commentId: string;
  comment: string;
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
    user.posts.push(postData.id);
    user.save();
    return postData;
  };

  editPost = async ({
    postId, refreshToken, userId, username, post,
  }: IEditPost) => {
    const user = await this.findUser({ refreshToken, userId, username });
    const postData = await Post.findById(postId)
      .populate({
        path: 'comments',
        select: '-__v',
        populate: {
          path: 'user',
          select: 'username info',
          populate: {
            path: 'info',
            select: 'fullName avatar -_id',
          },
        },
      });
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
    Object.assign(postData, {
      ...postData,
      ...post,
      isEdit: true,
      lastEdit: Date.now(),
    });
    await postData.save();
    return postData;
  };

  removePost = async ({ postId, refreshToken }: Pick<IEditPost, 'postId' | 'refreshToken'>) => {
    const user = await this.findUser({ refreshToken });
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

  addLike = async ({ postId, refreshToken }: Pick<IEditPost, 'postId' | 'refreshToken'>) => {
    const user = await this.findUser({ refreshToken });
    const post = await Post.findById(postId);
    const existlike = await Likes.findOne({ post, user });
    if (existlike) {
      throw ApiError.likeError({
        code: 421,
        type: 'Duplicate',
        message: 'Like exist',
      });
    }
    if (!post) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    const like = await Likes.create({ user: user.id, post: post.id });
    post.likes.push(like.id);
    user.likes.push(like.id);
    await post.save();
    await user.save();
    return like;
  };

  removeLike = async ({ postId, refreshToken }: Pick<IEditPost, 'postId' | 'refreshToken'>) => {
    const user = await this.findUser({ refreshToken });
    const post = await Post.findById(postId);
    const like = await Likes.findOne({ post, user });
    if (!like) {
      throw ApiError.likeError({
        code: 421,
        type: 'Duplicate',
        message: 'Like exist',
      });
    }
    if (!post) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    user.likes = user.likes.filter((likeId) => likeId.toHexString() !== like.id);
    post.likes = post.likes.filter((likeId) => likeId.toHexString() !== like.id);
    await like.remove();
    await user.save();
    await post.save();
    return { status: true, type: 'Remove', post };
  };

  getLikes = async ({ refreshToken }: Pick<IEditPost, 'refreshToken'>) => {
    const user = await this.findUser({ refreshToken });
    const like = await Likes.find({ user })
      .populate({
        path: 'post',
        populate: {
          path: 'user',
          select: 'username',
          populate: {
            path: 'info',
            select: 'fullName',
          },
        },
      });
    return like;
  };

  addComment = async ({ refreshToken, postId, comment: text }: Omit<IComment, 'commentId'>) => {
    if (!text) return null;
    const user = await this.findUser({ refreshToken });
    const post = await Post.findById(postId).populate({
      path: 'comments',
      select: '-__v',
      populate: {
        path: 'user',
        select: 'username info',
        populate: {
          path: 'info',
          select: 'fullName avatar -_id',
        },
      },
    });
    if (!post) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    const comment = await Comments.create({
      user: user.id, post: post.id, text,
    });
    await comment.populate({
      path: 'user',
      select: 'username',
      populate: {
        path: 'info',
        select: 'fullName avatar',
      },
    });
    await comment.populate({
      path: 'post',
    });
    post.comments.push(comment.id);
    await post.save();
    // sockets[0].emit('comment', { comment, post });
    return { comment, post };
  };

  editComment = async ({
    refreshToken, commentId, comment: text,
  }: Omit<IComment, 'postId'>) => {
    const user = await this.findUser({ refreshToken });
    const comment = await Comments.findById(commentId);
    if (!comment) {
      throw ApiError.commentError({
        code: 404,
        type: 'NotFound',
        message: 'Comment not found',
      });
    }
    if (comment.user.toHexString() !== user.id) {
      throw ApiError.commentError({
        type: 'NotAccess',
        message: 'Not your comment',
      });
    }
    comment.text = text;
    await comment.save();
    await comment.populate({
      path: 'user',
      select: 'username',
      populate: {
        path: 'info',
        select: 'fullName avatar',
      },
    });
    await comment.populate({
      path: 'post',
    });
    return comment;
  };

  removeComment = async ({ refreshToken, postId, commentId }: Omit<IComment, 'comment'>) => {
    const user = await this.findUser({ refreshToken });
    const post = await Post.findById(postId);
    const comment = await Comments.findById(commentId);
    if (!comment) {
      throw ApiError.commentError({
        code: 404,
        type: 'NotFound',
        message: 'Comment not found',
      });
    }
    if (comment.user.toHexString() !== user.id) {
      throw ApiError.commentError({
        type: 'NotAccess',
        message: 'Not your comment',
      });
    }
    if (!post) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    post.comments = post.comments.filter((item) => item.toHexString() !== commentId);
    await post.save();
    await comment.remove();
    return { post, comment };
  };

  getComments = async ({ postId }: Pick<IComment, 'postId'>) => {
    const post = await Post.findById(postId);
    if (!post) {
      throw ApiError.postError({
        code: 404,
        type: 'NotFound',
        message: 'Post not found',
      });
    }
    await post.populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'username',
        populate: {
          path: 'info',
          select: 'fullName avatar',
        },
      },
    });
    return post;
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
    const user = await this.findUser({ refreshToken, userId });
    const userPopulated = await user.populate({
      path: 'posts',
      select: '-__v',
      options: {
        sort: { date: -1 },
      },
      populate: {
        path: 'comments',
        select: '-__v',
        populate: {
          path: 'user',
          select: 'username info',
          populate: {
            path: 'info',
            select: 'fullName avatar -_id',
          },
        },
      },
    });
    return userPopulated.posts;
  };

  getAllPost = async () => {
    const posts = await Post.find({}).select('-__v').populate({
      path: 'user',
      select: 'isOnline username',
      populate: {
        path: 'info',
        select: 'avatar fullName',
      },
    }).sort({ date: -1 });
    return posts;
  };
}

const postsService = new PostsService();

export default postsService;
