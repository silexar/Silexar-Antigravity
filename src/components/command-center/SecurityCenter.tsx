/**
 * Security Center - Security Audit Dashboard
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Audit logs, failed login attempts, suspicious sessions,
 * compliance status, and SSL certificates monitoring.
 */

'use client';

import React, { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Lock,
    Unlock,
    Eye,
    User,
    LogIn,
    FileText,
    Server,
    Award,
    Activity
} from 'lucide-react';

interface AuditLogEntry {
    id: string;
    timestamp: Date;
    user: string;
    action: string;
    module: string;
    ip: string;
    status: 'success' | 'warning' | 'error';
    details?: string;
}

interface FailedLoginAttempt {
    id: string;
    timestamp: Date;
    email: string;
    ip: string;
    attempts: number;
    location: string;
    blocked: boolean;
}

interface SuspiciousSession {
    id: string;
    user: string;
    startTime: Date;
    duration: string;
    ip: string;
    risk: 'low' | 'medium' | 'high';
    anomalies: string[];
}

interface SSLCertificate {
    domain: string;
    issuer: string;
    expires: string;
    daysRemaining: number;
    status: 'valid' | 'expiring' | 'expired';
}

const mockAuditLogs: AuditLogEntry[] = [
    { id: '1', timestamp: new Date(Date.now() - 300000), user: 'admin@silexar.cl', action: 'Login exitoso', module: 'Auth', ip: '192.168.1.100', status: 'success' },
    { id: '2', timestamp: new Date(Date.now() - 600000), user: 'admin@silexar.cl', action: 'Cambio de configuracion', module: 'Settings', ip: '192.168.1.100', status: 'success', details: 'Feature flag: new_dashboard enabled' },
    { id: '3', timestamp: new Date(Date.now() - 900000), user: 'unknown', action: 'Login fallido', module: 'Auth', ip: '45.33.32.156', status: 'error', details: 'Credenciales invalidas' },
    { id: '4', timestamp: new Date(Date.now() - 1200000), user: 'admin@silexar.cl', action: 'Ejecucion de failover', module: 'Database', ip: '192.168.1.100', status: 'warning', details: 'Failover a replica secundaria' },
    { id: '5', timestamp: new Date(Date.now() - 1800000), user: 'user@cliente.cl', action: 'Exportar datos', module: 'Reports', ip: '10.0.0.50', status: 'success' },
    { id: '6', timestamp: new Date(Date.now() - 2400000), user: 'unknown', action: 'Multiples intentos de login', module: 'Auth', ip: '185.220.101.34', status: 'error', details: '3 intentos fallidos' },
    { id: '7', timestamp: new Date(Date.now() - 3000000), user: 'admin@silexar.cl', action: 'Creacion de tenant', module: 'Tenants', ip: '192.168.1.100', status: 'success', details: 'Nuevo cliente: Radio Austral' },
];

const mockFailedLogins: FailedLoginAttempt[] = [
    { id: '1', timestamp: new Date(Date.now() - 300000), email: 'root@admin.com', ip: '185.220.101.34', attempts: 5, location: 'Rusia', blocked: true },
    { id: '2', timestamp: new Date(Date.now() - 600000), email: 'admin@silexar.cl', ip: '203.0.113.50', attempts: 3, location: 'China', blocked: true },
    { id: '3', timestamp: new Date(Date.now() - 900000), email: 'test@test.com', ip: '45.33.32.156', attempts: 1, location: 'Estados Unidos', blocked: false },
    { id: '4', timestamp: new Date(Date.now() - 1800000), email: 'user@unknown.eu', ip: '198.51.100.23', attempts: 8, location: 'Alemania', blocked: true },
];

const mockSuspiciousSessions: SuspiciousSession[] = [
    { id: '1', user: 'temp@session.io', startTime: new Date(Date.now() - 7200000), duration: '2h 15m', ip: '185.220.101.34', risk: 'high', anomalies: ['Ubicacion inusual', 'Multiples IPs', 'Pattern de acceso anomal'] },
    { id: '2', user: 'export@cron.job', startTime: new Date(Date.now() - 3600000), duration: '1h 5m', ip: '10.0.0.25', risk: 'medium', anomalies: ['Acceso a datos masivos', 'Fuera de horario'] },
    { id: '3', user: 'api@service', startTime: new Date(Date.now() - 1800000), duration: '32m', ip: '10.0.0.30', risk: 'low', anomalies: ['Alta frecuencia de requests'] },
];

const mockCertificates: SSLCertificate[] = [
    { domain: 'silexar.pulse', issuer: 'Let\'s Encrypt', expires: '2025-03-15', daysRemaining: 78, status: 'valid' },
    { domain: 'api.silexar.pulse', issuer: 'Let\'s Encrypt', expires: '2025-03-15', daysRemaining: 78, status: 'valid' },
    { domain: 'admin.silexar.pulse', issuer: 'DigiCert', expires: '2025-01-20', daysRemaining: 15, status: 'expiring' },
    { domain: 'legacy.silexar.pulse', issuer: 'Comodo', expires: '2024-12-01', daysRemaining: -30, status: 'expired' },
];

