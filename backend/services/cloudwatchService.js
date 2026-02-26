// services/cloudwatchService.js
// Fetches RDS metrics from AWS CloudWatch using the REST API (no SDK needed)
import crypto from 'crypto';

const REGION     = process.env.AWS_REGION            || 'ap-southeast-1';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const DB_ID      = process.env.CLOUDWATCH_DB_IDENTIFIER;

export function isConfigured() {
    return !!(ACCESS_KEY && SECRET_KEY && REGION && DB_ID);
}

/* ── AWS Signature V4 ── */
function sign(key, msg) {
    return crypto.createHmac('sha256', key).update(msg).digest();
}
function getSigningKey(secret, date, region, service) {
    const kDate    = sign(`AWS4${secret}`, date);
    const kRegion  = sign(kDate, region);
    const kService = sign(kRegion, service);
    return sign(kService, 'aws4_request');
}
function sha256hex(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}
async function cloudwatchRequest(params) {
    const service  = 'monitoring';
    const host     = `monitoring.${REGION}.amazonaws.com`;
    const endpoint = `https://${host}/`;

    const now     = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
    const dateStr = amzDate.slice(0, 8);

    // 1. Grab the session token if it exists in the environment
    const sessionToken = process.env.AWS_SESSION_TOKEN;

    // Build query string (sorted)
    const query = Object.entries({ Action: 'GetMetricStatistics', Version: '2010-08-01', ...params })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');

    const payloadHash = sha256hex('');

    // 2. Build canonical and signed headers dynamically
    let canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
    let signedHeaders    = 'host;x-amz-date';

    if (sessionToken) {
        canonicalHeaders += `x-amz-security-token:${sessionToken}\n`;
        signedHeaders    += ';x-amz-security-token';
    }

    const canonicalReq  = `GET\n/\n${query}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const credScope     = `${dateStr}/${REGION}/${service}/aws4_request`;
    const stringToSign  = `AWS4-HMAC-SHA256\n${amzDate}\n${credScope}\n${sha256hex(canonicalReq)}`;
    const signingKey    = getSigningKey(SECRET_KEY, dateStr, REGION, service);
    const signature     = sign(signingKey, stringToSign).toString('hex');

    const authHeader    = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // 3. Attach the token to the actual outgoing request
    const headers = {
        'x-amz-date': amzDate,
        Authorization: authHeader
    };
    if (sessionToken) {
        headers['x-amz-security-token'] = sessionToken;
    }

    const res = await fetch(`${endpoint}?${query}`, { headers });

    const text = await res.text();
    if (!res.ok) throw new Error(`CloudWatch error ${res.status}: ${text.slice(0, 300)}`);
    return text; // XML
}
/* ── Parse CloudWatch XML datapoints ── */
function parseDatapoints(xml) {
    const points = [];
    const memberRx = /<member>([\s\S]*?)<\/member>/g;
    let m;
    while ((m = memberRx.exec(xml)) !== null) {
        const block     = m[1];
        const ts        = (/<Timestamp>(.*?)<\/Timestamp>/.exec(block))?.[1];
        const avg       = (/<Average>(.*?)<\/Average>/.exec(block))?.[1];
        const sum       = (/<Sum>(.*?)<\/Sum>/.exec(block))?.[1];
        const val       = avg ?? sum;
        if (ts && val !== undefined) {
            points.push({ timestamp: ts, value: parseFloat(val) });
        }
    }
    return points.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/* ── Metric stat map ── */
const STAT_MAP = {
    CPUUtilization:            'Average',
    DatabaseConnections:       'Average',
    FreeableMemory:            'Average',
    ReadIOPS:                  'Average',
    WriteIOPS:                 'Average',
    ReadLatency:               'Average',
    FreeStorageSpace:          'Average',
    NetworkReceiveThroughput:  'Average',
    DBLoad:                    'Average',
};

export async function getMetric(metricName, periodSeconds = 3600) {
    if (!isConfigured()) throw new Error('CloudWatch not configured');

    const stat       = STAT_MAP[metricName] || 'Average';
    const endTime    = new Date();
    const startTime  = new Date(endTime.getTime() - periodSeconds * 1000);
    // CloudWatch period must be >= 60s and a multiple of 60
    const cwPeriod   = Math.max(60, Math.round(periodSeconds / 60) * 60 / Math.min(60, Math.round(periodSeconds / 60)));

    const xml = await cloudwatchRequest({
        MetricName:                  metricName,
        Namespace:                   'AWS/RDS',
        'Statistics.member.1':       stat,        // ← fixed: was Statistics_member_1
        'Dimensions.member.1.Name':  'DBInstanceIdentifier',
        'Dimensions.member.1.Value': DB_ID,
        StartTime:                   startTime.toISOString(),
        EndTime:                     endTime.toISOString(),
        Period:                      String(cwPeriod),
    });

    return parseDatapoints(xml);
}

export function getStatus() {
    const token = process.env.AWS_SESSION_TOKEN;
    return {
        configured:   isConfigured(),
        region:       REGION        || null,
        dbIdentifier: DB_ID         || null,
        hasKey:       !!ACCESS_KEY,
        hasSecret:    !!SECRET_KEY,
        hasToken:     !!token,
        tokenStart:   token ? token.substring(0, 5) : 'none'
    };
}