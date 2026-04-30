/**
 * CEO Dashboard - Main Command Center
 * Silexar Pulse - Executive Overview
 * Migrated to AdminDesignSystem TIER_0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { HealthMetricsCollector, SystemHealth } from '@/lib/monitoring/health-metrics';
import { getPredictiveAlertEngine, Prediction } from '@/lib/monitoring/predictive-alert-engine';
import { getAlertManager, Alert } from '@/lib/monitoring/alert-manager';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
    return (
        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: color }}>
                    {icon}
                </div>
                {change !== undefined && (
                    <span style={{
                        fontSize: '0.875rem',
                        color: change >= 0 ? N.success : N.danger
                    }}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                    </span>
                )}
            </div>
            <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{title}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{value}</p>
            </div>
        </NeuCard>
    );
}

interface QuickActionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

function QuickAction({ title, description, icon, onClick, variant = 'default' }: QuickActionProps) {
    const bgColor = variant === 'danger' ? `${N.danger}15` : `${N.accent}15`;
    const borderColor = variant === 'danger' ? N.danger : N.accent;

    return (
        <button
            onClick={onClick}
            style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                border: `1px solid ${borderColor}30`,
                background: bgColor,
                textAlign: 'left',
                transition: 'all 0.2s',
                cursor: 'pointer'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    background: variant === 'danger' ? `${N.danger}20` : `${N.accent}20`
                }}>
                    {icon}
                </div>
                <div>
                    <p style={{ fontWeight: '500', color: N.text }}>{title}</p>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>{description}</p>
                </div>
            </div>
        </button>
    );
}

export function CEODashboard() {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const collector = new HealthMetricsCollector();
            const healthData = await collector.getSystemHealth();
            setHealth(healthData);

            const alertMgr = getAlertManager();
            const alertData = alertMgr.getAlerts({ limit: 50 });
            setAlerts(alertData);

            const predictiveEngine = getPredictiveAlertEngine();
            const predictionsData = await predictiveEngine.analyzeAndPredict();
            setPredictions(predictionsData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFailover = async (type: string) => {
        if (!confirm(`¿Ejecutar failover para ${type}?`)) return;

        try {
            const response = await fetch('/api/providers/failover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });

            if (response.ok) {
                alert('Failover ejecutado correctamente');
                loadDashboardData();
            } else {
                alert('Error al ejecutar failover');
            }
        } catch (error) {
            alert('Error al ejecutar failover');
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24rem' }}>
                <div style={{
                    width: '3rem',
                    height: '3rem',
                    border: '3px solid ' + N.dark,
                    borderTopColor: N.accent,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    const getSystemStatus = () => {
        if (health?.status === 'healthy') return { label: '🟢 Sistema Saludable', bg: N.success, color: 'success' };
        if (health?.status === 'degraded') return { label: '🟡 Sistema Degradado', bg: N.warning, color: 'warning' };
        return { label: '🔴 Sistema Crítico', bg: N.danger, color: 'danger' };
    };

    const statusInfo = getSystemStatus();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: N.text }}>CEO Command Center</h1>
                    <p style={{ color: N.textSub }}>Panel de control ejecutivo - {new Date().toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={statusInfo.color as 'success' | 'warning' | 'danger'} label={statusInfo.label} />
                    <NeuButton variant="secondary" onClick={loadDashboardData}>
                        Actualizar
                    </NeuButton>
                </div>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <MetricCard
                    title="Score de Salud"
                    value={health?.score || 0}
                    icon={
                        <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                    }
                    color={N.accent}
                />
                <MetricCard
                    title="Alertas Activas"
                    value={alerts.length}
                    icon={
                        <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    }
                    color={N.danger}
                />
                <MetricCard
                    title="Predicciones"
                    value={predictions.length}
                    icon={
                        <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    }
                    color={N.success}
                />
                <MetricCard
                    title="Componentes"
                    value={health?.components ? Object.keys(health.components).length : 0}
                    icon={
                        <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    }
                    color="#8b5cf6"
                />
            </div>

            {/* Predictions & Recommendations */}
            {predictions.length > 0 && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: `${N.warning}15`, borderLeft: `4px solid ${N.warning}` }}>
                    <h3 style={{ fontWeight: '600', color: N.warning, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🔮</span>
                        Predicciones y Recomendaciones
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {predictions.slice(0, 5).map((pred, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                background: N.base,
                                borderRadius: '0.5rem'
                            }}>
                                <div>
                                    <span style={{ fontWeight: '500', color: N.text }}>{pred.metric}</span>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub, marginLeft: '0.5rem' }}>
                                        {(pred.probability as number).toFixed(0)}% probabilidad
                                    </span>
                                </div>
                                <StatusBadge
                                    status={pred.severity === 'critical' ? 'danger' : pred.severity === 'high' ? 'warning' : 'neutral'}
                                    label={pred.severity}
                                />
                            </div>
                        ))}
                    </div>
                </NeuCard>
            )}

            {/* Component Health */}
            {health?.components && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: N.text }}>Estado de Componentes</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                        {Object.entries(health.components).map(([name, component]) => (
                            <div key={name} style={{ textAlign: 'center', padding: '1rem', background: N.base, borderRadius: '0.5rem' }}>
                                <div style={{
                                    width: '0.75rem',
                                    height: '0.75rem',
                                    borderRadius: '50%',
                                    margin: '0 auto 0.5rem',
                                    background: component.status === 'healthy' ? N.success : component.status === 'degraded' ? N.warning : N.danger
                                }} />
                                <p style={{ fontWeight: '500', textTransform: 'capitalize', color: N.text }}>{name}</p>
                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{component.status}</p>
                            </div>
                        ))}
                    </div>
                </NeuCard>
            )}

            {/* Quick Actions */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: N.text }}>Acciones Rápidas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <QuickAction
                        title="Ejecutar Failover"
                        description="Cambiar a proveedor secundario"
                        icon={<svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>}
                        onClick={() => handleFailover('speech')}
                    />
                    <QuickAction
                        title="Ver Logs de Auditoría"
                        description="Revisar actividad del sistema"
                        icon={<svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>}
                        onClick={() => { }}
                    />
                    <QuickAction
                        title="Alertas Críticas"
                        description="Ver alertas que requieren atención"
                        icon={<svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>}
                        onClick={() => { }}
                    />
                </div>
            </NeuCard>

            {/* Recent Alerts */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: N.text }}>Alertas Recientes</h3>
                {alerts.length === 0 ? (
                    <p style={{ color: N.textSub, textAlign: 'center', padding: '2rem' }}>No hay alertas activas</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {alerts.slice(0, 10).map((alert, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                background: N.base,
                                borderRadius: '0.5rem'
                            }}>
                                <div>
                                    <p style={{ fontWeight: '500', color: N.text }}>{alert.title}</p>
                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>{alert.message}</p>
                                </div>
                                <StatusBadge
                                    status={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'neutral'}
                                    label={alert.severity}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </NeuCard>
        </div>
    );
}