/**
 * Database Failover Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Control de replicación y failover de bases de datos.
 */

'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import { Database, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface DatabaseServer {
    id: string;
    name: string;
    type: 'primary' | 'standby';
    status: 'healthy' | 'unhealthy' | 'syncing';
    host: string;
    connections: number;
    maxConnections: number;
    latency: number;
    replicationLag: number;
    storageUsed: string;
    storageTotal: string;
    lastFailover: string;
}

const mockDatabases: DatabaseServer[] = [
    {
        id: '1',
        name: 'Supabase PostgreSQL',
        type: 'primary',
        status: 'healthy',
        host: 'db.supabase.co',
        connections: 45,
        maxConnections: 100,
        latency: 12,
        replicationLag: 0,
        storageUsed: '850 GB',
        storageTotal: '1 TB',
        lastFailover: '2026-01-15 03:00',
    },
    {
        id: '2',
        name: 'Google Cloud SQL',
        type: 'standby',
        status: 'healthy',
        host: '34.82.145.78',
        connections: 12,
        maxConnections: 100,
        latency: 28,
        replicationLag: 0.3,
        storageUsed: '840 GB',
        storageTotal: '1 TB',
        lastFailover: '2026-01-15 03:00',
    },
];

export default function DatabaseFailoverPanel() {
    const [databases, setDatabases] = useState<DatabaseServer[]>(mockDatabases);
    const [isFailingOver, setIsFailingOver] = useState(false);
    const [failoverHistory, setFailoverHistory] = useState([
        { date: '2026-01-15', time: '03:00', reason: 'Maintenance', duration: '45s', status: 'success' },
        { date: '2025-11-22', time: '14:30', reason: 'High Latency', duration: '2m 15s', status: 'success' },
        { date: '2025-09-10', time: '08:15', reason: 'Storage Full', duration: '5m 30s', status: 'success' },
    ]);

    const primaryDb = databases.find(d => d.type === 'primary');
    const standbyDb = databases.find(d => d.type === 'standby');

    const performFailover = () => {
        const confirmed = confirm('⚠️ CRÍTICO: Se ejecutará failover de base de datos. ¿Está seguro?');
        if (!confirmed) return;

        setIsFailingOver(true);

        setTimeout(() => {
            setDatabases(prev => prev.map(db => {
                if (db.type === 'primary') {
                    return { ...db, type: 'standby', status: 'syncing' };
                }
                if (db.type === 'standby') {
                    return { ...db, type: 'primary', status: 'healthy', lastFailover: new Date().toISOString().slice(0, 16) };
                }
                return db;
            }));

            setFailoverHistory(prev => [{
                date: new Date().toISOString().slice(0, 10),
                time: new Date().toISOString().slice(11, 16),
                reason: 'Manual',
                duration: '30s',
                status: 'success'
            }, ...prev]);

            setIsFailingOver(false);
        }, 5000);
    };

    const getStoragePercentage = (db: DatabaseServer) => {
        const used = parseInt(db.storageUsed);
        const total = parseInt(db.storageTotal);
        return (used / total) * 100;
    };

    const getConnectionColor = (connections: number, maxConnections: number) => {
        const percentage = (connections / maxConnections) * 100;
        if (percentage > 80) return N.danger;
        if (percentage > 50) return N.warning;
        return N.success;
    };

    const getStatusBadge = (status: DatabaseServer['status']) => {
        switch (status) {
            case 'healthy': return <StatusBadge status="success" label="Healthy" />;
            case 'syncing': return <StatusBadge status="warning" label="Syncing" />;
            case 'unhealthy': return <StatusBadge status="danger" label="Unhealthy" />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #6366f1, #8b5cf6)` }}>
                        <Database style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Database Failover</h2>
                        <p style={{ color: N.textSub }}>Control de replicación y failover de bases de datos</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <NeuButton variant="secondary" onClick={() => { }}>
                        <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        Sincronizar
                    </NeuButton>
                    <NeuButton
                        variant="primary"
                        onClick={performFailover}
                        disabled={isFailingOver}
                    >
                        {isFailingOver ? (
                            <>
                                <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                Ejecutando Failover...
                            </>
                        ) : (
                            <>
                                <AlertTriangle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                Failover Manual
                            </>
                        )}
                    </NeuButton>
                </div>
            </div>

            {/* Database Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {databases.map(db => (
                    <NeuCard
                        key={db.id}
                        style={{
                            boxShadow: getShadow(),
                            padding: '1.5rem',
                            background: db.type === 'primary'
                                ? `linear-gradient(135deg, ${N.accent}20, ${N.accent}10)`
                                : N.base,
                            border: db.type === 'primary' ? `2px solid ${N.accent}50` : `1px solid ${N.dark}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '2rem' }}>{db.type === 'primary' ? '👑' : '🔄'}</span>
                                <div>
                                    <h3 style={{ fontWeight: '600', color: N.text }}>{db.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>{db.host}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {getStatusBadge(db.status)}
                                <StatusBadge
                                    status={db.type === 'primary' ? 'info' : 'neutral'}
                                    label={db.type === 'primary' ? 'PRIMARY' : 'STANDBY'}
                                />
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: N.textSub, marginBottom: '0.25rem' }}>Conexiones</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>
                                    {db.connections}
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>/{db.maxConnections}</span>
                                </p>
                                <div style={{ marginTop: '0.25rem', height: '6px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${(db.connections / db.maxConnections) * 100}%`,
                                            background: getConnectionColor(db.connections, db.maxConnections),
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: N.textSub, marginBottom: '0.25rem' }}>Latencia</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{db.latency}ms</p>
                                <p style={{ fontSize: '0.75rem', color: N.success, marginTop: '0.25rem' }}>✓ Optimal</p>
                            </div>
                            {db.type === 'standby' && (
                                <div style={{ gridColumn: 'span 2', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: N.textSub, marginBottom: '0.25rem' }}>Replication Lag</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{db.replicationLag}s</p>
                                    <div style={{ marginTop: '0.25rem', height: '6px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${Math.min(db.replicationLag * 10, 100)}%`,
                                                background: db.replicationLag > 5 ? N.danger : N.success,
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Storage */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '0.875rem', color: N.textSub }}>Storage</span>
                                <span style={{ fontSize: '0.875rem', color: N.text }}>{db.storageUsed} / {db.storageTotal}</span>
                            </div>
                            <div style={{ height: '8px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${getStoragePercentage(db)}%`,
                                        background: getStoragePercentage(db) > 90 ? N.danger :
                                            getStoragePercentage(db) > 70 ? N.warning : N.accent,
                                        transition: 'all 0.3s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Last Failover */}
                        <div style={{ paddingTop: '1rem', borderTop: `1px solid ${N.dark}50` }}>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Último Failover</p>
                            <p style={{ fontSize: '0.875rem', color: N.text }}>{db.lastFailover}</p>
                        </div>
                    </NeuCard>
                ))}
            </div>

            {/* Failover History */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: `${N.base}ee` }}>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontWeight: '600', color: N.text }}>📜 Historial de Failovers</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%' }}>
                        <thead style={{ background: `${N.dark}50` }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Fecha</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Hora</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Razón</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Duración</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody style={{ borderTop: `1px solid ${N.dark}` }}>
                            {failoverHistory.map((entry, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}>
                                    <td style={{ padding: '0.75rem', color: N.text }}>{entry.date}</td>
                                    <td style={{ padding: '0.75rem', color: N.textSub }}>{entry.time}</td>
                                    <td style={{ padding: '0.75rem', color: N.textSub }}>{entry.reason}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: '500', color: N.text }}>{entry.duration}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <StatusBadge
                                            status={entry.status === 'success' ? 'success' : 'danger'}
                                            label={entry.status}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NeuCard>
        </div>
    );
}
