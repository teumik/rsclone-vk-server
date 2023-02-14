import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  info: { type: Schema.Types.ObjectId, ref: 'Info' },
  settings: { type: Schema.Types.ObjectId, ref: 'Settings' },
  pendingRequest: [{ type: Schema.Types.ObjectId, ref: 'Friends' }],
  outgoingRequest: [{ type: Schema.Types.ObjectId, ref: 'Friends' }],
  friends: [{
    friendDocument: { type: Schema.Types.ObjectId, ref: 'Friends' },
    friendId: { type: Schema.Types.ObjectId, ref: 'User' },
  }],
  isOnline: { type: Boolean, required: true, default: false },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
});

const User = model('User', userSchema);

export default User;
