import { Schema, model } from 'mongoose';

const schema = new Schema({
  title: { type: String },
  members: [{ type: Schema.Types.ObjectId, required: true, ref: 'User' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  role: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
  },
});

const Chat = model('Chat', schema);

export default Chat;
