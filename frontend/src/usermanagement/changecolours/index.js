import { T } from './theme.js';

export const ROLES = Object.freeze([
    { id: 'super_admin', label: 'Super Admin', color: T.danger,   perms: 9, badge: '◈' },
    { id: 'admin',       label: 'Admin',       color: T.warning,  perms: 7, badge: '◆' },
    { id: 'developer',   label: 'Developer',   color: T.info,     perms: 6, badge: '◇' },
    { id: 'analyst',     label: 'Analyst',     color: T.accent,   perms: 4, badge: '○' },
    { id: 'viewer',      label: 'Viewer',      color: T.success,  perms: 2, badge: '·' },
]);

export const DEPARTMENTS = Object.freeze([
    'Engineering', 'Product', 'Data', 'Security', 'Operations', 'Finance',
]);

export const LOCATIONS = Object.freeze([
    'San Francisco', 'New York', 'London', 'Tokyo', 'Berlin', 'Remote',
]);

export const RESOURCE_ROWS = Object.freeze([
    'overview', 'performance', 'sql', 'api', 'users', 'billing', 'security',
]);

export const PERM_LABELS = Object.freeze({ r: 'Read', w: 'Write', d: 'Delete', a: 'Admin' });
export const PERM_COLORS = Object.freeze({ r: T.success, w: T.info, d: T.warning, a: T.danger });

/** Default permission set per role — used by PermissionMatrix and UserFormModal */
export const DEFAULT_PERMISSIONS = Object.freeze({
    super_admin: {
        overview: ['r','w','d','a'], performance: ['r','w','d','a'],
        sql:      ['r','w','d','a'], api:         ['r','w','d','a'],
        users:    ['r','w','d','a'], billing:     ['r','w','d','a'],
        security: ['r','w','d','a'],
    },
    admin: {
        overview: ['r','w','d'], performance: ['r','w','d'],
        sql:      ['r','w'],     api:         ['r','w'],
        users:    ['r','w'],     billing:     ['r'],
        security: ['r','w'],
    },
    developer: {
        overview: ['r','w'], performance: ['r','w'],
        sql:      ['r','w'], api:         ['r','w'],
        users:    ['r'],     billing:     [],
        security: ['r'],
    },
    analyst: {
        overview: ['r'], performance: ['r'],
        sql:      ['r'], api:         ['r'],
        users:    [],    billing:     [],
        security: [],
    },
    viewer: {
        overview: ['r'], performance: ['r'],
        sql:      [],    api:         [],
        users:    [],    billing:     [],
        security: [],
    },
});

export const USER_STATUSES = Object.freeze(['active', 'inactive', 'suspended']);

export const AUDIT_LEVELS = Object.freeze({
    info:     T.info,
    warn:     T.warning,
    critical: T.danger,
    success:  T.success,
});

export const SESSION_RISK_COLORS = Object.freeze({
    low:      T.success,
    medium:   T.warning,
    high:     T.danger,
    critical: T.danger,
});