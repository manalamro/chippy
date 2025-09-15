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

// CORS configuration - إعدادات CORS محدثة
const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://chippy-manals-projects-ec1b19ad.vercel.app',
  'https://vercel.app', // للـ preview deployments
  /\.vercel\.app$/, // لكل الـ subdomains على Vercel
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []), // تجنّب undefined
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true, // للسماح بالكوكيز والتوثيق
  optionsSuccessStatus: 200 // لدعم المتصفحات القديمة
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// إضافة middleware للتحقق من الاتصال
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
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
  res.status(200).json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Chippy API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth',
      products: '/products',
      cart: '/cart',
      orders: '/orders',
      admin: '/admin',
      addresses: '/addresses'
    }
  });
});

// Error handling middleware
app.use((
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

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
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database connection failed';
  }

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Test database connection and start server
const PORT = process.env.PORT || 5000; // غيرت من 5432 لـ 5000

// تحسين إدارة الاتصال بقاعدة البيانات
const connectWithRetry = () => {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error acquiring client:', err.stack);
      console.log('Retrying database connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
      return;
    }
    
    console.log('✅ Connected to database successfully');
    release();

    const PORT = Number(process.env.PORT) || 5000;
    // Start the server after successful database connection
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  });
};

// إضافة معالجة الإغلاق بشكل نظيف
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

// بدء الاتصال
connectWithRetry();

// Export the app and pool for testing purposes
export default app;
export { pool };