import { Types } from 'mongoose';

interface IPostDto {
  id?: Types.ObjectId;
  user: Types.ObjectId;
  date: Date;
  text: string;
  files: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
}

class PostDto {
  static getData = ({
    id, user, date, text, files, likes, comments,
  }: IPostDto) => ({
    id, user, date, text, files, likes, comments,
  });
}

export default PostDto;
