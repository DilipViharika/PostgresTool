/**
 * services/indexAdvisor.js
 * ────────────────────────
 * Postgres index analysis and suggestions.
 *
 * Identifies:
 *   - Unused indexes (no scans, not PK or unique)
 *   - Redundant indexes (one is a prefix of another)
 *   - Missing indexes (from slow queries via pg_stat_statements)
 *
 * All functions are safe: DDL is generated but never executed.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PURE HELPERS (exported, testable without DB)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse WHERE clause to extract candidate indexed columns.
 * Handles: `t.col = ...`, `t.col IN (...)`, `t.col > ?`, `a.col = b.col`, etc.
 * Returns array of {table, column} pairs.
 */
export function parseWhereColumns(sql) {
    if (!sql) return [];

    const candidates = [];
    // Match patterns like "table.column OP" where OP is =, <, >, <=, >=, IN, LIKE, etc.
    // Also handles schema.table.column
    const colPattern = /(\w+(?:\.\w+)*)\s*(=|<>|!=|<|>|<=|>=|IN|LIKE|ILIKE|BETWEEN|IS|~|!~)/gi;

    let match;
    while ((match = colPattern.exec(sql)) !== null) {
        const expr = match[1];
        const parts = expr.split('.');
        let table, column;

        if (parts.length === 1) {
            // bare column name — skip (needs context)
            continue;
        } else if (parts.length === 2) {
            // table.column
            [table, column] = parts;
        } else if (parts.length === 3) {
            // schema.table.column
            table = parts[1];
            column = parts[2];
        } else {
            continue;
        }

        const normalizedCol = column.toLowerCase();
        if (!candidates.some(c => c.table === table && c.column === normalizedCol)) {
            candidates.push({ table, column: normalizedCol });
        }
    }

    return candidates;
}

/**
 * Check if a column is already covered by an existing index (prefix match rule).
 * Returns true if any index on the table starts with this column.
 */
export function isColumnCovered(column, existingIndexes) {
    return existingIndexes.some(idx => {
        const cols = idx.columns || [];
        return cols[0] && cols[0].toLowerCase() === column.toLowerCase();
    });
}

/**
 * Score a suggestion based on call frequency and mean execution time.
 * Impact = calls * meanTimeMs, normalized to 0-100.
 */
export function scoreSuggestion({ calls = 0, meanTimeMs = 0 }) {
    const impact = (calls || 0) * (meanTimeMs || 0);
    // Normalize to 0-100: assume max reasonable is 1M impact
    return Math.min(100, Math.max(0, Math.round((impact / 1_000_000) * 100)));
}

/**
 * Generate CREATE INDEX CONCURRENTLY statement.
 * Safely quotes identifiers.
 */
export function generateIndexDdl({ table, columns, unique = false, using = 'btree' }) {
    if (!table || !columns || columns.length === 0) {
        throw new Error('table and columns required');
    }

    // Quote identifiers to handle reserved words, mixed case, etc.
    const quotedTable = quoteIdent(table);
    const quotedCols = columns.map(c => quoteIdent(c)).join(', ');
    const indexName = generateIndexName(table, columns);

    const uniqueClause = unique ? 'UNIQUE ' : '';
    const using_lower = using.toLowerCase();
    const usingClause = using_lower !== 'btree' ? ` USING ${using_lower}` : '';

    return `CREATE ${uniqueClause}INDEX CONCURRENTLY ${quoteIdent(indexName)} ON ${quotedTable} (${quotedCols})${usingClause};`;
}

/**
 * Generate DROP INDEX CONCURRENTLY statement.
 */
export function dropRedundantIndexDdl(indexName, schema = 'public') {
    const quotedName = quoteIdent(indexName);
    return `DROP INDEX CONCURRENTLY IF EXISTS ${quotedName};`;
}

/**
 * Generate a sensible index name from table and columns.
 */
function generateIndexName(table, columns) {
    const colPart = columns.slice(0, 3).join('_').replace(/[^a-z0-9_]/gi, '');
    const baseName = `idx_${table}_${colPart}`.substring(0, 63); // Postgres limit
    return baseName.toLowerCase();
}

