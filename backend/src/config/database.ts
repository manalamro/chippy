import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/** Render internal URLs use hostnames like dpg-xxx-a (no render.com suffix). */
function isRenderInternalUrl(connectionString: string): boolean {
  try {
    const { hostname } = new URL(connectionString);
    return hostname.startsWith('dpg-') && !hostname.includes('render.com');
  } catch {
    return false;
  }
}

function resolveSsl(connectionString: string): PoolConfig['ssl'] {
  if (process.env.DATABASE_SSL === 'true') {
    return { rejectUnauthorized: false };
  }
  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }
  // Internal Render Postgres must not use SSL — otherwise the server drops the connection.
  if (isRenderInternalUrl(connectionString)) {
    return false;
  }
  // External/cloud URLs (Render external, Supabase, Heroku, etc.)
  return { rejectUnauthorized: false };
}

function createPoolConfig(): PoolConfig {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: resolveSsl(process.env.DATABASE_URL),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  };
}

const pool = new Pool(createPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

function logDatabaseTarget(connectionString: string): void {
  try {
    const { hostname } = new URL(connectionString);
    const ssl = resolveSsl(connectionString);
    console.log(`DB target: ${hostname} | SSL: ${ssl === false ? 'off' : 'on'}`);

    if (process.env.RENDER && hostname.includes('-postgres.render.com')) {
      console.error(
        'Wrong DATABASE_URL: you are using the External URL on Render. ' +
          'In Postgres → Connections, copy Internal Database URL ' +
          '(hostname should be dpg-xxxxx-a without .oregon-postgres.render.com).'
      );
    }
  } catch {
    console.log('DB target: invalid DATABASE_URL format');
  }
}

export async function testDatabaseConnection(): Promise<void> {
  if (process.env.DATABASE_URL) {
    logDatabaseTarget(process.env.DATABASE_URL);
  }

  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('Successfully connected to the database');
  } finally {
    client.release();
  }
}

export default pool;
