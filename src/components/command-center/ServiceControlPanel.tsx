/**
 * Service Control Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Control and monitoring of all system services.
 */

'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import { RefreshCw, Play, Square, AlertTriangle } from 'lucide-react';

interface Service {
    id: string;
    name: string;
    type: string;
    status: 'running' | 'stopped' | 'degraded' | 'restarting';
    uptime: string;
    cpu: number;
    memory: number;
    lastRestart: string;
    version: string;
}

const mockServices: Service[] = [
    {
        id: '1',
        name: 'API Gateway',
        type: 'gateway',
        status: 'running',
        uptime: '45 dias 12h',
        cpu: 23,
        memory: 456,
        lastRestart: '2026-03-12 08:00',
        version: 'v2.4.1',
    },
    {
        id: '2',
        name: 'Auth Service',
        type: 'auth',
        status: 'running',
        uptime: '45 dias 12h',
        cpu: 12,
        memory: 234,
        lastRestart: '2026-03-12 08:00',
        version: 'v1.8.3',
    },
    {
        id: '3',
        name: 'Cortex AI Engine',
        type: 'ai',
        status: 'running',
        uptime: '12 dias 4h',
        cpu: 67,
        memory: 2048,
        lastRestart: '2026-04-15 02:30',
        version: 'v3.2.0',
    },
    {
        id: '4',
        name: 'Notification Service',
        type: 'notifications',
        status: 'degraded',
        uptime: '5 dias 8h',
        cpu: 45,
        memory: 512,
        lastRestart: '2026-04-22 14:00',
        version: 'v2.1.5',
    },
    {
        id: '5',
        name: 'Storage Service',
        type: 'storage',
        status: 'running',
        uptime: '45 dias 12h',
        cpu: 8,
        memory: 128,
        lastRestart: '2026-03-12 08:00',
        version: 'v1.5.2',
    },
    {
        id: '6',
        name: 'Analytics Engine',
        type: 'analytics',
        status: 'stopped',
        uptime: '-',
        cpu: 0,
        memory: 0,
        lastRestart: '2026-04-10 18:00',
        version: 'v2.0.1',
    },
    {
        id: '7',
        name: 'Cortex Voice',
        type: 'voice',
        status: 'running',
        uptime: '20 dias 15h',
        cpu: 34,
        memory: 892,
        lastRestart: '2026-04-07 04:00',
        version: 'v2.3.0',
    },
    {
        id: '8',
        name: 'Billing Service',
        type: 'billing',
        status: 'running',
        uptime: '45 dias 12h',
        cpu: 5,
        memory: 178,
        lastRestart: '2026-03-12 08:00',
        version: 'v1.2.4',
    },
];

const statusConfig = {
    running: { color: N.success, label: 'Running', bgColor: `${N.success}10`, borderColor: `${N.success}30` },
    stopped: { color: N.textSub, label: 'Stopped', bgColor: `${N.textSub}10`, borderColor: `${N.textSub}30` },
    degraded: { color: N.warning, label: 'Degraded', bgColor: `${N.warning}10`, borderColor: `${N.warning}30` },
    restarting: { color: N.accent, label: 'Restarting', bgColor: `${N.accent}10`, borderColor: `${N.accent}30` },
};

const typeIcons: Record<string, React.ReactNode> = {
    gateway: <span style={{ fontSize: '1.5rem' }}>🌐</span>,
    auth: <span style={{ fontSize: '1.5rem' }}>🔐</span>,
    ai: <span style={{ fontSize: '1.5rem' }}>🧠</span>,
    notifications: <span style={{ fontSize: '1.5rem' }}>🔔</span>,
    storage: <span style={{ fontSize: '1.5rem' }}>💾</span>,
    analytics: <span style={{ fontSize: '1.5rem' }}>📊</span>,
    voice: <span style={{ fontSize: '1.5rem' }}>🎤</span>,
    billing: <span style={{ fontSize: '1.5rem' }}>💰</span>,
};

