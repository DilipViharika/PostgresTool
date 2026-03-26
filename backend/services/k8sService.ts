import { Pool } from 'pg';

export async function getContainerMetrics(pool: Pool): Promise<any> {
    return { isContainer: false };
}

export async function getPodInfo(pool: Pool): Promise<any> {
    return { hostname: 'unknown' };
}

export async function getResourceLimits(pool: Pool): Promise<any> {
    return {};
}

export async function getConnectionsByPod(pool: Pool): Promise<any[]> {
    return [];
}

export async function getReplicaTopology(pool: Pool): Promise<any> {
    return {};
}

export async function getK8sHealthCheck(pool: Pool): Promise<any> {
    return { status: 'unknown' };
}

export async function getContainerResourceHistory(pool: Pool, hours: number): Promise<any[]> {
    return [];
}
