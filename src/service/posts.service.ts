import { env } from 'process';
import dotenv from 'dotenv';

dotenv.config();

class PostsService {
  addPost = async () => {
    console.log('add');
    return null;
  };

  editPost = async () => {
    console.log('edit');
    return null;
  };

  getPost = async () => {
    console.log('get');
    return null;
  };

  getAllPost = async () => {
    console.log('get_all');
    return null;
  };
}

const postsService = new PostsService();

export default postsService;
