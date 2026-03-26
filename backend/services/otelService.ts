import { Pool } from 'pg';

export async function ingestMetrics(pool: Pool, metrics: any[]): Promise<number> {
    return 0;
}

export async function queryMetrics(pool: Pool, opts: any): Promise<any> {
    return { rows: [], total: 0, limit: 0, offset: 0 };
}

export async function getMetricNames(pool: Pool): Promise<string[]> {
    return [];
}

export async function getServiceMap(pool: Pool): Promise<string[]> {
    return [];
}

export async function getMetricStats(pool: Pool, name: string, interval: string, opts: any): Promise<any[]> {
    return [];
}

export async function deleteOldMetrics(pool: Pool, retentionDays: number): Promise<number> {
    return 0;
}
