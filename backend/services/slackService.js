// ==========================================================================
//  VIGIL — Slack Notification Service
// ==========================================================================

const SEVERITY_EMOJI = {
    critical: ':red_circle:',
    warning:  ':large_yellow_circle:',
    info:     ':large_blue_circle:',
};

const SEVERITY_COLOR = {
    critical: '#9B1C1C',
    warning:  '#D97706',
    info:     '#2563EB',
};

/**
 * Send an alert notification to a Slack channel via Incoming Webhook.
 *
 * @param {object} alert  - The alert object from Vigil's alert engine
 * @param {string} webhookUrl - Slack Incoming Webhook URL (from env)
 * @returns {Promise<void>}
 */
export async function sendSlackAlert(alert, webhookUrl) {
    if (!webhookUrl) return; // silently skip if not configured

    const emoji    = SEVERITY_EMOJI[alert.severity] || ':bell:';
    const color    = SEVERITY_COLOR[alert.severity] || '#6B7280';
    const severity = (alert.severity || 'info').toUpperCase();
    const time     = new Date(alert.timestamp || Date.now()).toUTCString();

    const payload = {
        // Main text shown in notifications / previews
        text: `${emoji} *Vigil Alert — ${severity}*: ${alert.message}`,

        // Rich attachment block
        attachments: [
            {
                color,
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: `${emoji}  Vigil Alert — ${severity}`,
                            emoji: true,
                        },
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*${alert.message}*`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Category*\n${alert.category || 'general'}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Severity*\n${severity}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Time*\n${time}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Alert ID*\n${alert.id || 'N/A'}`,
                            },
                        ],
                    },
                    // Optional: show extra data if present
                    ...(alert.data && Object.keys(alert.data).length > 0
                        ? [
                              {
                                  type: 'section',
                                  text: {
                                      type: 'mrkdwn',
                                      text: `*Details*\n\`\`\`${JSON.stringify(alert.data, null, 2)}\`\`\``,
                                  },
                              },
                          ]
                        : []),
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'mrkdwn',
                                text: ':bar_chart: Sent by *Vigil* — PostgreSQL Monitoring Platform',
                            },
                        ],
                    },
                ],
            },
        ],
    };

    const response = await fetch(webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Slack webhook failed: ${response.status} — ${text}`);
    }
}

/**
 * Send a plain text message to Slack (useful for test pings or digests).
 *
 * @param {string} message  - Plain text message
 * @param {string} webhookUrl
 */
export async function sendSlackMessage(message, webhookUrl) {
    if (!webhookUrl) return;

    const response = await fetch(webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: message }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Slack webhook failed: ${response.status} — ${text}`);
    }
}