export default function ServiceControlPanel() {
    const [services, setServices] = useState<Service[]>(mockServices);
    const [filter, setFilter] = useState<string>('all');

    const filteredServices = filter === 'all'
        ? services
        : services.filter(s => s.status === filter);

    const restartService = (id: string) => {
        const confirmed = confirm('Esta seguro de reiniciar este servicio?');
        if (!confirmed) return;

        setServices(prev => prev.map(s =>
            s.id === id
                ? { ...s, status: 'restarting' as const, cpu: 0, memory: 0 }
                : s
        ));

        setTimeout(() => {
            setServices(prev => prev.map(s =>
                s.id === id
                    ? { ...s, status: 'running' as const, uptime: '0h', lastRestart: new Date().toISOString().slice(0, 16) }
                    : s
            ));
        }, 3000);
    };

    const stopService = (id: string) => {
        const confirmed = confirm('Esta seguro de detener este servicio?');
        if (!confirmed) return;

        setServices(prev => prev.map(s =>
            s.id === id
                ? { ...s, status: 'stopped' as const, cpu: 0, memory: 0 }
                : s
        ));
    };

    const startService = (id: string) => {
        setServices(prev => prev.map(s =>
            s.id === id
                ? { ...s, status: 'running' as const }
                : s
        ));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Panel de Servicios en Vivo</h2>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Control y monitoreo de todos los servicios del sistema</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <NeuButton variant="secondary" onClick={() => { }}>
                        <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        Sincronizar Estado
                    </NeuButton>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Total Servicios</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{services.length}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Running</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.success }}>
                        {services.filter(s => s.status === 'running').length}
                    </p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Degraded</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.warning }}>
                        {services.filter(s => s.status === 'degraded').length}
                    </p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Detenidos</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.textSub }}>
                        {services.filter(s => s.status === 'stopped').length}
                    </p>
                </NeuCard>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'running', label: 'Running' },
                    { id: 'degraded', label: 'Degraded' },
                    { id: 'stopped', label: 'Stopped' },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            border: 'none',
                            cursor: 'pointer',
                            background: filter === f.id ? N.accent : `${N.dark}50`,
                            color: filter === f.id ? 'white' : N.textSub,
                            transition: 'all 0.2s'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {filteredServices.map(service => {
                    const status = statusConfig[service.status];
                    return (
                        <NeuCard
                            key={service.id}
                            style={{
                                boxShadow: getShadow(),
                                padding: '1.25rem',
                                background: status.bgColor,
                                border: `1px solid ${status.borderColor}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {typeIcons[service.type] || <span style={{ fontSize: '1.5rem' }}>⚙️</span>}
                                    <div>
                                        <h3 style={{ fontWeight: '600', color: N.text }}>{service.name}</h3>
                                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>{service.version}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        width: '0.625rem',
                                        height: '0.625rem',
                                        borderRadius: '9999px',
                                        background: status.color
                                    }} />
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>{status.label}</span>
                                </div>
                            </div>

                            {service.status !== 'stopped' && (
                                <>
                                    {/* CPU */}
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: N.textSub }}>CPU</span>
                                            <span style={{ color: N.text }}>{service.cpu}%</span>
                                        </div>
                                        <div style={{ height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${service.cpu}%`,
                                                    background: service.cpu > 80 ? N.danger : service.cpu > 50 ? N.warning : N.success,
                                                    transition: 'all 0.3s'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Memory */}
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: N.textSub }}>Memoria</span>
                                            <span style={{ color: N.text }}>{service.memory} MB</span>
                                        </div>
                                        <div style={{ height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${(service.memory / 2048) * 100}%`,
                                                    background: N.accent,
                                                    transition: 'all 0.3s'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '0.75rem 0', borderTop: `1px solid ${N.dark}50` }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>Uptime</p>
                                    <p style={{ fontSize: '0.875rem', color: N.text }}>{service.uptime}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>Ultimo Restart</p>
                                    <p style={{ fontSize: '0.875rem', color: N.text }}>{service.lastRestart}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: `1px solid ${N.dark}50` }}>
                                {service.status === 'running' && (
                                    <>
                                        <div style={{ flex: 1 }}>
                                            <NeuButton variant="secondary" onClick={() => restartService(service.id)}>
                                                <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                                                Reiniciar
                                            </NeuButton>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <NeuButton variant="secondary" onClick={() => stopService(service.id)}>
                                                <Square style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                                                Detener
                                            </NeuButton>
                                        </div>
                                    </>
                                )}
                                {service.status === 'stopped' && (
                                    <div style={{ flex: 1 }}>
                                        <NeuButton variant="primary" onClick={() => startService(service.id)}>
                                            <Play style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                                            Iniciar
                                        </NeuButton>
                                    </div>
                                )}
                                {service.status === 'degraded' && (
                                    <div style={{ flex: 1 }}>
                                        <NeuButton variant="secondary" onClick={() => restartService(service.id)}>
                                            <AlertTriangle style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                                            Reiniciar
                                        </NeuButton>
                                    </div>
                                )}
                                {service.status === 'restarting' && (
                                    <div style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: `${N.accent}20`,
                                        color: N.accent,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        textAlign: 'center'
                                    }}>
                                        Reiniciando...
                                    </div>
                                )}
                            </div>
                        </NeuCard>
                    );
                })}
            </div>
        </div>
    );
}
