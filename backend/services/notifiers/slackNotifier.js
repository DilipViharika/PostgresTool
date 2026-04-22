/**
 * slackNotifier.js
 * ─────────────────
 * Multi-tenant Slack notifier that plugs into the NotifierManager fan-out.
 *
 * Supports two delivery modes, chosen by which credentials are supplied:
 *
 *   1) Bot token + channel ID  (preferred — allows threaded replies, updates)
 *      - auth:  `botToken` (xoxb-…), `channel` (Cxxxx)
 *      - API:   POST https://slack.com/api/chat.postMessage
 *
 *   2) Incoming webhook URL    (simplest — legacy / quick setup)
 *      - auth:  `webhookUrl` (https://hooks.slack.com/services/T…/B…/…)
 *      - API:   POST <webhookUrl>
 *
 * Both paths produce the same Block Kit payload so the end-user experience
 * is identical. Credentials are passed in per instance — this notifier holds
 * NO environment-level secrets, which is what makes it safe for multi-tenant
 * per-organization destinations.
 *
 * Return shape mirrors the other notifiers: { ok, status, detail, ... }.
 */

import { BaseNotifier, postJson } from './baseNotifier.js';

const SLACK_CHAT_POST = 'https://slack.com/api/chat.postMessage';

const SEVERITY_COLOR = {
    debug:    '#9CA3AF',
    info:     '#38BDF8',
    warning:  '#F59E0B',
    error:    '#F97316',
    critical: '#EF4444',
    resolved: '#22C55E',
};

const SEVERITY_EMOJI = {
    debug:    ':grey_question:',
    info:     ':large_blue_circle:',
    warning:  ':large_yellow_circle:',
    error:    ':large_orange_circle:',
    critical: ':red_circle:',
    resolved: ':white_check_mark:',
};

/**
 * Build the Block Kit payload common to both delivery modes.
 * Exported for testing.
 */
export function buildSlackBlocks(alert) {
    const severity = (alert.resolved ? 'resolved' : alert.severity || 'info');
    const emoji = SEVERITY_EMOJI[severity] || ':bell:';
    const color = SEVERITY_COLOR[severity] || '#6B7280';
    const title = alert.title || alert.message || 'FATHOM alert';
    const headerText = `${emoji}  FATHOM — ${String(severity).toUpperCase()}`;

    const fields = [];
    if (alert.component) fields.push({ type: 'mrkdwn', text: `*Component*\n${alert.component}` });
    if (alert.source)    fields.push({ type: 'mrkdwn', text: `*Source*\n${alert.source}` });
    if (alert.id)        fields.push({ type: 'mrkdwn', text: `*Alert ID*\n\`${alert.id}\`` });
    if (alert.timestamp) fields.push({
        type: 'mrkdwn',
        text: `*When*\n${new Date(alert.timestamp).toUTCString()}`,
    });

    const attachmentBlocks = [
        { type: 'header', text: { type: 'plain_text', text: headerText, emoji: true } },
        { type: 'section', text: { type: 'mrkdwn', text: `*${title}*` } },
    ];
    if (alert.message && alert.message !== title) {
        attachmentBlocks.push({ type: 'section', text: { type: 'mrkdwn', text: alert.message } });
    }
    if (fields.length) {
        attachmentBlocks.push({ type: 'section', fields });
    }
    if (alert.metadata && Object.keys(alert.metadata).length > 0) {
        const pretty = JSON.stringify(alert.metadata, null, 2).slice(0, 2800);
        attachmentBlocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: `*Details*\n\`\`\`${pretty}\`\`\`` },
        });
    }
    const actionElements = [];
    if (alert.dashboardUrl) actionElements.push({
        type: 'button', text: { type: 'plain_text', text: 'Dashboard' }, url: alert.dashboardUrl,
    });
    if (alert.runbookUrl) actionElements.push({
        type: 'button', text: { type: 'plain_text', text: 'Runbook' }, url: alert.runbookUrl,
    });
    if (actionElements.length) {
        attachmentBlocks.push({ type: 'actions', elements: actionElements });
    }

    return {
        // Fallback for notifications where blocks aren't rendered.
        text: `${emoji} FATHOM ${String(severity).toUpperCase()}: ${title}`,
        attachments: [{ color, blocks: attachmentBlocks }],
    };
}

export class SlackNotifier extends BaseNotifier {
    /**
     * @param {object} opts
     * @param {string} [opts.webhookUrl]  — Slack incoming webhook URL
     * @param {string} [opts.botToken]    — Slack bot OAuth token (xoxb-…)
     * @param {string} [opts.channel]     — Slack channel ID (required with botToken)
     * @param {string} [opts.name='slack']
     * @param {string} [opts.threadTs]    — optional thread ts to reply into
     */
    constructor({
        webhookUrl,
        botToken,
        channel,
        threadTs,
        name = 'slack',
        ...rest
    } = {}) {
        super({ name, ...rest });
        if (!webhookUrl && !(botToken && channel)) {
            throw new Error(
                'SlackNotifier: supply either webhookUrl OR (botToken + channel).'
            );
        }
        if (botToken && !String(botToken).startsWith('xox')) {
            throw new Error('SlackNotifier: botToken must look like a Slack OAuth token (xox…)');
        }
        this.webhookUrl = webhookUrl || null;
        this.botToken = botToken || null;
        this.channel = channel || null;
        this.threadTs = threadTs || null;
    }

    buildPayload(alert) {
        return buildSlackBlocks(alert);
    }

    async sendImpl(alert) {
        const body = this.buildPayload(alert);

        // Bot API path — preferred when configured.
        if (this.botToken) {
            const payload = {
                channel: this.channel,
                text: body.text,
                attachments: body.attachments,
                ...(this.threadTs ? { thread_ts: this.threadTs } : {}),
            };
            const res = await postJson(
                this.http,
                SLACK_CHAT_POST,
                payload,
                {
                    headers: { Authorization: `Bearer ${this.botToken}` },
                    timeoutMs: this.timeoutMs,
                }
            );
            // Slack Bot API always returns 200 for both success and app-level error;
            // success is signalled by the JSON body's `ok: true` field.
            let parsed = null;
            try { parsed = JSON.parse(res.body || '{}'); } catch { parsed = null; }
            if (res.status === 200 && parsed?.ok) {
                return {
                    ok: true,
                    status: res.status,
                    detail: 'slack chat.postMessage accepted',
                    ts: parsed.ts || null,
                    channel: parsed.channel || null,
                };
            }
            // Surface Slack's error code (e.g. `channel_not_found`, `invalid_auth`).
            const errCode = parsed?.error || `http_${res.status}`;
            return {
                ok: false,
                status: res.status === 200 ? 400 : res.status,
                detail: `slack chat.postMessage failed: ${errCode}`,
                slackError: errCode,
            };
        }

        // Incoming-webhook path.
        const res = await postJson(
            this.http,
            this.webhookUrl,
            body,
            { timeoutMs: this.timeoutMs }
        );
        if (res.status >= 200 && res.status < 300) {
            return { ok: true, status: res.status, detail: 'slack webhook accepted' };
        }
        return {
            ok: false,
            status: res.status,
            detail: `slack webhook failed: HTTP ${res.status} — ${res.body?.slice?.(0, 200)}`,
        };
    }
}
