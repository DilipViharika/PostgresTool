# VIGIL SDK - Universal Database Monitoring Integration

The VIGIL SDK provides a unified, plug-and-play framework for integrating database monitoring with external platforms including Salesforce, Mulesoft, and multiple database systems. Monitor your entire infrastructure from a single dashboard.

## Features

- **Universal Database Support**: PostgreSQL, MySQL, MongoDB, MariaDB, Oracle
- **External Platform Integration**: Salesforce, Mulesoft, custom connectors
- **Event-Driven Architecture**: Real-time alerts and metrics using EventEmitter
- **Robust Authentication**: API Key and JWT token support with automatic refresh
- **Structured Logging**: Debug, info, warn, and error levels with optional sinks
- **Retry Logic**: Exponential backoff for resilient API communication
- **Extensible Design**: Easy to add new platform connectors

## Installation

```bash
npm install @vigil/sdk
```

### Node.js Version

Requires Node.js 18.0.0 or higher.

## Quick Start

### 1. Initialize VIGIL Client

```javascript
import { VigilClient } from '@vigil/sdk';

const client = new VigilClient({
  baseUrl: 'https://api.vigil.example.com',
  apiKey: 'sk_test_your_api_key_here',
  orgId: 'org_123456',
  options: {
    logLevel: 'info',
    retryAttempts: 3,
    timeout: 30000
  }
});

// Connect to VIGIL
await client.connect();
console.log('Connected to VIGIL');
```

### 2. Fetch Database Metrics

```javascript
// Get metrics for all PostgreSQL databases
const metrics = await client.getMetrics('postgresql', {
  timeRange: 3600 // Last hour
});

console.log('Database Metrics:', metrics);
```

### 3. Execute Queries

```javascript
// Query a connected database
const results = await client.query(
  'SELECT * FROM users LIMIT 10',
  { connectionId: 'conn_123' }
);

console.log('Query Results:', results);
```

### 4. Subscribe to Events

```javascript
// Subscribe to alerts
client.subscribe('alert', (alert) => {
  console.log('Alert received:', alert);
});

// Subscribe to metrics updates
client.subscribe('metrics', (metrics) => {
  console.log('Metrics updated:', metrics);
});

// Subscribe to connection changes
client.subscribe('connected', (info) => {
  console.log('Connected:', info);
});
```

## Salesforce Integration

### Setup

1. Create a Connected App in Salesforce
2. Get your Client ID, Client Secret, and Security Token
3. Initialize the connector

### Example: Basic Authentication and Metrics

```javascript
import { SalesforceConnector } from '@vigil/sdk';

const sfConnector = new SalesforceConnector({
  instanceUrl: 'https://login.salesforce.com',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  username: 'admin@example.com',
  password: 'your_password',
  securityToken: 'your_security_token'
});

// Authenticate
const authResponse = await sfConnector.authenticate();
console.log('Authenticated:', authResponse.access_token.substring(0, 20) + '...');

// Fetch API limits
const metrics = await sfConnector.getMetrics();
console.log('API Calls Used:', metrics.limits.ApiCalls.Used);
console.log('API Calls Max:', metrics.limits.ApiCalls.Max);
```

### Example: SOQL Queries

```javascript
// Execute SOQL query
const accounts = await sfConnector.query(
  'SELECT Id, Name, Revenue FROM Account WHERE Industry = \'Technology\' LIMIT 100'
);

console.log('Accounts found:', accounts.totalSize);
accounts.records.forEach(account => {
  console.log(`${account.Name}: $${account.Revenue}`);
});
```

### Example: Event Subscriptions

```javascript
// Listen for authentication events
sfConnector.on('authenticated', (info) => {
  console.log('Salesforce authenticated:', info.instanceUrl);
});

// Listen for metrics updates
sfConnector.on('metrics_updated', (metrics) => {
  console.log('Salesforce metrics updated');
  console.log('API Usage:', metrics.limits.ApiCalls.Used / metrics.limits.ApiCalls.Max * 100 + '%');
});

// Listen for errors
sfConnector.on('error', (error) => {
  console.error('Salesforce error:', error.type, error.error.message);
});
```

### Example: Sync Metrics to VIGIL

```javascript
// Sync Salesforce metrics to VIGIL dashboard
const syncResult = await sfConnector.syncToVigil(client, {
  includeAuditTrail: true
});

console.log('Synced metrics to VIGIL');
```

## Mulesoft Integration

### Setup

1. Create a Connected App in Anypoint Platform
2. Get your Client ID and Client Secret
3. Initialize the connector

### Example: Basic Authentication

