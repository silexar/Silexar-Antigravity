/**
 * Support Tickets Panel - Ticket Management System
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Client tickets, status tracking, SLA monitoring,
 * and response time analytics.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import {
    Ticket,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Send,
    Filter
} from 'lucide-react';

interface Ticket {
    id: string;
    client: string;
    subject: string;
    status: 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: string;
    responseTime: number;
    slaStatus: 'on_track' | 'at_risk' | 'breached';
    category: string;
    messages: number;
}

interface SLAMetric {
    name: string;
    target: number;
    actual: number;
    breached: number;
}

const mockTickets: Ticket[] = [
    {
        id: 'TKT-2025-0156',
        client: 'Radio Nacional Chile',
        subject: 'Error en reproduccion de campanhas',
        status: 'open',
        priority: 'high',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 1800000),
        responseTime: 0,
        slaStatus: 'at_risk',
        category: 'Tecnico',
        messages: 3
    },
    {
        id: 'TKT-2025-0155',
        client: 'FM Stgo Central',
        subject: 'Consulta sobre facturacion de diciembre',
        status: 'in_progress',
        priority: 'medium',
        createdAt: new Date(Date.now() - 3600000 * 8),
        updatedAt: new Date(Date.now() - 3600000),
        assignedTo: 'Maria Garcia',
        responseTime: 45,
        slaStatus: 'on_track',
        category: 'Facturacion',
        messages: 5
    },
    {
        id: 'TKT-2025-0154',
        client: 'Radio Patagonia',
        subject: 'Solicitud de nueva funcionalidad',
        status: 'pending_client',
        priority: 'low',
        createdAt: new Date(Date.now() - 3600000 * 24 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 24),
        assignedTo: 'Carlos Lopez',
        responseTime: 120,
        slaStatus: 'on_track',
        category: 'Feature Request',
        messages: 8
    },
    {
        id: 'TKT-2025-0153',
        client: 'Emisora Andina',
        subject: 'No recibe emails de notificacion',
        status: 'resolved',
        priority: 'medium',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 24),
        assignedTo: 'Maria Garcia',
        responseTime: 90,
        slaStatus: 'on_track',
        category: 'Tecnico',
        messages: 12
    },
    {
        id: 'TKT-2025-0152',
        client: 'Radio Austral',
        subject: 'Problema con API de reportes',
        status: 'open',
        priority: 'critical',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
        responseTime: 0,
        slaStatus: 'breached',
        category: 'API',
        messages: 2
    },
];

const mockSLAMetrics: SLAMetric[] = [
    { name: 'Tiempo Primera Respuesta', target: 60, actual: 72, breached: 3 },
    { name: 'Tiempo de Resolucion', target: 480, actual: 420, breached: 1 },
    { name: 'SLA critico (1h)', target: 60, actual: 85, breached: 2 },
    { name: 'SLA alto (4h)', target: 240, actual: 200, breached: 0 },
];

const mockTeamPerformance = [
    { name: 'Maria Garcia', tickets: 24, avgResponse: 45, resolution: 92 },
    { name: 'Carlos Lopez', tickets: 18, avgResponse: 67, resolution: 88 },
    { name: 'Juan Perez', tickets: 15, avgResponse: 55, resolution: 95 },
    { name: 'Ana Torres', tickets: 12, avgResponse: 78, resolution: 85 },
];

const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
        case 'open': return <StatusBadge status="danger" label="Abierto" />;
        case 'in_progress': return <StatusBadge status="info" label="En Progreso" />;
        case 'pending_client': return <StatusBadge status="warning" label="Esperando Cliente" />;
        case 'resolved': return <StatusBadge status="success" label="Resuelto" />;
        case 'closed': return <StatusBadge status="neutral" label="Cerrado" />;
    }
};

const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
        case 'critical': return <StatusBadge status="danger" label="Critico" />;
        case 'high': return <StatusBadge status="danger" label="Alto" />;
        case 'medium': return <StatusBadge status="warning" label="Medio" />;
        case 'low': return <StatusBadge status="info" label="Bajo" />;
    }
};

const getSLAStatusIcon = (status: Ticket['slaStatus']) => {
    switch (status) {
        case 'on_track': return <CheckCircle style={{ width: '1rem', height: '1rem', color: N.success }} />;
        case 'at_risk': return <AlertTriangle style={{ width: '1rem', height: '1rem', color: N.warning }} />;
        case 'breached': return <AlertCircle style={{ width: '1rem', height: '1rem', color: N.danger }} />;
    }
};

const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
};

export default function SupportTickets() {
    const [activeTab, setActiveTab] = useState<'tickets' | 'sla' | 'team'>('tickets');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

    const filteredTickets = filterStatus === 'all'
        ? mockTickets
        : mockTickets.filter(t => t.status === filterStatus);

    const openTickets = mockTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const criticalTickets = mockTickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, ${N.accent}, #06b6d4)` }}>
                        <Ticket style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Sistema de Tickets</h2>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Soporte y gestion de incidentes</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status="danger" label={`${criticalTickets} Criticos`} />
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Tickets Abiertos</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{openTickets}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.danger}20` }}>
                            <Ticket style={{ width: '1.5rem', height: '1.5rem', color: N.danger }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>En Progreso</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.accent }}>
                                {mockTickets.filter(t => t.status === 'in_progress').length}
                            </p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.accent}20` }}>
                            <Clock style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Pendiente Cliente</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.warning }}>
                                {mockTickets.filter(t => t.status === 'pending_client').length}
                            </p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.warning}20` }}>
                            <User style={{ width: '1.5rem', height: '1.5rem', color: N.warning }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Resueltos (30d)</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.success }}>
                                {mockTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                            </p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.success}20` }}>
                            <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                        </div>
                    </div>
                </NeuCard>
            </div>

            {/* Tab Navigation */}
            <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${N.dark}` }}>
                    <button
                        onClick={() => setActiveTab('tickets')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'tickets' ? N.accent : 'transparent',
                            color: activeTab === 'tickets' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Ticket style={{ width: '1rem', height: '1rem' }} />
                        Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab('sla')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'sla' ? N.accent : 'transparent',
                            color: activeTab === 'sla' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Clock style={{ width: '1rem', height: '1rem' }} />
                        SLA Monitoring
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'team' ? N.accent : 'transparent',
                            color: activeTab === 'team' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <User style={{ width: '1rem', height: '1rem' }} />
                        Equipo
                    </button>
                </div>

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base, borderRadius: 0 }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${N.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: '600', color: N.text }}>Tickets de Clientes</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter style={{ width: '1rem', height: '1rem', color: N.textSub }} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{
                                        background: N.dark,
                                        border: `1px solid ${N.dark}`,
                                        color: N.text,
                                        fontSize: '0.875rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    }}
                                >
                                    <option value="all">Todos</option>
                                    <option value="open">Abiertos</option>
                                    <option value="in_progress">En Progreso</option>
                                    <option value="pending_client">Pendiente</option>
                                    <option value="resolved">Resueltos</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            {filteredTickets.map(ticket => (
                                <div key={ticket.id} style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <button
                                            onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                                            style={{
                                                flex: 1,
                                                textAlign: 'left',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                <div style={{ marginTop: '0.25rem' }}>
                                                    {getSLAStatusIcon(ticket.slaStatus)}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: N.textSub }}>{ticket.id}</span>
                                                        {getPriorityBadge(ticket.priority)}
                                                        {getStatusBadge(ticket.status)}
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text, marginTop: '0.25rem' }}>{ticket.subject}</p>
                                                    <p style={{ fontSize: '0.75rem', color: N.textSub, marginTop: '0.25rem' }}>{ticket.client}</p>
                                                </div>
                                            </div>
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Creado</p>
                                                <p style={{ fontSize: '0.875rem', color: N.text }}>{formatTimeAgo(ticket.createdAt)}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: N.textSub }}>
                                                <MessageSquare style={{ width: '1rem', height: '1rem' }} />
                                                <span style={{ fontSize: '0.875rem' }}>{ticket.messages}</span>
                                            </div>
                                            {expandedTicket === ticket.id ? (
                                                <ChevronUp style={{ width: '1rem', height: '1rem', color: N.textSub }} />
                                            ) : (
                                                <ChevronDown style={{ width: '1rem', height: '1rem', color: N.textSub }} />
                                            )}
                                        </div>
                                    </div>

                                    {expandedTicket === ticket.id && (
                                        <div style={{ marginTop: '1rem', paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                                                <div>
                                                    <p style={{ color: N.textSub }}>Categoria</p>
                                                    <p style={{ color: N.text }}>{ticket.category}</p>
                                                </div>
                                                <div>
                                                    <p style={{ color: N.textSub }}>Asignado a</p>
                                                    <p style={{ color: N.text }}>{ticket.assignedTo || 'Sin asignar'}</p>
                                                </div>
                                                <div>
                                                    <p style={{ color: N.textSub }}>Ultima actualizacion</p>
                                                    <p style={{ color: N.text }}>{formatTimeAgo(ticket.updatedAt)}</p>
                                                </div>
                                                <div>
                                                    <p style={{ color: N.textSub }}>Tiempo de respuesta</p>
                                                    <p style={{ color: N.text }}>{ticket.responseTime > 0 ? `${ticket.responseTime}min` : 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                                                <NeuButton variant="primary" onClick={() => { }}>
                                                    <Send style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                                    Responder
                                                </NeuButton>
                                                <NeuButton variant="secondary" onClick={() => { }}>
                                                    Ver Detalles
                                                </NeuButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </NeuCard>
                )}

                {/* SLA Tab */}
                {activeTab === 'sla' && (
                    <div style={{ padding: '1.5rem' }}>
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.25rem' }}>Metricas SLA</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Cumplimiento de acuerdos de servicio</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {mockSLAMetrics.map((metric, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>{metric.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                                                    Objetivo: {metric.target}min
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                                                    Actual: {metric.actual}min
                                                </span>
                                                {metric.breached > 0 && (
                                                    <StatusBadge status="danger" label={`${metric.breached} breached`} />
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ height: '0.75rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${Math.min((metric.actual / metric.target) * 100, 100)}%`,
                                                    background: metric.actual <= metric.target ? N.success : N.danger,
                                                    transition: 'all 0.3s'
                                                }}
                                            />
                                        </div>
                                        {metric.actual > metric.target && (
                                            <p style={{ fontSize: '0.75rem', color: N.danger, marginTop: '0.25rem' }}>
                                                {(metric.actual - metric.target).toFixed(0)}min sobre el objetivo
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </NeuCard>
                    </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                    <div style={{ padding: '1.5rem' }}>
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.25rem' }}>Rendimiento del Equipo</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Estadisticas del equipo de soporte</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockTeamPerformance.map((member, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '2.5rem',
                                                    height: '2.5rem',
                                                    borderRadius: '9999px',
                                                    background: `${N.accent}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <span style={{ color: N.accent, fontWeight: 'bold' }}>{member.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '500', color: N.text }}>{member.name}</p>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>{member.tickets} tickets este mes</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.accent }}>{member.avgResponse}min</p>
                                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>Respuesta avg</p>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.success }}>{member.resolution}%</p>
                                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>Resolucion</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ height: '0.5rem', background: N.dark, borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${member.resolution}%`,
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
            </NeuCard>
        </div>
    );
}
