/**
 * MongoDBAdapter.ts
 *
 * MongoDB-specific adapter.
 * Provides monitoring capabilities for MongoDB and compatible databases.
 *
 * Note: Full TypeScript implementation deferred. See MongoDBAdapter.js for details.
 */

import { BaseAdapter } from './BaseAdapter.js';

export class MongoDBAdapter extends BaseAdapter {
  constructor(config: any) {
    super(config);
    this.dbType = 'mongodb';
  }

  getDriverName(): string {
    return 'MongoDB';
  }

  async connect(): Promise<void> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async disconnect(): Promise<void> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getOverviewStats(): Promise<any> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getPerformanceStats(): Promise<any> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getTableStats(): Promise<any[]> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getIndexStats(): Promise<any[]> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getActiveConnections(): Promise<any[]> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getLockInfo(): Promise<any[]> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getReplicationStatus(): Promise<any> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getDatabaseList(): Promise<any[]> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getServerVersion(): Promise<any> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async executeQuery(sql: string, params: any[] = []): Promise<any> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  async getKeyMetrics(): Promise<any[]> {
    throw new Error('MongoDB adapter - implementation pending');
  }

  getCapabilities(): any {
    return {
      replication: true,
      indexes: true,
      locks: false,
      queryPlan: true,
      schemas: false,
      storedProcedures: false,
      partitioning: false,
      sharding: true,
    };
  }
}

export default MongoDBAdapter;
