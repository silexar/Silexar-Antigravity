/**
 * Frontend Failover Panel
 * CEO Command Center Fortune 10 Tier 0
 * Migrated to AdminDesignSystem TIER_0
 * 
 * Multi-platform deployment monitoring and failover control.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { N, getShadow } from '@/components/admin/_sdk/AdminDesignSystem';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Zap,
    Globe,
    Server,
    Activity,
    Settings
} from 'lucide-react';

interface DeploymentHealth {
    id: string;
    name: string;
    platform: string;
    url: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    isPrimary: boolean;
    responseTime: number;
    lastCheck: Date;
}

interface FailoverStatus {
    currentState: 'normal' | 'failing_over' | 'in_failover' | 'failing_back';
    primaryDeployment: string;
    activeDeployment: string;
    deployments: DeploymentHealth[];
    lastFailover: {
        timestamp: Date;
        from: string;
        to: string;
        reason: string;
        success: boolean;
    } | null;
    metrics: {
        totalFailovers: number;
        successfulFailovers: number;
        averageFailoverTime: number;
        uptimePercentage: number;
    };
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    vercel: <Server style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />,
    netlify: <Globe style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />,
    cloudflare_pages: <Zap style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
};

const STATUS_COLORS = {
    healthy: N.success,
    degraded: N.warning,
    unhealthy: N.danger,
    unknown: N.textSub
};

const STATE_COLORS = {
    normal: N.success,
    failing_over: N.warning,
    in_failover: '#f97316',
    failing_back: N.accent
};

export function FrontendFailoverPanel() {
    const [status, setStatus] = useState<FailoverStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [performingAction, setPerformingAction] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [configData, setConfigData] = useState<Record<string, string>>({
        vercelToken: '',
        netlifyToken: '',
        cloudflareToken: '',
        cloudflareAccountId: '',
        cloudflareZoneId: ''
    });
    const [configSaved, setConfigSaved] = useState(false);

    // Fetch failover status
    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/frontend-failover/status');
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error('Failed to fetch failover status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    // Perform manual failover
    const handleFailover = async (targetId: string) => {
        setPerformingAction(true);
        setSelectedTarget(targetId);
        try {
            const response = await fetch('/api/frontend-failover/failover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId })
            });
            if (response.ok) {
                await fetchStatus();
            }
        } catch (error) {
            console.error('Failover failed:', error);
        } finally {
            setPerformingAction(false);
            setSelectedTarget(null);
        }
    };

    // Perform manual failback
    const handleFailback = async () => {
        setPerformingAction(true);
        try {
            const response = await fetch('/api/frontend-failover/failback', {
                method: 'POST'
            });
            if (response.ok) {
                await fetchStatus();
            }
        } catch (error) {
            console.error('Failback failed:', error);
        } finally {
            setPerformingAction(false);
        }
    };

    // Trigger health check
    const handleHealthCheck = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/frontend-failover/health-check', {
                method: 'POST'
            });
            if (response.ok) {
                await fetchStatus();
            }
        } catch (error) {
            console.error('Health check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Save configuration
    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/frontend-failover/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update-config',
                    config: {
                        vercel: { token: configData.vercelToken },
                        netlify: { accessToken: configData.netlifyToken },
                        cloudflare: {
                            apiToken: configData.cloudflareToken,
                            accountId: configData.cloudflareAccountId,
                            zoneId: configData.cloudflareZoneId
                        }
                    }
                })
            });
            if (response.ok) {
                setConfigSaved(true);
                setTimeout(() => setConfigSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load configuration
    const loadConfig = useCallback(async () => {
        try {
            const response = await fetch('/api/frontend-failover/config');
            if (response.ok) {
                const data = await response.json();
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    if (loading && !status) {
        return (
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
                    <RefreshCw style={{ width: '2rem', height: '2rem', color: N.accent, animation: 'spin 1s linear infinite' }} />
                </div>
            </NeuCard>
        );
    }

    const getStatusBadge = (deployment: DeploymentHealth) => {
        const color = STATUS_COLORS[deployment.status];
        return (
            <div style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                background: `${color}20`,
                color: color
            }}>
                {deployment.status.toUpperCase()}
            </div>
        );
    };

    const getStateBannerColor = (state: FailoverStatus['currentState']) => {
        switch (state) {
            case 'normal': return N.success;
            case 'in_failover': return '#f97316';
            default: return N.warning;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `linear-gradient(135deg, #6366f1, #8b5cf6)` }}>
                        <Shield style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>Frontend Failover</h2>
                        <p style={{ fontSize: '0.875rem', color: N.textSub }}>Multi-platform deployment monitoring</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <NeuButton variant="secondary" onClick={() => setShowConfig(!showConfig)}>
                        <Settings style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        Config
                    </NeuButton>
                    <NeuButton variant="secondary" onClick={handleHealthCheck} disabled={loading}>
                        <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        Health Check
                    </NeuButton>
                </div>
            </div>

            {/* State Banner */}
            {status && (
                <NeuCard style={{
                    boxShadow: getShadow(),
                    padding: '1rem',
                    background: N.base,
                    borderLeft: `4px solid ${getStateBannerColor(status.currentState)}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {status.currentState === 'normal' ? (
                                <CheckCircle style={{ width: '2rem', height: '2rem', color: N.success }} />
                            ) : (
                                <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#f97316' }} />
                            )}
                            <div>
                                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: STATE_COLORS[status.currentState] }}>
                                    {status.currentState === 'normal' ? 'All Systems Operational' :
                                        status.currentState === 'in_failover' ? 'FAILOVER ACTIVE' :
                                            'Transitioning...'}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>
                                    Active: {status.deployments.find(d => d.id === status.activeDeployment)?.name || 'Unknown'}
                                </p>
                            </div>
                        </div>
                        {status.currentState !== 'normal' && (
                            <NeuButton variant="primary" onClick={handleFailback} disabled={performingAction}>
                                {performingAction ? 'Restoring...' : 'Initiate Failback'}
                            </NeuButton>
                        )}
                    </div>
                </NeuCard>
            )}

            {/* Configuration Panel */}
            {showConfig && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings style={{ width: '1.25rem', height: '1.25rem' }} />
                        API Configuration
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1rem' }}>
                        Ingresa las API keys y tokens de cada plataforma para activar el failover.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* Vercel Config */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontWeight: '500', color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Server style={{ width: '1rem', height: '1rem' }} />
                                Vercel (Primary)
                            </h4>
                            <input
                                type="password"
                                placeholder="Vercel Token"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    background: N.base,
                                    color: N.text,
                                    fontSize: '0.875rem'
                                }}
                                value={configData.vercelToken}
                                onChange={(e) => setConfigData({ ...configData, vercelToken: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Team ID"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    background: N.base,
                                    color: N.text,
                                    fontSize: '0.875rem'
                                }}
                                value={configData.vercelToken ? '***' : ''}
                                readOnly
                            />
                        </div>

                        {/* Netlify Config */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontWeight: '500', color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Globe style={{ width: '1rem', height: '1rem' }} />
                                Netlify (Failover 1)
                            </h4>
                            <input
                                type="password"
                                placeholder="Netlify Access Token"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    background: N.base,
                                    color: N.text,
                                    fontSize: '0.875rem'
                                }}
                                value={configData.netlifyToken}
                                onChange={(e) => setConfigData({ ...configData, netlifyToken: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Site ID"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    background: N.base,
                                    color: N.text,
                                    fontSize: '0.875rem'
                                }}
                                value={configData.netlifyToken ? '***' : ''}
                                readOnly
                            />
                        </div>

                        {/* Cloudflare Config */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontWeight: '500', color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap style={{ width: '1rem', height: '1rem' }} />
                                Cloudflare (DNS + Pages)
                            </h4>
                            <input
                                type="password"
                                placeholder="Cloudflare API Token"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    background: N.base,
                                    color: N.text,
                                    fontSize: '0.875rem'
                                }}
                                value={configData.cloudflareToken}
                                onChange={(e) => setConfigData({ ...configData, cloudflareToken: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Account ID"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    background: N.base,
                                    color: N.text,
                                    fontSize: '0.875rem'
                                }}
                                value={configData.cloudflareAccountId}
                                onChange={(e) => setConfigData({ ...configData, cloudflareAccountId: e.target.value })}
                            />
                        </div>

                        {/* DNS Config */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontWeight: '500', color: N.text }}>DNS Failover</h4>
                            <input
                                type="text"
                                placeholder="Domain (e.g., silexar.cl)"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    background: N.base,
                                    color: N.text,
                                    fontSize: '0.875rem'
                                }}
                                defaultValue="silexar.cl"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <NeuButton variant="primary" onClick={handleSaveConfig}>
                            {configSaved ? (
                                <>
                                    <CheckCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                    Saved!
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                        </NeuButton>
                        <p style={{ fontSize: '0.75rem', color: N.textSub }}>
                            Los cambios se guardan en memoria. Para producción, configura las variables de entorno.
                        </p>
                    </div>
                </NeuCard>
            )}

            {/* Metrics Grid */}
            {status && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Activity style={{ width: '2rem', height: '2rem', color: N.accent }} />
                            <div>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{status.metrics.uptimePercentage.toFixed(2)}%</p>
                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Uptime</p>
                            </div>
                        </div>
                    </NeuCard>
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <RefreshCw style={{ width: '2rem', height: '2rem', color: '#a855f7' }} />
                            <div>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{status.metrics.totalFailovers}</p>
                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Total Failovers</p>
                            </div>
                        </div>
                    </NeuCard>
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle style={{ width: '2rem', height: '2rem', color: N.success }} />
                            <div>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{status.metrics.successfulFailovers}</p>
                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Successful</p>
                            </div>
                        </div>
                    </NeuCard>
                    <NeuCard style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Zap style={{ width: '2rem', height: '2rem', color: '#f97316' }} />
                            <div>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{status.metrics.averageFailoverTime.toFixed(0)}ms</p>
                                <p style={{ fontSize: '0.75rem', color: N.textSub }}>Avg. Failover Time</p>
                            </div>
                        </div>
                    </NeuCard>
                </div>
            )}

            {/* Deployments */}
            {status && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {status.deployments.map((deployment) => (
                        <NeuCard
                            key={deployment.id}
                            style={{
                                boxShadow: getShadow(),
                                padding: '1.5rem',
                                background: N.base,
                                border: deployment.id === status.activeDeployment ? `2px solid ${N.accent}` : `1px solid ${N.dark}`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        background: deployment.platform === 'vercel' ? '#000' :
                                            deployment.platform === 'netlify' ? '#0e7f5e' :
                                                '#f97316'
                                    }}>
                                        {PLATFORM_ICONS[deployment.platform]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: '600', color: N.text }}>{deployment.name}</h3>
                                        <p style={{ fontSize: '0.75rem', color: N.textSub }}>{deployment.url}</p>
                                    </div>
                                </div>
                                {deployment.isPrimary && (
                                    <StatusBadge status="info" label="PRIMARY" />
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>Status</span>
                                    {getStatusBadge(deployment)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>Response Time</span>
                                    <span style={{
                                        fontWeight: '500',
                                        color: deployment.responseTime < 200 ? N.success :
                                            deployment.responseTime < 500 ? N.warning : N.danger
                                    }}>
                                        {deployment.responseTime}ms
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.textSub }}>Last Check</span>
                                    <span style={{ fontSize: '0.875rem', color: N.text }}>
                                        {new Date(deployment.lastCheck).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${N.dark}` }}>
                                {deployment.id !== status.activeDeployment && (
                                    <div style={{ width: '100%' }}>
                                        <NeuButton
                                            variant="secondary"
                                            onClick={() => handleFailover(deployment.id)}
                                            disabled={performingAction || status.currentState !== 'normal'}
                                        >
                                            {performingAction && selectedTarget === deployment.id ? (
                                                <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <Zap style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                            )}
                                            {status.currentState !== 'normal' ? 'Wait for Normal' : 'Failover Here'}
                                        </NeuButton>
                                    </div>
                                )}
                                {deployment.id === status.activeDeployment && status.currentState === 'normal' && !deployment.isPrimary && (
                                    <div style={{ width: '100%' }}>
                                        <NeuButton
                                            variant="primary"
                                            onClick={handleFailback}
                                            disabled={performingAction}
                                        >
                                            Return to Primary
                                        </NeuButton>
                                    </div>
                                )}
                            </div>
                        </NeuCard>
                    ))}
                </div>
            )}

            {/* Last Failover Event */}
            {status?.lastFailover && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <XCircle style={{ width: '1.25rem', height: '1.25rem', color: N.textSub }} />
                        Last Failover Event
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Timestamp</p>
                            <p style={{ fontWeight: '500', color: N.text }}>{new Date(status.lastFailover.timestamp).toLocaleString()}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>From</p>
                            <p style={{ fontWeight: '500', color: N.text }}>{status.lastFailover.from}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>To</p>
                            <p style={{ fontWeight: '500', color: N.text }}>{status.lastFailover.to}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>Status</p>
                            <p style={{ fontWeight: '500', color: status.lastFailover.success ? N.success : N.danger }}>
                                {status.lastFailover.success ? 'Successful' : 'Failed'}
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${N.dark}` }}>
                        <p style={{ fontSize: '0.75rem', color: N.textSub }}>Reason</p>
                        <p style={{ fontSize: '0.875rem', color: N.text }}>{status.lastFailover.reason}</p>
                    </div>
                </NeuCard>
            )}

            {/* DNS Configuration */}
            <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                <h3 style={{ fontWeight: '600', color: N.text, marginBottom: '1rem' }}>DNS Configuration</h3>
                <div style={{ padding: '1rem', background: `${N.dark}50`, borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    <p><span style={{ color: N.textSub }}>CNAME:</span> app.silexar.com → {status?.deployments.find(d => d.id === status?.activeDeployment)?.url || 'loading...'}</p>
                    <p><span style={{ color: N.textSub }}>Provider:</span> Cloudflare</p>
                    <p><span style={{ color: N.textSub }}>Health Check:</span> Every 30 seconds</p>
                    <p><span style={{ color: N.textSub }}>Failover Threshold:</span> 3 consecutive failures</p>
                </div>
            </NeuCard>
        </div>
    );
}
