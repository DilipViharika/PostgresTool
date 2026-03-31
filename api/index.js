/**
 * Vercel Serverless Function — wraps the Express app from backend/server.js
 *
 * Vercel sets VERCEL=1 automatically, so server.js skips its own startup()
 * (HTTP listen, WebSocket server, etc.) and just exports the configured Express app.
 *
 * This catch-all handler forwards every /api/* request to Express.
 */
import app from '../backend/server.js';

export default app;
