'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { getShadow, N } from '@/components/admin/_sdk/AdminDesignSystem';

interface SystemLimit {
    id: string;
    name: string;
    description: string;
    defaultValue: number;
    unit: string;
    adjustable: boolean;
    tiers: {
        starter: number;
        professional: number;
        enterprise: number;
        platinum: number;
    };
}

const mockLimits: SystemLimit[] = [
    {
        id: 'max_users',
        name: 'Máximo de Usuarios',
        description: 'Cantidad máxima de usuarios por tenant',
        defaultValue: 50,
        unit: 'usuarios',
        adjustable: true,
        tiers: { starter: 50, professional: 200, enterprise: 1000, platinum: -1 },
    },
    {
        id: 'max_stations',
        name: 'Máximo de Estaciones',
        description: 'Cantidad máxima de estaciones de radio',
        defaultValue: 5,
        unit: 'estaciones',
        adjustable: true,
        tiers: { starter: 5, professional: 15, enterprise: 50, platinum: -1 },
    },
    {
        id: 'storage_limit',
        name: 'Límite de Storage',
        description: 'Almacenamiento máximo en la nube',
        defaultValue: 500,
        unit: 'GB',
        adjustable: true,
        tiers: { starter: 500, professional: 1000, enterprise: 5000, platinum: -1 },
    },
    {
        id: 'api_rate_limit',
        name: 'API Calls por Minuto',
        description: 'Límite de llamadas API por minuto',
        defaultValue: 100,
        unit: 'req/min',
        adjustable: true,
        tiers: { starter: 100, professional: 500, enterprise: 2000, platinum: -1 },
    },
    {
        id: 'concurrent_sessions',
        name: 'Sesiones Concurrentes',
        description: 'Máximo de sesiones activas simultáneas por usuario',
        defaultValue: 3,
        unit: 'sesiones',
        adjustable: true,
        tiers: { starter: 1, professional: 3, enterprise: 10, platinum: -1 },
    },
    {
        id: 'max_ads',
        name: 'Máximo de Anuncios',
        description: 'Cantidad máxima de publicidades por estación',
        defaultValue: 100,
        unit: 'anuncios',
        adjustable: true,
        tiers: { starter: 50, professional: 100, enterprise: 500, platinum: -1 },
    },
    {
        id: 'file_upload_size',
        name: 'Tamaño Máximo de Archivo',
        description: 'Tamaño máximo de archivos subidos (audio, imágenes)',
        defaultValue: 100,
        unit: 'MB',
        adjustable: true,
        tiers: { starter: 50, professional: 100, enterprise: 500, platinum: -1 },
    },
    {
        id: 'retention_days',
        name: 'Retención de Datos',
        description: 'Días de retención de logs y datos analytics',
        defaultValue: 30,
        unit: 'días',
        adjustable: true,
        tiers: { starter: 7, professional: 30, enterprise: 90, platinum: -1 },
    },
];

const formatValue = (value: number, unit: string) => {
    if (value === -1) return '∞';
    return `${value} ${unit}`;
};

const planLabels = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
    platinum: 'Platinum',
};

const planColors = {
    starter: N.textSub,
    professional: '#93c5fd',
    enterprise: '#c084fc',
    platinum: '#fbbf24',
};

