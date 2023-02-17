import { Schema, model } from 'mongoose';

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  post: { type: Schema.Types.ObjectId, required: true, ref: 'Posts' },
});

const Likes = model('Likes', schema);

export default Likes;
