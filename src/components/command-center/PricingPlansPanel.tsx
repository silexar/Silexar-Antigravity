/**
 * Pricing Plans Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Configuration of plans for all clients.
 */

'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import { Check, Plus, X } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: number;
    billing: 'monthly' | 'yearly' | 'custom';
    description: string;
    features: string[];
    limits: {
        users: number;
        stations: number;
        storage: string;
        apiCalls: number;
    };
    popular?: boolean;
}

const mockPlans: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 5000,
        billing: 'monthly',
        description: 'Para emisoras pequenas o nuevas',
        features: [
            'Hasta 50 usuarios',
            '5 estaciones',
            '500 GB storage',
            '100K API calls/mes',
            'Soporte email',
            'Basic analytics',
        ],
        limits: { users: 50, stations: 5, storage: '500 GB', apiCalls: 100000 },
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 15000,
        billing: 'monthly',
        description: 'Para empresas en crecimiento',
        features: [
            'Hasta 200 usuarios',
            '15 estaciones',
            '1 TB storage',
            '500K API calls/mes',
            'Soporte prioritario',
            'Advanced analytics',
            'Cortex Voice',
        ],
        limits: { users: 200, stations: 15, storage: '1 TB', apiCalls: 500000 },
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 50000,
        billing: 'monthly',
        description: 'Para grandes broadcasters',
        features: [
            'Hasta 1000 usuarios',
            '50 estaciones',
            '5 TB storage',
            '2M API calls/mes',
            'Soporte 24/7',
            'Custom dashboards',
            'AI Predictions',
            'Multi-tenant ads',
        ],
        limits: { users: 1000, stations: 50, storage: '5 TB', apiCalls: 2000000 },
    },
    {
        id: 'platinum',
        name: 'Platinum',
        price: 0,
        billing: 'custom',
        description: 'Solucion personalizada',
        features: [
            'Usuarios ilimitados',
            'Estaciones ilimitadas',
            'Storage ilimitado',
            'API calls ilimitados',
            'Dedicated support',
            'Custom integrations',
            'SLA garantido',
            'On-premise option',
        ],
        limits: { users: -1, stations: -1, storage: 'Unlimited', apiCalls: -1 },
    },
];

const formatPrice = (price: number, billing: string) => {
    if (price === 0) return 'Custom';
    return `$${price.toLocaleString()}${billing === 'yearly' ? '/ano' : '/mes'}`;
};

