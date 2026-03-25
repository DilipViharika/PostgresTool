/**
 * @vigil/types — Shared type definitions for VIGIL
 * ──────────────────────────────────────────────────
 * Single source of truth for all data shapes flowing between
 * frontend and backend. Import from '@vigil/types' in both.
 */

// Re-export all domain modules
export * from './auth.js';
export * from './connection.js';
export * from './database.js';
export * from './alert.js';
export * from './monitoring.js';
export * from './api.js';
// config.ts is exported separately — it depends on React types (frontend-only)
// Import it directly: import type { ... } from '@vigil/types/config';
