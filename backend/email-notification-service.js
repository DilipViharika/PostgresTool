// ==========================================================================
//  VIGIL — Email Notification Service for Alerts
// ==========================================================================

const nodemailer = require('nodemailer');

/**
 * Email Notification Service
 * Supports multiple email providers: Gmail, SendGrid, AWS SES, SMTP
 */
class EmailNotificationService {
    constructor(config) {
        this.config = config;
        this.transporter = null;
        this.enabled = config.enabled || false;
        this.initialize();
    }

    // Initialize email transporter based on provider
    initialize() {
        if (!this.enabled) {
            console.log('Email notifications disabled');
            return;
        }

        const provider = this.config.provider || 'smtp';

        try {
            switch (provider) {
                case 'gmail':
                    this.transporter = this.createGmailTransporter();
                    break;
                case 'sendgrid':
                    this.transporter = this.createSendGridTransporter();
                    break;
                case 'ses':
                    this.transporter = this.createSESTransporter();
                    break;
                case 'smtp':
                default:
                    this.transporter = this.createSMTPTransporter();
                    break;
            }

            console.log(`Email notification service initialized (${provider})`);
            this.verifyConnection();
        } catch (error) {
            console.error('Failed to initialize email service:', error.message);
            this.enabled = false;
        }
    }

