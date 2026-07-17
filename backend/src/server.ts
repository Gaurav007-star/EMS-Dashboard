import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import orgRoutes from './routes/orgRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', orgRoutes);

// Base route for health check
app.get('/', (_req, res) => {
  res.send('Employee Management System API is running...');
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// For local development: connect DB, seed, and start server
const startServer = async () => {
  await connectDB();

  // Auto-seed only if database is empty
  const { Employee } = require('./models/Employee');
  const count = await Employee.countDocuments();
  if (count === 0) {
    console.log('No employees found. Seeding database...');
    const { default: seedDatabase } = await import('./seed');
    await seedDatabase();
  } else {
    console.log(`Database already has ${count} employees. Skipping seed.`);
  }

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

// Run standalone only when executed directly (not imported by Vercel)
if (require.main === module) {
  startServer();
}

export default app;
