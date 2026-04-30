/**
 * Metrics Graphs Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Monitoreo en tiempo real del sistema.
 */

'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import { Activity, Cpu, MemoryStick, Zap, BarChart3 } from 'lucide-react';

interface GraphData {
    time: Date;
    value: number;
}

const generateHistoricalData = (hours: number, baseValue: number, variance: number): GraphData[] => {
    const data: GraphData[] = [];
    const now = new Date();
    for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * variance * 2;
        const value = Math.max(0, Math.min(100, baseValue + variation));
        data.push({ time, value });
    }
    return data;
};

const mockCpuData = generateHistoricalData(24, 45, 20);
const mockMemoryData = generateHistoricalData(24, 62, 15);
const mockLatencyData = generateHistoricalData(24, 85, 60);
const mockRequestsData = generateHistoricalData(24, 12000, 5000);

export default function MetricsGraphsPanel() {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [graphs, setGraphs] = useState({
        cpu: mockCpuData,
        memory: mockMemoryData,
        latency: mockLatencyData,
        requests: mockRequestsData,
    });

    const currentMetrics = {
        cpu: graphs.cpu[graphs.cpu.length - 1]?.value || 0,
        memory: graphs.memory[graphs.memory.length - 1]?.value || 0,
        latency: graphs.latency[graphs.latency.length - 1]?.value || 0,
        requests: graphs.requests[graphs.requests.length - 1]?.value || 0,
    };

    const getAverage = (data: GraphData[]) => {
        const sum = data.reduce((acc, d) => acc + d.value, 0);
        return Math.round(sum / data.length);
    };

    const getPeak = (data: GraphData[]) => {
        return Math.max(...data.map(d => d.value));
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    const getMetricColor = (value: number, threshold: number[]) => {
        if (value > threshold[2]) return N.danger;
        if (value > threshold[1]) return N.warning;
        return N.success;
    };

    // Simple bar chart component
    const BarChart = ({ data, color, maxValue }: { data: GraphData[]; color: string; maxValue: number }) => (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '10rem' }}>
            {data.map((d, i) => (
                <div
                    key={i}
                    style={{
                        flex: 1,
                        height: `${(d.value / maxValue) * 100}%`,
                        minHeight: '4px',
                        background: color,
                        borderRadius: '2px 2px 0 0',
                        transition: 'all 0.2s',
                        opacity: 0.8
                    }}
                    title={`${formatTime(d.time)}: ${d.value}`}
                />
            ))}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #3b82f6, #6366f1)` }}>
                        <BarChart3 style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Métricas y Gráficos</h2>
                        <p style={{ color: N.textSub }}>Monitoreo en tiempo real del sistema</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['24h', '7d', '30d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer',
                                background: timeRange === range ? N.accent : N.dark,
                                color: timeRange === range ? 'white' : N.textSub,
                                transition: 'all 0.2s'
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Current Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.25rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Cpu style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />
                        <StatusBadge
                            status={currentMetrics.cpu > 80 ? 'danger' : currentMetrics.cpu > 50 ? 'warning' : 'success'}
                            label={`${currentMetrics.cpu}%`}
                        />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>CPU Usage</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: N.textSub }}>Avg: {getAverage(graphs.cpu)}%</span>
                        <span style={{ color: N.textSub }}>Peak: {getPeak(graphs.cpu)}%</span>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.25rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <MemoryStick style={{ width: '1.5rem', height: '1.5rem', color: '#a855f7' }} />
                        <StatusBadge
                            status={currentMetrics.memory > 80 ? 'danger' : currentMetrics.memory > 50 ? 'warning' : 'success'}
                            label={`${currentMetrics.memory}%`}
                        />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Memory Usage</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: N.textSub }}>Avg: {getAverage(graphs.memory)}%</span>
                        <span style={{ color: N.textSub }}>Peak: {getPeak(graphs.memory)}%</span>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.25rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Zap style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                        <StatusBadge
                            status={currentMetrics.latency > 200 ? 'danger' : currentMetrics.latency > 100 ? 'warning' : 'success'}
                            label={`${currentMetrics.latency}ms`}
                        />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>API Latency</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: N.textSub }}>Avg: {getAverage(graphs.latency)}ms</span>
                        <span style={{ color: N.textSub }}>Peak: {getPeak(graphs.latency)}ms</span>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.25rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />
                        <StatusBadge status="info" label={`${currentMetrics.requests.toLocaleString()}/h`} />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Requests/h</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: N.textSub }}>Avg: {getAverage(graphs.requests).toLocaleString()}</span>
                        <span style={{ color: N.textSub }}>Peak: {getPeak(graphs.requests).toLocaleString()}</span>
                    </div>
                </NeuCard>
            </div>

            {/* Graphs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {/* CPU Graph */}
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: '600', color: N.text }}>💻 CPU Usage</h3>
                        <span style={{ fontSize: '0.875rem', color: N.textSub }}>24h</span>
                    </div>
                    <BarChart data={graphs.cpu} color={N.accent} maxValue={100} />
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: N.textSub }}>
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>Ahora</span>
                    </div>
                </NeuCard>

                {/* Memory Graph */}
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: '600', color: N.text }}>🧠 Memory Usage</h3>
                        <span style={{ fontSize: '0.875rem', color: N.textSub }}>24h</span>
                    </div>
                    <BarChart data={graphs.memory} color="#a855f7" maxValue={100} />
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: N.textSub }}>
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>Ahora</span>
                    </div>
                </NeuCard>

                {/* Latency Graph */}
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: '600', color: N.text }}>⚡ API Latency</h3>
                        <span style={{ fontSize: '0.875rem', color: N.textSub }}>24h</span>
                    </div>
                    <BarChart data={graphs.latency} color={N.success} maxValue={200} />
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: N.textSub }}>
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>Ahora</span>
                    </div>
                </NeuCard>

                {/* Requests Graph */}
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: '600', color: N.text }}>📊 Requests/hour</h3>
                        <span style={{ fontSize: '0.875rem', color: N.textSub }}>24h</span>
                    </div>
                    <BarChart data={graphs.requests} color="#f59e0b" maxValue={25000} />
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: N.textSub }}>
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>Ahora</span>
                    </div>
                </NeuCard>
            </div>

            {/* Database Metrics */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '1rem' }}>🗄️ Métricas de Base de Datos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Connections</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>45<span style={{ fontSize: '0.875rem', color: N.textSub }}>/100</span></p>
                        <div style={{ marginTop: '0.5rem', height: '8px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '45%', background: N.accent }} />
                        </div>
                    </div>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Query Time</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>12ms</p>
                        <p style={{ fontSize: '0.75rem', color: N.success, marginTop: '0.25rem' }}>↓ 3ms mejora</p>
                    </div>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Replication Lag</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>0.3s</p>
                        <p style={{ fontSize: '0.75rem', color: N.success, marginTop: '0.25rem' }}>✓ Healthy</p>
                    </div>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Disk I/O</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>15%</p>
                        <p style={{ fontSize: '0.75rem', color: N.textSub, marginTop: '0.25rem' }}>Normal</p>
                    </div>
                </div>
            </NeuCard>
        </div>
    );
}
