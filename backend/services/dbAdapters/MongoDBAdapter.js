/**
 * MongoDBAdapter.js
 *
 * MongoDB-specific adapter using the official mongodb driver.
 * Note: The mongodb package should be added to dependencies.
 *
 * Metrics sourced from:
 * - serverStatus command for server statistics
 * - dbStats command for database statistics
 * - listCollections for collection information
 * - currentOp for active operations
 */

import { BaseAdapter } from './BaseAdapter.js';

let mongodb;
try {
    mongodb = await import('mongodb');
} catch (error) {
    mongodb = null;
}

export class MongoDBAdapter extends BaseAdapter {
    constructor(config) {
        super(config);
        this.dbType = 'mongodb';
        this.client = null;
        this.db = null;
    }

    getDriverName() {
        return 'MongoDB';
    }

    _checkDriver() {
        if (!mongodb) {
            throw new Error('MongoDB driver (mongodb) not installed. Install with: npm install mongodb');
        }
    }

    async connect() {
        this._checkDriver();
        try {
            const MongoClient = mongodb.MongoClient;
            const url = this._buildConnectionString();

            this.client = new MongoClient(url, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
            });

            await this.client.connect();
            this.db = this.client.db(this.config.database || 'admin');
            this.connected = true;
        } catch (error) {
            throw new Error(`MongoDB connection failed: ${error.message}`);
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            this.connected = false;
        }
    }

    _buildConnectionString() {
        if (this.config.connectionString) {
            return this.config.connectionString;
        }

        const user = this.config.user ? `${this.config.user}:${this.config.password || ''}@` : '';
        const host = this.config.host || 'localhost';
        const port = this.config.port || 27017;
        const database = this.config.database || 'admin';

        return `mongodb://${user}${host}:${port}/${database}`;
    }

    async getOverviewStats() {
        try {
            const serverStatus = await this.db.admin().serverStatus();
            const dbStats = await this.db.stats();

            const connections = serverStatus.connections || {};
            const opcounters = serverStatus.opcounters || {};
            const uptime = serverStatus.uptime || 0;

            const txnRate = uptime > 0 ?
                ((opcounters.insert || 0) + (opcounters.update || 0) + (opcounters.delete || 0)) / uptime :
                0;

            return {
                activeConnections: this.toNumber(connections.current, 0),
                totalConnections: this.toNumber(connections.available, 0),
                dbSizeBytes: this.toNumber(dbStats.dataSize, 0) + this.toNumber(dbStats.indexSize, 0),
                uptimeSeconds: this.toNumber(uptime),
                version: serverStatus.version || 'Unknown',
                cacheHitRatio: this._calculateCacheHitRatio(serverStatus),
                transactionsPerSec: this.round(txnRate),
                tuplesInserted: this.toNumber(opcounters.insert),
                tuplesUpdated: this.toNumber(opcounters.update),
                tuplesDeleted: this.toNumber(opcounters.delete),
                tuplesFetched: this.toNumber(opcounters.query),
            };
        } catch (error) {
            throw new Error(`Failed to get overview stats: ${error.message}`);
        }
    }

    async getPerformanceStats() {
        try {
            const serverStatus = await this.db.admin().serverStatus();
            const currentOp = await this.db.admin().command({ currentOp: 1 });

            const opcounters = serverStatus.opcounters || {};
            const uptime = serverStatus.uptime || 1;
            const txnRate = ((opcounters.insert || 0) + (opcounters.update || 0) + (opcounters.delete || 0)) / uptime;

            const activeOps = (currentOp.inprog || []).filter(op => op.active === true).length;
            const waitingOps = (currentOp.inprog || []).filter(op => op.waitingForLock === true).length;

            return {
                avgQueryTimeMs: this.toNumber(serverStatus.operationTime ? serverStatus.operationTime.getTime() : 0),
                activeQueries: activeOps,
                queriesWaiting: waitingOps,
                cacheHitRatio: this._calculateCacheHitRatio(serverStatus),
            };
        } catch (error) {
            throw new Error(`Failed to get performance stats: ${error.message}`);
        }
    }

    async getTableStats() {
        try {
            const collections = await this.db.listCollections().toArray();
            const stats = [];

            for (const coll of collections) {
                try {
                    const collStats = await this.db.command({
                        collStats: coll.name,
                        verbose: true,
                    });

                    stats.push({
                        schema: 'default',
                        name: coll.name,
                        rowEstimate: this.toNumber(collStats.count, 0),
                        totalSizeBytes: this.toNumber(collStats.totalSize, 0),
                        tableSizeBytes: this.toNumber(collStats.size, 0),
                        indexSizeBytes: this.toNumber(collStats.totalIndexSize, 0),
                        deadTuples: 0,
                        lastVacuum: null,
                        lastAutovacuum: null,
                        lastAnalyze: null,
                        lastAutoanalyze: null,
                    });
                } catch (error) {
                    console.error(`Error getting stats for collection ${coll.name}:`, error.message);
                }
            }

            return stats;
        } catch (error) {
            throw new Error(`Failed to get table stats: ${error.message}`);
        }
    }

    async getIndexStats() {
        try {
            const collections = await this.db.listCollections().toArray();
            const stats = [];

            for (const coll of collections) {
                try {
                    const indexes = await this.db.collection(coll.name).indexes();

                    for (const idx of indexes) {
                        stats.push({
                            schema: 'default',
                            table: coll.name,
                            name: idx.name,
                            sizeBytes: 0,
                            scans: 0,
                            rowsRead: 0,
                            rowsFetched: 0,
                        });
                    }
                } catch (error) {
                    console.error(`Error getting indexes for collection ${coll.name}:`, error.message);
                }
            }

            return stats;
        } catch (error) {
            throw new Error(`Failed to get index stats: ${error.message}`);
        }
    }

    async getActiveConnections() {
        try {
            const currentOp = await this.db.admin().command({ currentOp: 1 });
            const connections = [];

            const ops = currentOp.inprog || [];
            for (const op of ops) {
                if (op.active && op.operation) {
                    connections.push({
                        pid: this.toNumber(op.opid, 0),
                        user: op.user || 'unknown',
                        database: op.ns?.split('.')[0] || this.config.database || 'admin',
                        state: op.waitingForLock ? 'waiting' : 'active',
                        query: op.command ? JSON.stringify(op.command) : op.operation,
                        durationSeconds: this.toNumber(op.secs_running, 0),
                        clientAddr: op.client || null,
                    });
                }
            }

            return connections;
        } catch (error) {
            return [];
        }
    }

    async getLockInfo() {
        try {
            const currentOp = await this.db.admin().command({ currentOp: 1 });
            const locks = [];

            const ops = currentOp.inprog || [];
            const waitingOps = ops.filter(op => op.waitingForLock === true);

            for (const waitOp of waitingOps) {
                locks.push({
                    blockedPid: this.toNumber(waitOp.opid, 0),
                    blockingPid: null,
                    blockingUser: null,
                    blockedQuery: waitOp.operation,
                    blockingQuery: null,
                    lockMode: 'exclusive',
                });
            }

            return locks;
        } catch (error) {
            return [];
        }
    }

    async getReplicationStatus() {
        try {
            const replicaStatus = await this.db.admin().command({ replSetGetStatus: 1 });

            if (!replicaStatus || !replicaStatus.members) {
                return {
                    isReplica: false,
                    replicaAppName: null,
                    maxReplicationLagMb: 0,
                    replicaCount: 0,
                };
            }

            const members = replicaStatus.members;
            const primaryMember = members.find(m => m.state === 1); // Primary
            const replicaMembers = members.filter(m => m.state === 2); // Secondary

            // Calculate replication lag (simplified)
            const maxLag = replicaMembers.length > 0 ? 0 : 0;

            return {
                isReplica: primaryMember ? true : false,
                replicaAppName: primaryMember ? primaryMember.name : null,
                maxReplicationLagMb: maxLag,
                replicaCount: replicaMembers.length,
            };
        } catch (error) {
            return {
                isReplica: false,
                replicaAppName: null,
                maxReplicationLagMb: 0,
                replicaCount: 0,
            };
        }
    }

    async getDatabaseList() {
        try {
            const adminDb = this.client.db('admin');
            const dbList = await adminDb.admin().listDatabases();

            return (dbList.databases || []).map(db => ({
                name: db.name,
                sizeBytes: this.toNumber(db.sizeOnDisk, 0),
                isTemplate: false,
                connections: 0,
            }));
        } catch (error) {
            return [];
        }
    }

    async getServerVersion() {
        try {
            const serverStatus = await this.db.admin().serverStatus();
            const versionStr = serverStatus.version || 'Unknown';

            const parts = versionStr.split('.');
            const major = parseInt(parts[0], 10) || 0;
            const minor = parseInt(parts[1], 10) || 0;

            return {
                version: versionStr,
                versionNum: major * 10000 + minor * 100,
                major,
                minor,
                dbType: 'mongodb',
            };
        } catch (error) {
            return {
                version: 'Unknown',
                versionNum: 0,
                major: 0,
                minor: 0,
                dbType: 'mongodb',
            };
        }
    }

    async executeQuery(sql) {
        // MongoDB doesn't use SQL — this is a simplified stub
        const startTime = Date.now();
        const rows = [];
        const duration = Date.now() - startTime;

        return {
            rows,
            fields: [],
            rowCount: 0,
            duration,
        };
    }

    async getKeyMetrics() {
        const metrics = [];

        try {
            const serverStatus = await this.db.admin().serverStatus();

            // Cache hit ratio
            const cacheRatio = this._calculateCacheHitRatio(serverStatus);
            metrics.push({
                id: 'cache_hit_ratio',
                label: 'Cache Hit Ratio',
                value: cacheRatio,
                unit: '%',
                category: 'performance',
                severity: cacheRatio >= 99 ? 'ok' : cacheRatio >= 90 ? 'warning' : 'critical',
                thresholds: { warning: 90, critical: 80 },
                description: 'Memory cache page hit ratio',
                dbSpecific: false,
            });

            // Operations per second
            const opcounters = serverStatus.opcounters || {};
            const uptime = serverStatus.uptime || 1;
            const opsPerSec = ((opcounters.insert || 0) + (opcounters.query || 0) + (opcounters.update || 0) + (opcounters.delete || 0)) / uptime;

            metrics.push({
                id: 'operations_per_sec',
                label: 'Operations/Second',
                value: this.round(opsPerSec, 2),
                unit: 'ops/sec',
                category: 'performance',
                severity: 'ok',
                thresholds: { warning: 10000, critical: 50000 },
                description: 'Average operations per second',
                dbSpecific: false,
            });

            // Active connections
            const connections = serverStatus.connections || {};
            const activeConn = this.toNumber(connections.current, 0);
            metrics.push({
                id: 'active_connections',
                label: 'Active Connections',
                value: activeConn,
                unit: 'count',
                category: 'connections',
                severity: activeConn > 100 ? 'warning' : activeConn > 500 ? 'critical' : 'ok',
                thresholds: { warning: 100, critical: 500 },
                description: 'Number of active client connections',
                dbSpecific: false,
            });

            // Replication lag (if applicable)
            try {
                const replicaStatus = await this.db.admin().command({ replSetGetStatus: 1 });
                if (replicaStatus && replicaStatus.members) {
                    const primaryMember = replicaStatus.members.find(m => m.state === 1);
                    const secondaryMembers = replicaStatus.members.filter(m => m.state === 2);

                    if (secondaryMembers.length > 0 && primaryMember) {
                        metrics.push({
                            id: 'replication_lag_sec',
                            label: 'Replication Lag',
                            value: 0, // Simplified
                            unit: 'sec',
                            category: 'replication',
                            severity: 'ok',
                            thresholds: { warning: 10, critical: 60 },
                            description: 'Maximum replication lag across replica set members',
                            dbSpecific: true,
                        });
                    }
                }
            } catch { /* Replication not available */ }
        } catch (error) {
            console.error('Error getting MongoDB metrics:', error.message);
        }

        return metrics;
    }

    getCapabilities() {
        return {
            replication: true,
            vacuum: false,
            indexes: true,
            locks: true,
            queryPlan: false,
            wal: false,
            schemas: false, // MongoDB doesn't have schemas in the traditional sense
            storedProcedures: false,
            partitioning: false,
            sharding: true,
        };
    }

    // Helper methods

    _calculateCacheHitRatio(serverStatus) {
        const wt = serverStatus.wiredTiger;
        if (!wt) return 0;

        const cache = wt.cache;
        if (!cache) return 0;

        const pagesRead = this.toNumber(cache.pages_read_into_cache, 1);
        const requestedPages = this.toNumber(cache.pages_requested_from_cache, 1);

        if (requestedPages === 0) return 0;

        const hitRatio = ((requestedPages - pagesRead) / requestedPages) * 100;
        return this.round(Math.max(0, hitRatio), 2);
    }
}

export default MongoDBAdapter;
