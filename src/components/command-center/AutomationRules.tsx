/**
 * Automation Rules Panel - IFTTT Automation System
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Automation rules, scheduled tasks, and automatic triggers
 * for system operations.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import {
    Zap,
    Clock,
    Play,
    Pause,
    Trash2,
    Plus,
    Settings,
    AlertCircle,
    CheckCircle,
    Calendar,
    Mail,
    Bell,
    Database,
    TrendingUp,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface AutomationRule {
    id: string;
    name: string;
    description: string;
    trigger: {
        type: 'schedule' | 'event' | 'condition';
        config: Record<string, any>;
    };
    actions: Array<{
        type: 'email' | 'notification' | 'api_call' | 'database_update' | 'webhook';
        config: Record<string, any>;
    }>;
    status: 'active' | 'paused' | 'disabled';
    lastRun?: Date;
    nextRun?: Date;
    runCount: number;
    successRate: number;
}

interface ScheduledTask {
    id: string;
    name: string;
    schedule: string;
    lastExecution?: Date;
    nextExecution: Date;
    status: 'scheduled' | 'running' | 'completed' | 'failed';
    duration?: number;
}

const mockAutomationRules: AutomationRule[] = [
    {
        id: 'rule_1',
        name: 'Renewal Reminder - 30 days',
        description: 'Envía recordatorio 30 días antes del vencimientos de contrato',
        trigger: {
            type: 'schedule',
            config: { cron: '0 9 * * *', daysBefore: 30 }
        },
        actions: [
            { type: 'email', config: { template: 'renewal_reminder', to: 'client' } },
            { type: 'notification', config: { channel: 'dashboard', message: 'Contrato por vencer' } }
        ],
        status: 'active',
        lastRun: new Date(Date.now() - 3600000 * 24),
        nextRun: new Date(Date.now() + 3600000 * 24 * 2),
        runCount: 156,
        successRate: 98.7
    },
    {
        id: 'rule_2',
        name: 'High Usage Alert',
        description: 'Alerta cuando uso de API supera 85% de límite',
        trigger: {
            type: 'condition',
            config: { metric: 'api_usage', operator: '>', value: 85 }
        },
        actions: [
            { type: 'notification', config: { channel: 'slack', message: 'Alto uso de API detectado' } },
            { type: 'api_call', config: { endpoint: '/api/providers/scale', auto: true } }
        ],
        status: 'active',
        lastRun: new Date(Date.now() - 3600000 * 2),
        runCount: 23,
        successRate: 100
    },
    {
        id: 'rule_3',
        name: 'Monthly Report Generation',
        description: 'Genera reportes mensuales de usage',
        trigger: {
            type: 'schedule',
            config: { cron: '0 2 1 * *' }
        },
        actions: [
            { type: 'database_update', config: { operation: 'generate_report' } },
            { type: 'email', config: { template: 'monthly_report', to: 'admin' } }
        ],
        status: 'paused',
        lastRun: new Date(Date.now() - 3600000 * 24 * 30),
        runCount: 12,
        successRate: 91.6
    },
    {
        id: 'rule_4',
        name: 'Churn Risk Detection',
        description: 'Identifica clientes con patrones de churn',
        trigger: {
            type: 'event',
            config: { event: 'low_activity', threshold: 7 }
        },
        actions: [
            { type: 'notification', config: { channel: 'dashboard', message: 'Cliente en riesgo' } },
            { type: 'api_call', config: { endpoint: '/api/ai/analyze_churn', auto: false } }
        ],
        status: 'active',
        lastRun: new Date(Date.now() - 3600000 * 12),
        runCount: 45,
        successRate: 88.9
    },
    {
        id: 'rule_5',
        name: 'Auto-backup Daily',
        description: 'Backup automático diario de base de datos',
        trigger: {
            type: 'schedule',
            config: { cron: '0 3 * * *' }
        },
        actions: [
            { type: 'database_update', config: { operation: 'backup' } },
            { type: 'webhook', config: { url: 'https://backup.service/silexar' } }
        ],
        status: 'active',
        lastRun: new Date(Date.now() - 3600000 * 20),
        nextRun: new Date(Date.now() + 3600000 * 4),
        runCount: 365,
        successRate: 99.7
    },
];

const mockScheduledTasks: ScheduledTask[] = [
    { id: '1', name: 'Daily Backup', schedule: '0 3 * * *', lastExecution: new Date(Date.now() - 3600000 * 20), nextExecution: new Date(Date.now() + 3600000 * 4), status: 'scheduled' },
    { id: '2', name: 'Weekly Cleanup', schedule: '0 4 * * 0', lastExecution: new Date(Date.now() - 3600000 * 24 * 7), nextExecution: new Date(Date.now() + 3600000 * 24 * 6), status: 'scheduled' },
    { id: '3', name: 'Monthly Invoice Generation', schedule: '0 2 1 * *', lastExecution: new Date(Date.now() - 3600000 * 24 * 28), nextExecution: new Date(Date.now() + 3600000 * 24 * 3), status: 'scheduled' },
    { id: '4', name: 'Report Generation', schedule: '0 9 * * *', nextExecution: new Date(Date.now() + 3600000 * 18), status: 'running', duration: 45 },
    { id: '5', name: 'Cache Refresh', schedule: '*/15 * * * *', nextExecution: new Date(Date.now() + 900000), status: 'scheduled' },
];

