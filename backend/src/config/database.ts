import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// استخدم DATABASE_URL للتوافق مع بيئات الاستضافة، مع SSL عند الاتصال عبر Render/Heroku
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
});

export default pool;