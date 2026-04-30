'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { getShadow, getFloatingShadow, N } from '@/components/admin/_sdk/AdminDesignSystem';

interface Tenant {
    id: string;
    name: string;
    plan: 'starter' | 'professional' | 'enterprise' | 'platinum';
    status: 'active' | 'suspended' | 'trial';
    users: number;
    stations: number;
    storage: string;
    apiCalls: number;
    createdAt: string;
    contact: string;
    email: string;
}

const mockTenants: Tenant[] = [
    {
        id: '1',
        name: 'MegaMedia',
        plan: 'enterprise',
        status: 'active',
        users: 245,
        stations: 12,
        storage: '850 GB',
        apiCalls: 1250000,
        createdAt: '2023-01-15',
        contact: 'Carlos Mendoza',
        email: 'carlos.mendoza@megamedia.cl',
    },
    {
        id: '2',
        name: 'Prisa Radio',
        plan: 'platinum',
        status: 'active',
        users: 580,
        stations: 28,
        storage: '2.1 TB',
        apiCalls: 3400000,
        createdAt: '2022-06-01',
        contact: 'María González',
        email: 'maria.gonzalez@prisa.cl',
    },
    {
        id: '3',
        name: 'Radio Nacional',
        plan: 'professional',
        status: 'active',
        users: 89,
        stations: 5,
        storage: '320 GB',
        apiCalls: 450000,
        createdAt: '2024-02-20',
        contact: 'Roberto Silva',
        email: 'r.silva@radionacional.cl',
    },
    {
        id: '4',
        name: 'Cadena Regional',
        plan: 'starter',
        status: 'trial',
        users: 12,
        stations: 2,
        storage: '45 GB',
        apiCalls: 23000,
        createdAt: '2026-04-01',
        contact: 'Ana López',
        email: 'ana.lopez@cadena.cl',
    },
    {
        id: '5',
        name: 'El Mercurio',
        plan: 'enterprise',
        status: 'active',
        users: 156,
        stations: 8,
        storage: '680 GB',
        apiCalls: 890000,
        createdAt: '2023-08-10',
        contact: 'Pedro Ramírez',
        email: 'p.ramirez@elmercurio.cl',
    },
    {
        id: '6',
        name: 'TV Chile',
        plan: 'platinum',
        status: 'suspended',
        users: 34,
        stations: 3,
        storage: '120 GB',
        apiCalls: 67000,
        createdAt: '2025-01-05',
        contact: 'Jorge Torres',
        email: 'j.torres@tvchile.cl',
    },
];

const planColors = {
    starter: N.textSub,
    professional: '#93c5fd',
    enterprise: '#c084fc',
    platinum: '#fbbf24',
};

const planLabels = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
    platinum: 'Platinum',
};

const statusColors = {
    active: N.success,
    suspended: N.danger,
    trial: N.warning,
};

const statusLabels = {
    active: 'Activo',
    suspended: 'Suspendido',
    trial: 'Trial',
};

