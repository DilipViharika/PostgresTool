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
import MSSQLAdapter from './MSSQLAdapter.js';
import OracleAdapter from './OracleAdapter.js';
import MongoDBAdapter from './MongoDBAdapter.js';

/** Supported database types */
export const SUPPORTED_DB_TYPES = [
    'postgresql',
    'mysql',
    'mssql',
    'oracle',
    'mongodb',
];

/**
 * Detect the database type from a connection string
 *
 * Supports:
 * - postgres://user:pass@host:port/db
 * - postgresql://user:pass@host:port/db
 * - mysql://user:pass@host:port/db
 * - mssql://user:pass@host:port/db
 * - sqlserver://user:pass@host:port/db (alias for MSSQL)
 * - oracle://user:pass@host:port/sid
 * - oracledb://user:pass@host:port/sid (alias for Oracle)
 * - mongodb://user:pass@host:port/db
 * - mongodb+srv://user:pass@host/db (MongoDB with SRV records)
 *
 * @param {string} connectionString - Connection string to parse
 * @returns {string} Detected database type (lowercase), or null if unrecognized
 */
export function detectDbType(connectionString) {
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
    if (lower.startsWith('mssql://') || lower.startsWith('sqlserver://')) {
        return 'mssql';
    }
    if (lower.startsWith('oracle://') || lower.startsWith('oracledb://')) {
        return 'oracle';
    }
    if (lower.startsWith('mongodb://') || lower.startsWith('mongodb+srv://')) {
        return 'mongodb';
    }

    return null;
}

/**
 * Get an adapter instance for the specified database type
 *
 * @param {string} dbType - Database type ('postgresql', 'mysql', 'mssql', 'oracle', 'mongodb')
 * @param {Object} config - Database connection configuration
 * @returns {BaseAdapter} Adapter instance
 * @throws {Error} If database type is not supported
 */
export function getAdapter(dbType, config = {}) {
    const normalized = String(dbType).toLowerCase().trim();

    switch (normalized) {
        case 'postgresql':
        case 'postgres':
            return new PostgresAdapter(config);

        case 'mysql':
            return new MySQLAdapter(config);

        case 'mssql':
        case 'sqlserver':
            return new MSSQLAdapter(config);

        case 'oracle':
        case 'oracledb':
            return new OracleAdapter(config);

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
 * @param {Object} config - Additional configuration
 * @returns {BaseAdapter} Adapter instance, or null if type cannot be detected
 */
export function getAdapterFromString(connectionString, config = {}) {
    const dbType = detectDbType(connectionString);
    if (!dbType) {
        throw new Error(
            `Cannot detect database type from connection string. ` +
            `Supported formats: postgres://, mysql://, mssql://, oracle://, mongodb://`
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
