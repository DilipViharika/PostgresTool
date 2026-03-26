/**
 * Database Adapter Factory
 *
 * This factory provides:
 * 1. Connection string parsing to detect database type
 * 2. Adapter instantiation for the appropriate database type
 * 3. Registry of supported databases
 *
 * The adapter pattern allows VIGIL to support multiple databases while maintaining
 * a unified monitoring interface across the frontend and backend.
 */

import PostgresAdapter from './PostgresAdapter.js';
import MySQLAdapter from './MySQLAdapter.js';
import MongoDBAdapter from './MongoDBAdapter.js';
import { BaseAdapter } from './BaseAdapter.js';

interface AdapterConfig {
  [key: string]: any;
}

/** Supported database types */
export const SUPPORTED_DB_TYPES = ['postgresql', 'mysql', 'mongodb'];

/**
 * Detect the database type from a connection string
 *
 * Supports:
 * - postgres://user:pass@host:port/db
 * - postgresql://user:pass@host:port/db
 * - mysql://user:pass@host:port/db
 * - mongodb://user:pass@host:port/db
 * - mongodb+srv://user:pass@host/db (MongoDB with SRV records)
 *
 * @param {string} connectionString - Connection string to parse
 * @returns {string | null} Detected database type (lowercase), or null if unrecognized
 */
export function detectDbType(connectionString: string): string | null {
  if (!connectionString || typeof connectionString !== 'string') {
    return null;
  }

  const lower = connectionString.toLowerCase();

  if (lower.startsWith('postgres://') || lower.startsWith('postgresql://')) {
    return 'postgresql';
  }
  if (lower.startsWith('mysql://')) {
    return 'mysql';
  }
  if (lower.startsWith('mongodb://') || lower.startsWith('mongodb+srv://')) {
    return 'mongodb';
  }

  return null;
}

/**
 * Get an adapter instance for the specified database type
 *
 * @param {string} dbType - Database type ('postgresql', 'mysql', 'mongodb')
 * @param {AdapterConfig} config - Database connection configuration
 * @returns {BaseAdapter} Adapter instance
 * @throws {Error} If database type is not supported
 */
export function getAdapter(dbType: string, config: AdapterConfig = {}): BaseAdapter {
  const normalized = String(dbType).toLowerCase().trim();

  switch (normalized) {
    case 'postgresql':
    case 'postgres':
      return new PostgresAdapter(config);

    case 'mysql':
      return new MySQLAdapter(config);

    case 'mongodb':
    case 'mongo':
      return new MongoDBAdapter(config);

    default:
      throw new Error(
        `Unsupported database type: "${dbType}". Supported types: ${SUPPORTED_DB_TYPES.join(', ')}`
      );
  }
}

/**
 * Create an adapter by detecting the type from a connection string
 *
 * @param {string} connectionString - Connection string to parse
 * @param {AdapterConfig} config - Additional configuration
 * @returns {BaseAdapter} Adapter instance
 * @throws {Error} If type cannot be detected
 */
export function getAdapterFromString(connectionString: string, config: AdapterConfig = {}): BaseAdapter {
  const dbType = detectDbType(connectionString);
  if (!dbType) {
    throw new Error(
      `Cannot detect database type from connection string. ` +
        `Supported formats: postgres://, mysql://, mongodb://`
    );
  }
  return getAdapter(dbType, config);
}

export default {
  getAdapter,
  getAdapterFromString,
  detectDbType,
  SUPPORTED_DB_TYPES,
};