const mockComplianceStatus = {
    GDPR: { status: 'compliant', lastAudit: '2024-12-15', issues: 0 },
    SOC2: { status: 'compliant', lastAudit: '2024-11-28', issues: 0 },
    ISO27001: { status: 'in_progress', lastAudit: '2024-10-10', issues: 2 },
    'PCI_DSS': { status: 'compliant', lastAudit: '2024-09-05', issues: 0 },
};

export default function SecurityCenter() {
    const [activeTab, setActiveTab] = useState<'audit' | 'logins' | 'sessions' | 'certificates'>('audit');
    const [showOnlyErrors, setShowOnlyErrors] = useState(false);

    const filteredLogs = showOnlyErrors
        ? mockAuditLogs.filter(log => log.status === 'error')
        : mockAuditLogs;

    const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
        switch (status) {
            case 'success': return <CheckCircle style={{ width: '1rem', height: '1rem', color: N.success }} />;
            case 'warning': return <AlertTriangle style={{ width: '1rem', height: '1rem', color: N.warning }} />;
            case 'error': return <AlertTriangle style={{ width: '1rem', height: '1rem', color: N.danger }} />;
        }
    };

    const getRiskBadge = (risk: SuspiciousSession['risk']) => {
        switch (risk) {
            case 'high': return <StatusBadge status="danger" label="Alto" />;
            case 'medium': return <StatusBadge status="warning" label="Medio" />;
            case 'low': return <StatusBadge status="info" label="Bajo" />;
        }
    };

    const getCertStatusBadge = (status: SSLCertificate['status']) => {
        switch (status) {
            case 'valid': return <StatusBadge status="success" label="Valido" />;
            case 'expiring': return <StatusBadge status="warning" label="Expirando" />;
            case 'expired': return <StatusBadge status="danger" label="Expirado" />;
        }
    };

    const getComplianceBadge = (status: string) => {
        if (status === 'compliant') return <StatusBadge status="success" label="Conforme" />;
        if (status === 'in_progress') return <StatusBadge status="warning" label="En Progreso" />;
        return <StatusBadge status="danger" label="No Conforme" />;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, ${N.danger}, ${N.warning})` }}>
                        <Shield style={{ width: '2rem', height: '2rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Centro de Seguridad</h2>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Audit logs, compliance y monitoreo de seguridad</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status="success" label="Pentagon++ Activo" />
                </div>
            </div>

            {/* Security Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Failed Logins (24h)</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.danger }}>{mockFailedLogins.length}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.danger}20` }}>
                            <LogIn style={{ width: '1.5rem', height: '1.5rem', color: N.danger }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Sesiones Sospechosas</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.warning }}>{mockSuspiciousSessions.filter(s => s.risk === 'high').length}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.warning}20` }}>
                            <Eye style={{ width: '1.5rem', height: '1.5rem', color: N.warning }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Eventos de Audit</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{mockAuditLogs.length}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.accent}20` }}>
                            <FileText style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />
                        </div>
                    </div>
                </NeuCard>

                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: N.textSub }}>Certificados SSL</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.success }}>{mockCertificates.filter(c => c.status === 'valid').length}/{mockCertificates.length}</p>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${N.success}20` }}>
                            <Award style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />
                        </div>
                    </div>
                </NeuCard>
            </div>

            {/* Compliance Status */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield style={{ width: '1.25rem', height: '1.25rem', color: N.success }} />
                        Estado de Compliance
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Certificaciones y auditorias</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {Object.entries(mockComplianceStatus).map(([key, value]) => (
                        <div key={key} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: N.text }}>{key}</span>
                                {getComplianceBadge(value.status)}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Ultima auditoria: {value.lastAudit}</p>
                            {value.issues > 0 && (
                                <p style={{ fontSize: '0.75rem', color: N.warning, marginTop: '0.25rem' }}>{value.issues} hallazgos pendientes</p>
                            )}
                        </div>
                    ))}
                </div>
            </NeuCard>

            {/* Tabs Navigation */}
            <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${N.dark}` }}>
                    <button
                        onClick={() => setActiveTab('audit')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'audit' ? N.accent : 'transparent',
                            color: activeTab === 'audit' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FileText style={{ width: '1rem', height: '1rem' }} />
                        Audit Log
                    </button>
                    <button
                        onClick={() => setActiveTab('logins')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'logins' ? N.accent : 'transparent',
                            color: activeTab === 'logins' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogIn style={{ width: '1rem', height: '1rem' }} />
                        Logins Fallidos
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'sessions' ? N.accent : 'transparent',
                            color: activeTab === 'sessions' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <User style={{ width: '1rem', height: '1rem' }} />
                        Sesiones
                    </button>
                    <button
                        onClick={() => setActiveTab('certificates')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'certificates' ? N.accent : 'transparent',
                            color: activeTab === 'certificates' ? 'white' : N.textSub,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Award style={{ width: '1rem', height: '1rem' }} />
                        Certificados
                    </button>
                </div>

                {/* Audit Log Tab */}
                {activeTab === 'audit' && (
                    <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base, borderRadius: 0 }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${N.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontWeight: '600', color: N.text }}>Log de Auditoria</h3>
                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>Ultimas acciones en el sistema</p>
                            </div>
                            <NeuButton
                                variant={showOnlyErrors ? 'primary' : 'secondary'}
                                onClick={() => setShowOnlyErrors(!showOnlyErrors)}
                            >
                                <AlertTriangle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                Solo errores
                            </NeuButton>
                        </div>
                        <div>
                            {filteredLogs.map(log => (
                                <div key={log.id} style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ marginTop: '0.25rem' }}>
                                                {getStatusIcon(log.status)}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: '500', color: N.text }}>{log.user}</span>
                                                    <StatusBadge status="neutral" label={log.module} />
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>{log.action}</p>
                                                {log.details && (
                                                    <p style={{ fontSize: '0.75rem', color: `${N.textSub}80`, marginTop: '0.25rem' }}>{log.details}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>{log.ip}</p>
                                            <p style={{ fontSize: '0.75rem', color: N.textSub, marginTop: '0.25rem' }}>
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </NeuCard>
                )}

                {/* Failed Logins Tab */}
                {activeTab === 'logins' && (
                    <div style={{ padding: '1.5rem' }}>
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.25rem' }}>Intentos de Login Fallidos</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Bloqueos automaticos y deteccion de amenazas</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockFailedLogins.map(login => (
                                    <div key={login.id} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', background: `${N.danger}20`, borderRadius: '0.5rem' }}>
                                                    <LogIn style={{ width: '1.25rem', height: '1.25rem', color: N.danger }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: '500', color: N.text }}>{login.email}</span>
                                                        {login.blocked && <StatusBadge status="danger" label="Bloqueado" />}
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>IP: {login.ip} - {login.location}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.danger }}>{login.attempts}</p>
                                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>intentos</p>
                                                <p style={{ fontSize: '0.75rem', color: N.textSub, marginTop: '0.25rem' }}>
                                                    {new Date(login.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </NeuCard>
                    </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                    <div style={{ padding: '1.5rem' }}>
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.25rem' }}>Sesiones Sospechosas</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Actividad anomal detectada por IA</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockSuspiciousSessions.map(session => (
                                    <div key={session.id} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', background: `${N.warning}20`, borderRadius: '0.5rem' }}>
                                                    <Activity style={{ width: '1.25rem', height: '1.25rem', color: N.warning }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: '500', color: N.text }}>{session.user}</span>
                                                        {getRiskBadge(session.risk)}
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>IP: {session.ip} - Duracion: {session.duration}</p>
                                                </div>
                                            </div>
                                            <NeuButton variant="secondary" onClick={() => { }}>
                                                Terminar Sesion
                                            </NeuButton>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {session.anomalies.map((anomaly, idx) => (
                                                <span key={idx} style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.75rem',
                                                    background: `${N.warning}15`,
                                                    color: N.warning,
                                                    border: `1px solid ${N.warning}30`
                                                }}>
                                                    {anomaly}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </NeuCard>
                    </div>
                )}

                {/* Certificates Tab */}
                {activeTab === 'certificates' && (
                    <div style={{ padding: '1.5rem' }}>
                        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                            <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '0.25rem' }}>Certificados SSL</h3>
                            <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>Monitoreo de certificados y renovaciones</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mockCertificates.map(cert => (
                                    <div key={cert.domain} style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', border: `1px solid ${N.dark}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    padding: '0.5rem',
                                                    borderRadius: '0.5rem',
                                                    background: cert.status === 'valid' ? `${N.success}20` : cert.status === 'expiring' ? `${N.warning}20` : `${N.danger}20`
                                                }}>
                                                    <Award style={{
                                                        width: '1.25rem',
                                                        height: '1.25rem',
                                                        color: cert.status === 'valid' ? N.success : cert.status === 'expiring' ? N.warning : N.danger
                                                    }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: '500', color: N.text }}>{cert.domain}</span>
                                                        {getCertStatusBadge(cert.status)}
                                                    </div>
                                                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>{cert.issuer}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{
                                                    fontSize: '1.125rem',
                                                    fontWeight: 'bold',
                                                    color: cert.daysRemaining < 0 ? N.danger : cert.daysRemaining < 30 ? N.warning : N.text
                                                }}>
                                                    {cert.daysRemaining < 0 ? `${Math.abs(cert.daysRemaining)} dias vencido` : `${cert.daysRemaining} dias`}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Expira: {cert.expires}</p>
                                            </div>
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
