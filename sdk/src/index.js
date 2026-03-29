/**
 * VIGIL SDK - Universal Database Monitoring Integration
 * Provides plug-and-play connectors for external platforms
 *
 * @version 1.0.0
 */

export { VigilClient } from './core/client.js';
export { SalesforceConnector } from './connectors/salesforce.js';
export { MulesoftConnector } from './connectors/mulesoft.js';
export { DatabaseConnector } from './connectors/database.js';
export { EventEmitter } from './core/events.js';
export { Logger } from './core/logger.js';
export { AuthManager } from './core/auth.js';
