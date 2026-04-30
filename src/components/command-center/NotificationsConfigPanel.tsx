/**
 * Notifications Configuration Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Notification channels, recipients and rules configuration.
 */

'use client';

import { useState } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import { Bell, Mail, Phone, Smartphone, Plus, X } from 'lucide-react';

interface NotificationChannel {
    id: string;
    name: 'email' | 'sms' | 'push';
    enabled: boolean;
    recipients: string[];
    minSeverity: 'info' | 'warning' | 'critical';
}

interface NotificationRule {
    id: string;
    name: string;
    channel: string;
    severity: string;
    enabled: boolean;
    template: string;
}

const mockChannels: NotificationChannel[] = [
    {
        id: '1',
        name: 'email',
        enabled: true,
        recipients: ['ceo@silexar.cl', 'admin@silexar.cl', 'oncall@silexar.cl'],
        minSeverity: 'warning',
    },
    {
        id: '2',
        name: 'sms',
        enabled: true,
        recipients: ['+56912345678', '+56987654321'],
        minSeverity: 'critical',
    },
    {
        id: '3',
        name: 'push',
        enabled: true,
        recipients: ['Mobile App - CEO', 'Mobile App - Ops Team'],
        minSeverity: 'info',
    },
];

const mockRules: NotificationRule[] = [
    { id: '1', name: 'Critical Alerts', channel: 'email', severity: 'critical', enabled: true, template: 'Critical: {{title}} - {{message}}' },
    { id: '2', name: 'Critical SMS', channel: 'sms', severity: 'critical', enabled: true, template: 'CRITICAL: {{title}}' },
    { id: '3', name: 'Warnings Email', channel: 'email', severity: 'warning', enabled: true, template: 'Warning: {{title}}' },
    { id: '4', name: 'Info Notifications', channel: 'push', severity: 'info', enabled: false, template: '{{title}}' },
    { id: '5', name: 'Daily Summary', channel: 'email', severity: 'info', enabled: true, template: 'Daily Report: {{summary}}' },
];

const channelIcons = {
    email: <Mail style={{ width: '1.5rem', height: '1.5rem', color: N.accent }} />,
    sms: <Phone style={{ width: '1.5rem', height: '1.5rem', color: N.success }} />,
    push: <Smartphone style={{ width: '1.5rem', height: '1.5rem', color: '#a855f7' }} />,
};

const channelColors = {
    email: `${N.accent}20`,
    sms: `${N.success}20`,
    push: '#a855f720',
};

const severityColors = {
    info: `${N.accent}20`,
    warning: `${N.warning}20`,
    critical: `${N.danger}20`,
};

const severityTextColors = {
    info: N.accent,
    warning: N.warning,
    critical: N.danger,
};