const mockTriggerTypes = [
    { type: 'schedule', label: 'Programado', icon: Clock, color: N.accent },
    { type: 'event', label: 'Evento', icon: Zap, color: '#a855f7' },
    { type: 'condition', label: 'Condición', icon: AlertCircle, color: N.warning },
];

const mockActionTypes = [
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'notification', label: 'Notificación', icon: Bell },
    { type: 'api_call', label: 'Llamado API', icon: Zap },
    { type: 'database_update', label: 'Actualizar DB', icon: Database },
    { type: 'webhook', label: 'Webhook', icon: TrendingUp },
];

const getStatusBadge = (status: AutomationRule['status']) => {
    switch (status) {
        case 'active': return <StatusBadge status="success" label="Activo" />;
        case 'paused': return <StatusBadge status="warning" label="Pausado" />;
        case 'disabled': return <StatusBadge status="neutral" label="Deshabilitado" />;
    }
};

const getTaskStatusBadge = (status: ScheduledTask['status']) => {
    switch (status) {
        case 'scheduled': return <StatusBadge status="info" label="Programado" />;
        case 'running': return <StatusBadge status="warning" label="Ejecutando" />;
        case 'completed': return <StatusBadge status="success" label="Completado" />;
        case 'failed': return <StatusBadge status="danger" label="Fallido" />;
    }
};

