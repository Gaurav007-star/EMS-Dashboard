import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import app from '../src/server';

let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isConnected) {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    await mongoose.connect(connStr);
    isConnected = true;
  }

  return app(req, res);
}
