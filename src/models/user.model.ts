import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: [{ type: String, ref: 'Role' }],
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
});

const User = model('User', userSchema);

export default User;
