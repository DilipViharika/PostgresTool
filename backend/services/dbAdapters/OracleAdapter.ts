/**
 * OracleAdapter.ts
 *
 * Oracle Database-specific adapter.
 * Provides monitoring capabilities for Oracle Database.
 *
 * Note: Full TypeScript implementation deferred. See OracleAdapter.js for details.
 */

import { BaseAdapter } from './BaseAdapter.js';

export class OracleAdapter extends BaseAdapter {
  constructor(config: any) {
    super(config);
    this.dbType = 'oracle';
  }

  getDriverName(): string {
    return 'Oracle Database';
  }

  async connect(): Promise<void> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async disconnect(): Promise<void> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getOverviewStats(): Promise<any> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getPerformanceStats(): Promise<any> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getTableStats(): Promise<any[]> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getIndexStats(): Promise<any[]> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getActiveConnections(): Promise<any[]> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getLockInfo(): Promise<any[]> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getReplicationStatus(): Promise<any> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getDatabaseList(): Promise<any[]> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getServerVersion(): Promise<any> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async executeQuery(sql: string, params: any[] = []): Promise<any> {
    throw new Error('Oracle adapter - implementation pending');
  }

  async getKeyMetrics(): Promise<any[]> {
    throw new Error('Oracle adapter - implementation pending');
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

export default OracleAdapter;
