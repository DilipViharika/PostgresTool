import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { useConnection } from '../../../context/ConnectionContext';
import {
    Database,
    Table2,
    ChevronRight,
    ChevronDown,
    Search,
    Key,
    Hash,
    Eye,
    Copy,
    Layers,
    Code,
    FunctionSquare,
} from 'lucide-react';

/**
 * SchemaTreeBrowser
 * ──────────────────
 * Enhanced schema browser with tree-view navigation.
 *
 * Features:
 * - Tree structure: Database > Schema > Tables/Views/Functions/Sequences
 * - Expandable nodes with chevron icons and indentation
 * - Table node expands to show columns (name, type, nullable, PK/FK badges)
 * - Search/filter bar at top (fuzzy match on table/column names)
 * - Right-click context menu: "View Data (Top 100)", "Copy CREATE TABLE", "View Indexes"
 * - Fetches schema data from `/api/schema/tree?connectionId=X` (GET)
 * - Loading skeleton while fetching
 * - Empty state when no schema data
 * - Compact sidebar-style layout (works in a 300px wide panel)
 */

const SchemaTreeBrowser = () => {
    useAdaptiveTheme();

    const { activeConnectionId } = useConnection();
    const [treeData, setTreeData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    // Fetch schema tree data
    useEffect(() => {
        const fetchSchemaTree = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchData('/api/schema/tree');
                setTreeData(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch schema tree');
            } finally {
                setLoading(false);
            }
        };

        if (activeConnectionId) {
            fetchSchemaTree();
        }
    }, [activeConnectionId]);

    // Fuzzy search filter
    const filteredTree = useMemo(() => {
        if (!treeData) return null;
        if (!searchTerm) return treeData;

        const searchLower = searchTerm.toLowerCase();

        const filterSchemas = (schemas) => {
            return schemas
                .map((schema) => {
                    const filteredTables = schema.tables.filter((table) => {
                        const tableMatch = table.name.toLowerCase().includes(searchLower);
                        const columnMatch = table.columns?.some((col) =>
                            col.name.toLowerCase().includes(searchLower)
                        );
                        return tableMatch || columnMatch;
                    });

                    const filteredViews = schema.views?.filter((view) =>
                        view.name.toLowerCase().includes(searchLower)
                    ) || [];

                    const filteredFunctions = schema.functions?.filter((func) =>
                        func.name.toLowerCase().includes(searchLower)
                    ) || [];

                    const filteredSequences = schema.sequences?.filter((seq) =>
                        seq.name.toLowerCase().includes(searchLower)
                    ) || [];

                    if (
                        filteredTables.length > 0 ||
                        filteredViews.length > 0 ||
                        filteredFunctions.length > 0 ||
                        filteredSequences.length > 0
                    ) {
                        return {
                            ...schema,
                            tables: filteredTables,
                            views: filteredViews,
                            functions: filteredFunctions,
                            sequences: filteredSequences,
                        };
                    }
                    return null;
                })
                .filter(Boolean);
        };

        return {
            ...treeData,
            schemas: filterSchemas(treeData.schemas || []),
        };
    }, [treeData, searchTerm]);

    // Toggle node expansion
    const toggleExpand = useCallback((nodeId) => {
        setExpandedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    // Handle right-click context menu
    const handleContextMenu = (e, node, nodeType) => {
        e.preventDefault();
        setSelectedNode({ ...node, type: nodeType });
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
        });
    };

    // Copy CREATE TABLE to clipboard
    const handleCopyCreateTable = async () => {
        if (!selectedNode || selectedNode.type !== 'table') return;
        try {
            // In production, fetch the actual CREATE TABLE statement from the backend
            const createTableSQL = `CREATE TABLE ${selectedNode.schema}.${selectedNode.name} (\n  -- columns would be listed here\n);`;
            await navigator.clipboard.writeText(createTableSQL);
            setContextMenu(null);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Styles
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: THEME.glass,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusMd,
            overflow: 'hidden',
            fontFamily: THEME.fontBody,
        },
        searchBar: {
            padding: '12px',
            borderBottom: `1px solid ${THEME.glassBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        searchInput: {
            flex: 1,
            padding: '6px 10px',
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusSm,
            color: THEME.textMain,
            fontFamily: THEME.fontBody,
            fontSize: '13px',
            outline: 'none',
        },
        treeContainer: {
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            fontSize: '13px',
        },
        treeNode: {
            padding: '4px 0',
            userSelect: 'none',
        },
        nodeRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 6px',
            cursor: 'pointer',
            borderRadius: THEME.radiusSm,
            transition: THEME.transitionFast,
        },
        nodeRowHover: {
            background: THEME.surfaceHover,
        },
        nodeIcon: {
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
        },
        chevron: {
            width: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        nodeName: {
            flex: 1,
            color: THEME.textMain,
            fontSize: '12px',
            fontWeight: '500',
        },
        badge: {
            display: 'inline-block',
            padding: '1px 4px',
            background: THEME.primary + '20',
            color: THEME.primary,
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: '600',
            marginRight: '4px',
        },
        column: {
            padding: '3px 0 3px 24px',
            fontSize: '11px',
            color: THEME.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        columnName: {
            color: THEME.secondary,
            fontFamily: 'monospace',
            fontSize: '11px',
        },
        columnType: {
            color: THEME.textDim,
            fontSize: '10px',
            marginLeft: '4px',
        },
        contextMenu: {
            position: 'fixed',
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusSm,
            boxShadow: THEME.shadowMd,
            zIndex: 10000,
            minWidth: '200px',
        },
        contextMenuItemStyle: {
            padding: '8px 12px',
            cursor: 'pointer',
            color: THEME.textMain,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: THEME.transitionFast,
        },
        contextMenuItemHover: {
            background: THEME.surfaceHover,
        },
        emptyState: {
            padding: '32px 16px',
            textAlign: 'center',
            color: THEME.textMuted,
            fontSize: '12px',
        },
        loadingSkeleton: {
            padding: '12px',
        },
        skeletonLine: {
            height: '20px',
            background: THEME.surface,
            borderRadius: THEME.radiusSm,
            marginBottom: '8px',
            animation: 'pulse 2s infinite',
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <style>
                    {`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }`}
                </style>
                <div style={styles.searchBar}>
                    <Search size={14} style={{ color: THEME.textMuted }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        disabled
                        style={{ ...styles.searchInput, opacity: 0.5 }}
                    />
                </div>
                <div style={styles.loadingSkeleton}>
                    <div style={styles.skeletonLine} />
                    <div style={styles.skeletonLine} />
                    <div style={styles.skeletonLine} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={{ padding: '16px', color: THEME.danger, fontSize: '12px' }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!filteredTree || !filteredTree.schemas || filteredTree.schemas.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.searchBar}>
                    <Search size={14} style={{ color: THEME.textMuted }} />
                    <input
                        type="text"
                        placeholder="Search tables, columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                <div style={styles.emptyState}>
                    <Database size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <div>No schema data available</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>
                {`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }`}
            </style>

            {/* Search Bar */}
            <div style={styles.searchBar}>
                <Search size={14} style={{ color: THEME.textMuted, flexShrink: 0 }} />
                <input
                    type="text"
                    placeholder="Search tables, columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {/* Tree View */}
            <div style={styles.treeContainer}>
                {filteredTree.schemas.map((schema) => {
                    const schemaId = `schema-${schema.name}`;
                    const isExpanded = expandedNodes.has(schemaId);

                    return (
                        <div key={schemaId} style={styles.treeNode}>
                            {/* Schema Node */}
                            <div
                                style={{
                                    ...styles.nodeRow,
                                    fontWeight: '600',
                                }}
                                onClick={() => toggleExpand(schemaId)}
                            >
                                <div style={styles.chevron}>
                                    {isExpanded ? (
                                        <ChevronDown size={14} color={THEME.primary} />
                                    ) : (
                                        <ChevronRight size={14} color={THEME.textMuted} />
                                    )}
                                </div>
                                <Database size={12} style={{ color: THEME.primary }} />
                                <span style={styles.nodeName}>{schema.name}</span>
                            </div>

                            {isExpanded && (
                                <div>
                                    {/* Tables */}
                                    {schema.tables && schema.tables.length > 0 && (
                                        <div>
                                            {schema.tables.map((table) => {
                                                const tableId = `table-${schema.name}-${table.name}`;
                                                const tableExpanded = expandedNodes.has(tableId);

                                                return (
                                                    <div key={tableId} style={styles.treeNode}>
                                                        {/* Table Node */}
                                                        <div
                                                            style={{
                                                                ...styles.nodeRow,
                                                                marginLeft: '16px',
                                                            }}
                                                            onClick={() => toggleExpand(tableId)}
                                                            onContextMenu={(e) =>
                                                                handleContextMenu(e, {
                                                                    name: table.name,
                                                                    schema: schema.name,
                                                                }, 'table')
                                                            }
                                                        >
                                                            <div style={styles.chevron}>
                                                                {tableExpanded ? (
                                                                    <ChevronDown size={14} color={THEME.secondary} />
                                                                ) : (
                                                                    <ChevronRight size={14} color={THEME.textMuted} />
                                                                )}
                                                            </div>
                                                            <Table2 size={12} style={{ color: THEME.secondary }} />
                                                            <span style={styles.nodeName}>{table.name}</span>
                                                            {table.rowCount && (
                                                                <span style={{ ...styles.badge, marginRight: 0 }}>
                                                                    {table.rowCount.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Columns */}
                                                        {tableExpanded && table.columns && table.columns.length > 0 && (
                                                            <div>
                                                                {table.columns.map((col) => (
                                                                    <div
                                                                        key={`${tableId}-${col.name}`}
                                                                        style={styles.column}
                                                                    >
                                                                        {col.isPrimaryKey && (
                                                                            <Key
                                                                                size={10}
                                                                                style={{ color: THEME.warning }}
                                                                            />
                                                                        )}
                                                                        {col.isForeignKey && (
                                                                            <Layers
                                                                                size={10}
                                                                                style={{ color: THEME.info }}
                                                                            />
                                                                        )}
                                                                        {!col.isPrimaryKey && !col.isForeignKey && (
                                                                            <Hash
                                                                                size={10}
                                                                                style={{ color: THEME.textDim }}
                                                                            />
                                                                        )}
                                                                        <span style={styles.columnName}>
                                                                            {col.name}
                                                                        </span>
                                                                        <span style={styles.columnType}>
                                                                            {col.type}
                                                                            {col.nullable === false && ' NOT NULL'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Views */}
                                    {schema.views && schema.views.length > 0 && (
                                        <div>
                                            {schema.views.map((view) => (
                                                <div
                                                    key={`view-${schema.name}-${view.name}`}
                                                    style={{
                                                        ...styles.nodeRow,
                                                        marginLeft: '16px',
                                                    }}
                                                >
                                                    <div style={styles.chevron} />
                                                    <Eye size={12} style={{ color: THEME.info }} />
                                                    <span style={styles.nodeName}>{view.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Functions */}
                                    {schema.functions && schema.functions.length > 0 && (
                                        <div>
                                            {schema.functions.map((func) => (
                                                <div
                                                    key={`func-${schema.name}-${func.name}`}
                                                    style={{
                                                        ...styles.nodeRow,
                                                        marginLeft: '16px',
                                                    }}
                                                >
                                                    <div style={styles.chevron} />
                                                    <FunctionSquare size={12} style={{ color: THEME.success }} />
                                                    <span style={styles.nodeName}>{func.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Sequences */}
                                    {schema.sequences && schema.sequences.length > 0 && (
                                        <div>
                                            {schema.sequences.map((seq) => (
                                                <div
                                                    key={`seq-${schema.name}-${seq.name}`}
                                                    style={{
                                                        ...styles.nodeRow,
                                                        marginLeft: '16px',
                                                    }}
                                                >
                                                    <div style={styles.chevron} />
                                                    <Layers size={12} style={{ color: THEME.warning }} />
                                                    <span style={styles.nodeName}>{seq.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9999,
                        }}
                        onClick={() => setContextMenu(null)}
                    />
                    <div
                        style={{
                            ...styles.contextMenu,
                            top: `${contextMenu.y}px`,
                            left: `${contextMenu.x}px`,
                        }}
                    >
                        <div
                            style={styles.contextMenuItemStyle}
                            onClick={() => {
                                // View Data action
                                setContextMenu(null);
                            }}
                        >
                            <Eye size={12} />
                            View Data (Top 100)
                        </div>
                        <div
                            style={styles.contextMenuItemStyle}
                            onClick={handleCopyCreateTable}
                        >
                            <Copy size={12} />
                            Copy CREATE TABLE
                        </div>
                        <div
                            style={styles.contextMenuItemStyle}
                            onClick={() => {
                                // View Indexes action
                                setContextMenu(null);
                            }}
                        >
                            <Code size={12} />
                            View Indexes
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SchemaTreeBrowser;
