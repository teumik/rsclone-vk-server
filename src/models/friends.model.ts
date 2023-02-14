import { Schema, model } from 'mongoose';

const friendsSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  recipient: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  status: { type: Boolean, default: false },
});

const Friends = model('Friends', friendsSchema);

export default Friends;
