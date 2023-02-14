import { Schema, model } from 'mongoose';

const settingsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  theme: {
    type: String,
    enum: ['system', 'light', 'dark'],
    default: 'system',
  },
  visibleFields: [{
    type: String,
    enum: ['birthDate', 'friends', 'posts'],
  }],
});

const Settings = model('Settings', settingsSchema);

export default Settings;