const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-CL', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function AutomationRules() {
    const [activeTab, setActiveTab] = useState<'rules' | 'scheduled' | 'create'>('rules');
    const [expandedRule, setExpandedRule] = useState<string | null>(null);

    const activeRulesCount = mockAutomationRules.filter(r => r.status === 'active').length;
    const totalRuns = mockAutomationRules.reduce((sum, r) => sum + r.runCount, 0);
    const avgSuccessRate = mockAutomationRules.reduce((sum, r) => sum + r.successRate, 0) / mockAutomationRules.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #f59e0b, #ea580c)` }}>
                        <Zap style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Automation Rules</h2>
                        <p style={{ color: N.textSub }}>Reglas if-this-then-that y tareas programadas</p>
                    </div>
                </div>
                <NeuButton variant="primary" onClick={() => { }}>
                    <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Nueva Regla
                </NeuButton>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Reglas Activas</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: N.success }}>{activeRulesCount}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.success}20` }}>
                            <Play style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Ejecuciones Totales</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: N.text }}>{totalRuns.toLocaleString()}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.accent}20` }}>
                            <Zap style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Tasa de Éxito</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: N.success }}>{avgSuccessRate.toFixed(1)}%</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.success}20` }}>
                            <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Próxima Ejecución</p>
                            <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: N.text }}>18:00</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#a855f720' }}>
                            <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#a855f7' }} />
                        </div>
                    </div>
                </NeuCard>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: N.base, borderRadius: '0.5rem' }}>
                    {[
                        { id: 'rules', label: 'Reglas', icon: <Zap style={{ width: '1rem', height: '1rem' }} /> },
                        { id: 'scheduled', label: 'Programadas', icon: <Clock style={{ width: '1rem', height: '1rem' }} /> },
                        { id: 'create', label: 'Crear', icon: <Plus style={{ width: '1rem', height: '1rem' }} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: activeTab === tab.id ? N.accent : 'transparent',
                                color: activeTab === tab.id ? 'white' : N.textSub,
                                fontWeight: activeTab === tab.id ? '600' : '400',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Rules Tab */}
                {activeTab === 'rules' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: 0 }}>
                        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${N.dark}` }}>
                            <h3 style={{ fontWeight: '600', color: N.text }}>Reglas de Automatización</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>If-this-then-that rules</p>
                        </div>
                        <div>
                            {mockAutomationRules.map(rule => (
                                <div
                                    key={rule.id}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: `1px solid ${N.dark}50`,
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <button
                                            style={{
                                                flex: 1,
                                                textAlign: 'left',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                            onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                <div style={{ marginTop: '0.25rem' }}>
                                                    {rule.status === 'active' ? (
                                                        <Play style={{ width: '1rem', height: '1rem', color: N.success }} />
                                                    ) : rule.status === 'paused' ? (
                                                        <Pause style={{ width: '1rem', height: '1rem', color: N.warning }} />
                                                    ) : (
                                                        <Pause style={{ width: '1rem', height: '1rem', color: N.textSub }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: '500', color: N.text }}>{rule.name}</span>
                                                        {getStatusBadge(rule.status)}
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>{rule.description}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                                                            {rule.runCount} ejecuciones • {rule.successRate}% éxito
                                                        </span>
                                                        {rule.nextRun && (
                                                            <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                                                                Próxima: {formatDateTime(rule.nextRun)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                            <NeuButton variant="secondary" onClick={() => { }}>
                                                <Settings style={{ width: '1rem', height: '1rem' }} />
                                            </NeuButton>
                                            {rule.status === 'active' ? (
                                                <NeuButton variant="secondary" onClick={() => { }}>
                                                    <Pause style={{ width: '1rem', height: '1rem' }} />
                                                </NeuButton>
                                            ) : (
                                                <NeuButton variant="secondary" onClick={() => { }}>
                                                    <Play style={{ width: '1rem', height: '1rem' }} />
                                                </NeuButton>
                                            )}
                                            <NeuButton variant="secondary" onClick={() => { }}>
                                                <Trash2 style={{ width: '1rem', height: '1rem' }} />
                                            </NeuButton>
                                            {expandedRule === rule.id ? (
                                                <ChevronUp style={{ width: '1rem', height: '1rem', color: N.textSub }} />
                                            ) : (
                                                <ChevronDown style={{ width: '1rem', height: '1rem', color: N.textSub }} />
                                            )}
                                        </div>
                                    </div>

                                    {expandedRule === rule.id && (
                                        <div style={{ marginTop: '1rem', paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                <div style={{ padding: '0.75rem', background: N.base, borderRadius: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <Zap style={{ width: '1rem', height: '1rem', color: N.accent }} />
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>Trigger</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>
                                                        {rule.trigger.type === 'schedule' && `Programado: ${rule.trigger.config.cron}`}
                                                        {rule.trigger.type === 'event' && `Evento: ${rule.trigger.config.event}`}
                                                        {rule.trigger.type === 'condition' && `Condición: ${rule.trigger.config.metric} ${rule.trigger.config.operator} ${rule.trigger.config.value}`}
                                                    </p>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: N.base, borderRadius: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <Settings style={{ width: '1rem', height: '1rem', color: N.accent }} />
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>Acciones</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {rule.actions.map((action, idx) => (
                                                            <StatusBadge key={idx} status="info" label={action.type} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </NeuCard>
                )}

                {/* Scheduled Tasks Tab */}
                {activeTab === 'scheduled' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: '600', color: N.text }}>Tareas Programadas</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Tareas cron del sistema</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {mockScheduledTasks.map(task => (
                                <div key={task.id} style={{
                                    padding: '1rem',
                                    background: N.base,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${N.dark}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                background: task.status === 'running' ? `${N.warning}20` :
                                                    task.status === 'completed' ? `${N.success}20` :
                                                        task.status === 'failed' ? `${N.danger}20` : `${N.accent}20`
                                            }}>
                                                <Clock style={{
                                                    width: '1.25rem',
                                                    height: '1.25rem',
                                                    color: task.status === 'running' ? N.warning :
                                                        task.status === 'completed' ? N.success :
                                                            task.status === 'failed' ? N.danger : N.accent
                                                }} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: '500', color: N.text }}>{task.name}</span>
                                                    {getTaskStatusBadge(task.status)}
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>Cron: {task.schedule}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {task.lastExecution && (
                                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>Última: {formatDateTime(task.lastExecution)}</p>
                                            )}
                                            <p style={{ fontSize: '0.875rem', color: N.accent }}>Próxima: {formatDateTime(task.nextExecution)}</p>
                                            {task.duration && (
                                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Duración: {task.duration}s</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </NeuCard>
                )}

                {/* Create Tab */}
                {activeTab === 'create' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: '600', color: N.text }}>Crear Nueva Regla</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Configura un nuevo trigger y acciones</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: N.base, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text, marginBottom: '1rem' }}>Tipo de Trigger</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    {mockTriggerTypes.map(t => (
                                        <button
                                            key={t.type}
                                            style={{
                                                padding: '1rem',
                                                background: N.base,
                                                border: `1px solid ${N.dark}`,
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <t.icon style={{ width: '1.5rem', height: '1.5rem', color: t.color, marginBottom: '0.5rem' }} />
                                            <p style={{ fontWeight: '500', color: N.text }}>{t.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: N.base, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text, marginBottom: '1rem' }}>Acciones</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                                    {mockActionTypes.map(a => (
                                        <button
                                            key={a.type}
                                            style={{
                                                padding: '0.75rem',
                                                background: N.base,
                                                border: `1px solid ${N.dark}`,
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <a.icon style={{ width: '1.25rem', height: '1.25rem', color: N.textSub, margin: '0 auto 0.25rem' }} />
                                            <p style={{ fontSize: '0.75rem', color: N.text }}>{a.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <NeuButton variant="primary" onClick={() => { }}>
                                    <Zap style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                    Crear Regla
                                </NeuButton>
                                <NeuButton variant="secondary" onClick={() => { }}>
                                    Guardar como Draft
                                </NeuButton>
                            </div>
                        </div>
                    </NeuCard>
                )}
            </div>
        </div>
    );
}
