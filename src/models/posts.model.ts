import { Schema, model } from 'mongoose';

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  text: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Likes' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
  files: [{ type: String }],
  date: { type: Date, required: true, default: Date.now() },
});

const Post = model('Posts', schema);

export default Post;
