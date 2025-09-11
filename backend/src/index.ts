import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import addressRoute from './routes/address'
// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/addresses', addressRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error(err.stack);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL errors
  if (err.code === '23505') { // unique_violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') { // foreign_key_violation
    statusCode = 400;
    message = 'Invalid reference';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Test database connection and start server
const PORT = process.env.PORT || 5000;

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to database');
  release();
  
  // Start the server after successful database connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// Export the app for testing purposes
export default app;