```javascript
import { MulesoftConnector } from '@vigil/sdk';

const muleConnector = new MulesoftConnector({
  anyPointUrl: 'https://anypoint.mulesoft.com',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  orgId: 'YOUR_ORG_ID'
});

// Authenticate
const authResponse = await muleConnector.authenticate();
console.log('Authenticated with Mulesoft');
```

### Example: Application Metrics

```javascript
// Get list of deployed applications
const apps = await muleConnector.getApps();

apps.forEach(app => {
  console.log(`Application: ${app.name}`);
  console.log(`Status: ${app.status}`);
});

// Get metrics for a specific application
const appMetrics = await muleConnector.getAppMetrics('app_id_123');
console.log('CPU Usage:', appMetrics.cpu + '%');
console.log('Memory Usage:', appMetrics.memory + '%');
console.log('Error Rate:', appMetrics.errorRate + '%');
```

### Example: API Analytics

```javascript
// Get managed APIs
const apis = await muleConnector.getApiManagerApis();

// Get analytics for specific API
const analytics = await muleConnector.getApiAnalytics('api_456', {
  duration: 86400 // Last 24 hours
});

console.log('Request Count:', analytics.requestCount);
console.log('Error Count:', analytics.errorCount);
console.log('Average Latency:', analytics.averageLatency + 'ms');
console.log('Success Rate:', analytics.successRate + '%');
```

### Example: Alerts and Audit Logs

```javascript
// Get active alerts
const alerts = await muleConnector.getAlerts({ activeOnly: true });
console.log('Active Alerts:', alerts.length);

alerts.forEach(alert => {
  console.log(`Alert: ${alert.name}`);
  console.log(`Severity: ${alert.severity}`);
});

// Get audit logs from last 7 days
const auditLogs = await muleConnector.getAuditLogs({ daysBack: 7 });
console.log('Audit Events:', auditLogs.length);
```

### Example: Sync Metrics to VIGIL

```javascript
// Sync all Mulesoft metrics to VIGIL
const syncResult = await muleConnector.syncToVigil(client, {
  includeApps: true,
  includeApis: true,
  includeAlerts: true
});

console.log('Synced Mulesoft metrics to VIGIL');
```

## Database Integration

### Supported Databases

- PostgreSQL
- MySQL / MariaDB
- MongoDB
- Oracle

### Example: PostgreSQL Connection

```javascript
import { DatabaseConnector } from '@vigil/sdk';

const dbConnector = new DatabaseConnector({
  type: 'postgresql',
  host: 'db.example.com',
  port: 5432,
  username: 'postgres',
  password: 'your_password',
  database: 'myapp',
  options: {
    ssl: true,
    timeout: 30000
  }
});

// Connect to database
const connInfo = await dbConnector.connect();
console.log('Connected to database:', connInfo.id);
```

### Example: Database Metrics

```javascript
// Get database overview
const overview = await dbConnector.getOverview();
console.log('Database Size:', overview.size / 1024 / 1024 + ' MB');
console.log('Active Connections:', overview.connectionStats.active);
console.log('Databases:', overview.databases.length);

// Get performance metrics
const performance = await dbConnector.getPerformance();
console.log('Cache Hit Ratio:', performance.cacheStats.indexHitRatio * 100 + '%');
console.log('Slow Queries:', performance.slowQueries.length);
console.log('Slow Query Threshold:', performance.queryStats.slowQueryThreshold + 'ms');

// Get replication status
const replication = await dbConnector.getReplicationStatus();
console.log('Replication Status:', replication.status);
console.log('Synchronized Replicas:', replication.syncedReplicas);
```

### Example: Execute Queries

```javascript
// Execute a query
const results = await dbConnector.executeQuery(
  'SELECT id, name, email FROM users WHERE active = true',
  []
);

console.log('Results:', results.length);

// Get query history
const history = dbConnector.getQueryHistory(10);
history.forEach(entry => {
  console.log(`Query: ${entry.sql.substring(0, 50)}...`);
  console.log(`Duration: ${entry.duration}ms`);
});
```

## Advanced Usage

### Custom Logger

```javascript
import { Logger } from '@vigil/sdk';

const logger = new Logger({
  name: 'MyApp',
  level: 'debug',
  sink: (entry) => {
    // Send logs to external service
    fetch('https://logs.example.com/ingest', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  }
});

logger.info('Application started');
logger.debug('Debug information', { userId: 123 });
logger.warn('Warning message');
logger.error('Error occurred', new Error('Connection failed'));
```

### Custom Event Emitter

```javascript
import { EventEmitter } from '@vigil/sdk';

const emitter = new EventEmitter();

// Register listener
emitter.on('data_received', (data) => {
  console.log('Data:', data);
});

// Register one-time listener
emitter.once('initialized', () => {
  console.log('System initialized');
});

// Emit events
emitter.emit('initialized');
emitter.emit('data_received', { id: 1, value: 100 });

// Check listener count
console.log('Event listeners:', emitter.listenerCount());

// Remove listener
emitter.removeAllListeners('data_received');
```

