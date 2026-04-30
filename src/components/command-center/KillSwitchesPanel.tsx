/**
 * Kill Switches Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Controles de emergencia para proveedores y servicios.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import { AlertTriangle, Zap, RotateCcw } from 'lucide-react';

interface KillSwitch {
    id: string;
    name: string;
    description: string;
    type: 'provider' | 'feature' | 'service';
    target: string;
    enabled: boolean;
    lastTriggered?: Date;
    triggeredBy?: string;
}

export function KillSwitchesPanel() {
    const [switches, setSwitches] = useState<KillSwitch[]>([
        {
            id: 'ks-1',
            name: 'Desactivar OpenAI',
            description: 'Desactiva todas las llamadas a OpenAI Whisper',
            type: 'provider',
            target: 'openai_whisper',
            enabled: false,
        },
        {
            id: 'ks-2',
            name: 'Desactivar Transcription',
            description: 'Desactiva la función de transcripción de audio',
            type: 'feature',
            target: 'transcription',
            enabled: false,
        },
        {
            id: 'ks-3',
            name: 'Modo Mantenimiento',
            description: 'Desactiva el acceso de usuarios no-admin',
            type: 'service',
            target: 'user_access',
            enabled: false,
        },
        {
            id: 'ks-4',
            name: 'Desactivar Notificaciones',
            description: 'Desactiva todos los canales de notificación',
            type: 'feature',
            target: 'notifications',
            enabled: false,
        },
        {
            id: 'ks-5',
            name: 'Failover Global SMS',
            description: 'Redirige SMS a proveedor secundario',
            type: 'provider',
            target: 'sms_twilio',
            enabled: false,
        },
    ]);

    const [isActivating, setIsActivating] = useState<string | null>(null);

    const handleToggle = async (id: string) => {
        const switchItem = switches.find(s => s.id === id);
        if (!switchItem) return;

        const action = switchItem.enabled ? 'desactivar' : 'activar';
        const confirmed = confirm(`¿Está seguro de ${action} "${switchItem.name}"?`);

        if (!confirmed) return;

        setIsActivating(id);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSwitches(prev => prev.map(s =>
            s.id === id
                ? {
                    ...s,
                    enabled: !s.enabled,
                    lastTriggered: new Date(),
                    triggeredBy: 'admin@silexar.com'
                }
                : s
        ));

        setIsActivating(null);
    };

    const activeCount = switches.filter(s => s.enabled).length;

    const getTypeBadge = (type: KillSwitch['type']) => {
        switch (type) {
            case 'provider': return <StatusBadge status="info" label={type} />;
            case 'feature': return <StatusBadge status="warning" label={type} />;
            case 'service': return <StatusBadge status="success" label={type} />;
        }
    };

    const resetAll = () => {
        if (confirm('¿Desactivar TODOS los kill switches?')) {
            setSwitches(prev => prev.map(s => ({ ...s, enabled: false })));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #ef4444, #dc2626)` }}>
                        <Zap style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Kill Switches</h2>
                        <p style={{ color: N.textSub }}>Controles de emergencia para proveedores y servicios</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>
                        {activeCount} activo{activeCount !== 1 ? 's' : ''}
                    </span>
                    {activeCount > 0 && (
                        <NeuButton variant="secondary" onClick={resetAll}>
                            <RotateCcw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                            Resetear Todos
                        </NeuButton>
                    )}
                </div>
            </div>

            {/* Warning Banner */}
            {activeCount > 0 && (
                <NeuCard style={{
                    boxShadow: getShadow(),
                    padding: '1rem',
                    background: `${N.danger}15`,
                    border: `1px solid ${N.danger}30`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <div>
                            <h3 style={{ fontWeight: '600', color: N.danger }}>
                                {activeCount} Kill Switch{activeCount !== 1 ? 'es' : ''} Activo{activeCount !== 1 ? 's' : ''}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>
                                Estos controles pueden afectar la operación del sistema. Use con precaución.
                            </p>
                        </div>
                    </div>
                </NeuCard>
            )}

            {/* Kill Switches Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {switches.map(sw => (
                    <NeuCard
                        key={sw.id}
                        style={{
                            boxShadow: getShadow(),
                            padding: '1rem',
                            background: sw.enabled ? `${N.danger}10` : N.base,
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: sw.enabled ? N.danger : N.dark,
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    background: sw.enabled ? `${N.danger}30` : `${N.dark}50`
                                }}>
                                    {sw.enabled ? (
                                        <svg style={{ width: '1.25rem', height: '1.25rem', color: N.danger }} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg style={{ width: '1.25rem', height: '1.25rem', color: N.textSub }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontWeight: '600',
                                        color: sw.enabled ? N.danger : N.text
                                    }}>
                                        {sw.name}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>{sw.description}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {getTypeBadge(sw.type)}
                                        <span style={{ fontSize: '0.75rem', color: N.textSub }}>{sw.target}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleToggle(sw.id)}
                                disabled={isActivating === sw.id}
                                style={{
                                    position: 'relative',
                                    width: '2.75rem',
                                    height: '1.5rem',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: sw.enabled ? N.danger : N.dark,
                                    transition: 'all 0.2s',
                                    opacity: isActivating === sw.id ? 0.5 : 1
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
                                        transform: sw.enabled ? 'translateX(1.625rem)' : 'translateX(2px)'
                                    }}
                                />
                            </button>
                        </div>

                        {sw.enabled && sw.lastTriggered && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${N.danger}30`, fontSize: '0.75rem', color: N.danger }}>
                                Activado por {sw.triggeredBy} el {sw.lastTriggered.toLocaleString()}
                            </div>
                        )}
                    </NeuCard>
                ))}
            </div>

            {/* Add New Kill Switch */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: `${N.dark}20` }}>
                <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.75rem' }}>Agregar Kill Switch</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Nombre"
                        style={{ flex: 1, padding: '0.5rem', background: N.base, border: `1px solid ${N.dark}`, borderRadius: '0.375rem', color: N.text }}
                    />
                    <select style={{ padding: '0.5rem', background: N.base, border: `1px solid ${N.dark}`, borderRadius: '0.375rem', color: N.text }}>
                        <option value="provider">Provider</option>
                        <option value="feature">Feature</option>
                        <option value="service">Service</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Target"
                        style={{ flex: 1, padding: '0.5rem', background: N.base, border: `1px solid ${N.dark}`, borderRadius: '0.375rem', color: N.text }}
                    />
                    <NeuButton variant="primary">Agregar</NeuButton>
                </div>
            </NeuCard>
        </div>
    );
}
