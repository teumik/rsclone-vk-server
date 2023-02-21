import { Schema, model } from 'mongoose';

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, required: true, ref: 'User' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  files: [{ type: String }],
  role: {
    type: String,
    enum: ['tat', 'group'],
    default: 'tat',
  },
});

const Chat = model('Chat', schema);

export default Chat;
