const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false // Required for many hosted Postgres services like Vercel or Neon
    }
});

// Example query
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error('Connection error', err.stack);
    else console.log('Connected to DB at:', res.rows[0].now);
});