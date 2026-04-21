/**
 * middleware/ipAllowList.js
 * ─────────────────────────
 * Per-workspace IP allow-listing. Pure JavaScript — no external deps.
 *
 * If the active workspace has one or more rows in `ip_allowlist`, the
 * request's client IP must match at least one CIDR or the request is
 * rejected with 403 before any handler runs. Empty list = open (fail open
 * per workspace, fail closed once a single rule exists).
 *
 * Supports IPv4 and IPv6 CIDRs. Accepts req.ip (Express sets this when
 * `trust proxy` is configured) or falls back to socket.remoteAddress.
 */

import { query } from '../db.js';

const cache = new Map(); // workspaceId -> { cidrs: [...], ts }
const CACHE_MS = 30_000;

export function ipAllowListMiddleware() {
    return async function ipAllowList(req, res, next) {
        try {
            const wsId = req.workspace?.id;
            if (!wsId) return next();
            const cidrs = await getCidrs(wsId);
            if (cidrs.length === 0) return next(); // no rules → open

            const ip = (req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
            if (!ip) return res.status(403).json({ error: 'ip_allowlist_no_address' });

            for (const c of cidrs) {
                if (ipInCidr(ip, c)) return next();
            }
            return res.status(403).json({
                error: 'ip_not_allowed',
                ip,
            });
        } catch (err) { next(err); }
    };
}

async function getCidrs(wsId) {
    const hit = cache.get(wsId);
    if (hit && Date.now() - hit.ts < CACHE_MS) return hit.cidrs;
    const { rows } = await query(
        `SELECT cidr FROM pgmonitoringtool.ip_allowlist WHERE workspace_id = $1`,
        [wsId]
    );
    const cidrs = rows.map(r => r.cidr);
    cache.set(wsId, { cidrs, ts: Date.now() });
    return cidrs;
}

// ─────────────────────────────────────────────────────────────────────────────
// CIDR containment
// ─────────────────────────────────────────────────────────────────────────────
export function ipInCidr(ip, cidr) {
    if (!cidr) return false;
    const [net, bits] = cidr.split('/');
    const maskBits = bits === undefined ? (net.includes(':') ? 128 : 32) : Number(bits);
    try {
        if (ip.includes(':') || net.includes(':')) {
            return v6InCidr(ip, net, maskBits);
        }
        return v4InCidr(ip, net, maskBits);
    } catch {
        return false;
    }
}

function v4ToInt(ip) {
    const p = ip.split('.').map(Number);
    if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) {
        throw new Error('invalid v4');
    }
    return (((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]) >>> 0;
}

function v4InCidr(ip, net, bits) {
    const ipi = v4ToInt(ip);
    const neti = v4ToInt(net);
    if (bits === 0) return true;
    const mask = (~((1 << (32 - bits)) - 1)) >>> 0;
    return (ipi & mask) === (neti & mask);
}

function v6Expand(ip) {
    // Expand :: and zero-fill each group.
    if (ip.includes('::')) {
        const [l, r] = ip.split('::');
        const left = l ? l.split(':') : [];
        const right = r ? r.split(':') : [];
        const missing = 8 - (left.length + right.length);
        ip = [...left, ...new Array(missing).fill('0'), ...right].join(':');
    }
    return ip.split(':').map(g => g.padStart(4, '0')).join('');
}

function v6InCidr(ip, net, bits) {
    const ipHex = v6Expand(ip);
    const netHex = v6Expand(net);
    const chars = Math.floor(bits / 4);
    const rem = bits % 4;
    if (ipHex.slice(0, chars) !== netHex.slice(0, chars)) return false;
    if (rem === 0) return true;
    const ipNibble = parseInt(ipHex[chars], 16);
    const netNibble = parseInt(netHex[chars], 16);
    const mask = (0xF << (4 - rem)) & 0xF;
    return (ipNibble & mask) === (netNibble & mask);
}