/**
 * Quote a SQL identifier (table, column, index name) safely.
 */
function quoteIdent(name) {
    if (!name) return '""';
    // Escape double quotes by doubling them
    return `"${String(name).replace(/"/g, '""')}"`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyze index usage from pg_stat_user_indexes and pg_indexes.
 * Returns { unused: [...], redundant: [...] }
 *
 * Unused: idx_scan = 0, not primary key, not unique-constraint-supporting
 * Redundant: two indexes where one's column prefix is a superset of another
 */
export async function analyzeIndexUsage(client) {
    // Fetch all user-created indexes with their stats
    const { rows: indexes } = await client.query(`
        SELECT
            i.schemaname,
            i.tablename,
            i.indexname,
            pg_relation_size(quote_ident(i.schemaname) || '.' || quote_ident(i.indexname))::bigint AS size_bytes,
            (SELECT count(*) FROM pg_class
             WHERE relname = i.indexname
             AND (SELECT count(*) FROM pg_inherits WHERE inhrelid = oid) = 0
            ) AS is_valid,
            -- get index columns from pg_index + pg_attribute
            (SELECT array_agg(a.attname ORDER BY i2.attnum)
             FROM pg_index idx
             JOIN pg_attribute a ON a.attrelid = idx.indrelid AND a.attnum = ANY(idx.indkey)
             JOIN (SELECT attnum FROM pg_attribute
                   WHERE attrelid = idx.indrelid) i2 ON i2.attnum = a.attnum
             WHERE idx.indexrelid = quote_ident(i.schemaname)::regclass || '.' || quote_ident(i.indexname)::text::regclass
             LIMIT 1
            ) AS index_columns
        FROM pg_indexes i
        WHERE i.schemaname NOT IN ('pg_catalog', 'information_schema')
    `);

    // Fetch usage stats from pg_stat_user_indexes
    const { rows: stats } = await client.query(`
        SELECT
            schemaname,
            tablename,
            indexrelname,
            idx_scan,
            idx_tup_read,
            idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    `);

    // Enrich indexes with stats
    const statsMap = new Map(stats.map(s => [s.indexrelname, s]));
    const enriched = indexes.map(idx => ({
        ...idx,
        idx_scan: statsMap.get(idx.indexname)?.idx_scan ?? 0,
        idx_tup_read: statsMap.get(idx.indexname)?.idx_tup_read ?? 0,
        idx_tup_fetch: statsMap.get(idx.indexname)?.idx_tup_fetch ?? 0,
    }));

    // Identify unused indexes
    const unused = [];
    for (const idx of enriched) {
        if (idx.idx_scan === 0) {
            // Check if it's a primary key or unique constraint
            const { rows: constraints } = await client.query(`
                SELECT constraint_type
                FROM information_schema.table_constraints
                WHERE table_name = $1 AND constraint_name = $2
                LIMIT 1
            `, [idx.tablename, idx.indexname]);

            const isPkOrUnique = constraints.some(c =>
                c.constraint_type === 'PRIMARY KEY' || c.constraint_type === 'UNIQUE'
            );

            if (!isPkOrUnique) {
                unused.push({
                    schema: idx.schemaname,
                    table: idx.tablename,
                    name: idx.indexname,
                    sizeBytes: idx.size_bytes,
                    definition: idx.indexdef || 'CREATE INDEX ...',
                    reason: 'No index scans recorded',
                });
            }
        }
    }

    // Identify redundant indexes (column prefix overlap)
    const redundant = [];
    const tableIndexes = new Map();
    enriched.forEach(idx => {
        const key = `${idx.schemaname}.${idx.tablename}`;
        if (!tableIndexes.has(key)) tableIndexes.set(key, []);
        tableIndexes.get(key).push(idx);
    });

    for (const [_tableKey, tableIdxList] of tableIndexes) {
        for (let i = 0; i < tableIdxList.length; i++) {
            for (let j = i + 1; j < tableIdxList.length; j++) {
                const a = tableIdxList[i];
                const b = tableIdxList[j];
                const aColumns = (a.indexdef || '').match(/\(([^)]+)\)/)?.[1]?.split(',').map(x => x.trim()) || [];
                const bColumns = (b.indexdef || '').match(/\(([^)]+)\)/)?.[1]?.split(',').map(x => x.trim()) || [];

                // If both have the same leading column, mark the larger as redundant
                if (aColumns[0] && bColumns[0] && aColumns[0] === bColumns[0]) {
                    const larger = (a.size_bytes || 0) > (b.size_bytes || 0) ? a : b;
                    const smaller = larger === a ? b : a;

                    // Only add if we haven't already
                    if (!redundant.some(r => r.name === larger.indexname)) {
                        redundant.push({
                            schema: larger.schemaname,
                            table: larger.tablename,
                            name: larger.indexname,
                            sizeBytes: larger.size_bytes,
                            definition: larger.indexdef || 'CREATE INDEX ...',
                            reason: `Redundant with ${smaller.indexname} (both index column: ${aColumns[0]})`,
                            canDropAfter: smaller.indexname,
                        });
                    }
                }
            }
        }
    }

    return { unused, redundant };
}

