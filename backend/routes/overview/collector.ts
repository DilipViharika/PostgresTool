import { Pool } from 'pg';

const COLLECT_INTERVAL_MS = Number(process.env.COLLECT_INTERVAL_MS || 30_000);

let collectTimer: NodeJS.Timeout | null = null;

export function startCollector(): void {
    console.log('[collector] Starting');
    if (collectTimer) clearInterval(collectTimer);
}

export function stopCollector(): void {
    if (collectTimer) clearInterval(collectTimer);
    console.log('[collector] Stopped');
}