export default function NotificationsConfigPanel() {
    const [channels, setChannels] = useState<NotificationChannel[]>(mockChannels);
    const [rules, setRules] = useState<NotificationRule[]>(mockRules);
    const [newRecipient, setNewRecipient] = useState('');

    const toggleChannel = (id: string) => {
        setChannels(prev => prev.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
        ));
    };

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
        ));
    };

    const addRecipient = (channelId: string) => {
        if (!newRecipient.trim()) return;
        setChannels(prev => prev.map(c => {
            if (c.id === channelId) {
                return { ...c, recipients: [...c.recipients, newRecipient.trim()] };
            }
            return c;
        }));
        setNewRecipient('');
    };

    const removeRecipient = (channelId: string, recipient: string) => {
        setChannels(prev => prev.map(c => {
            if (c.id === channelId) {
                return { ...c, recipients: c.recipients.filter(r => r !== recipient) };
            }
            return c;
        }));
    };

    const updateSeverity = (channelId: string, severity: NotificationChannel['minSeverity']) => {
        setChannels(prev => prev.map(c =>
            c.id === channelId ? { ...c, minSeverity: severity } : c
        ));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, ${N.accent}, #a855f7)` }}>
                        <Bell style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Configuracion de Notificaciones</h2>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Canales, destinatarios y reglas de notificacion</p>
                    </div>
                </div>
                <NeuButton variant="primary" onClick={() => { }}>
                    <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Nueva Regla
                </NeuButton>
            </div>

            {/* Channels Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: N.text }}>Canales de Notificacion</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {channels.map(channel => (
                        <NeuCard
                            key={channel.id}
                            style={{
                                boxShadow: getShadow(),
                                padding: '1.25rem',
                                background: channel.enabled ? N.base : `${N.base}80`,
                                opacity: channel.enabled ? 1 : 0.6,
                                border: `1px solid ${channel.enabled ? N.dark : `${N.dark}50`}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {channelIcons[channel.name]}
                                    <span style={{ fontWeight: '500', color: N.text, textTransform: 'capitalize' }}>{channel.name}</span>
                                </div>
                                <button
                                    onClick={() => toggleChannel(channel.id)}
                                    style={{
                                        position: 'relative',
                                        width: '3rem',
                                        height: '1.5rem',
                                        borderRadius: '9999px',
                                        background: channel.enabled ? N.success : N.dark,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '0.25rem',
                                            width: '1rem',
                                            height: '1rem',
                                            borderRadius: '9999px',
                                            background: 'white',
                                            transition: 'left 0.2s',
                                            left: channel.enabled ? '1.75rem' : '0.25rem'
                                        }}
                                    />
                                </button>
                            </div>

                            {channel.enabled && (
                                <>
                                    {/* Severity Threshold */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem', display: 'block' }}>Minima Severidad:</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {(['info', 'warning', 'critical'] as const).map(severity => (
                                                <button
                                                    key={severity}
                                                    onClick={() => updateSeverity(channel.id, severity)}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: channel.minSeverity === severity ? severityColors[severity] : `${N.dark}80`,
                                                        color: channel.minSeverity === severity ? severityTextColors[severity] : N.textSub,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {severity}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recipients */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '0.5rem', display: 'block' }}>Destinatarios:</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            {channel.recipients.map((recipient, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: `${N.dark}50`,
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem 0.75rem'
                                                }}>
                                                    <span style={{ fontSize: '0.875rem', color: N.text, maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipient}</span>
                                                    <button
                                                        onClick={() => removeRecipient(channel.id, recipient)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: N.textSub,
                                                            cursor: 'pointer',
                                                            padding: '0.25rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            transition: 'color 0.2s'
                                                        }}
                                                    >
                                                        <X style={{ width: '1rem', height: '1rem' }} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={newRecipient}
                                                onChange={(e) => setNewRecipient(e.target.value)}
                                                placeholder="Agregar destinatario..."
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 0.75rem',
                                                    background: N.base,
                                                    border: `1px solid ${N.dark}`,
                                                    borderRadius: '0.5rem',
                                                    color: N.text,
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                            <NeuButton variant="secondary" onClick={() => addRecipient(channel.id)}>
                                                <Plus style={{ width: '1rem', height: '1rem' }} />
                                            </NeuButton>
                                        </div>
                                    </div>
                                </>
                            )}
                        </NeuCard>
                    ))}
                </div>
            </div>

            {/* Notification Rules */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: N.text, marginBottom: '1rem' }}>Reglas de Notificacion</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%' }}>
                        <thead style={{ background: `${N.dark}50` }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Regla</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Canal</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Severidad</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Template</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Estado</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500', color: N.textSub }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody style={{ borderTop: `1px solid ${N.dark}` }}>
                            {rules.map(rule => (
                                <tr key={rule.id} style={{ borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500', color: N.text }}>{rule.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            background: channelColors[rule.channel as keyof typeof channelColors],
                                            color: rule.channel === 'email' ? N.accent : rule.channel === 'sms' ? N.success : '#a855f7'
                                        }}>
                                            {rule.channel}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            background: severityColors[rule.severity as keyof typeof severityColors],
                                            color: severityTextColors[rule.severity as keyof typeof severityTextColors]
                                        }}>
                                            {rule.severity}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: N.textSub, maxWidth: '16rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.template}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => toggleRule(rule.id)}
                                            style={{
                                                position: 'relative',
                                                width: '2.5rem',
                                                height: '1.25rem',
                                                borderRadius: '9999px',
                                                background: rule.enabled ? N.success : N.dark,
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '0.125rem',
                                                    width: '1rem',
                                                    height: '1rem',
                                                    borderRadius: '9999px',
                                                    background: 'white',
                                                    transition: 'left 0.2s',
                                                    left: rule.enabled ? '1.375rem' : '0.125rem'
                                                }}
                                            />
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <NeuButton variant="secondary" onClick={() => { }}>
                                            Editar
                                        </NeuButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </NeuCard>

            {/* Test Notification */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: N.text, marginBottom: '1rem' }}>Probar Notificaciones</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select style={{
                        padding: '0.5rem 1rem',
                        background: N.base,
                        border: `1px solid ${N.dark}`,
                        borderRadius: '0.5rem',
                        color: N.text,
                        minWidth: '8rem'
                    }}>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="push">Push</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Destinatario de prueba"
                        style={{
                            flex: 1,
                            padding: '0.5rem 1rem',
                            background: N.base,
                            border: `1px solid ${N.dark}`,
                            borderRadius: '0.5rem',
                            color: N.text,
                            fontSize: '0.875rem'
                        }}
                    />
                    <NeuButton variant="primary" onClick={() => { }}>
                        Enviar Test
                    </NeuButton>
                </div>
            </NeuCard>
        </div>
    );
}
