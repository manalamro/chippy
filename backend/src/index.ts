import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { testDatabaseConnection } from './config/database';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import addressRoute from './routes/address';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://chippy-i378.onrender.com',
  /\.vercel\.app$/
];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin || allowedOrigins.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const origin = req.get('origin') || 'no-origin';
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

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

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') {
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

// Port declaration (استخدام بورت منصة Render أو 5000 محلياً)
const PORT = process.env.PORT || 5000;

// Start server directly
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Test DB connection (non-blocking — server keeps running if DB is unavailable)
testDatabaseConnection().catch((err) => {
  console.error('Error connecting to the database:', err.message);
  if (process.env.DATABASE_URL) {
    console.error('Check DATABASE_URL on Render — use Internal Database URL from your Postgres service.');
    console.error('If using External URL, set DATABASE_SSL=true. Remove NODE_TLS_REJECT_UNAUTHORIZED=0.');
  } else {
    console.error('DATABASE_URL is not set — add it in Render Environment variables.');
  }
});

export default app;