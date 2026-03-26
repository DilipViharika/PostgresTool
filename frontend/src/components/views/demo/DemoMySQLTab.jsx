import React from 'react';
import { GlassCard, MetricCard, BentoMetric, DataTable, ResourceGauge, ChipBadge } from '../../ui/SharedComponents.jsx';
import { getDS } from '../../../config/designTokens.js';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Activity, Database, Lock, AlertCircle, TrendingUp, Server, Settings } from 'lucide-react';

const DS = getDS();

// Demo data generators
const generateChartData = (values) => {
    return values.map((value, i) => ({
        time: `${i}h`,
        value,
    }));
};

const DemoMySQLTab = ({ tabId }) => {
    // Section 1: Server Vitals Data
    const qpsHistoryData = generateChartData([
        3800, 4000, 4200, 4500, 4820, 5100, 4900, 4600, 4400, 4200, 4000, 3800, 3600, 3800, 4000, 4200, 4500, 4820,
        5100, 4900, 4600, 4400, 4200, 4000,
    ]);

    const tpsHistoryData = generateChartData([
        1200, 1300, 1400, 1500, 1580, 1650, 1600, 1520, 1450, 1380, 1300, 1200, 1150, 1200, 1300, 1400, 1500, 1580,
        1650, 1600, 1520, 1450, 1380, 1300,
    ]);

    const latencyHistoryData = generateChartData([
        2.8, 3.0, 3.2, 3.4, 3.6, 3.4, 3.2, 3.0, 2.8, 3.0, 3.2, 3.4, 3.6, 3.4, 3.2, 3.0, 2.8, 3.0, 3.2, 3.4, 3.6, 3.4,
        3.2, 3.0,
    ]);

    // Section 3: Command Breakdown Data
    const commandData = [
        { name: 'SELECT', value: 3200, fill: DS.cyan },
        { name: 'INSERT', value: 820, fill: '#34d399' },
        { name: 'UPDATE', value: 580, fill: '#818cf8' },
        { name: 'DELETE', value: 220, fill: '#fb7185' },
    ];

    const commandBarData = [
        { name: 'SELECT', value: 3200 },
        { name: 'INSERT', value: 820 },
        { name: 'UPDATE', value: 580 },
        { name: 'DELETE', value: 220 },
    ];

    // Section 4: InnoDB Buffer Pool Data
    const bufferPoolData = generateChartData([
        78, 79, 80, 81, 82, 84, 83, 82, 81, 80, 79, 78, 77, 78, 79, 80, 81, 82, 84, 83, 82, 81, 80, 79,
    ]);

    // Section 5: System Resources Data
    const cpuHistoryData = generateChartData([
        25, 28, 30, 32, 35, 38, 36, 34, 32, 30, 28, 25, 24, 26, 28, 30, 32, 35, 38, 36, 34, 32, 30, 28,
    ]);

    const memoryHistoryData = generateChartData([
        62, 64, 65, 66, 68, 70, 69, 68, 67, 66, 65, 63, 62, 63, 64, 65, 66, 68, 70, 69, 68, 67, 66, 65,
    ]);

    const connectionsHistoryData = generateChartData([
        70, 75, 80, 85, 90, 95, 100, 98, 92, 88, 85, 80, 75, 78, 82, 86, 90, 95, 100, 98, 92, 88, 85, 80,
    ]);

    // Section 6: Slow Queries
    const slowQueriesData = [
        {
            query: 'SELECT c.*, COUNT(o.id) order_count, SUM...',
            avgTime: '1,240ms',
            calls: 480,
            rowsExamined: '5,200,000',
        },
        {
            query: 'SELECT p.*, GROUP_CONCAT(t.name) tags...',
            avgTime: '780ms',
            calls: 1200,
            rowsExamined: '2,800,000',
        },
        {
            query: 'INSERT INTO analytics_events...',
            avgTime: '2,100ms',
            calls: 24,
            rowsExamined: '4,000,000',
        },
    ];

    // Section 7: Replication
    const replicationData = [
        {
            name: 'mysql-replica-01',
            lag: '0.5s',
            state: 'Running',
            gtid: 'a1b2...458920',
        },
        {
            name: 'mysql-replica-02',
            lag: '0.8s',
            state: 'Running',
            gtid: 'a1b2...458918',
        },
    ];

    return (
        <div
            style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                backgroundColor: DS.bg,
                color: DS.text,
            }}
        >
            {/* Section 1: Server Vitals */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: DS.cyan,
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Server Vitals</h2>
                    <ChipBadge label="DEMO DATA" color="amber" />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <MetricCard label="QPS" value="4,820" unit="queries/s" />
                    <MetricCard label="TPS" value="1,580" unit="transactions/s" />
                    <MetricCard label="Connections" value="95/300" unit="active" />
                    <MetricCard label="Uptime" value="34" unit="days" />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <ResourceGauge label="CPU" value={35} unit="%" color={DS.cyan} />
                    <ResourceGauge label="Memory" value={68} unit="%" color="#34d399" />
                </div>
            </div>

            {/* Section 2: Query Performance */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#818cf8',
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Query Performance</h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>QPS History</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={qpsHistoryData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={DS.cyan}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>TPS History</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={tpsHistoryData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#34d399"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Latency History</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={latencyHistoryData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#818cf8"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <BentoMetric
                        metrics={[
                            { label: 'Avg Query', value: '3.2ms' },
                            { label: 'p95', value: '15.4ms' },
                            { label: 'Slow Queries', value: '22' },
                            { label: 'Full Scans', value: '6.8%' },
                        ]}
                    />
                </div>
            </div>

            {/* Section 3: Command Breakdown */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#34d399',
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Command Breakdown</h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={commandData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}/s`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {commandData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Commands/sec</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={commandBarData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Bar dataKey="value" fill={DS.cyan} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>
            </div>

            {/* Section 4: InnoDB Engine */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#fbbf24',
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>InnoDB Engine</h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <ResourceGauge label="Buffer Pool" value={82} unit="%" color="#34d399" />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <MetricCard label="Cache Hit" value="99.6" unit="%" />
                    <MetricCard label="Log Writes" value="450" unit="/s" />
                    <MetricCard label="Page Reads" value="1,200" unit="/s" />
                    <MetricCard label="Page Writes" value="380" unit="/s" />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Buffer Pool History</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={bufferPoolData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    fill={`${DS.cyan}33`}
                                    stroke={DS.cyan}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>
            </div>

            {/* Section 5: System Resources */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#fb7185',
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>System Resources</h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <ResourceGauge label="CPU" value={35} unit="%" color={DS.cyan} />
                    <ResourceGauge label="Memory" value={68} unit="%" color="#34d399" />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>CPU Usage</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={cpuHistoryData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    fill={`${DS.cyan}33`}
                                    stroke={DS.cyan}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Memory Usage</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={memoryHistoryData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    fill={`#34d39933`}
                                    stroke="#34d399"
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Active Connections</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={connectionsHistoryData}>
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: DS.textMuted, fontSize: 12 }}
                                    stroke={`${DS.border}44`}
                                />
                                <YAxis tick={{ fill: DS.textMuted, fontSize: 12 }} stroke={`${DS.border}44`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: DS.bgHover,
                                        border: `1px solid ${DS.border}`,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: DS.text }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#818cf8"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>
            </div>

            {/* Section 6: Slow Queries */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: DS.cyan,
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Slow Queries</h2>
                </div>
                <DataTable
                    columns={[
                        { header: 'Query', key: 'query', width: '40%' },
                        { header: 'Avg Time (ms)', key: 'avgTime', width: '20%' },
                        { header: 'Calls', key: 'calls', width: '20%' },
                        { header: 'Rows Examined', key: 'rowsExamined', width: '20%' },
                    ]}
                    data={slowQueriesData}
                />
            </div>

            {/* Section 7: Replication */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#34d399',
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Replication</h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <DataTable
                        columns={[
                            { header: 'Replica', key: 'name', width: '30%' },
                            { header: 'Lag', key: 'lag', width: '20%' },
                            { header: 'State', key: 'state', width: '20%' },
                            { header: 'GTID', key: 'gtid', width: '30%' },
                        ]}
                        data={replicationData}
                    />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <BentoMetric
                        metrics={[
                            { label: 'Lag', value: '0.5s' },
                            { label: 'Workers', value: '4' },
                            { label: 'GTID', value: 'ON' },
                            { label: 'Semi-sync', value: 'YES' },
                        ]}
                    />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <MetricCard label="Binlog Size" value="2.4" unit="GB" />
                    <MetricCard label="Purge Age" value="7" unit="days" />
                </div>
            </div>

            {/* Section 8: Schema & Security */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#818cf8',
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Schema & Security</h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <BentoMetric
                        metrics={[
                            { label: 'Databases', value: '8' },
                            { label: 'Tables', value: '342' },
                            { label: 'Views', value: '28' },
                            { label: 'Procedures', value: '15' },
                            { label: 'Triggers', value: '22' },
                            { label: 'Foreign Keys', value: '89' },
                        ]}
                    />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <MetricCard label="Users" value="24" unit="" />
                    <MetricCard label="Roles" value="6" unit="" />
                    <MetricCard label="Failed Logins" value="3" unit="" />
                    <MetricCard label="DDL Changes" value="2" unit="" />
                </div>
            </div>

            {/* Section 9: Indexes & Reliability */}
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#fbbf24',
                        }}
                    />
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Indexes & Reliability</h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px',
                    }}
                >
                    <MetricCard label="Total Indexes" value="485" unit="" />
                    <MetricCard label="Unused" value="18" unit="" />
                    <MetricCard label="Duplicate" value="5" unit="" />
                    <MetricCard label="Hit Ratio" value="98.7" unit="%" />
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '16px',
                    }}
                >
                    <BentoMetric
                        metrics={[
                            { label: 'Error Rate', value: '0.02%' },
                            { label: 'Availability', value: '99.97%' },
                            { label: 'Recovery Time', value: '12s' },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default DemoMySQLTab;
