/**
 * External Integrations Panel - API Status Dashboard
 * CEO Command Center Fortune 10 Tier 0
 * 
 * External API status, latency monitoring, and
 * service availability tracking.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { getShadow, N } from '@/components/admin/_sdk/AdminDesignSystem';

interface ExternalService {
    id: string;
    name: string;
    provider: string;
    type: 'database' | 'email' | 'storage' | 'api' | 'ai' | 'monitoring';
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    latencyMs: number;
    uptime: number;
    lastChecked: Date;
    endpoint?: string;
    region?: string;
    errorRate: number;
}

interface APIMetrics {
    serviceId: string;
    requestsPerMinute: number;
    successRate: number;
    avgLatency: number;
    p99Latency: number;
    quotaUsed: number;
    quotaLimit: number;
}

const mockServices: ExternalService[] = [
    { id: '1', name: 'Supabase PostgreSQL', provider: 'Supabase', type: 'database', status: 'healthy', latencyMs: 23, uptime: 99.98, lastChecked: new Date(), endpoint: 'db.supabase.co', region: 'us-east-1', errorRate: 0.02 },
    { id: '2', name: 'Redis Cache', provider: 'Redis Labs', type: 'database', status: 'healthy', latencyMs: 2, uptime: 99.99, lastChecked: new Date(), endpoint: 'redis.cloud', region: 'us-east-1', errorRate: 0.01 },
    { id: '3', name: 'Cloudflare R2', provider: 'Cloudflare', type: 'storage', status: 'healthy', latencyMs: 45, uptime: 99.95, lastChecked: new Date(), endpoint: 'r2.cloudflare.com', region: 'us-east-1', errorRate: 0.05 },
    { id: '4', name: 'Resend Email', provider: 'Resend', type: 'email', status: 'degraded', latencyMs: 890, uptime: 99.5, lastChecked: new Date(), endpoint: 'api.resend.com', errorRate: 2.3 },
    { id: '5', name: 'OpenAI GPT-4', provider: 'OpenAI', type: 'ai', status: 'healthy', latencyMs: 450, uptime: 99.9, lastChecked: new Date(), endpoint: 'api.openai.com', region: 'us-east-1', errorRate: 0.1 },
    { id: '6', name: 'OpenAI Whisper', provider: 'OpenAI', type: 'ai', status: 'healthy', latencyMs: 1200, uptime: 99.7, lastChecked: new Date(), endpoint: 'api.openai.com', region: 'us-east-1', errorRate: 0.3 },
    { id: '7', name: 'Vercel Edge', provider: 'Vercel', type: 'api', status: 'healthy', latencyMs: 12, uptime: 99.99, lastChecked: new Date(), region: 'us-east-1', errorRate: 0.0 },
    { id: '8', name: 'Sentry Monitoring', provider: 'Sentry', type: 'monitoring', status: 'healthy', latencyMs: 35, uptime: 99.99, lastChecked: new Date(), endpoint: 'sentry.io', errorRate: 0.01 },
    { id: '9', name: 'Slack Notifications', provider: 'Slack', type: 'api', status: 'unknown', latencyMs: 0, uptime: 0, lastChecked: new Date(Date.now() - 3600000), errorRate: 0 },
];

const mockAPIMetrics: APIMetrics[] = [
    { serviceId: '1', requestsPerMinute: 1250, successRate: 99.98, avgLatency: 23, p99Latency: 45, quotaUsed: 45000000, quotaLimit: 100000000 },
    { serviceId: '4', requestsPerMinute: 89, successRate: 97.7, avgLatency: 890, p99Latency: 2100, quotaUsed: 890, quotaLimit: 1000 },
    { serviceId: '5', requestsPerMinute: 234, successRate: 99.9, avgLatency: 450, p99Latency: 890, quotaUsed: 125000, quotaLimit: 500000 },
];

const mockServiceDependencies = [
    { source: 'Frontend', targets: ['API Gateway', 'Auth Service'] },
    { source: 'API Gateway', targets: ['Database', 'Cache', 'AI Services', 'Email'] },
    { source: 'Auth Service', targets: ['Database'] },
    { source: 'Campaign Engine', targets: ['Database', 'Storage', 'AI Services'] },
    { source: 'Billing Service', targets: ['Database', 'Email'] },
];

const getStatusIcon = (status: ExternalService['status']) => {
    switch (status) {
        case 'healthy': return <span style={{ color: N.success }}>✅</span>;
        case 'degraded': return <span style={{ color: N.warning }}>⚠️</span>;
        case 'down': return <span style={{ color: N.danger }}>❌</span>;
        case 'unknown': return <span style={{ color: N.textSub }}>❓</span>;
    }
};

const getStatusBadge = (status: ExternalService['status']) => {
    switch (status) {
        case 'healthy': return <StatusBadge status="success" label="Saludable" />;
        case 'degraded': return <StatusBadge status="warning" label="Degradado" />;
        case 'down': return <StatusBadge status="danger" label="Caído" />;
        case 'unknown': return <StatusBadge status="neutral" label="Desconocido" />;
    }
};

const getServiceIcon = (type: ExternalService['type']) => {
    switch (type) {
        case 'database': return <span>🗄️</span>;
        case 'email': return <span>📧</span>;
        case 'storage': return <span>☁️</span>;
        case 'api': return <span>⚡</span>;
        case 'ai': return <span>💬</span>;
        case 'monitoring': return <span>📊</span>;
    }
};

const formatLatency = (ms: number) => {
    if (ms === 0) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
};

const tabs = [
    { id: 'services', label: 'Servicios', icon: '🖥️' },
    { id: 'latency', label: 'Latencia', icon: '📈' },
    { id: 'dependencies', label: 'Dependencias', icon: '🌐' },
] as const;

export default function ExternalIntegrations() {
    const [activeTab, setActiveTab] = useState<'services' | 'latency' | 'dependencies'>('services');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const healthyCount = mockServices.filter(s => s.status === 'healthy').length;
    const degradedCount = mockServices.filter(s => s.status === 'degraded').length;
    const downCount = mockServices.filter(s => s.status === 'down').length;
    const avgLatency = mockServices.reduce((sum, s) => sum + s.latencyMs, 0) / mockServices.filter(s => s.latencyMs > 0).length;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsRefreshing(false);
    };

    const getLatencyColor = (ms: number) => {
        if (ms === 0) return N.textSub;
        if (ms > 500) return N.danger;
        if (ms > 200) return N.warning;
        return N.success;
    };

    const getUptimeColor = (uptime: number) => {
        if (uptime < 99) return N.danger;
        if (uptime < 99.9) return N.warning;
        return N.success;
    };

    const getErrorRateColor = (rate: number) => {
        if (rate > 1) return N.danger;
        if (rate > 0.1) return N.warning;
        return N.textSub;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        background: `linear-gradient(135deg, ${N.accent}, #0891b2)`
                    }}>
                        <span style={{ fontSize: '2rem' }}>🌐</span>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>Integraciones Externas</h2>
                        <p style={{ color: N.textSub }}>Estado de APIs y servicios externos</p>
                    </div>
                </div>
                <NeuButton variant="secondary" onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? '⏳ Verificando...' : '🔄 Verificar Todos'}
                </NeuButton>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Servicios Saludables</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: N.success }}>{healthyCount}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.success}20` }}>
                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Degradados</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: N.warning }}>{degradedCount}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.warning}20` }}>
                            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Caídos</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: N.danger }}>{downCount}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.danger}20` }}>
                            <span style={{ fontSize: '1.5rem' }}>❌</span>
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Latencia Promedio</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: N.text }}>{formatLatency(Math.round(avgLatency))}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.accent}20` }}>
                            <span style={{ fontSize: '1.5rem' }}>📈</span>
                        </div>
                    </div>
                </NeuCard>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: activeTab === tab.id ? N.accent : N.base,
                            color: activeTab === tab.id ? N.text : N.textSub,
                            transition: 'background 0.2s'
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </div>
                ))}
            </div>

            {/* Services Tab */}
            {activeTab === 'services' && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, marginBottom: '0.5rem' }}>Estado de Servicios Externos</h3>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Monitoreo en tiempo real</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mockServices.map(service => (
                            <div key={service.id} style={{
                                padding: '1rem',
                                background: `${N.dark}50`,
                                borderRadius: '0.5rem',
                                border: `1px solid ${service.status === 'degraded' ? `${N.warning}50` :
                                    service.status === 'down' ? `${N.danger}50` : N.dark}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.5rem',
                                            background: service.status === 'healthy' ? `${N.success}20` :
                                                service.status === 'degraded' ? `${N.warning}20` :
                                                    service.status === 'down' ? `${N.danger}20` : `${N.textSub}20`
                                        }}>
                                            {getServiceIcon(service.type)}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 500, color: N.text }}>{service.name}</span>
                                                {getStatusBadge(service.status)}
                                            </div>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>{service.provider}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 700,
                                                color: getLatencyColor(service.latencyMs)
                                            }}>
                                                {formatLatency(service.latencyMs)}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Latencia</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 700,
                                                color: getUptimeColor(service.uptime)
                                            }}>
                                                {service.uptime}%
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Uptime</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: getErrorRateColor(service.errorRate)
                                            }}>
                                                {service.errorRate}%
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Error Rate</p>
                                        </div>
                                        {service.endpoint && (
                                            <NeuButton variant="ghost">
                                                🔗
                                            </NeuButton>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: N.textSub }}>
                                    <span>Última verificación: {service.lastChecked.toLocaleTimeString()}</span>
                                    {service.region && <span>Región: {service.region}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </NeuCard>
            )}

            {/* Latency Tab */}
            {activeTab === 'latency' && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, marginBottom: '0.5rem' }}>Análisis de Latencia</h3>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Métricas detalladas de API</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {mockAPIMetrics.map(metric => {
                            const service = mockServices.find(s => s.id === metric.serviceId);
                            return (
                                <div key={metric.serviceId} style={{
                                    padding: '1rem',
                                    background: `${N.dark}50`,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${N.dark}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontWeight: 500, color: N.text }}>{service?.name}</span>
                                            {getStatusBadge(service?.status || 'unknown')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                                            <span style={{ color: N.textSub }}>
                                                {metric.requestsPerMinute} req/min
                                            </span>
                                            <span style={{ color: N.textSub }}>
                                                Success: <span style={{ color: metric.successRate > 99 ? N.success : N.warning }}>{metric.successRate}%</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ textAlign: 'center', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: N.success }}>{metric.avgLatency}ms</p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Avg Latency</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: N.warning }}>{metric.p99Latency}ms</p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>P99 Latency</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: N.accent }}>{metric.successRate}%</p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Success Rate</p>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#c084fc' }}>{Math.round((metric.quotaUsed / metric.quotaLimit) * 100)}%</p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Quota Used</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: N.textSub }}>Uso de Quota</span>
                                            <span style={{ fontSize: '0.875rem', color: N.text }}>{(metric.quotaUsed / 1000000).toFixed(1)}M / {(metric.quotaLimit / 1000000).toFixed(0)}M</span>
                                        </div>
                                        <div style={{ height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                background: (metric.quotaUsed / metric.quotaLimit) > 0.8 ? N.warning : N.accent,
                                                width: `${(metric.quotaUsed / metric.quotaLimit) * 100}%`
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </NeuCard>
            )}

            {/* Dependencies Tab */}
            {activeTab === 'dependencies' && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, marginBottom: '0.5rem' }}>Arquitectura de Dependencias</h3>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Flujo de dependencias entre servicios</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mockServiceDependencies.map((dep, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ width: '8rem', flexShrink: 0 }}>
                                    <div style={{
                                        padding: '0.5rem 0.75rem',
                                        background: `${N.accent}20`,
                                        border: `1px solid ${N.accent}50`,
                                        borderRadius: '0.5rem',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: N.accent }}>{dep.source}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ width: '2rem', height: '0.125rem', background: N.dark }} />
                                    {dep.targets.map((target, tIdx) => (
                                        <React.Fragment key={tIdx}>
                                            <div style={{
                                                padding: '0.5rem 0.75rem',
                                                background: `${N.dark}50`,
                                                border: `1px solid ${N.dark}`,
                                                borderRadius: '0.5rem',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{ fontSize: '0.875rem', color: N.text }}>{target}</span>
                                            </div>
                                            {tIdx < dep.targets.length - 1 && (
                                                <div style={{ width: '2rem', height: '0.125rem', background: N.dark }} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </NeuCard>
            )}
        </div>
    );
}
