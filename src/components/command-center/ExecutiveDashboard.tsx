/**
 * Executive Dashboard - Executive Summary KPIs
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Executive summary, month-over-month trends,
 * goals vs actual, and projections.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    BarChart3,
    Target,
    ArrowUpRight,
    Award,
    Rocket,
    PieChart
} from 'lucide-react';

interface KPIMetric {
    id: string;
    name: string;
    value: string;
    previousValue: string;
    change: number;
    target?: string;
    progress?: number;
    unit?: string;
}

interface MonthlyData {
    month: string;
    revenue: number;
    clients: number;
    campaigns: number;
    satisfaction: number;
}

interface GoalItem {
    id: string;
    name: string;
    category: 'revenue' | 'clients' | 'growth' | 'retention';
    current: number;
    target: number;
    unit: string;
    status: 'on_track' | 'at_risk' | 'exceeded' | 'behind';
}

const mockKPIs: KPIMetric[] = [
    { id: '1', name: 'MRR', value: '$182M', previousValue: '$162M', change: 12.4, target: '$180M', progress: 101 },
    { id: '2', name: 'Clientes Activos', value: '47', previousValue: '41', change: 14.6, target: '45', progress: 104 },
    { id: '3', name: 'Tasa de Churn', value: '2.3%', previousValue: '3.1%', change: -25.8, target: '<3%', progress: 100 },
    { id: '4', name: 'NPS Score', value: '72', previousValue: '68', change: 5.9, target: '70', progress: 103 },
    { id: '5', name: 'Uptime', value: '99.9%', previousValue: '99.7%', change: 0.2, target: '99.5%', progress: 100 },
    { id: '6', name: 'Satisfacción', value: '94%', previousValue: '91%', change: 3.3, target: '90%', progress: 104 },
];

const mockMonthlyData: MonthlyData[] = [
    { month: 'Jul', revenue: 145000000, clients: 38, campaigns: 42, satisfaction: 88 },
    { month: 'Ago', revenue: 152000000, clients: 39, campaigns: 45, satisfaction: 89 },
    { month: 'Sep', revenue: 158000000, clients: 40, campaigns: 48, satisfaction: 90 },
    { month: 'Oct', revenue: 165000000, clients: 42, campaigns: 52, satisfaction: 91 },
    { month: 'Nov', revenue: 172000000, clients: 44, campaigns: 55, satisfaction: 92 },
    { month: 'Dic', revenue: 182000000, clients: 47, campaigns: 58, satisfaction: 94 },
];

const mockGoals: GoalItem[] = [
    { id: '1', name: 'MRR Target', category: 'revenue', current: 182, target: 180, unit: 'M CLP', status: 'exceeded' },
    { id: '2', name: 'Nuevos Clientes', category: 'clients', current: 47, target: 50, unit: 'clientes', status: 'at_risk' },
    { id: '3', name: 'Net Revenue Retention', category: 'retention', current: 118, target: 115, unit: '%', status: 'exceeded' },
    { id: '4', name: 'Crecimiento ARR', category: 'growth', current: 12.4, target: 15, unit: '%', status: 'behind' },
    { id: '5', name: 'Churn Rate', category: 'retention', current: 2.3, target: 2.0, unit: '%', status: 'on_track' },
    { id: '6', name: 'Satisfacción Cliente', category: 'retention', current: 94, target: 92, unit: '%', status: 'exceeded' },
];

const mockProjections = [
    { metric: 'MRR', current: 182, projected: 205, projectionDate: 'Mar 2025', confidence: 92 },
    { metric: 'Clientes', current: 47, projected: 55, projectionDate: 'Mar 2025', confidence: 88 },
    { metric: 'ARR', current: 2.18, projected: 2.46, projectionDate: 'Mar 2025', confidence: 90 },
];

const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
};

const getStatusBadge = (status: GoalItem['status']) => {
    switch (status) {
        case 'exceeded': return <StatusBadge status="success" label="Excedido" />;
        case 'on_track': return <StatusBadge status="info" label="En Curso" />;
        case 'at_risk': return <StatusBadge status="warning" label="En Riesgo" />;
        case 'behind': return <StatusBadge status="danger" label="Atrasado" />;
    }
};

const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp style={{ width: '1rem', height: '1rem', color: N.success }} />;
    if (change < 0) return <TrendingDown style={{ width: '1rem', height: '1rem', color: N.danger }} />;
    return <BarChart3 style={{ width: '1rem', height: '1rem', color: N.textSub }} />;
};

export default function ExecutiveDashboard() {
    const [activeTab, setActiveTab] = useState<'summary' | 'trends' | 'goals' | 'projections'>('summary');

    const avgChange = mockKPIs.reduce((sum, k) => sum + k.change, 0) / mockKPIs.length;
    const goalsOnTrack = mockGoals.filter(g => g.status === 'on_track' || g.status === 'exceeded').length;
    const totalGoals = mockGoals.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #f59e0b, #ca8a04)` }}>
                        <Award style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Dashboard Ejecutivo</h2>
                        <p style={{ color: N.textSub }}>Resumen ejecutivo y KPIs Fortune 10</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge
                        status="success"
                        label={`+${avgChange.toFixed(1)}% Avg Growth`}
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
                {mockKPIs.map(kpi => (
                    <NeuCard key={kpi.id} style={{ boxShadow: getShadow(), padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: N.textSub }}>{kpi.name}</span>
                            {getTrendIcon(kpi.change)}
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{kpi.value}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: kpi.change > 0 ? N.success : N.danger }}>
                                {kpi.change > 0 ? '+' : ''}{kpi.change}%
                            </span>
                            <span style={{ fontSize: '0.75rem', color: N.textSub }}>vs mes anterior</span>
                        </div>
                        {kpi.target && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${N.dark}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.75rem', color: N.textSub }}>Meta: {kpi.target}</span>
                                    {kpi.progress && (
                                        <StatusBadge
                                            status={kpi.progress >= 100 ? 'success' : 'warning'}
                                            label={`${kpi.progress}%`}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </NeuCard>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: N.base, borderRadius: '0.5rem' }}>
                    {[
                        { id: 'summary', label: 'Resumen' },
                        { id: 'trends', label: 'Tendencias' },
                        { id: 'goals', label: 'Metas' },
                        { id: 'projections', label: 'Proyecciones' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
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
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* Executive Summary */}
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Award style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
                                <h3 style={{ fontWeight: '600', color: N.text }}>Resumen Ejecutivo</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: `${N.success}10`, border: `1px solid ${N.success}30`, borderRadius: '0.5rem' }}>
                                    <h4 style={{ fontWeight: '500', color: N.success, marginBottom: '0.5rem' }}>🏆 Trimestre Exitoso</h4>
                                    <p style={{ fontSize: '0.875rem', color: N.text }}>
                                        El Q4 2024 cerró con un crecimiento de 12.4% en MRR, superando la meta establecida.
                                        6 nuevos clientes wurden añadidos, con una tasa de churn reducida a 2.3%.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { icon: DollarSign, label: 'Revenue Growth', value: '+12.4%', color: N.success },
                                        { icon: Users, label: 'New Clients', value: '+6', color: N.success },
                                        { icon: TrendingDown, label: 'Churn Reduction', value: '-25.8%', color: N.success },
                                        { icon: BarChart3, label: 'NPS Improvement', value: '+5.9%', color: N.success }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            background: N.base,
                                            borderRadius: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <item.icon style={{ width: '1.25rem', height: '1.25rem', color: item.color }} />
                                                <span style={{ fontSize: '0.875rem', color: N.text }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <ArrowUpRight style={{ width: '1rem', height: '1rem', color: N.success }} />
                                                <span style={{ fontWeight: '500', color: item.color }}>{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </NeuCard>

                        {/* Goals Summary */}
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Target style={{ width: '1.25rem', height: '1.25rem', color: N.accent }} />
                                <h3 style={{ fontWeight: '600', color: N.text }}>Estado de Metas</h3>
                            </div>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'relative', display: 'inline-flex' }}>
                                    <PieChart style={{ width: '6rem', height: '6rem', color: N.dark }} />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>
                                            {Math.round((goalsOnTrack / totalGoals) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.5rem' }}>
                                    {goalsOnTrack} de {totalGoals} metas en curso
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>Metas Excedidas</span>
                                    <StatusBadge status="success" label={String(mockGoals.filter(g => g.status === 'exceeded').length)} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>En Curso</span>
                                    <StatusBadge status="info" label={String(mockGoals.filter(g => g.status === 'on_track').length)} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>En Riesgo</span>
                                    <StatusBadge status="warning" label={String(mockGoals.filter(g => g.status === 'at_risk').length)} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>Atrasadas</span>
                                    <StatusBadge status="danger" label={String(mockGoals.filter(g => g.status === 'behind').length)} />
                                </div>
                            </div>
                        </NeuCard>
                    </div>
                )}

                {/* Trends Tab */}
                {activeTab === 'trends' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '1.5rem' }}>Tendencias Mes a Mes</h3>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Últimos 6 meses de métricas clave</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Revenue Trend */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>Revenue</h4>
                                    <span style={{ fontSize: '0.875rem', color: N.success }}>+25.5% 6 meses</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '8rem' }}>
                                    {mockMonthlyData.map((data, idx) => {
                                        const maxRevenue = Math.max(...mockMonthlyData.map(d => d.revenue));
                                        const height = (data.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: `${height}%`,
                                                    background: `linear-gradient(to top, ${N.success}80, ${N.success})`,
                                                    borderRadius: '0.25rem 0.25rem 0 0',
                                                    transition: 'all 0.2s',
                                                    minHeight: '4px'
                                                }} />
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>{data.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Clients Trend */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>Clientes</h4>
                                    <span style={{ fontSize: '0.875rem', color: N.accent }}>+9 nuevos clientes</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '6rem' }}>
                                    {mockMonthlyData.map((data, idx) => {
                                        const maxClients = Math.max(...mockMonthlyData.map(d => d.clients));
                                        const height = (data.clients / maxClients) * 100;
                                        return (
                                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: `${height}%`,
                                                    background: `linear-gradient(to top, ${N.accent}80, ${N.accent})`,
                                                    borderRadius: '0.25rem 0.25rem 0 0',
                                                    transition: 'all 0.2s',
                                                    minHeight: '4px'
                                                }} />
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>{data.clients}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Satisfaction Trend */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>Satisfacción</h4>
                                    <span style={{ fontSize: '0.875rem', color: '#a855f7' }}>+6% puntos</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '6rem' }}>
                                    {mockMonthlyData.map((data, idx) => {
                                        const height = data.satisfaction;
                                        return (
                                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: `${height}%`,
                                                    background: `linear-gradient(to top, #a855f780, #a855f7)`,
                                                    borderRadius: '0.25rem 0.25rem 0 0',
                                                    transition: 'all 0.2s',
                                                    minHeight: '4px'
                                                }} />
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>{data.satisfaction}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </NeuCard>
                )}

                {/* Goals Tab */}
                {activeTab === 'goals' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.5rem' }}>Goals vs Actual</h3>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Seguimiento de metas trimestrales</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {mockGoals.map(goal => (
                                <div key={goal.id} style={{
                                    padding: '1rem',
                                    background: N.base,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${N.dark}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h4 style={{ fontWeight: '500', color: N.text }}>{goal.name}</h4>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>{goal.current} / {goal.target} {goal.unit}</p>
                                        </div>
                                        {getStatusBadge(goal.status)}
                                    </div>
                                    <div style={{ height: '0.75rem', background: N.base, borderRadius: '0.25rem', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                                                background: goal.status === 'exceeded' ? N.success :
                                                    goal.status === 'on_track' ? N.accent :
                                                        goal.status === 'at_risk' ? N.warning : N.danger,
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </div>
                                    {goal.status === 'exceeded' && (
                                        <p style={{ fontSize: '0.75rem', color: N.success, marginTop: '0.5rem' }}>
                                            ✨ Excedido por {((goal.current / goal.target - 1) * 100).toFixed(1)}%
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </NeuCard>
                )}

                {/* Projections Tab */}
                {activeTab === 'projections' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.5rem' }}>Proyecciones 90 días</h3>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Predicciones basadas en tendencias actuales</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {mockProjections.map((proj, idx) => (
                                <div key={idx} style={{
                                    padding: '1.5rem',
                                    background: N.base,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${N.dark}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: '500', color: N.text }}>{proj.metric}</h4>
                                        <StatusBadge status="info" label={`${proj.confidence}% confianza`} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub, marginBottom: '0.25rem' }}>Actual</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{proj.current}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ArrowUpRight style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub, marginBottom: '0.25rem' }}>Proyectado</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.success }}>+{(((proj.projected - proj.current) / proj.current) * 100).toFixed(1)}%</p>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>{proj.projected}</p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: N.textSub, marginTop: '1rem', textAlign: 'center' }}>
                                        Proyección para: {proj.projectionDate}
                                    </p>
                                </div>
                            ))}

                            <div style={{ padding: '1rem', background: `${N.accent}10`, border: `1px solid ${N.accent}30`, borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Rocket style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />
                                    <div>
                                        <h4 style={{ fontWeight: '500', color: N.accent }}>Trayectoria hacia Fortune 10</h4>
                                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>
                                            Con las tendencias actuales, estamos en camino de alcanzar el status Fortune 10
                                            en Q3 2025, con un ARR proyectado de $3.2B y 78+ clientes enterprise.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NeuCard>
                )}
            </div>
        </div>
    );
}