    // Gmail transporter
    createGmailTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.config.gmail.user,
                pass: this.config.gmail.appPassword // Use App Password, not regular password
            }
        });
    }

    // SendGrid transporter
    createSendGridTransporter() {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: this.config.sendgrid.apiKey
            }
        });
    }

    // AWS SES transporter
    createSESTransporter() {
        return nodemailer.createTransport({
            host: `email-smtp.${this.config.ses.region}.amazonaws.com`,
            port: 587,
            secure: false,
            auth: {
                user: this.config.ses.accessKeyId,
                pass: this.config.ses.secretAccessKey
            }
        });
    }

    // Generic SMTP transporter
    createSMTPTransporter() {
        return nodemailer.createTransport({
            host: this.config.smtp.host,
            port: this.config.smtp.port || 587,
            secure: this.config.smtp.secure || false, // true for 465, false for other ports
            auth: {
                user: this.config.smtp.user,
                pass: this.config.smtp.password
            },
            tls: {
                rejectUnauthorized: this.config.smtp.rejectUnauthorized !== false
            }
        });
    }

    // Verify email connection
    async verifyConnection() {
        if (!this.transporter) return false;

        try {
            await this.transporter.verify();
            console.log('Email server connection verified');
            return true;
        } catch (error) {
            console.error('Email server connection failed:', error.message);
            return false;
        }
    }

    // Get severity color for HTML emails
    getSeverityColor(severity) {
        const colors = {
            critical: '#dc2626',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[severity] || '#6b7280';
    }

    // Get severity emoji
    getSeverityEmoji(severity) {
        const emojis = {
            critical: '🔴',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return emojis[severity] || '📢';
    }

    // Generate HTML email template
    generateHTMLEmail(alert) {
        const color = this.getSeverityColor(alert.severity);
        const emoji = this.getSeverityEmoji(alert.severity);

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIGIL Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">VIGIL Alert System</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Database Monitoring Alert</p>
        </div>

        <!-- Alert Content -->
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Severity Badge -->
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background-color: ${color}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                    ${emoji} ${alert.severity}
                </span>
            </div>

            <!-- Alert Details -->
            <div style="border-left: 4px solid ${color}; padding-left: 20px; margin: 20px 0;">
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 20px;">${alert.message}</h2>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Category:</strong> ${alert.category}
                </p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}
                </p>
                ${alert.data && alert.data.rule ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Rule:</strong> ${alert.data.rule}
                </p>
                ` : ''}
            </div>

            ${alert.data && alert.data.metrics ? `
            <!-- Metrics -->
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">Key Metrics</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${Object.entries(alert.data.metrics)
                        .filter(([key]) => !key.includes('Queries') && !key.includes('Tables'))
                        .slice(0, 6)
                        .map(([key, value]) => `
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${this.formatMetricName(key)}</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; font-size: 14px;">${this.formatMetricValue(key, value)}</td>
                    </tr>
                    `).join('')}
                </table>
            </div>
            ` : ''}

            <!-- Actions -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">Take action on this alert:</p>
                <a href="${this.config.dashboardUrl || 'http://localhost:5173'}/alerts" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    View in Dashboard
                </a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    This is an automated alert from VIGIL Database Monitoring System
                </p>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
                    Database: ${this.config.databaseName || 'PostgreSQL'}
                </p>
            </div>
        </div>

        <!-- Tips -->
        ${alert.severity === 'critical' ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">⚠️ Critical Alert - Immediate Action Required</p>
            <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 13px;">This alert requires your immediate attention to prevent potential service disruption.</p>
        </div>
        ` : ''}
    </div>
</body>
</html>
        `;
    }

    // Generate plain text email
    generatePlainTextEmail(alert) {
        const emoji = this.getSeverityEmoji(alert.severity);
        
        let text = `
═══════════════════════════════════════════════════════
  VIGIL Database Monitoring Alert
═══════════════════════════════════════════════════════

${emoji} SEVERITY: ${alert.severity.toUpperCase()}

MESSAGE: ${alert.message}

CATEGORY: ${alert.category}
TIME: ${new Date(alert.timestamp).toLocaleString()}
${alert.data && alert.data.rule ? `RULE: ${alert.data.rule}\n` : ''}
`;

        if (alert.data && alert.data.metrics) {
            text += '\nKEY METRICS:\n';
            text += '───────────────────────────────────────────────────────\n';
            Object.entries(alert.data.metrics)
                .filter(([key]) => !key.includes('Queries') && !key.includes('Tables'))
                .slice(0, 6)
                .forEach(([key, value]) => {
                    text += `${this.formatMetricName(key).padEnd(25)} ${this.formatMetricValue(key, value)}\n`;
                });
        }

        text += `
───────────────────────────────────────────────────────
View details: ${this.config.dashboardUrl || 'http://localhost:5173'}/alerts

This is an automated alert from VIGIL
Database: ${this.config.databaseName || 'PostgreSQL'}
═══════════════════════════════════════════════════════
        `;

        return text.trim();
    }

    // Format metric names for display
    formatMetricName(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    // Format metric values
    formatMetricValue(key, value) {
        if (key.includes('Connections') || key.includes('Count')) {
            return value.toString();
        }
        if (key.includes('Ratio') || key.includes('Pct')) {
            return `${parseFloat(value).toFixed(1)}%`;
        }
        if (key.includes('GB') || key.includes('Size')) {
            return `${parseFloat(value).toFixed(2)} GB`;
        }
        if (key.includes('Seconds') || key.includes('Uptime')) {
            const hours = Math.floor(value / 3600);
            return `${hours}h`;
        }
        return value.toString();
    }

    // Send email for alert
    async sendAlert(alert, recipients) {
        if (!this.enabled || !this.transporter) {
            console.log('Email notifications disabled, skipping email send');
            return { success: false, reason: 'disabled' };
        }

        // Check if this severity should trigger email
        const severityLevels = {
            info: 1,
            warning: 2,
            critical: 3
        };

        const minLevel = severityLevels[this.config.minSeverity || 'warning'];
        const alertLevel = severityLevels[alert.severity];

        if (alertLevel < minLevel) {
            console.log(`Alert severity ${alert.severity} below threshold, skipping email`);
            return { success: false, reason: 'below_threshold' };
        }

        // Get recipients list
        const to = recipients || this.config.recipients || [];
        if (!Array.isArray(to) || to.length === 0) {
            console.log('No email recipients configured');
            return { success: false, reason: 'no_recipients' };
        }

        try {
            const mailOptions = {
                from: this.config.from || `"VIGIL Alert System" <${this.config.smtp?.user || 'alerts@vigil.local'}>`,
                to: to.join(', '),
                subject: `${this.getSeverityEmoji(alert.severity)} [${alert.severity.toUpperCase()}] VIGIL Alert - ${alert.message.substring(0, 60)}${alert.message.length > 60 ? '...' : ''}`,
                text: this.generatePlainTextEmail(alert),
                html: this.generateHTMLEmail(alert),
                priority: alert.severity === 'critical' ? 'high' : 'normal'
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Alert email sent: ${info.messageId}`);
            
            return {
                success: true,
                messageId: info.messageId,
                recipients: to
            };
        } catch (error) {
            console.error('Failed to send alert email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send test email
    async sendTestEmail(recipient) {
        const testAlert = {
            id: 'test-alert',
            timestamp: new Date().toISOString(),
            severity: 'info',
            category: 'maintenance',
            message: 'This is a test email from VIGIL Alert System',
            data: {
                rule: 'test_email',
                metrics: {
                    activeConnections: 15,
                    maxConnections: 100,
                    cacheHitRatio: 95.5,
                    diskUsedGB: 42.3
                }
            }
        };

        return this.sendAlert(testAlert, [recipient]);
    }

    // Send digest email (summary of multiple alerts)
    async sendDigest(alerts, recipients) {
        if (!this.enabled || !this.transporter) {
            return { success: false, reason: 'disabled' };
        }

        const to = recipients || this.config.recipients || [];
        if (to.length === 0) {
            return { success: false, reason: 'no_recipients' };
        }

        const critical = alerts.filter(a => a.severity === 'critical').length;
        const warning = alerts.filter(a => a.severity === 'warning').length;
        const info = alerts.filter(a => a.severity === 'info').length;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>VIGIL Alert Digest</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">VIGIL Alert Digest</h1>
            <p style="margin: 10px 0 0 0;">Summary of Recent Alerts</p>
        </div>
        
        <div style="padding: 30px;">
            <div style="display: flex; justify-content: space-around; margin-bottom: 30px;">
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${critical}</div>
                    <div style="color: #6b7280; font-size: 14px;">Critical</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${warning}</div>
                    <div style="color: #6b7280; font-size: 14px;">Warning</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${info}</div>
                    <div style="color: #6b7280; font-size: 14px;">Info</div>
                </div>
            </div>

            <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Recent Alerts</h2>
            ${alerts.slice(0, 10).map(alert => `
                <div style="border-left: 4px solid ${this.getSeverityColor(alert.severity)}; padding: 10px 15px; margin-bottom: 10px; background-color: #f9fafb; border-radius: 0 6px 6px 0;">
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">${alert.message}</div>
                    <div style="font-size: 12px; color: #6b7280;">${new Date(alert.timestamp).toLocaleString()}</div>
                </div>
            `).join('')}

            <div style="text-align: center; margin-top: 30px;">
                <a href="${this.config.dashboardUrl || 'http://localhost:5173'}/alerts" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    View All Alerts
                </a>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        try {
            const info = await this.transporter.sendMail({
                from: this.config.from || `"VIGIL Alert System" <${this.config.smtp?.user || 'alerts@vigil.local'}>`,
                to: to.join(', '),
                subject: `📊 VIGIL Alert Digest - ${critical} Critical, ${warning} Warning, ${info} Info`,
                html
            });

            console.log(`Digest email sent: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Failed to send digest email:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailNotificationService;