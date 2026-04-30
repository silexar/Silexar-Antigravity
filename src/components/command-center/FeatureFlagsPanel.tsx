/**
 * Feature Flags Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Control de features y rollouts por plan.
 */

'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import { Flag, ToggleLeft, ToggleRight } from 'lucide-react';

interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    rolloutPercentage: number;
    plans: {
        starter: boolean;
        professional: boolean;
        enterprise: boolean;
        platinum: boolean;
    };
    lastModified: string;
    modifiedBy: string;
}

const mockFeatureFlags: FeatureFlag[] = [
    {
        id: '1',
        name: 'Cortex Voice',
        description: 'Motor de transcripción y síntesis de voz con IA',
        enabled: true,
        rolloutPercentage: 100,
        plans: { starter: false, professional: true, enterprise: true, platinum: true },
        lastModified: '2026-04-15',
        modifiedBy: 'Carlos Admin',
    },
    {
        id: '2',
        name: 'Mobile App',
        description: 'Aplicación móvil nativa para iOS y Android',
        enabled: true,
        rolloutPercentage: 75,
        plans: { starter: false, professional: false, enterprise: true, platinum: true },
        lastModified: '2026-04-10',
        modifiedBy: 'María CEO',
    },
    {
        id: '3',
        name: 'Advanced Analytics',
        description: 'Dashboards avanzados y reportes personalizados',
        enabled: true,
        rolloutPercentage: 100,
        plans: { starter: false, professional: true, enterprise: true, platinum: true },
        lastModified: '2026-04-01',
        modifiedBy: 'Pedro Dev',
    },
    {
        id: '4',
        name: 'AI Predictions',
        description: 'Predicciones de audiencia y optimización con ML',
        enabled: true,
        rolloutPercentage: 50,
        plans: { starter: false, professional: false, enterprise: false, platinum: true },
        lastModified: '2026-03-28',
        modifiedBy: 'María CEO',
    },
    {
        id: '5',
        name: 'Multi-Tenant Ads',
        description: 'Sistema de publicidad multi-tenant avanzado',
        enabled: false,
        rolloutPercentage: 0,
        plans: { starter: false, professional: false, enterprise: true, platinum: true },
        lastModified: '2026-03-20',
        modifiedBy: 'Carlos Admin',
    },
    {
        id: '6',
        name: 'Real-time Collaboration',
        description: 'Edición colaborativa en tiempo real',
        enabled: true,
        rolloutPercentage: 100,
        plans: { starter: false, professional: true, enterprise: true, platinum: true },
        lastModified: '2026-04-12',
        modifiedBy: 'Pedro Dev',
    },
    {
        id: '7',
        name: 'Custom Branding',
        description: 'Marca personalizada para cada tenant',
        enabled: true,
        rolloutPercentage: 100,
        plans: { starter: false, professional: false, enterprise: true, platinum: true },
        lastModified: '2026-04-05',
        modifiedBy: 'María CEO',
    },
    {
        id: '8',
        name: 'API v3',
        description: 'Nueva versión de API con GraphQL',
        enabled: false,
        rolloutPercentage: 25,
        plans: { starter: false, professional: false, enterprise: false, platinum: true },
        lastModified: '2026-04-18',
        modifiedBy: 'Pedro Dev',
    },
];

const planLabels: Record<keyof FeatureFlag['plans'], string> = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
    platinum: 'Platinum',
};

