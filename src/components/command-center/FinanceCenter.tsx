/**
 * Finance Center - Financial Dashboard
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * MRR/ARR metrics, churn rate, revenue by client,
 * pending billing, client debts, and growth metrics.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    AlertCircle,
    ArrowUpRight,
    Receipt,
    PiggyBank,
    BarChart3,
    ArrowUpRight as ArrowUpRightIcon,
    ArrowDownRight,
    CreditCard
} from 'lucide-react';

interface RevenueByClient {
    client: string;
    revenue: number;
    percentage: number;
    trend: number;
}

interface PendingInvoice {
    id: string;
    client: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
    status: 'pending' | 'overdue' | 'critical';
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
    target: number;
}

const mockMRR = 182000000;
const mockARR = 2184000000;
const mockChurnRate = 2.3;
const mockGrowthRate = 12.4;

const mockRevenueByClient: RevenueByClient[] = [
    { client: 'Radio Patagonia', revenue: 62000000, percentage: 34, trend: 8.2 },
    { client: 'Radio Nacional Chile', revenue: 45000000, percentage: 25, trend: 5.1 },
    { client: 'Radio Austral', revenue: 35000000, percentage: 19, trend: 15.3 },
    { client: 'FM Stgo Central', revenue: 28000000, percentage: 15, trend: -2.4 },
    { client: 'Otros', revenue: 12000000, percentage: 7, trend: 3.8 },
];

const mockPendingInvoices: PendingInvoice[] = [
    { id: 'INV-2025-0123', client: 'Emisora Andina', amount: 1500000, dueDate: '2024-12-15', daysOverdue: 12, status: 'critical' },
    { id: 'INV-2025-0124', client: 'FM Stgo Central', amount: 3800000, dueDate: '2025-01-05', daysOverdue: 5, status: 'overdue' },
    { id: 'INV-2025-0125', client: 'Radio Patagonia', amount: 8900000, dueDate: '2025-01-20', daysOverdue: 0, status: 'pending' },
    { id: 'INV-2025-0126', client: 'Radio del Valle', amount: 2100000, dueDate: '2025-01-18', daysOverdue: 0, status: 'pending' },
];

const mockMonthlyRevenue: MonthlyRevenue[] = [
    { month: 'Jul', revenue: 145000000, target: 140000000 },
    { month: 'Ago', revenue: 152000000, target: 145000000 },
    { month: 'Sep', revenue: 158000000, target: 150000000 },
    { month: 'Oct', revenue: 165000000, target: 155000000 },
    { month: 'Nov', revenue: 172000000, target: 160000000 },
    { month: 'Dic', revenue: 182000000, target: 165000000 },
];

const mockGrowthMetrics = {
    newClients: 8,
    newClientsTarget: 10,
    expansionRevenue: 15600000,
    expansionTarget: 12000000,
    churnedRevenue: 4200000,
    netNewARR: 72000000,
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
};

const formatShortCurrency = (value: number) => {
    if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
};

export default function FinanceCenter() {
    const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'billing' | 'growth'>('overview');

    const totalPendingAmount = mockPendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const getStatusBadge = (status: PendingInvoice['status']) => {
        switch (status) {
            case 'critical': return <StatusBadge status="danger" label="Crítico" />;
            case 'overdue': return <StatusBadge status="warning" label="Vencido" />;
            case 'pending': return <StatusBadge status="info" label="Pendiente" />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #22c55e, #16a34a)` }}>
                        <DollarSign style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Centro Financiero</h2>
                        <p style={{ color: N.textSub }}>Métricas financieras y revenue analytics</p>
                    </div>
                </div>
                <StatusBadge status="success" label={`+${mockGrowthRate}% MoM`} />
            </div>

            {/* Main Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>MRR</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{formatShortCurrency(mockMRR)}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.success}20` }}>
                            <DollarSign style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        <TrendingUp style={{ width: '1rem', height: '1rem', color: N.success }} />
                        <span style={{ color: N.success, marginLeft: '0.25rem' }}>+{mockGrowthRate}%</span>
                        <span style={{ color: N.textSub, marginLeft: '0.25rem' }}>vs mes anterior</span>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>ARR</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{formatShortCurrency(mockARR)}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.accent}20` }}>
                            <BarChart3 style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: N.textSub }}>
                        Proyectado 12 meses
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Churn Rate</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{mockChurnRate}%</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: mockChurnRate < 5 ? `${N.success}20` : `${N.danger}20` }}>
                            <Users style={{ width: '1.5rem', height: '1.5rem', color: mockChurnRate < 5 ? N.success : N.danger }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: N.textSub }}>
                        Meta: {'<3%'}
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: `${N.warning}15`, border: `1px solid ${N.warning}30` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Deuda Total</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.warning }}>{formatShortCurrency(totalPendingAmount)}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.warning}20` }}>
                            <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: N.warning }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: N.textSub }}>
                        {mockPendingInvoices.length} facturas pendientes
                    </div>
                </NeuCard>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: N.base, borderRadius: '0.5rem' }}>
                    {([
                        { id: 'overview', label: 'Resumen' },
                        { id: 'revenue', label: 'Revenue' },
                        { id: 'billing', label: 'Facturación' },
                        { id: 'growth', label: 'Crecimiento' }
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
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

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* Revenue by Client */}
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.5rem' }}>Revenue por Cliente</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1rem' }}>Top 5 clientes por facturación</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockRevenueByClient.map((item, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.875rem', color: N.textSub, width: '1rem' }}>{idx + 1}</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>{item.client}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '0.875rem', color: N.success }}>{formatShortCurrency(item.revenue)}</span>
                                                <span style={{ fontSize: '0.75rem', color: item.trend >= 0 ? N.success : N.danger }}>
                                                    {item.trend >= 0 ? '+' : ''}{item.trend}%
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: '1.5rem', height: '8px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${item.percentage}%`,
                                                    background: `linear-gradient(to right, ${N.accent}, #a855f7)`,
                                                    transition: 'all 0.3s'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </NeuCard>

                        {/* Monthly Revenue Chart */}
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.5rem' }}>Revenue Mensual</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1rem' }}>Últimos 6 meses vs meta</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockMonthlyRevenue.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: N.textSub, width: '2rem' }}>{item.month}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ height: '1.5rem', background: N.dark, borderRadius: '0.25rem', position: 'relative', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${(item.revenue / 200000000) * 100}%`,
                                                        background: `linear-gradient(to right, ${N.success}, #22c55e)`,
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        borderRight: '2px dashed',
                                                        borderColor: N.warning,
                                                        position: 'absolute',
                                                        left: `${(item.target / 200000000) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.875rem', color: N.success, width: '5rem', textAlign: 'right' }}>
                                            {formatShortCurrency(item.revenue)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${N.dark}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: N.success }} />
                                    <span style={{ fontSize: '0.75rem', color: N.textSub }}>Revenue real</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRight: '2px dashed', borderColor: N.warning }} />
                                    <span style={{ fontSize: '0.75rem', color: N.textSub }}>Meta</span>
                                </div>
                            </div>
                        </NeuCard>
                    </div>
                )}

                {/* Revenue Tab */}
                {activeTab === 'revenue' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                        <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '1.5rem' }}>Análisis de Revenue</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: `${N.dark}50`, borderRadius: '0.5rem', textAlign: 'center' }}>
                                <PiggyBank style={{ width: '2.5rem', height: '2.5rem', color: N.success, margin: '0 auto 0.75rem' }} />
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{formatShortCurrency(mockMRR)}</p>
                                <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.5rem' }}>MRR Actual</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: `${N.dark}50`, borderRadius: '0.5rem', textAlign: 'center' }}>
                                <TrendingUp style={{ width: '2.5rem', height: '2.5rem', color: N.accent, margin: '0 auto 0.75rem' }} />
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{formatShortCurrency(mockARR)}</p>
                                <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.5rem' }}>ARR Proyectado</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: `${N.dark}50`, borderRadius: '0.5rem', textAlign: 'center' }}>
                                <DollarSign style={{ width: '2.5rem', height: '2.5rem', color: '#a855f7', margin: '0 auto 0.75rem' }} />
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{formatShortCurrency(mockMRR * 12)}</p>
                                <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.5rem' }}>Run Rate Anual</p>
                            </div>
                        </div>
                    </NeuCard>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                        <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.5rem' }}>Facturación Pendiente</h3>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>
                            {mockPendingInvoices.length} facturas • Total: {formatCurrency(totalPendingAmount)}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {mockPendingInvoices.map((invoice) => (
                                <div key={invoice.id} style={{
                                    padding: '1rem',
                                    background: `${N.dark}50`,
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${N.dark}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.5rem', background: N.dark, borderRadius: '0.5rem' }}>
                                                <Receipt style={{ width: '1.25rem', height: '1.25rem', color: N.textSub }} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '500', color: N.text }}>{invoice.client}</p>
                                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{invoice.id}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.warning }}>{formatCurrency(invoice.amount)}</p>
                                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>Vence: {invoice.dueDate}</p>
                                            </div>
                                            {getStatusBadge(invoice.status)}
                                            <NeuButton variant="secondary" onClick={() => { }}>
                                                Cobrar
                                            </NeuButton>
                                        </div>
                                    </div>
                                    {invoice.daysOverdue > 0 && (
                                        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: N.danger }}>
                                            <AlertCircle style={{ width: '1rem', height: '1rem' }} />
                                            <span style={{ fontSize: '0.875rem' }}>{invoice.daysOverdue} días de atraso</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </NeuCard>
                )}

                {/* Growth Tab */}
                {activeTab === 'growth' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                        <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.5rem' }}>Métricas de Crecimiento</h3>
                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Net New ARR y composición</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: `${N.success}10`, borderRadius: '0.5rem', border: `1px solid ${N.success}30` }}>
                                <h4 style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1rem' }}>Net New ARR</h4>
                                <p style={{ fontSize: '3rem', fontWeight: 'bold', color: N.success, marginBottom: '0.5rem' }}>{formatShortCurrency(mockGrowthMetrics.netNewARR)}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <TrendingUp style={{ width: '1rem', height: '1rem', color: N.success }} />
                                    <span style={{ color: N.success }}>+{((mockGrowthMetrics.netNewARR / mockARR) * 100).toFixed(1)}%</span>
                                    <span style={{ color: N.textSub }}>del ARR total</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: N.textSub }}>Nuevos Clientes</span>
                                        <span style={{ fontSize: '0.875rem', color: N.text }}>{mockGrowthMetrics.newClients}/{mockGrowthMetrics.newClientsTarget}</span>
                                    </div>
                                    <div style={{ height: '8px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${(mockGrowthMetrics.newClients / mockGrowthMetrics.newClientsTarget) * 100}%`,
                                                background: N.success,
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: N.textSub }}>Revenue de Expansión</span>
                                        <span style={{ fontSize: '0.875rem', color: N.text }}>{formatShortCurrency(mockGrowthMetrics.expansionRevenue)}</span>
                                    </div>
                                    <div style={{ height: '8px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${(mockGrowthMetrics.expansionRevenue / (mockGrowthMetrics.expansionTarget * 1.5)) * 100}%`,
                                                background: N.accent,
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: N.textSub }}>Churned Revenue</span>
                                        <span style={{ fontSize: '0.875rem', color: N.danger }}>-{formatShortCurrency(mockGrowthMetrics.churnedRevenue)}</span>
                                    </div>
                                    <div style={{ height: '8px', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${(mockGrowthMetrics.churnedRevenue / mockMRR) * 100}%`,
                                                background: N.danger,
                                                transition: 'all 0.3s'
                                            }}
                                        />
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
