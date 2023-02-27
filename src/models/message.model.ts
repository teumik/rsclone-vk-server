import { Schema, model } from 'mongoose';

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  chat: { type: Schema.Types.ObjectId, required: true, ref: 'Chat' },
  message: { type: String },
  files: [{ type: String }],
  date: { type: Date, required: true, default: Date.now },
});

const Message = model('Message', schema);

export default Message;
