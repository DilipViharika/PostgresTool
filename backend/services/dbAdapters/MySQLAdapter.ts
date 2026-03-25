/**
 * MySQLAdapter.ts
 *
 * MySQL/MariaDB-specific adapter.
 * Provides monitoring capabilities for MySQL and compatible databases.
 *
 * Note: Full TypeScript implementation deferred. See MySQLAdapter.js for details.
 */

import { BaseAdapter } from './BaseAdapter.js';

export class MySQLAdapter extends BaseAdapter {
  constructor(config: any) {
    super(config);
    this.dbType = 'mysql';
  }

  getDriverName(): string {
    return 'MySQL';
  }

  async connect(): Promise<void> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async disconnect(): Promise<void> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getOverviewStats(): Promise<any> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getPerformanceStats(): Promise<any> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getTableStats(): Promise<any[]> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getIndexStats(): Promise<any[]> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getActiveConnections(): Promise<any[]> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getLockInfo(): Promise<any[]> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getReplicationStatus(): Promise<any> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getDatabaseList(): Promise<any[]> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getServerVersion(): Promise<any> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async executeQuery(sql: string, params: any[] = []): Promise<any> {
    throw new Error('MySQL adapter - implementation pending');
  }

  async getKeyMetrics(): Promise<any[]> {
    throw new Error('MySQL adapter - implementation pending');
  }

  getCapabilities(): any {
    return {
      replication: true,
      indexes: true,
      locks: true,
      queryPlan: true,
      schemas: true,
      storedProcedures: true,
      partitioning: true,
    };
  }
}

export default MySQLAdapter;
