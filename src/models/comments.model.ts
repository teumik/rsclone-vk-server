import { Schema, model } from 'mongoose';

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  post: { type: Schema.Types.ObjectId, required: true, ref: 'Posts' },
  text: { type: String },
  files: [{ type: String }],
  date: { type: Date, required: true, default: Date.now },
});

const Comments = model('Comments', schema);

export default Comments;