export default function SystemLimitsPanel() {
    const [limits, setLimits] = useState<SystemLimit[]>(mockLimits);
    const [editingLimit, setEditingLimit] = useState<SystemLimit | null>(null);

    const updateTierValue = (limitId: string, tier: keyof SystemLimit['tiers'], value: number) => {
        setLimits(prev => prev.map(l => {
            if (l.id === limitId) {
                return { ...l, tiers: { ...l.tiers, [tier]: value } };
            }
            return l;
        }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>Límites del Sistema</h2>
                    <p style={{ color: N.textSub }}>Configuración de límites globales y por plan</p>
                </div>
                <NeuButton variant="primary" onClick={() => { }}>
                    + Agregar Nuevo Límite
                </NeuButton>
            </div>

            {/* Global Defaults Summary */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, marginBottom: '1rem' }}>📊 Resumen de Límites Globales</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {limits.slice(0, 4).map(limit => (
                        <div key={limit.id} style={{ background: `${N.dark}50`, borderRadius: '0.5rem', padding: '1rem' }}>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>{limit.name}</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: N.text }}>{formatValue(limit.defaultValue, limit.unit)}</p>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Default</p>
                        </div>
                    ))}
                </div>
            </NeuCard>

            {/* Limits Table */}
            <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%' }}>
                        <thead style={{ background: `${N.dark}50` }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Límite</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Starter</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Professional</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Enterprise</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Platinum</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody style={{ borderTop: `1px solid ${N.dark}` }}>
                            {limits.map(limit => (
                                <tr key={limit.id} style={{ borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 500, color: N.text }}>{limit.name}</p>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>{limit.description}</p>
                                        </div>
                                    </td>
                                    {(Object.keys(limit.tiers) as Array<keyof SystemLimit['tiers']>).map(tier => (
                                        <td key={tier} style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                            <div style={{
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                background: tier === 'starter' ? `${N.textSub}15` :
                                                    tier === 'professional' ? '#93c5fd15' :
                                                        tier === 'enterprise' ? '#c084fc15' :
                                                            '#fbbf2415'
                                            }}>
                                                <p style={{
                                                    fontSize: '1.125rem',
                                                    fontWeight: 700,
                                                    color: planColors[tier as keyof typeof planColors]
                                                }}>
                                                    {formatValue(limit.tiers[tier], limit.unit)}
                                                </p>
                                            </div>
                                        </td>
                                    ))}
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <NeuButton variant="secondary" onClick={() => setEditingLimit(limit)}>
                                                Editar
                                            </NeuButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NeuCard>

            {/* Usage Statistics */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, marginBottom: '1rem' }}>📈 Estadísticas de Uso</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ background: `${N.dark}50`, borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem' }}>Tenants usando Starter</p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: N.textSub }}>12</span>
                            <span style={{ fontSize: '0.75rem', color: N.success, marginBottom: '0.25rem' }}>de 50 máx</span>
                        </div>
                        <div style={{ marginTop: '0.5rem', height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: N.textSub, width: '24%' }} />
                        </div>
                    </div>
                    <div style={{ background: `${N.dark}50`, borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem' }}>Tenants usando Professional</p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#93c5fd' }}>8</span>
                            <span style={{ fontSize: '0.75rem', color: N.success, marginBottom: '0.25rem' }}>de 200 máx</span>
                        </div>
                        <div style={{ marginTop: '0.5rem', height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: N.accent, width: '4%' }} />
                        </div>
                    </div>
                    <div style={{ background: `${N.dark}50`, borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem' }}>Tenants usando Enterprise+</p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c084fc' }}>5</span>
                            <span style={{ fontSize: '0.75rem', color: N.success, marginBottom: '0.25rem' }}>∞ máx</span>
                        </div>
                        <div style={{ marginTop: '0.5rem', height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#c084fc', width: '100%' }} />
                        </div>
                    </div>
                </div>
            </NeuCard>

            {/* Edit Modal */}
            {editingLimit && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base, width: '100%', maxWidth: '32rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: N.text, marginBottom: '1.5rem' }}>Editar: {editingLimit.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>{editingLimit.description}</p>
                            {(Object.keys(editingLimit.tiers) as Array<keyof SystemLimit['tiers']>).map(tier => (
                                <div key={tier} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ color: N.text, fontWeight: 500, textTransform: 'capitalize' }}>{planLabels[tier]}</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            value={editingLimit.tiers[tier] === -1 ? '' : editingLimit.tiers[tier]}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? -1 : parseInt(e.target.value);
                                                updateTierValue(editingLimit.id, tier, val);
                                            }}
                                            placeholder="-1 = ∞"
                                            style={{
                                                width: '6rem',
                                                padding: '0.5rem 0.75rem',
                                                background: N.dark,
                                                border: `1px solid ${N.dark}`,
                                                borderRadius: '0.5rem',
                                                color: N.text,
                                                outline: 'none'
                                            }}
                                        />
                                        <span style={{ color: N.textSub, fontSize: '0.875rem' }}>{editingLimit.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <NeuButton variant="secondary" onClick={() => setEditingLimit(null)}>
                                Cerrar
                            </NeuButton>
                        </div>
                    </NeuCard>
                </div>
            )}
        </div>
    );
}