export default function TenantManagementPanel() {
    const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTenants = tenants.filter(
        (t) =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = (id: string) => {
        setTenants((prev) =>
            prev.map((t) =>
                t.id === id
                    ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' }
                    : t
            )
        );
    };

    const handleSaveEdit = () => {
        if (editingTenant) {
            setTenants((prev) =>
                prev.map((t) => (t.id === editingTenant.id ? editingTenant : t))
            );
            setEditingTenant(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>Gestión de Clientes/Tenants</h2>
                    <p style={{ color: N.textSub }}>Control total de todos los clientes de la plataforma</p>
                </div>
                <NeuButton variant="primary" onClick={() => setShowCreateModal(true)}>
                    + Nuevo Cliente
                </NeuButton>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Total Clientes</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{tenants.length}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Activos</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.success }}>
                        {tenants.filter((t) => t.status === 'active').length}
                    </p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>En Trial</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.warning }}>
                        {tenants.filter((t) => t.status === 'trial').length}
                    </p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Suspendidos</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.danger }}>
                        {tenants.filter((t) => t.status === 'suspended').length}
                    </p>
                </NeuCard>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: N.base,
                        border: `1px solid ${N.dark}`,
                        borderRadius: '0.75rem',
                        color: N.text,
                        outline: 'none'
                    }}
                />
                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: N.textSub }}>🔍</span>
            </div>

            {/* Tenants Table */}
            <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%' }}>
                        <thead style={{ background: `${N.dark}50` }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Cliente</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Plan</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Estado</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Usuarios</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Estaciones</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Storage</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>API Calls</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody style={{ borderTop: `1px solid ${N.dark}` }}>
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.id} style={{ borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div>
                                            <p style={{ fontWeight: 500, color: N.text }}>{tenant.name}</p>
                                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>{tenant.email}</p>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <StatusBadge
                                            status={tenant.plan === 'starter' ? 'neutral' : tenant.plan === 'professional' ? 'info' : tenant.plan === 'enterprise' ? 'warning' : 'success'}
                                            label={planLabels[tenant.plan]}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                borderRadius: '9999px',
                                                background: statusColors[tenant.status]
                                            }} />
                                            <span style={{ fontSize: '0.875rem', color: N.text, textTransform: 'capitalize' }}>{statusLabels[tenant.status]}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: N.text, fontWeight: 500 }}>{tenant.users}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: N.text, fontWeight: 500 }}>{tenant.stations}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: N.textSub }}>{tenant.storage}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: N.textSub }}>{tenant.apiCalls.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <NeuButton variant="secondary" onClick={() => setEditingTenant(tenant)}>
                                                Editar
                                            </NeuButton>
                                            <div
                                                onClick={() => toggleStatus(tenant.id)}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    background: tenant.status === 'active' ? `${N.danger}20` : `${N.success}20`,
                                                    color: tenant.status === 'active' ? N.danger : N.success,
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                {tenant.status === 'active' ? 'Suspender' : 'Activar'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NeuCard>

            {/* Edit Modal */}
            {editingTenant && (
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
                    <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base, width: '100%', maxWidth: '32rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: N.text, marginBottom: '1.5rem' }}>Editar Cliente: {editingTenant.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={editingTenant.name}
                                    onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        background: N.dark,
                                        border: `1px solid ${N.dark}`,
                                        borderRadius: '0.5rem',
                                        color: N.text,
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Plan</label>
                                <select
                                    value={editingTenant.plan}
                                    onChange={(e) => setEditingTenant({ ...editingTenant, plan: e.target.value as Tenant['plan'] })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        background: N.dark,
                                        border: `1px solid ${N.dark}`,
                                        borderRadius: '0.5rem',
                                        color: N.text,
                                        outline: 'none'
                                    }}
                                >
                                    <option value="starter">Starter</option>
                                    <option value="professional">Professional</option>
                                    <option value="enterprise">Enterprise</option>
                                    <option value="platinum">Platinum</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Max Usuarios</label>
                                    <input
                                        type="number"
                                        value={editingTenant.users}
                                        onChange={(e) => setEditingTenant({ ...editingTenant, users: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.dark,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Max Estaciones</label>
                                    <input
                                        type="number"
                                        value={editingTenant.stations}
                                        onChange={(e) => setEditingTenant({ ...editingTenant, stations: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 0.75rem',
                                            background: N.dark,
                                            border: `1px solid ${N.dark}`,
                                            borderRadius: '0.5rem',
                                            color: N.text,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Contacto</label>
                                <input
                                    type="text"
                                    value={editingTenant.contact}
                                    onChange={(e) => setEditingTenant({ ...editingTenant, contact: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        background: N.dark,
                                        border: `1px solid ${N.dark}`,
                                        borderRadius: '0.5rem',
                                        color: N.text,
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <NeuButton variant="secondary" onClick={() => setEditingTenant(null)}>
                                Cancelar
                            </NeuButton>
                            <NeuButton variant="primary" onClick={handleSaveEdit}>
                                Guardar Cambios
                            </NeuButton>
                        </div>
                    </NeuCard>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
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
                    <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base, width: '100%', maxWidth: '32rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: N.text, marginBottom: '1.5rem' }}>Crear Nuevo Cliente</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Nombre de Empresa</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Radio Andina"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        background: N.dark,
                                        border: `1px solid ${N.dark}`,
                                        borderRadius: '0.5rem',
                                        color: N.text,
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Email de Contacto</label>
                                <input
                                    type="email"
                                    placeholder="contacto@empresa.cl"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        background: N.dark,
                                        border: `1px solid ${N.dark}`,
                                        borderRadius: '0.5rem',
                                        color: N.text,
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: N.textSub, marginBottom: '0.25rem' }}>Plan</label>
                                <select style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    background: N.dark,
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    color: N.text,
                                    outline: 'none'
                                }}>
                                    <option value="starter">Starter - $5K/mes</option>
                                    <option value="professional">Professional - $15K/mes</option>
                                    <option value="enterprise">Enterprise - $50K/mes</option>
                                    <option value="platinum">Platinum - Custom</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <NeuButton variant="secondary" onClick={() => setShowCreateModal(false)}>
                                Cancelar
                            </NeuButton>
                            <NeuButton variant="primary" onClick={() => setShowCreateModal(false)}>
                                Crear Cliente
                            </NeuButton>
                        </div>
                    </NeuCard>
                </div>
            )}
        </div>
    );
}
