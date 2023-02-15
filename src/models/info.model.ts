import { Schema, model } from 'mongoose';

const infoSchema = new Schema({
  user: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
  icon: {
    data: Buffer,
    contentType: String,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  status: { type: String },
  familyStatus: { type: String },
  hometown: { type: String },
  school: { type: String },
  university: { type: String },
  interests: { type: String },
  lifePosition: { type: String },
  favoriteMusic: { type: String },
  favoriteBooks: { type: String },
  favoriteFilms: { type: String },
  birthDate: { type: Number },
});

const Info = model('Info', infoSchema);

export default Info;