### Authentication Management

```javascript
import { AuthManager } from '@vigil/sdk';

// API Key authentication
const apiKeyAuth = new AuthManager({
  type: 'apiKey',
  value: 'sk_test_your_api_key'
});

const headers = apiKeyAuth.getHeaders();
// { 'X-API-Key': 'sk_test_your_api_key' }

// JWT authentication with refresh
const jwtAuth = new AuthManager({
  type: 'jwt',
  value: 'eyJhbGc...',
  refreshUrl: 'https://api.example.com/auth/refresh',
  refreshToken: 'refresh_token_here'
});

// Check if token is expired
if (jwtAuth.isExpired()) {
  const newToken = await jwtAuth.refreshJWT();
  console.log('Token refreshed');
}
```

## Error Handling

All SDK methods throw errors that include context information:

```javascript
try {
  await client.connect();
} catch (error) {
  console.error('Connection failed:', error.message);
  // Handle specific errors
  if (error.message.includes('Unauthorized')) {
    console.error('Invalid API key');
  }
}

// Subscribe to error events
client.on('error', (errorInfo) => {
  console.error('Error type:', errorInfo.type);
  console.error('Error:', errorInfo.error);

  // Handle different error types
  switch (errorInfo.type) {
    case 'connection_error':
      // Handle connection errors
      break;
    case 'metrics_error':
      // Handle metrics fetch errors
      break;
    case 'query_error':
      // Handle query execution errors
      break;
  }
});
```

## Logging

Enable debug logging to troubleshoot issues:

```javascript
const client = new VigilClient({
  baseUrl: 'https://api.vigil.example.com',
  apiKey: 'sk_test_...',
  orgId: 'org_123',
  options: {
    logLevel: 'debug'
  }
});

// Access logger
const logger = client.getLogger();
console.log('Log history:', logger.getHistory());
```

## API Reference

### VigilClient

Main client for VIGIL API interaction.

**Methods:**
- `connect()` - Establish connection
- `disconnect()` - Close connection
- `getMetrics(dbType, options)` - Fetch metrics for database type
- `subscribe(event, callback)` - Subscribe to events
- `unsubscribe(event, subscriptionId)` - Unsubscribe from events
- `query(sql, options)` - Execute SQL query
- `getConnections()` - List active connections
- `healthCheck()` - Check API health

**Events:**
- `connected` - Connection established
- `disconnected` - Connection closed
- `error` - Error occurred
- `metrics` - Metrics received
- `alert` - Alert triggered

### SalesforceConnector

Salesforce platform integration.

**Methods:**
- `authenticate(flowType)` - Authenticate with Salesforce
- `query(soql)` - Execute SOQL query
- `getOrgs()` - List organizations
- `getObjects()` - List SObjects
- `getMetrics()` - Get API limits and usage
- `getAuditTrail(options)` - Get audit trail events
- `subscribeToEvents(channel, callback)` - Subscribe to platform events
- `syncToVigil(vigilClient, options)` - Sync metrics to VIGIL

### MulesoftConnector

Mulesoft Anypoint Platform integration.

**Methods:**
- `authenticate()` - Authenticate with Anypoint
- `getApps()` - List deployed applications
- `getAppMetrics(appId)` - Get app performance metrics
- `getApiManagerApis()` - List managed APIs
- `getApiAnalytics(apiId, options)` - Get API metrics
- `getAlerts(options)` - List active alerts
- `getAuditLogs(options)` - Get audit log events
- `syncToVigil(vigilClient, options)` - Sync metrics to VIGIL

### DatabaseConnector

Multi-database connector wrapper.

**Methods:**
- `connect()` - Connect to database
- `disconnect()` - Disconnect
- `getOverview()` - Get database overview
- `getPerformance()` - Get performance metrics
- `executeQuery(sql, params)` - Execute query
- `getReplicationStatus()` - Get replication status
- `getQueryHistory(limit)` - Get query history
- `getStatus()` - Get connection status

## Examples

See the `/examples` directory for complete, runnable examples:

- `basic-client.js` - VIGIL client setup and usage
- `salesforce-integration.js` - Salesforce connector examples
- `mulesoft-integration.js` - Mulesoft connector examples
- `database-monitoring.js` - Database connector examples
- `event-handling.js` - Event subscription and handling

## Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.

## License

MIT - see LICENSE file for details

## Support

For issues, questions, or suggestions:

- GitHub Issues: https://github.com/vigildb/vigil-sdk-js/issues
- Documentation: https://vigil.example.com/docs
- Email: support@vigil.example.com
