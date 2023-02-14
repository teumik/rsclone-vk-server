import { Schema, model } from 'mongoose';

const tokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
  refreshToken: { type: String, require: true },
});

const Token = model('Token', tokenSchema);

export default Token;
