/**
 * Database Adapter Factory
 *
 * This factory provides:
 * 1. Connection string parsing to detect database type
 * 2. Adapter instantiation for the appropriate database type
 * 3. Registry of supported databases
 *
 * The adapter pattern allows FATHOM to support multiple databases while maintaining
 * a unified monitoring interface across the frontend and backend.
 */

import PostgresAdapter from './PostgresAdapter.js';
import MySQLAdapter from './MySQLAdapter.js';
import MongoDBAdapter from './MongoDBAdapter.js';
import RedisAdapter from './RedisAdapter.js';
import ElasticsearchAdapter from './ElasticsearchAdapter.js';

/** Supported database types */
export const SUPPORTED_DB_TYPES = [
    'postgresql',
    'mysql',
    'mongodb',
    'redis',
    'elasticsearch',
];

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
    if (lower.startsWith('mongodb://') || lower.startsWith('mongodb+srv://')) {
        return 'mongodb';
    }
    if (lower.startsWith('redis://') || lower.startsWith('rediss://')) {
        return 'redis';
    }
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
        // Elasticsearch/OpenSearch connection strings are plain HTTP(S) URLs.
        // We only claim this type if the caller explicitly asked for it — the
        // bare URL shape is ambiguous, so callers should prefer getAdapter('elasticsearch', ...).
        return null;
    }

    return null;
}

/**
 * Get an adapter instance for the specified database type
 *
 * @param {string} dbType - Database type ('postgresql', 'mysql', 'mongodb')
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

        case 'mongodb':
        case 'mongo':
            return new MongoDBAdapter(config);

        case 'redis':
            return new RedisAdapter(config);

        case 'elasticsearch':
        case 'opensearch':
        case 'elastic':
            return new ElasticsearchAdapter(config);

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
            `Supported formats: postgres://, mysql://, mongodb://, redis://. ` +
            `For Elasticsearch, use getAdapter('elasticsearch', config) directly.`
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