/**
 * Suggest missing indexes based on slow queries from pg_stat_statements.
 * Filters by minCalls and minMeanTimeMs thresholds.
 * Returns ranked suggestions with { table, columns, reason, exampleQuery, calls, meanTimeMs, impact }.
 */
export async function suggestMissingIndexes(
    client,
    { minCalls = 50, minMeanTimeMs = 100 } = {}
) {
    // Check if pg_stat_statements is installed
    try {
        await client.query('SELECT 1 FROM pg_stat_statements LIMIT 1');
    } catch (_err) {
        return {
            suggestions: [],
            advisory: 'pg_stat_statements extension not installed',
        };
    }

    // Get slow queries
    const { rows: slowQueries } = await client.query(`
        SELECT
            query,
            calls,
            mean_exec_time AS mean_time_ms,
            total_exec_time,
            rows
        FROM pg_stat_statements
        WHERE calls >= $1
          AND mean_exec_time >= $2
          AND query NOT LIKE 'EXPLAIN%'
          AND query NOT LIKE 'CREATE%'
          AND query NOT LIKE 'DROP%'
          AND query NOT LIKE 'ALTER%'
        ORDER BY (calls * mean_exec_time) DESC
        LIMIT 20
    `, [minCalls, minMeanTimeMs]);

    // Extract index candidates from WHERE clauses
    const candidates = [];
    for (const q of slowQueries) {
        const whereMatch = q.query.match(/WHERE\s+(.+?)(?:GROUP|ORDER|LIMIT|$)/i);
        if (!whereMatch) continue;

        const whereClause = whereMatch[1];
        const cols = parseWhereColumns(whereClause);

        for (const { table, column } of cols) {
            candidates.push({
                table,
                columns: [column],
                calls: q.calls,
                meanTimeMs: q.mean_time_ms,
                exampleQuery: q.query.substring(0, 200),
            });
        }
    }

    // Check which columns are already indexed
    const existing = await client.query(`
        SELECT tablename, indexdef
        FROM pg_indexes
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    `);

    // Filter: only suggest columns not already indexed
    const suggestions = [];
    const seen = new Set();

    for (const cand of candidates) {
        // Skip if we already suggested this column
        const key = `${cand.table}.${cand.columns[0]}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Check if column is already indexed
        const isIndexed = existing.rows.some(row => {
            return row.indexdef.includes(cand.table) && row.indexdef.includes(cand.columns[0]);
        });

        if (!isIndexed) {
            const impact = scoreSuggestion({
                calls: cand.calls,
                meanTimeMs: cand.meanTimeMs,
            });

            suggestions.push({
                table: cand.table,
                columns: cand.columns,
                reason: `Frequently used in WHERE clause (${cand.calls} calls, ${cand.meanTimeMs.toFixed(2)}ms avg)`,
                exampleQuery: cand.exampleQuery,
                calls: cand.calls,
                meanTimeMs: cand.meanTimeMs,
                estImpact: impact,
            });
        }
    }

    // Sort by impact
    suggestions.sort((a, b) => b.estImpact - a.estImpact);

    return {
        suggestions: suggestions.slice(0, 10),
        advisory: null,
    };
}
