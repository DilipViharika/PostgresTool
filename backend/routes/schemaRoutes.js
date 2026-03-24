/**
 * routes/schemaRoutes.js
 * ──────────────────────
 * Schema relationships, dependencies, and column details.
 * Provides data for the Schema Visualizer tab.
 *
 * Mount with:
 *   app.use('/api', schemaRoutes(pool, authenticate));
 */

import { Router } from 'express';

function log(level, message, meta = {}) {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function schemaRoutes(pool, authenticate) {
    const router = Router();

    /**
     * GET /api/schema/relationships
     * Returns all foreign key relationships between tables (entities and edges)
     */
    router.get('/schema/relationships', authenticate, async (req, res) => {
        try {
            // Get all tables with metadata
            const tablesQuery = `
                SELECT
                    n.oid::regnamespace::text AS schema,
                    c.relname AS name,
                    c.oid::regclass::text AS id,
                    c.reltuples::bigint AS rowCount,
                    pg_size_pretty(pg_total_relation_size(c.oid)) AS size
                FROM pg_class c
                JOIN pg_namespace n ON c.relnamespace = n.oid
                WHERE c.relkind = 'r'
                  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_toast_temp_*')
                ORDER BY n.oid, c.relname;
            `;

            // Get foreign key relationships
            const relationshipsQuery = `
                SELECT
                    fk.conname AS fkName,
                    fk.contype AS type,
                    fk.confdeltype AS onDelete,
                    fk.confupdtype AS onUpdate,
                    t1.relname AS fromTable,
                    t2.relname AS toTable,
                    ns1.nspname AS fromSchema,
                    ns2.nspname AS toSchema,
                    a1.attname AS fromColumn,
                    a2.attname AS toColumn
                FROM pg_constraint fk
                JOIN pg_class t1 ON fk.conrelid = t1.oid
                JOIN pg_class t2 ON fk.confrelid = t2.oid
                JOIN pg_namespace ns1 ON t1.relnamespace = ns1.oid
                JOIN pg_namespace ns2 ON t2.relnamespace = ns2.oid
                JOIN pg_attribute a1 ON fk.conrelid = a1.attrelid
                    AND a1.attnum = ANY(fk.conkey)
                JOIN pg_attribute a2 ON fk.confrelid = a2.attrelid
                    AND a2.attnum = ANY(fk.confkey)
                WHERE fk.contype = 'f'
                  AND ns1.nspname NOT IN ('pg_catalog', 'information_schema')
                ORDER BY ns1.nspname, t1.relname, fk.conname;
            `;

            const [tablesResult, relationshipsResult] = await Promise.all([
                pool.query(tablesQuery),
                pool.query(relationshipsQuery),
            ]);

            const tables = tablesResult.rows.map(row => ({
                id: `${row.schema}.${row.name}`,
                name: row.name,
                schema: row.schema,
                rowCount: row.rowCount || 0,
                size: row.size,
            }));

            const relationships = relationshipsResult.rows.map(row => ({
                id: `${row.fromSchema}.${row.fromTable}→${row.toSchema}.${row.toTable}`,
                from: `${row.fromSchema}.${row.fromTable}`,
                to: `${row.toSchema}.${row.toTable}`,
                fromColumn: row.fromColumn,
                toColumn: row.toColumn,
                type: 'fk',
                onDelete: row.onDelete,
                onUpdate: row.onUpdate,
                cardinality: '1:N',
            }));

            res.json({ tables, relationships });
        } catch (err) {
            log('ERROR', 'Failed to fetch schema relationships', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /api/schema/dependencies
     * Returns view and function dependencies on tables
     */
    router.get('/schema/dependencies', authenticate, async (req, res) => {
        try {
            const query = `
                SELECT DISTINCT
                    n1.nspname::text || '.' || c1.relname::text AS source,
                    n2.nspname::text || '.' || c2.relname::text AS target,
                    CASE
                        WHEN c1.relkind = 'v' THEN 'view'
                        WHEN c1.relkind = 'm' THEN 'materialized_view'
                        ELSE 'function'
                    END AS dependencyType
                FROM pg_depend d
                JOIN pg_class c1 ON d.objid = c1.oid
                JOIN pg_class c2 ON d.refobjid = c2.oid
                JOIN pg_namespace n1 ON c1.relnamespace = n1.oid
                JOIN pg_namespace n2 ON c2.relnamespace = n2.oid
                WHERE d.deptype IN ('n', 'a')
                  AND c1.relkind IN ('v', 'm')
                  AND c2.relkind = 'r'
                  AND n1.nspname NOT IN ('pg_catalog', 'information_schema')
                ORDER BY n1.nspname, c1.relname;
            `;

            const result = await pool.query(query);
            const dependencies = result.rows.map(row => ({
                id: `${row.source}→${row.target}`,
                source: row.source,
                target: row.target,
                dependencyType: row.dependencyType,
            }));

            res.json({ dependencies });
        } catch (err) {
            log('ERROR', 'Failed to fetch schema dependencies', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /api/schema/columns/:schema/:table
     * Returns detailed column information including statistics
     */
    router.get('/schema/columns/:schema/:table', authenticate, async (req, res) => {
        try {
            const { schema, table } = req.params;

            const columnsQuery = `
                SELECT
                    c.column_name AS name,
                    c.data_type AS type,
                    c.is_nullable = 'YES' AS nullable,
                    c.column_default AS default,
                    CASE
                        WHEN tc.constraint_type = 'PRIMARY KEY' THEN true
                        ELSE false
                    END AS isPrimaryKey,
                    CASE
                        WHEN kcu.column_name IS NOT NULL THEN true
                        ELSE false
                    END AS isForeignKey
                FROM information_schema.columns c
                LEFT JOIN information_schema.table_constraints tc
                    ON c.table_name = tc.table_name
                    AND c.table_schema = tc.table_schema
                    AND tc.constraint_type = 'PRIMARY KEY'
                LEFT JOIN information_schema.key_column_usage kcu
                    ON c.column_name = kcu.column_name
                    AND c.table_name = kcu.table_name
                    AND c.table_schema = kcu.table_schema
                    AND kcu.constraint_name LIKE '%fk%'
                WHERE c.table_schema = $1
                  AND c.table_name = $2
                ORDER BY c.ordinal_position;
            `;

            const statsQuery = `
                SELECT
                    attname AS name,
                    n_distinct AS distinctValues,
                    null_frac AS nullFraction,
                    avg_width AS avgWidth
                FROM pg_stats
                WHERE schemaname = $1
                  AND tablename = $2
                ORDER BY attnum;
            `;

            const [columnsResult, statsResult] = await Promise.all([
                pool.query(columnsQuery, [schema, table]),
                pool.query(statsQuery, [schema, table]),
            ]);

            const statsMap = {};
            statsResult.rows.forEach(row => {
                statsMap[row.name] = {
                    distinctValues: row.distinctValues,
                    nullFraction: row.nullFraction,
                    avgWidth: row.avgWidth,
                };
            });

            const columns = columnsResult.rows.map(row => ({
                name: row.name,
                type: row.type,
                nullable: row.nullable,
                default: row.default,
                isPrimaryKey: row.isPrimaryKey,
                isForeignKey: row.isForeignKey,
                ...statsMap[row.name],
            }));

            res.json({ columns });
        } catch (err) {
            log('ERROR', 'Failed to fetch column details', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
