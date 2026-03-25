import { Pool } from 'pg';

export async function openTunnel(connId: string, config: any): Promise<number> {
    return 0;
}

export function closeTunnel(connId: string): boolean {
    return true;
}

export function getTunnelPort(connId: string): number | null {
    return null;
}

export function closeAll(): void {}
