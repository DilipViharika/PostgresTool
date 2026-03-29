// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { Search, ZoomIn, ZoomOut, Filter, Eye, Code } from 'lucide-react';
import type { Column, Table, TreeNode, TableRelationship, ChartData } from './types';

/**
 * SchemaVisualizerTab
 * ─────────────────────
 * Interactive force-directed graph showing table relationships.
 * Features:
 * - Force-directed layout with drag support
 * - Click to highlight relationships
 * - Hover for column details
 * - Zoom, pan, search, filter
 * - Dependency tree view (toggle)
 * - Column detail panel
 */

const SchemaVisualizerTab = () => {
    useAdaptiveTheme();

    const [relationships, setRelationships] = useState(null);
    const [dependencies, setDependencies] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedTableColumns, setSelectedTableColumns] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSchema, setFilterSchema] = useState('');
    const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'tree'
    const [zoom, setZoom] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredTable, setHoveredTable] = useState(null);
    const [tooltip, setTooltip] = useState(null);

    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const simulationRef = useRef(null);
    const nodesRef = useRef([]);
    const linksRef = useRef([]);
    const draggedNodeRef = useRef(null);

    // Fetch schema data
    useEffect(() => {
        const fetchSchema = async () => {
            try {
                setLoading(true);
                setError(null);
                const [relData, depData] = await Promise.all([
                    fetchData('/api/schema/relationships'),
                    fetchData('/api/schema/dependencies'),
                ]);
                setRelationships(relData);
                setDependencies(depData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSchema();
    }, []);

    // Fetch selected table columns
    useEffect(() => {
        if (!selectedTable) {
            setSelectedTableColumns(null);
            return;
        }
        const [schema, table] = selectedTable.split('.');
        const fetchColumns = async () => {
            try {
                const cols = await fetchData(`/api/schema/columns/${schema}/${table}`);
                setSelectedTableColumns(cols);
            } catch (err) {
                console.error('Failed to fetch columns:', err);
            }
        };
        fetchColumns();
    }, [selectedTable]);

    // Get unique schemas
    const schemas = useMemo(() => {
        if (!relationships) return [];
        const schemaSet = new Set();
        relationships.tables.forEach(t => schemaSet.add(t.schema));
        return Array.from(schemaSet).sort();
    }, [relationships]);

    // Filter and search
    const filteredTables = useMemo(() => {
        if (!relationships) return [];
        return relationships.tables.filter(t => {
            const matchesSchema = !filterSchema || t.schema === filterSchema;
            const matchesSearch = !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSchema && matchesSearch;
        });
    }, [relationships, filterSchema, searchTerm]);

    const filteredRelationships = useMemo(() => {
        if (!relationships) return [];
        const tableIds = new Set(filteredTables.map(t => t.id));
        return relationships.relationships.filter(
            r => tableIds.has(r.from) && tableIds.has(r.to)
        );
    }, [relationships, filteredTables]);

    // Force simulation
    const updateSimulation = useCallback(() => {
        if (!filteredTables.length) return;

        const nodes = filteredTables.map((t, i) => ({
            id: t.id,
            name: t.name,
            schema: t.schema,
            rowCount: t.rowCount,
            x: 0 * 600 - 300,
            y: 0 * 600 - 300,
            vx: 0,
            vy: 0,
            fixed: false,
        }));

        const links = filteredRelationships.map(r => ({
            source: r.from,
            target: r.to,
            type: r.type,
        }));

        nodesRef.current = nodes;
        linksRef.current = links;

        // Run simulation for 100 iterations
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        for (let iter = 0; iter < 100; iter++) {
            // Repulsion
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                    const force = 100 / (dist * dist);
                    a.vx -= (force * dx) / dist;
                    a.vy -= (force * dy) / dist;
                    b.vx += (force * dx) / dist;
                    b.vy += (force * dy) / dist;
                }
            }

            // Attraction along links
            for (const link of links) {
                const a = nodeMap.get(link.source);
                const b = nodeMap.get(link.target);
                if (!a || !b) continue;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                const force = (dist - 80) * 0.02;
                a.vx += (force * dx) / dist;
                a.vy += (force * dy) / dist;
                b.vx -= (force * dx) / dist;
                b.vy -= (force * dy) / dist;
            }

            // Center force
            for (const n of nodes) {
                n.vx -= n.x * 0.01;
                n.vy -= n.y * 0.01;
            }

            // Damping and update position
            for (const n of nodes) {
                if (!n.fixed) {
                    n.vx *= 0.98;
                    n.vy *= 0.98;
                    n.x += n.vx;
                    n.y += n.vy;
                }
            }
        }

        render();
    }, [filteredTables, filteredRelationships]);

    // Render SVG
    const render = useCallback(() => {
        const svg = svgRef.current;
        if (!svg) return;

        // Clear
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const width = svg.clientWidth || 800;
        const height = svg.clientHeight || 600;

        // Group for zoom/pan
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.transform = `scale(${zoom}) translate(${width / 2}, ${height / 2})`;
        g.style.transformOrigin = `0 0`;
        g.style.transformBox = 'fill-box';

        // Draw links
        for (const link of linksRef.current) {
            const source = nodesRef.current.find(n => n.id === link.source);
            const target = nodesRef.current.find(n => n.id === link.target);
            if (!source || !target) continue;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', source.x);
            line.setAttribute('y1', source.y);
            line.setAttribute('x2', target.x);
            line.setAttribute('y2', target.y);
            line.setAttribute('stroke', THEME.primary);
            line.setAttribute('stroke-width', '2');
            line.setAttribute('opacity', '0.4');
            g.appendChild(line);
        }

        // Draw nodes
        for (const node of nodesRef.current) {
            const isSelected = selectedTable === node.id;
            const isHovered = hoveredTable === node.id;
            const isRelated = selectedTable &&
                filteredRelationships.some(r =>
                    (r.from === selectedTable && r.to === node.id) ||
                    (r.from === node.id && r.to === selectedTable)
                );

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '35');
            circle.setAttribute('fill', isSelected ? THEME.secondary : THEME.primary);
            circle.setAttribute('opacity', isSelected || isRelated ? '1' : (isHovered ? '0.8' : '0.6'));
            circle.style.cursor = 'pointer';
            circle.style.transition = 'all 0.2s ease';

            circle.addEventListener('mousedown', (e) => {
                draggedNodeRef.current = node;
                node.fixed = true;
            });

            circle.addEventListener('mouseover', () => {
                setHoveredTable(node.id);
                setTooltip({ x: node.x, y: node.y, name: node.name, rows: node.rowCount });
            });

            circle.addEventListener('mouseout', () => {
                setHoveredTable(null);
                setTooltip(null);
            });

            circle.addEventListener('click', () => {
                setSelectedTable(isSelected ? null : node.id);
            });

            g.appendChild(circle);

            // Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', THEME.textMain);
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', '600');
            text.style.pointerEvents = 'none';
            text.textContent = node.name;
            g.appendChild(text);
        }

        svg.appendChild(g);
    }, [zoom, selectedTable, hoveredTable, filteredRelationships, THEME]);

    // Mouse events for panning and dragging
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const handleMouseMove = (e) => {
            if (draggedNodeRef.current) {
                const rect = svg.getBoundingClientRect();
                const x = (e.clientX - rect.left) / zoom - svg.clientWidth / 2 / zoom;
                const y = (e.clientY - rect.top) / zoom - svg.clientHeight / 2 / zoom;
                draggedNodeRef.current.x = x;
                draggedNodeRef.current.y = y;
                draggedNodeRef.current.vx = 0;
                draggedNodeRef.current.vy = 0;
                render();
            }
        };

        const handleMouseUp = () => {
            if (draggedNodeRef.current) {
                draggedNodeRef.current.fixed = false;
                draggedNodeRef.current = null;
            }
        };

        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        svg.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            svg.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, render]);

    // Initialize simulation when data loads or filters change
    useEffect(() => {
        if (relationships) {
            updateSimulation();
        }
    }, [relationships, filterSchema, searchTerm, updateSimulation]);

    // Styles
    const styles = {
        wrap: {
            display: 'flex',
            height: '100%',
            gap: '0',
            fontFamily: THEME.fontBody,
        },
        panel: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            background: THEME.glass,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusMd,
            overflow: 'hidden',
        },
        toolbar: {
            padding: '16px',
            borderBottom: `1px solid ${THEME.glassBorder}`,
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        input: {
            padding: '8px 12px',
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusSm,
            color: THEME.textMain,
            fontFamily: THEME.fontBody,
            fontSize: '13px',
            flex: 1,
            minWidth: '200px',
        },
        select: {
            padding: '8px 12px',
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
            borderRadius: THEME.radiusSm,
            color: THEME.textMain,
            fontFamily: THEME.fontBody,
            fontSize: '13px',
        },
        button: {
            padding: '8px 12px',
            background: THEME.primary,
            color: THEME.textInverse,
            border: 'none',
            borderRadius: THEME.radiusSm,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: THEME.transitionFast,
        },
        svg: {
            flex: 1,
            background: THEME.bgAlt,
            borderRadius: THEME.radiusMd,
        },
        sidePanel: {
            width: '280px',
            borderLeft: `1px solid ${THEME.glassBorder}`,
            padding: '16px',
            overflowY: 'auto',
            background: THEME.surface,
        },
        columnRow: {
            padding: '8px 0',
            borderBottom: `1px solid ${THEME.gridAlt}`,
            fontSize: '12px',
        },
        badge: {
            display: 'inline-block',
            padding: '2px 6px',
            background: THEME.primary + '20',
            color: THEME.primary,
            borderRadius: '3px',
            fontSize: '11px',
            marginRight: '4px',
        },
    };

    if (loading) {
        return (
            <div style={styles.panel}>
                <div style={{ padding: '32px', textAlign: 'center', color: THEME.textMuted }}>
                    Loading schema...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.panel}>
                <div style={{ padding: '32px', textAlign: 'center', color: THEME.danger }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.wrap}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={styles.toolbar}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                        <Search size={16} style={{ marginTop: '8px', color: THEME.textMuted }} />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <Filter size={16} style={{ color: THEME.textMuted }} />
                    <select
                        value={filterSchema}
                        onChange={e => setFilterSchema(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">All Schemas</option>
                        {schemas.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <select
                        value={viewMode}
                        onChange={e => setViewMode(e.target.value)}
                        style={styles.select}
                    >
                        <option value="graph">Graph View</option>
                        <option value="tree">Tree View</option>
                    </select>

                    <button style={styles.button} onClick={() => setZoom(z => z * 1.2)}>
                        <ZoomIn size={14} /> Zoom In
                    </button>
                    <button style={styles.button} onClick={() => setZoom(z => z / 1.2)}>
                        <ZoomOut size={14} /> Zoom Out
                    </button>
                </div>

                {viewMode === 'graph' ? (
                    <svg
                        ref={svgRef}
                        style={{
                            ...styles.svg,
                            flex: 1,
                        }}
                    />
                ) : (
                    <div style={{ padding: '16px', color: THEME.textMuted, fontSize: '13px' }}>
                        <div style={{ marginBottom: '12px', color: THEME.primary, fontWeight: '600' }}>
                            Dependencies ({filteredRelationships.length})
                        </div>
                        {filteredRelationships.map((rel, i) => (
                            <div key={i} style={{ padding: '4px 0', fontSize: '12px', marginBottom: '8px' }}>
                                <div>{rel.from.split('.')[1]} →</div>
                                <div style={{ marginLeft: '12px', color: THEME.secondary }}>
                                    {rel.to.split('.')[1]}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedTable && (
                <div style={styles.sidePanel}>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ color: THEME.textMain, fontWeight: '600', marginBottom: '4px' }}>
                            {selectedTable.split('.')[1]}
                        </div>
                        <div style={{ color: THEME.textMuted, fontSize: '11px' }}>
                            {selectedTable.split('.')[0]} schema
                        </div>
                    </div>

                    {selectedTableColumns && selectedTableColumns.columns && (
                        <div>
                            <div style={{ color: THEME.primary, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                                Columns
                            </div>
                            {selectedTableColumns.columns.map((col, i) => (
                                <div key={i} style={styles.columnRow}>
                                    <div>
                                        {col.isPrimaryKey && <span style={styles.badge}>PK</span>}
                                        {col.isForeignKey && <span style={styles.badge}>FK</span>}
                                        <code style={{ color: THEME.secondary }}>{col.name}</code>
                                    </div>
                                    <div style={{ color: THEME.textMuted, fontSize: '11px', marginTop: '2px' }}>
                                        {col.type}
                                        {col.nullable ? ' (nullable)' : ''}
                                    </div>
                                    {col.distinctValues && (
                                        <div style={{ color: THEME.textDim, fontSize: '11px', marginTop: '2px' }}>
                                            {col.distinctValues > 0 ? `${col.distinctValues.toFixed(0)} distinct` : 'null'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        style={{
                            ...styles.button,
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '16px',
                        }}
                        onClick={() => setSelectedTable(null)}
                    >
                        Close Panel
                    </button>
                </div>
            )}
        </div>
    );
};

export default SchemaVisualizerTab;
