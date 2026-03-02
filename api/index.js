/**
 * Vercel Serverless Entry Point
 * ─────────────────────────────
 * Re-exports the Express app from the backend so Vercel's
 * auto-detected `api/` directory picks it up as a serverless function.
 */
export { default } from '../backend/server.js';