export default function PricingPlansPanel() {
    const [plans, setPlans] = useState<Plan[]>(mockPlans);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const openEdit = (plan: Plan) => {
        setEditingPlan({ ...plan });
        setShowEditModal(true);
    };

    const saveEdit = () => {
        if (editingPlan) {
            setPlans(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
            setShowEditModal(false);
            setEditingPlan(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Planes y Precios</h2>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Configuracion de planes para todos los clientes</p>
                </div>
                <NeuButton variant="primary" onClick={() => { }}>
                    <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Nuevo Plan
                </NeuButton>
            </div>

            {/* Plans Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                {plans.map(plan => (
                    <NeuCard
                        key={plan.id}
                        style={{
                            boxShadow: getShadow(),
                            padding: '1.5rem',
                            background: plan.popular ? `linear-gradient(135deg, ${N.accent}20, #a855f720)` : N.base,
                            border: plan.popular ? `1px solid ${N.accent}50` : `1px solid ${N.dark}`,
                            position: 'relative'
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                position: 'absolute',
                                top: '-0.75rem',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '0.25rem 0.75rem',
                                background: N.accent,
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                borderRadius: '9999px'
                            }}>
                                Popular
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.text, marginBottom: '0.5rem' }}>{plan.name}</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>
                                {formatPrice(plan.price, plan.billing)}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>{plan.description}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: N.textSub, marginBottom: '0.5rem' }}>Limites:</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: N.textSub }}>Usuarios</span>
                                    <span style={{ color: N.text, fontWeight: '500' }}>
                                        {plan.limits.users === -1 ? '∞' : plan.limits.users}
                                    </span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: N.textSub }}>Estaciones</span>
                                    <span style={{ color: N.text, fontWeight: '500' }}>
                                        {plan.limits.stations === -1 ? '∞' : plan.limits.stations}
                                    </span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: N.textSub }}>Storage</span>
                                    <span style={{ color: N.text, fontWeight: '500' }}>{plan.limits.storage}</span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: N.textSub }}>API Calls</span>
                                    <span style={{ color: N.text, fontWeight: '500' }}>
                                        {plan.limits.apiCalls === -1 ? '∞' : `${(plan.limits.apiCalls / 1000).toFixed(0)}K`}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: N.textSub, marginBottom: '0.5rem' }}>Features:</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {plan.features.slice(0, 5).map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: N.textSub }}>
                                        <Check style={{ width: '1rem', height: '1rem', color: N.success }} />
                                        {feature}
                                    </li>
                                ))}
                                {plan.features.length > 5 && (
                                    <li style={{ fontSize: '0.875rem', color: `${N.textSub}80` }}>
                                        +{plan.features.length - 5} mas...
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div style={{ width: '100%' }}>
                            <NeuButton variant="secondary" onClick={() => openEdit(plan)}>
                                Editar Plan
                            </NeuButton>
                        </div>
                    </NeuCard>
                ))}
            </div>

            {/* Revenue Summary */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: N.text, marginBottom: '1rem' }}>Resumen de Ingresos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>MRR Estimado</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.success }}>$285K</p>
                    </div>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Clientes Starter</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.textSub }}>12</p>
                    </div>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Clientes Professional</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.accent }}>8</p>
                    </div>
                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Clientes Enterprise+</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a855f7' }}>5</p>
                    </div>
                </div>
            </NeuCard>

            {/* Edit Modal */}
            {showEditModal && editingPlan && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base, width: '100%', maxWidth: '32rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.text }}>Editar Plan: {editingPlan.name}</h3>
                            <button
                                onClick={() => { setShowEditModal(false); setEditingPlan(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: N.textSub }}
                            >
                                <X style={{ width: '1.5rem', height: '1.5rem' }} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem', display: 'block' }}>Nombre</label>
                                    <input
                                        type="text"
                                        value={editingPlan.name}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.base,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem', display: 'block' }}>Precio ($/mes)</label>
                                    <input
                                        type="number"
                                        value={editingPlan.price}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.base,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem', display: 'block' }}>Descripcion</label>
                                <input
                                    type="text"
                                    value={editingPlan.description}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        background: N.base,
                                        border: `1px solid ${N.dark}`,
                                        borderRadius: '0.5rem',
                                        color: N.text,
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem', display: 'block' }}>Max Usuarios</label>
                                    <input
                                        type="number"
                                        value={editingPlan.limits.users}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, users: parseInt(e.target.value) } })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.base,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem', display: 'block' }}>Max Estaciones</label>
                                    <input
                                        type="number"
                                        value={editingPlan.limits.stations}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, stations: parseInt(e.target.value) } })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.base,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem', display: 'block' }}>Storage</label>
                                    <input
                                        type="text"
                                        value={editingPlan.limits.storage}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, storage: e.target.value } })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.base,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem', display: 'block' }}>API Calls/mes</label>
                                    <input
                                        type="number"
                                        value={editingPlan.limits.apiCalls}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, apiCalls: parseInt(e.target.value) } })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.base,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <NeuButton variant="secondary" onClick={() => { setShowEditModal(false); setEditingPlan(null); }}>
                                Cancelar
                            </NeuButton>
                            <NeuButton variant="primary" onClick={saveEdit}>
                                Guardar Cambios
                            </NeuButton>
                        </div>
                    </NeuCard>
                </div>
            )}
        </div>
    );
}
