'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { getShadow, N } from '@/components/admin/_sdk/AdminDesignSystem';

interface User {
    id: string;
    name: string;
    email: string;
    tenant: string;
    plan: string;
    role: string;
    status: 'online' | 'offline' | 'away';
    lastActive: string;
    sessions: number;
}

const mockUsers: User[] = [
    { id: '1', name: 'Carlos Mendoza', email: 'carlos.mendoza@megamedia.cl', tenant: 'MegaMedia', plan: 'enterprise', role: 'Admin', status: 'online', lastActive: 'Ahora', sessions: 2 },
    { id: '2', name: 'María González', email: 'maria.gonzalez@prisa.cl', tenant: 'Prisa Radio', plan: 'platinum', role: 'Admin', status: 'online', lastActive: 'Ahora', sessions: 1 },
    { id: '3', name: 'Roberto Silva', email: 'r.silva@radionacional.cl', tenant: 'Radio Nacional', plan: 'professional', role: 'Editor', status: 'away', lastActive: 'Hace 15 min', sessions: 1 },
    { id: '4', name: 'Ana López', email: 'ana.lopez@cadena.cl', tenant: 'Cadena Regional', plan: 'starter', role: 'User', status: 'offline', lastActive: 'Hace 2h', sessions: 0 },
    { id: '5', name: 'Pedro Ramírez', email: 'p.ramirez@elmercurio.cl', tenant: 'El Mercurio', plan: 'enterprise', role: 'Admin', status: 'online', lastActive: 'Ahora', sessions: 3 },
    { id: '6', name: 'Jorge Torres', email: 'j.torres@tvchile.cl', tenant: 'TV Chile', plan: 'platinum', role: 'Editor', status: 'offline', lastActive: 'Hace 1d', sessions: 0 },
    { id: '7', name: 'Laura Fernández', email: 'l.fernandez@megamedia.cl', tenant: 'MegaMedia', plan: 'enterprise', role: 'User', status: 'online', lastActive: 'Ahora', sessions: 1 },
    { id: '8', name: 'Diego Ruiz', email: 'd.ruiz@prisa.cl', tenant: 'Prisa Radio', plan: 'platinum', role: 'Admin', status: 'away', lastActive: 'Hace 5 min', sessions: 2 },
    { id: '9', name: 'Sofia Martinez', email: 's.martinez@radionacional.cl', tenant: 'Radio Nacional', plan: 'professional', role: 'User', status: 'offline', lastActive: 'Hace 3h', sessions: 0 },
    { id: '10', name: 'Andrés Castro', email: 'a.castro@elmercurio.cl', tenant: 'El Mercurio', plan: 'enterprise', role: 'Editor', status: 'online', lastActive: 'Ahora', sessions: 1 },
];

const statusConfig = {
    online: { color: N.success, label: 'Online' },
    offline: { color: N.textSub, label: 'Offline' },
    away: { color: N.warning, label: 'Away' },
};

const planColors = {
    starter: N.textSub,
    professional: '#93c5fd',
    enterprise: '#c084fc',
    platinum: '#fbbf24',
};

export default function UserManagementPanel() {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.tenant.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const disconnectSession = (userId: string) => {
        const confirmed = confirm('¿Desconectar todas las sesiones de este usuario?');
        if (!confirmed) return;
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, sessions: 0 } : u
        ));
    };

    const getStats = () => ({
        total: users.length,
        online: users.filter(u => u.status === 'online').length,
        away: users.filter(u => u.status === 'away').length,
        offline: users.filter(u => u.status === 'offline').length,
    });

    const stats = getStats();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>Gestión de Usuarios Global</h2>
                    <p style={{ color: N.textSub }}>Ver y controlar todos los usuarios de todos los clientes</p>
                </div>
                <div
                    onClick={() => { }}
                    style={{
                        padding: '0.5rem 1rem',
                        background: `${N.danger}20`,
                        color: N.danger,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    🔌 Desconectar Todas las Sesiones
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Total Usuarios</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{stats.total}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Online</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.success }}>{stats.online}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Away</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.warning }}>{stats.away}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Offline</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.textSub }}>{stats.offline}</p>
                </NeuCard>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Sesiones Activas</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.accent }}>
                        {users.reduce((acc, u) => acc + u.sessions, 0)}
                    </p>
                </NeuCard>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            paddingRight: '3rem',
                            background: N.base,
                            border: `1px solid ${N.dark}`,
                            borderRadius: '0.75rem',
                            color: N.text,
                            outline: 'none'
                        }}
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: N.textSub }}>🔍</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'online', 'away', 'offline'].map(status => (
                        <div
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                background: filterStatus === status ? N.accent : N.base,
                                color: filterStatus === status ? N.text : N.textSub,
                                transition: 'background 0.2s'
                            }}
                        >
                            {status}
                        </div>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%' }}>
                        <thead style={{ background: `${N.dark}50` }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Usuario</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Cliente</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Plan</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Rol</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Estado</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Última Actividad</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Sesiones</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody style={{ borderTop: `1px solid ${N.dark}` }}>
                            {filteredUsers.map(user => {
                                const status = statusConfig[user.status];
                                const planColor = planColors[user.plan as keyof typeof planColors] || N.textSub;
                                return (
                                    <tr key={user.id} style={{ borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    borderRadius: '9999px',
                                                    background: status.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: N.text,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                }}>
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 500, color: N.text }}>{user.name}</p>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: N.textSub }}>{user.tenant}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                background: `${planColor}20`,
                                                color: planColor
                                            }}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: N.textSub }}>{user.role}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    width: '0.5rem',
                                                    height: '0.5rem',
                                                    borderRadius: '9999px',
                                                    background: status.color
                                                }} />
                                                <span style={{ fontSize: '0.875rem', color: status.color }}>{status.label}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: N.textSub }}>{user.lastActive}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: N.text, fontWeight: 500 }}>{user.sessions}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <NeuButton variant="secondary" onClick={() => { }}>
                                                    Ver Detalles
                                                </NeuButton>
                                                {user.sessions > 0 && (
                                                    <div
                                                        onClick={() => disconnectSession(user.id)}
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.875rem',
                                                            cursor: 'pointer',
                                                            background: `${N.danger}20`,
                                                            color: N.danger,
                                                            transition: 'background 0.2s'
                                                        }}
                                                    >
                                                        Desconectar
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </NeuCard>
        </div>
    );
}
