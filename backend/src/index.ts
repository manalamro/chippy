// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import dotenv from 'dotenv';
// import { Pool } from 'pg';
// import authRoutes from './routes/auth';
// import productRoutes from './routes/products';
// import cartRoutes from './routes/cart';
// import orderRoutes from './routes/orders';
// import adminRoutes from './routes/admin';
// import addressRoute from './routes/address';

// // Load environment variables
// dotenv.config();

// // Create Express app
// const app = express();

// // Database configuration
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || '5432'),
// });

// // CORS configuration - يسمح بـ Vite + React و Production
// const allowedOrigins: (string | RegExp)[] = [
//   'http://localhost:5173', // Vite dev server
//   'http://localhost:3000', // React dev server آخر (إذا موجود)
//   'https://chippy-i378.onrender.com', // Production
//   /\.vercel\.app$/ // أي subdomain على Vercel
// ];

// const corsOptions = {
//   origin: (origin: string | undefined, callback: Function) => {
//     // السماح بالطلبات بدون Origin (مثل Vite dev server)
//     if (!origin || allowedOrigins.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) {
//       callback(null, true);
//     } else {
//       callback(new Error(`Origin ${origin} not allowed by CORS`));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
//   credentials: true,
//   optionsSuccessStatus: 200
// };

// // Middleware
// app.use(helmet());
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Logging middleware (اختياري)
// app.use((req, res, next) => {
//   const origin = req.get('origin') || 'no-origin';
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin}`);
//   next();
// });

// // Routes
// app.use('/auth', authRoutes);
// app.use('/products', productRoutes);
// app.use('/cart', cartRoutes);
// app.use('/orders', orderRoutes);
// app.use('/admin', adminRoutes);
// app.use('/addresses', addressRoute);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ message: 'Server is running' });
// });

// // Error handling middleware
// app.use((
//   err: any,
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   console.error(err.stack);

//   let statusCode = err.statusCode || 500;
//   let message = err.message || 'Internal Server Error';

//   if (err.code === '23505') { // unique_violation
//     statusCode = 409;
//     message = 'Resource already exists';
//   } else if (err.code === '23503') { // foreign_key_violation
//     statusCode = 400;
//     message = 'Invalid reference';
//   }

//   res.status(statusCode).json({
//     success: false,
//     message,
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Test database connection and start server
// const PORT = 5000;

// pool.connect((err, client, release) => {
//   if (err) {
//     return console.error('Error acquiring client', err.stack);
//   }
//   console.log('Connected to database');
//   release();
  
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// });

// // Export the app for testing purposes
// export default app;


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
import addressRoute from './routes/address';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Database configuration - استخدم DATABASE_URL مباشرة
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

// دالة للاتصال مع إعادة المحاولة
async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✅ Connected to database successfully!');
      const { rows } = await client.query('SELECT current_database() AS db');
      console.log('📊 Database:', rows[0]?.db);
      client.release();
      return true;
    } catch (err: any) {
      console.log(`❌ Connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Could not connect to database after multiple retries');
}

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
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.status(200).json({ 
      message: 'Server is running',
      database: 'connected'
    });
  } catch (err) {
    res.status(503).json({ 
      message: 'Server is running but database is unavailable',
      error: (err as Error).message
    });
  }
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

// Start server with database connection retry
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔄 Attempting to connect to database...');
    console.log('📝 DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    await connectWithRetry();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('💥 Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

// Export for testing
export default app;
export { pool };