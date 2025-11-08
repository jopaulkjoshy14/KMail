import mongoose from 'mongoose';
import config from '../config/index.js';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.MONGODB_URI);
  console.log('MongoDB connected');
};