export default function FeatureFlagsPanel() {
    const [flags, setFlags] = useState<FeatureFlag[]>(mockFeatureFlags);
    const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

    const toggleFlag = (id: string) => {
        setFlags(prev => prev.map(f =>
            f.id === id ? { ...f, enabled: !f.enabled, lastModified: new Date().toISOString().slice(0, 10) } : f
        ));
    };

    const updatePlanAccess = (flagId: string, plan: keyof FeatureFlag['plans']) => {
        setFlags(prev => prev.map(f => {
            if (f.id === flagId) {
                const newPlans = { ...f.plans, [plan]: !f.plans[plan] };
                return { ...f, plans: newPlans, lastModified: new Date().toISOString().slice(0, 10) };
            }
            return f;
        }));
    };

    const updateRollout = (flagId: string, percentage: number) => {
        setFlags(prev => prev.map(f =>
            f.id === flagId ? { ...f, rolloutPercentage: percentage, lastModified: new Date().toISOString().slice(0, 10) } : f
        ));
    };

    const activeFlags = flags.filter(f => f.enabled).length;
    const inRolloutFlags = flags.filter(f => f.rolloutPercentage > 0 && f.rolloutPercentage < 100).length;
    const inactiveFlags = flags.filter(f => !f.enabled).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #6366f1, #8b5cf6)` }}>
                        <Flag style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Feature Flags</h2>
                        <p style={{ color: N.textSub }}>Control de features y rollouts por plan</p>
                    </div>
                </div>
                <NeuButton variant="primary" onClick={() => { }}>
                    + Nuevo Feature Flag
                </NeuButton>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem' }}>Total Features</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{flags.length}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: `${N.success}15` }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem' }}>Activos</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.success }}>{activeFlags}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: `${N.accent}15` }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem' }}>En Rollout</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.accent }}>{inRolloutFlags}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: `${N.dark}50` }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem' }}>Inactivos</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.textSub }}>{inactiveFlags}</p>
                </NeuCard>
            </div>

            {/* Feature Flags List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {flags.map(flag => (
                    <NeuCard
                        key={flag.id}
                        style={{
                            boxShadow: getShadow(),
                            padding: '1.25rem',
                            background: flag.enabled ? N.base : `${N.dark}30`,
                            border: flag.enabled ? `1px solid ${N.dark}` : `1px solid ${N.dark}50`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <h3 style={{
                                        fontWeight: '600',
                                        color: flag.enabled ? N.text : N.textSub
                                    }}>
                                        {flag.name}
                                    </h3>
                                    <StatusBadge
                                        status={flag.enabled ? 'success' : 'neutral'}
                                        label={flag.enabled ? 'Active' : 'Disabled'}
                                    />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{flag.description}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.875rem', color: N.textSub }}>Rollout: {flag.rolloutPercentage}%</span>
                                <button
                                    onClick={() => toggleFlag(flag.id)}
                                    style={{
                                        position: 'relative',
                                        width: '3rem',
                                        height: '1.5rem',
                                        borderRadius: '9999px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: flag.enabled ? N.success : N.dark,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '2px',
                                            width: '1rem',
                                            height: '1rem',
                                            borderRadius: '9999px',
                                            background: 'white',
                                            transition: 'transform 0.2s',
                                            transform: flag.enabled ? 'translateX(1.625rem)' : 'translateX(2px)'
                                        }}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Rollout Slider */}
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={flag.rolloutPercentage}
                                onChange={(e) => updateRollout(flag.id, parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    background: N.dark,
                                    borderRadius: '9999px',
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    accentColor: N.accent,
                                    opacity: flag.enabled ? 1 : 0.5
                                }}
                                disabled={!flag.enabled}
                            />
                        </div>

                        {/* Plan Access */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.875rem', color: N.textSub }}>Planes:</span>
                            {(Object.keys(flag.plans) as Array<keyof FeatureFlag['plans']>).map(plan => (
                                <button
                                    key={plan}
                                    onClick={() => updatePlanAccess(flag.id, plan)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: flag.plans[plan] ? `${N.success}20` : `${N.dark}50`,
                                        color: flag.plans[plan] ? N.success : N.textSub,
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: flag.plans[plan] ? `${N.success}50` : N.dark,
                                        opacity: flag.enabled ? 1 : 0.5
                                    }}
                                    disabled={!flag.enabled}
                                >
                                    {planLabels[plan]}
                                </button>
                            ))}
                        </div>

                        {/* Meta */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${N.dark}50`, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: N.textSub }}>
                            <span>Modificado: {flag.lastModified}</span>
                            <span>Por: {flag.modifiedBy}</span>
                        </div>
                    </NeuCard>
                ))}
            </div>
        </div>
    );
}
