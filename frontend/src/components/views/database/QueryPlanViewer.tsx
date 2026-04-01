import React, { useState, useMemo, useCallback } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { ChevronRight, ChevronDown, Clock, Rows3, Zap, Filter, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * QueryPlanViewer
 * ───────────────
 * A visual EXPLAIN ANALYZE explorer.
 *
 * Features:
 * - Takes a query plan JSON object as prop (from EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON))
 * - Renders as a tree of plan nodes
 * - Each node shows: operation type, actual rows, actual time, cost
 * - Color-coded by cost proportion (green→yellow→red gradient)
 * - Click a node to expand details: filter conditions, join type, index used, buffer stats
 * - Summary bar at top: total time, planning time, execution time, rows returned
 * - Zoom controls (scale the tree up/down)
 * - Node connection lines (vertical/horizontal connectors)
 */

const QueryPlanViewer = ({ planData = null, onClose = null }) => {
    useAdaptiveTheme();

    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [zoom, setZoom] = useState(1);
    const [selectedNode, setSelectedNode] = useState(null);

    // Extract summary stats
    const summaryStats = useMemo(() => {
        if (!planData || !planData.Plan) {
            return {
                planningTime: 0,
                executionTime: 0,
                totalTime: 0,
                rowsReturned: 0,
            };
        }

        return {
            planningTime: planData['Planning Time'] || 0,
            executionTime: planData['Execution Time'] || 0,
            totalTime: (planData['Planning Time'] || 0) + (planData['Execution Time'] || 0),
            rowsReturned: planData.Plan['Actual Rows'] || 0,
        };
    }, [planData]);

    // Find max cost for gradient normalization
    const maxCost = useMemo(() => {
        let max = 0;

        const traverse = (node) => {
            if (node['Total Cost']) {
                max = Math.max(max, node['Total Cost']);
            }
            if (node.Plans) {
                node.Plans.forEach(traverse);
            }
        };

        if (planData?.Plan) {
            traverse(planData.Plan);
        }

        return max > 0 ? max : 1;
    }, [planData]);

    // Get color based on cost proportion
    const getCostColor = useCallback((cost) => {
        const proportion = (cost || 0) / maxCost;

        if (proportion < 0.25) return THEME.success; // Green
        if (proportion < 0.5) return '#FFD700'; // Gold
        if (proportion < 0.75) return THEME.warning; // Orange
        return THEME.danger; // Red
    }, [maxCost]);

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

    // Styles
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusMd,
            overflow: 'hidden',
            fontFamily: THEME.fontBody,
        },
        header: {
            padding: '16px',
            borderBottom: `1px solid ${THEME.glassBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: {
            color: THEME.textMain,
            fontSize: '14px',
            fontWeight: '600',
        },
        toolbar: {
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
        },
        button: {
            padding: '6px 10px',
            background: THEME.primary,
            color: THEME.textInverse,
            border: 'none',
            borderRadius: THEME.radiusSm,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: THEME.transitionFast,
        },
        summaryBar: {
            display: 'flex',
            gap: '24px',
            padding: '12px 16px',
            background: THEME.surface,
            borderBottom: `1px solid ${THEME.glassBorder}`,
            fontSize: '12px',
        },
        summaryItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: THEME.textMain,
        },
        summaryValue: {
            fontWeight: '600',
            color: THEME.primary,
        },
        treeContainer: {
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            fontSize: '12px',
        },
        emptyState: {
            padding: '32px 16px',
            textAlign: 'center',
            color: THEME.textMuted,
            fontSize: '12px',
        },
        nodeRow: {
            marginBottom: '12px',
            padding: '8px',
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusSm,
            transition: THEME.transitionFast,
            cursor: 'pointer',
        },
        nodeRowHover: {
            background: THEME.surfaceHover,
            borderColor: THEME.glassBorderHover,
        },
        nodeHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
        },
        chevron: {
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        nodeTitle: {
            flex: 1,
            fontWeight: '600',
            color: THEME.textMain,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        nodeBadge: {
            padding: '2px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: '600',
        },
        nodeStats: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: `1px solid ${THEME.gridAlt}`,
        },
        statItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: THEME.textMuted,
        },
        detailsPanel: {
            marginTop: '12px',
            padding: '12px',
            background: THEME.bgAlt,
            borderRadius: THEME.radiusSm,
            border: `1px solid ${THEME.gridAlt}`,
            fontSize: '11px',
            maxHeight: '200px',
            overflowY: 'auto',
        },
        detailRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
            paddingBottom: '6px',
            borderBottom: `1px solid ${THEME.gridAlt}`,
        },
        detailLabel: {
            color: THEME.textMuted,
            fontWeight: '500',
        },
        detailValue: {
            color: THEME.textMain,
            fontFamily: 'monospace',
            fontSize: '10px',
        },
    };

    if (!planData || !planData.Plan) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <span style={styles.title}>Query Plan</span>
                    {onClose && (
                        <button style={styles.button} onClick={onClose}>
                            Close
                        </button>
                    )}
                </div>
                <div style={styles.emptyState}>
                    <Zap size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <div>No query plan data available</div>
                </div>
            </div>
        );
    }

    const renderNode = (node, nodeId, depth = 0) => {
        const isExpanded = expandedNodes.has(nodeId);
        const hasChildren = node.Plans && node.Plans.length > 0;
        const cost = node['Total Cost'] || 0;
        const costColor = getCostColor(cost);

        return (
            <div key={nodeId} style={{ marginLeft: `${depth * 16}px` }}>
                <div
                    style={{
                        ...styles.nodeRow,
                        borderLeftColor: costColor,
                        borderLeftWidth: '3px',
                        cursor: hasChildren || node.Filter || node.Index ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                        toggleExpand(nodeId);
                        setSelectedNode(isExpanded ? null : nodeId);
                    }}
                >
                    <div style={styles.nodeHeader}>
                        {hasChildren && (
                            <div style={styles.chevron}>
                                {isExpanded ? (
                                    <ChevronDown size={14} color={THEME.primary} />
                                ) : (
                                    <ChevronRight size={14} color={THEME.textMuted} />
                                )}
                            </div>
                        )}
                        {!hasChildren && <div style={styles.chevron} />}

                        <span
                            style={{
                                ...styles.nodeBadge,
                                background: costColor + '20',
                                color: costColor,
                            }}
                        >
                            {node['Node Type']}
                        </span>

                        <span style={styles.nodeTitle}>
                            {node.Filter && <Filter size={12} />}
                            {node.Plans && node.Plans.length > 0 && `(${node.Plans.length} child)`}
                        </span>
                    </div>

                    {/* Stats Row */}
                    <div style={styles.nodeStats}>
                        {node['Actual Rows'] !== undefined && (
                            <div style={styles.statItem}>
                                <Rows3 size={12} style={{ color: THEME.secondary }} />
                                <span>
                                    <strong>{node['Actual Rows']}</strong> rows
                                </span>
                            </div>
                        )}

                        {node['Actual Total Time'] !== undefined && (
                            <div style={styles.statItem}>
                                <Clock size={12} style={{ color: THEME.warning }} />
                                <span>
                                    <strong>{node['Actual Total Time'].toFixed(2)}</strong> ms
                                </span>
                            </div>
                        )}

                        {cost && (
                            <div style={styles.statItem}>
                                <Zap size={12} style={{ color: costColor }} />
                                <span>
                                    <strong>Cost:</strong> {cost.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Details Panel */}
                    {isExpanded && selectedNode === nodeId && (
                        <div style={styles.detailsPanel}>
                            {node.Filter && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Filter:</span>
                                    <span style={styles.detailValue}>{node.Filter}</span>
                                </div>
                            )}

                            {node['Index Name'] && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Index:</span>
                                    <span style={styles.detailValue}>{node['Index Name']}</span>
                                </div>
                            )}

                            {node['Join Type'] && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Join Type:</span>
                                    <span style={styles.detailValue}>{node['Join Type']}</span>
                                </div>
                            )}

                            {node['Relation Name'] && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Relation:</span>
                                    <span style={styles.detailValue}>{node['Relation Name']}</span>
                                </div>
                            )}

                            {node['Buffer Hits'] !== undefined && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Buffer Hits:</span>
                                    <span style={styles.detailValue}>{node['Buffer Hits']}</span>
                                </div>
                            )}

                            {node['Startup Cost'] !== undefined && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Startup Cost:</span>
                                    <span style={styles.detailValue}>
                                        {node['Startup Cost'].toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {node['Planned Rows'] !== undefined && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Planned Rows:</span>
                                    <span style={styles.detailValue}>{node['Planned Rows']}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Child Nodes */}
                {isExpanded && hasChildren && (
                    <div>
                        {node.Plans.map((child, idx) =>
                            renderNode(child, `${nodeId}-${idx}`, depth + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <span style={styles.title}>Query Execution Plan</span>
                <div style={styles.toolbar}>
                    <button
                        style={styles.button}
                        onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                    >
                        <ZoomOut size={12} />
                    </button>
                    <span style={{ color: THEME.textMuted, fontSize: '12px', minWidth: '40px' }}>
                        {(zoom * 100).toFixed(0)}%
                    </span>
                    <button
                        style={styles.button}
                        onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                    >
                        <ZoomIn size={12} />
                    </button>
                    {onClose && (
                        <button style={styles.button} onClick={onClose}>
                            Close
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Bar */}
            <div style={styles.summaryBar}>
                <div style={styles.summaryItem}>
                    <Clock size={12} />
                    <span>Planning: <span style={styles.summaryValue}>{summaryStats.planningTime.toFixed(2)}ms</span></span>
                </div>
                <div style={styles.summaryItem}>
                    <Zap size={12} />
                    <span>Execution: <span style={styles.summaryValue}>{summaryStats.executionTime.toFixed(2)}ms</span></span>
                </div>
                <div style={styles.summaryItem}>
                    <Clock size={12} />
                    <span>Total: <span style={styles.summaryValue}>{summaryStats.totalTime.toFixed(2)}ms</span></span>
                </div>
                <div style={styles.summaryItem}>
                    <Rows3 size={12} />
                    <span>Rows: <span style={styles.summaryValue}>{summaryStats.rowsReturned}</span></span>
                </div>
            </div>

            {/* Tree Container */}
            <div
                style={{
                    ...styles.treeContainer,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                }}
            >
                {renderNode(planData.Plan, 'root', 0)}
            </div>
        </div>
    );
};

export default QueryPlanViewer;
