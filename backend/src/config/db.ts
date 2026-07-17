import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    await mongoose.connect(connStr);
    console.log(`MongoDB Connected successfully`);
  } catch (error) {
    console.error(`MongoDB connection error:`, error);
    process.exit(1);
  }
};
