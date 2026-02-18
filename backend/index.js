// backend/api/index.js
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      success: true,
      message: 'PostgresTool Backend API',
      timestamp: result.rows[0].now,
      dbConnected: true
    });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  } finally {
    await pool.end();
  }
}
