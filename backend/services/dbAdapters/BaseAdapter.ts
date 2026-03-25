/**
 * BaseAdapter.ts
 *
 * Abstract base class for database adapters. All database-specific adapters inherit from this
 * and implement the required methods to provide a standardized monitoring interface.
 *
 * All methods return standardized shapes for database-agnostic consumption by the frontend and
 * alert engine.
 */

interface AdapterConfig {
  [key: string]: any;
}

interface KeyMetric {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  category: string;
  severity: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  description: string;
  dbSpecific: boolean;
}

interface QueryResult {
  rows: any[];
  fields?: any[];
  rowCount?: number;
  duration?: number;
}

interface DatabaseInfo {
  name: string;
  size?: number;
  [key: string]: any;
}

interface TableStat {
  [key: string]: any;
}

interface IndexStat {
  [key: string]: any;
}

interface ConnectionInfo {
  [key: string]: any;
}

interface LockInfo {
  [key: string]: any;
}

interface ServerVersionInfo {
  version: string;
  [key: string]: any;
}

interface OverviewStats {
  [key: string]: any;
}

interface PerformanceStats {
  [key: string]: any;
}

interface ReplicationStatus {
  [key: string]: any;
}

interface Capabilities {
  replication: boolean;
  vacuum?: boolean; // PostgreSQL-specific
  indexes: boolean;
  locks: boolean;
  queryPlan: boolean;
  wal?: boolean; // PostgreSQL-specific (Write-Ahead Log)
  schemas: boolean;
  storedProcedures: boolean;
  partitioning: boolean;
  sharding?: boolean; // MongoDB-specific
}

export class BaseAdapter {
  protected config: AdapterConfig;
  protected dbType: string;
  protected connected: boolean;

  /**
   * Initialize the adapter with a connection configuration
   * @param {AdapterConfig} config - Database connection configuration
   */
  constructor(config: AdapterConfig) {
    this.config = config;
    this.dbType = 'unknown';
    this.connected = false;
  }

  /**
   * Establish a connection to the database
   * @returns {Promise<void>}
   * @throws {Error} If connection fails
   */
  async connect(): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async disconnect(): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Get overview statistics about the database server
   * @returns {Promise<OverviewStats>} Overview stats
   */
  async getOverviewStats(): Promise<OverviewStats> {
    throw new Error('Not implemented');
  }

  /**
   * Get performance-related statistics
   * @returns {Promise<PerformanceStats>} Performance stats
   */
  async getPerformanceStats(): Promise<PerformanceStats> {
    throw new Error('Not implemented');
  }

  /**
   * Get statistics for all tables in the database
   * @returns {Promise<TableStat[]>} Array of table stat objects
   */
  async getTableStats(): Promise<TableStat[]> {
    throw new Error('Not implemented');
  }

  /**
   * Get statistics for all indexes in the database
   * @returns {Promise<IndexStat[]>} Array of index stat objects
   */
  async getIndexStats(): Promise<IndexStat[]> {
    throw new Error('Not implemented');
  }

  /**
   * Get list of currently active connections
   * @returns {Promise<ConnectionInfo[]>} Array of connection objects
   */
  async getActiveConnections(): Promise<ConnectionInfo[]> {
    throw new Error('Not implemented');
  }

  /**
   * Get information about locks held or waited on
   * @returns {Promise<LockInfo[]>} Array of lock objects
   */
  async getLockInfo(): Promise<LockInfo[]> {
    throw new Error('Not implemented');
  }

  /**
   * Get replication status (if applicable)
   * @returns {Promise<ReplicationStatus>} Replication status
   */
  async getReplicationStatus(): Promise<ReplicationStatus> {
    throw new Error('Not implemented');
  }

  /**
   * Get list of databases/schemas on the server
   * @returns {Promise<DatabaseInfo[]>} Array of database objects
   */
  async getDatabaseList(): Promise<DatabaseInfo[]> {
    throw new Error('Not implemented');
  }

  /**
   * Get the database server version
   * @returns {Promise<ServerVersionInfo>} Version information
   */
  async getServerVersion(): Promise<ServerVersionInfo> {
    throw new Error('Not implemented');
  }

  /**
   * Execute an arbitrary SQL query
   * @param {string} sql - The SQL to execute
   * @param {any[]} params - Optional parameters for prepared statement
   * @returns {Promise<QueryResult>} Query result with rows, fields, rowCount, and duration
   */
  async executeQuery(sql: string, params: any[] = []): Promise<QueryResult> {
    throw new Error('Not implemented');
  }

  /**
   * Get key metrics specific to this database type
   * Each adapter returns its own set of database-specific metrics
   * @returns {Promise<KeyMetric[]>} Array of metric objects
   *
   * Metric object shape:
   * {
   *   id: string,                              // unique identifier
   *   label: string,                           // display name
   *   value: number|string,                    // metric value
   *   unit: string,                            // unit of measurement
   *   category: string,                        // 'performance' | 'connections' | 'storage' | 'replication'
   *   severity: string,                        // 'ok' | 'warning' | 'critical'
   *   thresholds: {warning: number, critical: number},
   *   description: string,                     // human-readable description
   *   dbSpecific: boolean,                     // true if not available on all db types
   * }
   */
  async getKeyMetrics(): Promise<KeyMetric[]> {
    throw new Error('Not implemented');
  }

  /**
   * Get the capabilities/features supported by this database
   * @returns {Capabilities} Capabilities object
   *
   * Shape:
   * {
   *   replication: boolean,
   *   vacuum: boolean,               // PostgreSQL-specific
   *   indexes: boolean,
   *   locks: boolean,
   *   queryPlan: boolean,
   *   wal: boolean,                  // PostgreSQL-specific (Write-Ahead Log)
   *   schemas: boolean,
   *   storedProcedures: boolean,
   *   partitioning: boolean,
   *   sharding: boolean,             // MongoDB-specific
   * }
   */
  getCapabilities(): Capabilities {
    throw new Error('Not implemented');
  }

  /**
   * Helper: Format a timestamp in a standard way across adapters
   * @param {Date|string|number} timestamp
   * @returns {string | null} ISO 8601 formatted timestamp
   */
  formatTimestamp(timestamp: Date | string | number | null | undefined): string | null {
    if (!timestamp) return null;
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp instanceof Date) return timestamp.toISOString();
    return new Date(timestamp).toISOString();
  }

  /**
   * Helper: Normalize a number to specified decimal places
   * @param {number} value
   * @param {number} decimals
   * @returns {number | null}
   */
  round(value: number | null | undefined, decimals: number = 2): number | null {
    if (value === null || value === undefined) return null;
    return Number(Number(value).toFixed(decimals));
  }

  /**
   * Helper: Safely get a numeric value, defaulting to 0 if null/undefined
   * @param {any} value
   * @param {number} defaultValue
   * @returns {number}
   */
  toNumber(value: any, defaultValue: number = 0): number {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Helper: Get driver name for error messages
   * @returns {string}
   */
  getDriverName(): string {
    return 'Unknown Database';
  }
}

export default BaseAdapter;
