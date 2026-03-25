/**
 * db/schema.ts — Drizzle ORM Schema Definition
 * ──────────────────────────────────────────────
 * Single source of truth for the database schema.
 * Generates TypeScript types AND SQL migrations from one file.
 *
 * Usage:
 *   import { users, connections, alerts } from './db/schema.js';
 *   const result = await db.select().from(users).where(eq(users.status, 'active'));
 *
 * Generate migrations:
 *   npx drizzle-kit generate
 *
 * Push to database:
 *   npx drizzle-kit push
 */

import {
  pgTable,
  pgSchema,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  varchar,
  real,
  json,
  inet,
  uuid,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Schema namespace ────────────────────────────────────────────────────────
export const pgmonitoringtool = pgSchema('pgmonitoringtool');

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgmonitoringtool.table(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 50 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('viewer'),
    accessLevel: varchar('access_level', { length: 10 }).notNull().default('read'),
    allowedScreens: text('allowed_screens').array().notNull().default([]),
    dataAccess: varchar('data_access', { length: 20 }).default('internal'),
    department: varchar('department', { length: 100 }),
    location: varchar('location', { length: 100 }),
    mfaEnabled: boolean('mfa_enabled').notNull().default(true),
    apiAccess: boolean('api_access').notNull().default(false),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at'),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('users_username_unique').on(table.username),
    uniqueIndex('users_email_unique').on(table.email),
    index('users_status_idx').on(table.status),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Connections
// ─────────────────────────────────────────────────────────────────────────────

export const connections = pgmonitoringtool.table(
  'vigil_connections',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    name: text('name').notNull(),
    host: text('host').notNull().default(''),
    port: integer('port').notNull().default(5432),
    dbName: text('db_name').notNull().default('postgres'),
    username: text('username').default(''),
    passwordEncrypted: text('password_encrypted').default(''),
    ssl: boolean('ssl').notNull().default(true),
    color: varchar('color', { length: 7 }).default('#06b6d4'),
    isDefault: boolean('is_default').notNull().default(false),
    connectionType: varchar('connection_type', { length: 20 }).default('postgresql'),
    environment: varchar('environment', { length: 50 }).default('production'),
    region: varchar('region', { length: 100 }),
    notes: text('notes'),
    healthStatus: varchar('health_status', { length: 20 }).default('unknown'),
    lastHealthCheck: timestamp('last_health_check'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('connections_user_idx').on(table.userId),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────────────────────────────────────

export const userSessions = pgmonitoringtool.table(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').notNull().references(() => users.id),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    deviceLabel: varchar('device_label', { length: 100 }),
    location: varchar('location', { length: 100 }),
    riskLevel: varchar('risk_level', { length: 20 }).default('low'),
    isActive: boolean('is_active').notNull().default(true),
    expiresAt: timestamp('expires_at').notNull().defaultNow(),
    revokedAt: timestamp('revoked_at'),
    revokedBy: integer('revoked_by'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('sessions_user_idx').on(table.userId),
    index('sessions_active_idx').on(table.isActive),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// API Keys
// ─────────────────────────────────────────────────────────────────────────────

export const apiKeys = pgmonitoringtool.table(
  'user_api_keys',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    name: varchar('name', { length: 100 }).notNull(),
    keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),
    keyHash: varchar('key_hash', { length: 64 }).notNull(),
    scope: varchar('scope', { length: 50 }).default('read:all'),
    totalCalls: integer('total_calls').notNull().default(0),
    lastUsedAt: timestamp('last_used_at'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    revokedAt: timestamp('revoked_at'),
    revokedBy: integer('revoked_by'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('apikeys_user_idx').on(table.userId),
    uniqueIndex('apikeys_hash_unique').on(table.keyHash),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────────────────────────────────────

export const alerts = pgmonitoringtool.table(
  'alerts',
  {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 50 }).notNull(),
    severity: varchar('severity', { length: 20 }).notNull().default('warning'),
    message: text('message').notNull(),
    details: json('details').default({}),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    connectionId: integer('connection_id'),
    acknowledgedBy: varchar('acknowledged_by', { length: 100 }),
    acknowledgedAt: timestamp('acknowledged_at'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('alerts_status_idx').on(table.status),
    index('alerts_severity_idx').on(table.severity),
    index('alerts_created_idx').on(table.createdAt),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Alert Rules
// ─────────────────────────────────────────────────────────────────────────────

export const alertRules = pgmonitoringtool.table(
  'alert_rules',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description').default(''),
    metric: varchar('metric', { length: 100 }).notNull(),
    condition: varchar('condition', { length: 10 }).notNull(),
    threshold: real('threshold').notNull(),
    severity: varchar('severity', { length: 20 }).notNull().default('warning'),
    enabled: boolean('enabled').notNull().default(true),
    cooldownMinutes: integer('cooldown_minutes').default(15),
    notifyEmail: boolean('notify_email').default(false),
    notifySlack: boolean('notify_slack').default(false),
    connectionId: integer('connection_id'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Login Activity
// ─────────────────────────────────────────────────────────────────────────────

export const loginActivity = pgmonitoringtool.table(
  'user_login_activity',
  {
    userId: integer('user_id').notNull().references(() => users.id),
    day: timestamp('day', { mode: 'date' }).notNull(),
    loginCount: integer('login_count').notNull().default(0),
    failedCount: integer('failed_count').notNull().default(0),
  },
  (table) => [
    uniqueIndex('login_activity_user_day').on(table.userId, table.day),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log
// ─────────────────────────────────────────────────────────────────────────────

export const auditLog = pgmonitoringtool.table(
  'audit_log',
  {
    id: serial('id').primaryKey(),
    actorUsername: varchar('actor_username', { length: 100 }),
    action: varchar('action', { length: 100 }).notNull(),
    details: json('details').default({}),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => [
    index('audit_timestamp_idx').on(table.timestamp),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Feedback
// ─────────────────────────────────────────────────────────────────────────────

export const feedback = pgmonitoringtool.table(
  'feedback',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    rating: integer('rating').notNull(),
    category: varchar('category', { length: 50 }),
    message: text('message'),
    page: varchar('page', { length: 100 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  connections: many(connections),
  sessions: many(userSessions),
  apiKeys: many(apiKeys),
  loginActivity: many(loginActivity),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Inferred Types (for use throughout the app)
// ─────────────────────────────────────────────────────────────────────────────

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type ConnectionSelect = typeof connections.$inferSelect;
export type ConnectionInsert = typeof connections.$inferInsert;

export type SessionSelect = typeof userSessions.$inferSelect;
export type SessionInsert = typeof userSessions.$inferInsert;

export type AlertSelect = typeof alerts.$inferSelect;
export type AlertInsert = typeof alerts.$inferInsert;

export type AlertRuleSelect = typeof alertRules.$inferSelect;
export type AlertRuleInsert = typeof alertRules.$inferInsert;

export type AuditLogSelect = typeof auditLog.$inferSelect;
export type AuditLogInsert = typeof auditLog.$inferInsert;
