/**
 * Example: Express server with VIGIL integration
 * Demonstrates auto-tracking of HTTP requests and error handling
 */
import express from 'express';
import VigilSDK from '../src/index.js';

// Initialize VIGIL SDK
const vigil = new VigilSDK({
  apiKey: process.env.VIGIL_API_KEY || 'sk_live_demo_key',
  endpoint: process.env.VIGIL_ENDPOINT || 'https://vigil.example.com',
  appName: 'express-example',
  environment: process.env.NODE_ENV || 'development',
  batchSize: 10,
  flushInterval: 5000,
  debug: true,
});

// Create Express app
const app = express();

// Add VIGIL middleware (must be early in the chain)
app.use(vigil.expressMiddleware());

// Capture uncaught exceptions
vigil.captureUncaughtExceptions();

// Routes
app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'Alice' }] });
});

app.post('/api/users', (req, res) => {
  vigil.trackAudit({
    title: 'User Created',
    message: 'New user account created',
    metadata: { ip: req.ip },
  });
  res.status(201).json({ id: 2, name: 'Bob' });
});

app.get('/api/error', (req, res) => {
  const error = new Error('Simulated error');
  vigil.trackError({
    error,
    severity: 'error',
    metadata: { endpoint: req.path },
  });
  res.status(500).json({ error: error.message });
});

app.get('/api/metric', (req, res) => {
  vigil.trackMetric({
    title: 'API Response Time',
    value: Math.random() * 500,
    unit: 'ms',
  });
  res.json({ metric: 'recorded' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM: Shutting down...');
  await vigil.shutdown();
  process.exit(0);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  vigil.start();
});
