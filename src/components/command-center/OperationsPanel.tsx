/**
 * Operations Panel - Client Operations Center
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Displays active contracts, campaigns, revenue, expirations, and reconciliation status
 * for all clients in the platform.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import {
    Users,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    DollarSign,
    BarChart3,
    Megaphone
} from 'lucide-react';

// Mock data for clients
const mockClients = [
    {
        id: '1',
        name: 'Radio Nacional Chile',
        rut: '76.543.210-K',
        contracts: 3,
        activeContracts: 2,
        campaigns: 5,
        activeMegaphones: 3,
        billedRevenue: 45000000,
        pendingRevenue: 5200000,
        nextExpiration: '2025-02-15',
        reconciliationStatus: ' reconciled',
        usageRate: 87,
        plan: 'Enterprise'
    },
    {
        id: '2',
        name: 'FM Stgo Central',
        rut: '76.123.456-7',
        contracts: 2,
        activeContracts: 1,
        campaigns: 8,
        activeMegaphones: 4,
        billedRevenue: 28000000,
        pendingRevenue: 3800000,
        nextExpiration: '2025-01-28',
        reconciliationStatus: 'pending',
        usageRate: 92,
        plan: 'Professional'
    },
    {
        id: '3',
        name: 'Radio Patagonia',
        rut: '76.987.654-3',
        contracts: 4,
        activeContracts: 3,
        campaigns: 12,
        activeMegaphones: 6,
        billedRevenue: 62000000,
        pendingRevenue: 8900000,
        nextExpiration: '2025-03-20',
        reconciliationStatus: ' reconciled',
        usageRate: 76,
        plan: 'Enterprise Plus'
    },
    {
        id: '4',
        name: 'emisora Andina',
        rut: '76.456.789-0',
        contracts: 1,
        activeContracts: 1,
        campaigns: 3,
        activeMegaphones: 1,
        billedRevenue: 12000000,
        pendingRevenue: 1500000,
        nextExpiration: '2025-01-10',
        reconciliationStatus: 'issue',
        usageRate: 45,
        plan: 'Starter'
    },
    {
        id: '5',
        name: 'Radio Austral',
        rut: '77.111.222-3',
        contracts: 2,
        activeContracts: 2,
        campaigns: 6,
        activeMegaphones: 3,
        billedRevenue: 35000000,
        pendingRevenue: 4100000,
        nextExpiration: '2025-04-05',
        reconciliationStatus: ' reconciled',
        usageRate: 88,
        plan: 'Enterprise'
    }
];

const mockMegaphones = [
    { id: '1', name: 'Verano 2025', client: 'Radio Nacional Chile', status: 'active', budget: 12000000, spent: 7800000, impressions: 2450000 },
    { id: '2', name: 'Black Friday', client: 'FM Stgo Central', status: 'active', budget: 8000000, spent: 8200000, impressions: 1890000 },
    { id: '3', name: 'Navidad Premium', client: 'Radio Patagonia', status: 'scheduled', budget: 15000000, spent: 0, impressions: 0 },
    { id: '4', name: 'Cyber Monday', client: 'Radio Nacional Chile', status: 'completed', budget: 10000000, spent: 9800000, impressions: 3200000 },
    { id: '5', name: 'Ano Nuevo', client: 'emisora Andina', status: 'paused', budget: 5000000, spent: 2100000, impressions: 890000 },
];

const mockUpcomingExpirations = [
    { client: 'emisora Andina', contract: 'CTR-2024-001', expiration: '2025-01-10', daysLeft: 14, value: 12000000 },
    { client: 'FM Stgo Central', contract: 'CTR-2024-002', expiration: '2025-01-28', daysLeft: 32, value: 28000000 },
    { client: 'Radio Nacional Chile', contract: 'CTR-2023-005', expiration: '2025-02-15', daysLeft: 50, value: 45000000 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const getDaysColor = (days: number) => {
    if (days <= 15) return { bg: `${N.danger}20`, text: N.danger };
    if (days <= 30) return { bg: `${N.warning}20`, text: N.warning };
    return { bg: `${N.success}20`, text: N.success };
};

const getReconciliationBadge = (status: string) => {
    switch (status) {
        case ' reconciled':
            return <StatusBadge status="success" label="Conciliado" />;
        case 'pending':
            return <StatusBadge status="warning" label="Pendiente" />;
        case 'issue':
            return <StatusBadge status="danger" label="Problema" />;
        default:
            return <StatusBadge status="neutral" label={status} />;
    }
};

const getMegaphoneStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <StatusBadge status="success" label="Activa" />;
        case 'scheduled':
            return <StatusBadge status="info" label="Programada" />;
        case 'paused':
            return <StatusBadge status="warning" label="Pausada" />;
        case 'completed':
            return <StatusBadge status="neutral" label="Completada" />;
        default:
            return <StatusBadge status="neutral" label={status} />;
    }
};

export default function OperationsPanel() {
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'clients' | 'campaigns' | 'expirations'>('clients');

    const totalBilledRevenue = mockClients.reduce((sum, c) => sum + c.billedRevenue, 0);
    const totalPendingRevenue = mockClients.reduce((sum, c) => sum + c.pendingRevenue, 0);
    const totalActiveContracts = mockClients.reduce((sum, c) => sum + c.activeContracts, 0);
    const totalActiveMegaphones = mockClients.reduce((sum, c) => sum + c.activeMegaphones, 0);

    const client = selectedClient ? mockClients.find(c => c.id === selectedClient) : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Centro de Operaciones con Clientes</h2>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Gestion de contratos, campagnes y metricas por cliente</p>
                </div>
                <StatusBadge status="info" label={`${mockClients.length} Clientes Activos`} />
            </div>

            {/* Global Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.accent}20` }}>
                            <DollarSign style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Ingresos Facturados</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{formatCurrency(totalBilledRevenue)}</p>
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.warning}20` }}>
                            <Clock style={{ width: '1.5rem', height: '1.5rem', color: N.warning }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Facturacion Pendiente</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{formatCurrency(totalPendingRevenue)}</p>
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.success}20` }}>
                            <FileText style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Contratos Activos</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{totalActiveContracts}</p>
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#a855f720' }}>
                            <Megaphone style={{ width: '1.5rem', height: '1.5rem', color: '#a855f7' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Campanas Activas</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>{totalActiveMegaphones}</p>
                        </div>
                    </div>
                </NeuCard>
            </div>

            {/* Main Content Tabs */}
            <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base }}>
                {/* Tab Navigation */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${N.dark}` }}>
                    <button
                        onClick={() => setActiveView('clients')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeView === 'clients' ? N.accent : 'transparent',
                            color: activeView === 'clients' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Users style={{ width: '1rem', height: '1rem' }} />
                        Clientes
                    </button>
                    <button
                        onClick={() => setActiveView('campaigns')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeView === 'campaigns' ? N.accent : 'transparent',
                            color: activeView === 'campaigns' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Megaphone style={{ width: '1rem', height: '1rem' }} />
                        Campanas
                    </button>
                    <button
                        onClick={() => setActiveView('expirations')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeView === 'expirations' ? N.accent : 'transparent',
                            color: activeView === 'expirations' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Clock style={{ width: '1rem', height: '1rem' }} />
                        Vencimientos
                    </button>
                </div>

                {/* Clients View */}
                {activeView === 'clients' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '1.5rem' }}>
                        {/* Client List */}
                        <div>
                            <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                                <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '1rem' }}>Clientes</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {mockClients.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedClient(c.id)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                textAlign: 'left',
                                                background: selectedClient === c.id ? `${N.accent}20` : `${N.dark}50`,
                                                border: selectedClient === c.id ? `1px solid ${N.accent}` : `1px solid ${N.dark}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <p style={{ fontWeight: '500', color: N.text, fontSize: '0.875rem' }}>{c.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>{c.rut}</p>
                                                </div>
                                                <StatusBadge status="neutral" label={c.plan} />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>{c.activeContracts} contratos</span>
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>-</span>
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>{c.activeMegaphones} campanas</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </NeuCard>
                        </div>

                        {/* Client Detail */}
                        <div style={{ gridColumn: 'span 2' }}>
                            {client ? (
                                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <div>
                                            <h3 style={{ fontWeight: '600', color: N.text, fontSize: '1.25rem' }}>{client.name}</h3>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>{client.rut}</p>
                                        </div>
                                        <StatusBadge status="info" label={client.plan} />
                                    </div>

                                    {/* Revenue Metrics */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Ingresos Facturados</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.success }}>{formatCurrency(client.billedRevenue)}</p>
                                        </div>
                                        <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Pendiente</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.warning }}>{formatCurrency(client.pendingRevenue)}</p>
                                        </div>
                                    </div>

                                    {/* Usage Rate */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Tasa de Uso</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>{client.usageRate}%</p>
                                        </div>
                                        <div style={{ height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${client.usageRate}%`,
                                                    background: `linear-gradient(90deg, ${N.accent}, #a855f7)`,
                                                    transition: 'width 0.3s'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Contract & Megaphone Info */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <FileText style={{ width: '1.25rem', height: '1.25rem', color: N.accent }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Contratos</p>
                                                <p style={{ fontWeight: '500', color: N.text }}>{client.contracts} ({client.activeContracts} activos)</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                            <Megaphone style={{ width: '1.25rem', height: '1.25rem', color: '#a855f7' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Campanas</p>
                                                <p style={{ fontWeight: '500', color: N.text }}>{client.campaigns} ({client.activeMegaphones} activas)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reconciliation Status */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: N.textSub }} />
                                            <div>
                                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>Estado de Conciilacion</p>
                                                <p style={{ fontWeight: '500', color: N.text }}>Ultima: 15 Dic 2024</p>
                                            </div>
                                        </div>
                                        {getReconciliationBadge(client.reconciliationStatus)}
                                    </div>

                                    {/* Next Expiration */}
                                    <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Clock style={{ width: '1.25rem', height: '1.25rem', color: N.warning }} />
                                                <div>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Proximo Vencimientos</p>
                                                    <p style={{ fontWeight: '500', color: N.text }}>{client.nextExpiration}</p>
                                                </div>
                                            </div>
                                            <NeuButton variant="secondary" onClick={() => { }}>
                                                Renovar
                                            </NeuButton>
                                        </div>
                                    </div>
                                </NeuCard>
                            ) : (
                                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '24rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Users style={{ width: '3rem', height: '3rem', color: N.dark, margin: '0 auto 1rem' }} />
                                        <p style={{ color: N.textSub }}>Seleccione un cliente para ver detalles</p>
                                    </div>
                                </NeuCard>
                            )}
                        </div>
                    </div>
                )}

                {/* Megaphones View */}
                {activeView === 'campaigns' && (
                    <div style={{ padding: '1.5rem' }}>
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.25rem' }}>Campanas en Ejecucion</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Todas las campanas activas y programadas</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockMegaphones.map(campaign => (
                                    <div key={campaign.id} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <h4 style={{ fontWeight: '500', color: N.text }}>{campaign.name}</h4>
                                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{campaign.client}</p>
                                            </div>
                                            {getMegaphoneStatusBadge(campaign.status)}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                                            <div>
                                                <p style={{ color: N.textSub }}>Presupuesto</p>
                                                <p style={{ fontWeight: '500', color: N.text }}>{formatCurrency(campaign.budget)}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: N.textSub }}>Ejecutado</p>
                                                <p style={{ fontWeight: '500', color: N.accent }}>{formatCurrency(campaign.spent)}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: N.textSub }}>Impresiones</p>
                                                <p style={{ fontWeight: '500', color: '#a855f7' }}>{campaign.impressions.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '1rem', height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${(campaign.spent / campaign.budget) * 100}%`,
                                                    background: `linear-gradient(90deg, ${N.accent}, #a855f7)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </NeuCard>
                    </div>
                )}

                {/* Expirations View */}
                {activeView === 'expirations' && (
                    <div style={{ padding: '1.5rem' }}>
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.25rem' }}>Vencimientos Proximos</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Contratos que vencen en los proximos 60 dias</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockUpcomingExpirations.map((item, idx) => {
                                    const colors = getDaysColor(item.daysLeft);
                                    return (
                                        <div key={idx} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        background: colors.bg,
                                                        color: colors.text
                                                    }}>
                                                        {item.daysLeft} dias
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontWeight: '500', color: N.text }}>{item.client}</h4>
                                                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>{item.contract}</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>Valor del contrato</p>
                                                    <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: N.success }}>{formatCurrency(item.value)}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <NeuButton variant="secondary" onClick={() => { }}>
                                                        Renovar
                                                    </NeuButton>
                                                    <NeuButton variant="secondary" onClick={() => { }}>
                                                        Ver
                                                    </NeuButton>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: N.textSub }}>
                                                <Clock style={{ width: '1rem', height: '1rem' }} />
                                                <span>Vence el: {item.expiration}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </NeuCard>
                    </div>
                )}
            </NeuCard>
        </div>
    );
}
