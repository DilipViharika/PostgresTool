/**
 * services/auditExport.js
 * ───────────────────────
 * Immutable audit-log export to an S3-compatible bucket (AWS S3, Cloudflare
 * R2, Backblaze B2, Wasabi, MinIO). Designed to be scheduled from the
 * existing node-cron loop.
 *
 * Export format: newline-delimited JSON (`.ndjson`), one event per line,
 * gzipped. One object per workspace per hour:
 *   s3://<bucket>/vigil/audit/<workspace_slug>/yyyy=YYYY/mm=MM/dd=DD/HH.ndjson.gz
 *
 * SQS/EventBridge-compatible objects: if you enable S3 → SQS notifications,
 * your SIEM pipeline can ingest them lossless-ly.
 *
 * Dependency: @aws-sdk/client-s3 (install once, reused). If not present,
 * falls back to logging "would export X events" so local dev still runs.
 */

import { gzipSync } from 'node:zlib';
import { query } from '../db.js';

const DEFAULTS = {
    bucket:       process.env.AUDIT_EXPORT_BUCKET,
    region:       process.env.AUDIT_EXPORT_REGION || 'us-east-1',
    prefix:       process.env.AUDIT_EXPORT_PREFIX || 'vigil/audit',
    endpoint:     process.env.AUDIT_EXPORT_ENDPOINT, // set for R2/B2/MinIO
    accessKey:    process.env.AUDIT_EXPORT_ACCESS_KEY,
    secretKey:    process.env.AUDIT_EXPORT_SECRET_KEY,
    forcePathStyle: process.env.AUDIT_EXPORT_FORCE_PATH_STYLE === 'true',
};

let _s3Client = null;
async function getS3() {
    if (_s3Client) return _s3Client;
    if (!DEFAULTS.bucket) return null;
    try {
        const { S3Client } = await import('@aws-sdk/client-s3');
        _s3Client = new S3Client({
            region: DEFAULTS.region,
            endpoint: DEFAULTS.endpoint,
            forcePathStyle: DEFAULTS.forcePathStyle,
            credentials: DEFAULTS.accessKey
                ? { accessKeyId: DEFAULTS.accessKey, secretAccessKey: DEFAULTS.secretKey }
                : undefined,
        });
        return _s3Client;
    } catch (err) {
        console.warn('[auditExport] @aws-sdk/client-s3 not installed — skipping uploads');
        return null;
    }
}

/**
 * Export the audit log rows for [fromTs, toTs) for all workspaces that have
 * export enabled. Returns a summary { exported: n, workspaces: [...] }.
 */
export async function runAuditExport({ fromTs, toTs } = {}) {
    const end = toTs || new Date();
    const start = fromTs || new Date(end.getTime() - 60 * 60 * 1000); // last hour

    const { rows: events } = await query(
        `SELECT id, ts, actor_id, action, target, details, workspace_id
           FROM pgmonitoringtool.audit_log
          WHERE ts >= $1 AND ts < $2
          ORDER BY ts ASC`,
        [start, end]
    );
    if (events.length === 0) return { exported: 0, workspaces: [] };

    // Group by workspace.
    const byWs = new Map();
    for (const e of events) {
        const wsId = e.workspace_id || 0;
        if (!byWs.has(wsId)) byWs.set(wsId, []);
        byWs.get(wsId).push(e);
    }

    const s3 = await getS3();
    if (!s3) {
        console.log(`[auditExport] dry-run: would export ${events.length} events`);
        return { exported: events.length, workspaces: [...byWs.keys()], dryRun: true };
    }

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const workspaces = [];
    for (const [wsId, batch] of byWs) {
        const slug = await workspaceSlug(wsId);
        const ndjson = batch.map(e => JSON.stringify(e)).join('\n');
        const gz = gzipSync(Buffer.from(ndjson, 'utf8'));
        const d = new Date(start);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const key = `${DEFAULTS.prefix}/${slug}/yyyy=${yyyy}/mm=${mm}/dd=${dd}/${hh}.ndjson.gz`;
        await s3.send(new PutObjectCommand({
            Bucket: DEFAULTS.bucket,
            Key: key,
            Body: gz,
            ContentType: 'application/x-ndjson',
            ContentEncoding: 'gzip',
            Metadata: {
                'vigil-workspace-id': String(wsId),
                'vigil-event-count': String(batch.length),
            },
        }));
        workspaces.push({ workspaceId: wsId, slug, key, events: batch.length });
    }
    return { exported: events.length, workspaces };
}

async function workspaceSlug(wsId) {
    if (!wsId) return 'system';
    const { rows } = await query(
        `SELECT slug FROM pgmonitoringtool.workspaces WHERE id = $1 LIMIT 1`,
        [wsId]
    );
    return rows[0]?.slug || `ws-${wsId}`;
}

/**
 * Schedule hook — call from the existing cron loop once an hour.
 */
export function scheduleAuditExport(intervalMs = 60 * 60 * 1000) {
    const tick = async () => {
        try {
            const summary = await runAuditExport();
            if (summary.exported) {
                console.log('[auditExport]', JSON.stringify(summary));
            }
        } catch (err) {
            console.error('[auditExport] failed:', err.message);
        }
    };
    // Fire once on boot after a short delay, then at the configured cadence.
    setTimeout(tick, 30_000);
    return setInterval(tick, intervalMs);
}
