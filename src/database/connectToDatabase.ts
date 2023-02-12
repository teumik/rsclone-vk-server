import mongoose from 'mongoose';

const connectDatabase = async (DB_URL: string) => {
  if (DB_URL === '') {
    return console.error('Database URL cannot be empty string');
  }

  try {
    mongoose.set('strictQuery', false);
    return await mongoose.connect(DB_URL);
  } catch (error) {
    return console.error(error);
  }
};

export default connectDatabase;
