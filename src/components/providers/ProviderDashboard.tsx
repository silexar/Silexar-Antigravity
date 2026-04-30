/**
 * Provider Management Components
 * Silexar Pulse - CEO Command Center
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ProviderStatus, type ProviderHealth } from '@/lib/providers/interfaces/base-provider';
import { PROVIDER_TYPES, type ProviderType } from '@/lib/providers/interfaces';

interface ProviderInstance {
    id: string;
    type: ProviderType;
    name: string;
    status: ProviderStatus;
    isPrimary: boolean;
    lastHealthCheck: Date | null;
}

interface ProviderHealthInfo {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs: number;
    error?: string;
}

interface ProviderMetricsInfo {
    requestsTotal: number;
    requestsSuccess: number;
    requestsFailed: number;
    avgLatencyMs: number;
    quotaUsed: number;
    quotaLimit: number;
}

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
    const statusConfig: Record<string, { color: string; text: string }> = {
        [ProviderStatus.ACTIVE]: { color: 'bg-green-500', text: 'Activo' },
        [ProviderStatus.INACTIVE]: { color: 'bg-gray-500', text: 'Inactivo' },
        [ProviderStatus.DEGRADED]: { color: 'bg-yellow-500', text: 'Degradado' },
        [ProviderStatus.UNAVAILABLE]: { color: 'bg-red-500', text: 'No disponible' },
    };

    const config = statusConfig[status] || statusConfig[ProviderStatus.INACTIVE];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} text-white`}>
            {config.text}
        </span>
    );
}

export function HealthIndicator({ health }: { health: ProviderHealthInfo | null }) {
    if (!health) return <span className="text-gray-400">Sin datos</span>;

    const statusIcon = {
        healthy: (
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        degraded: (
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ),
        unhealthy: (
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        ),
    };

    return (
        <div className="flex items-center gap-2">
            {statusIcon[health.status]}
            <span className="text-sm">{health.latencyMs}ms</span>
            {health.error && <span className="text-xs text-red-500">({health.error})</span>}
        </div>
    );
}

export function ProviderCard({
    provider,
    health,
    metrics,
    onHealthCheck,
    onSetPrimary,
    onRemove
}: {
    provider: ProviderInstance;
    health: ProviderHealthInfo | null;
    metrics: ProviderMetricsInfo | null;
    onHealthCheck: () => void;
    onSetPrimary: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    {provider.isPrimary && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            PRIMARY
                        </span>
                    )}
                </div>
                <ProviderStatusBadge status={provider.status} />
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="text-gray-900">{provider.type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">ID:</span>
                    <span className="text-gray-900 font-mono text-xs">{provider.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Salud:</span>
                    <HealthIndicator health={health} />
                </div>
                {metrics && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Requests:</span>
                            <span className="text-gray-900">{metrics.requestsSuccess}/{metrics.requestsTotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Latencia avg:</span>
                            <span className="text-gray-900">{metrics.avgLatencyMs}ms</span>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={onHealthCheck}
                    className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                >
                    Verificar
                </button>
                {!provider.isPrimary && (
                    <button
                        onClick={onSetPrimary}
                        className="flex-1 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                    >
                        Hacer Primary
                    </button>
                )}
                <button
                    onClick={onRemove}
                    className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}

export function AddProviderModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (providerClass: string, config: Record<string, string>) => void;
}) {
    const [selectedClass, setSelectedClass] = useState<string>('openai_whisper');
    const [config, setConfig] = useState<Record<string, string>>({});

    const providerTypes: Array<{ providerClass: string; name: string; fields: string[] }> = [
        { providerClass: 'openai_whisper', name: 'OpenAI Whisper', fields: ['apiKey', 'endpoint'] },
        { providerClass: 'supabase_db', name: 'Supabase PostgreSQL', fields: ['apiKey', 'endpoint'] },
        { providerClass: 'cloudflare_r2', name: 'Cloudflare R2', fields: ['apiKey', 'accountId', 'bucketName'] },
        { providerClass: 'smtp_email', name: 'Resend Email', fields: ['apiKey', 'fromEmail'] },
        { providerClass: 'sms_twilio', name: 'Twilio SMS', fields: ['apiKey', 'accountSid', 'fromNumber'] },
        { providerClass: 'cache_redis', name: 'Redis Cache', fields: ['endpoint'] },
    ];

    const selectedProvider = providerTypes.find(p => p.providerClass === selectedClass);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(selectedClass, config);
        setConfig({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Agregar Proveedor</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Proveedor
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setConfig({});
                            }}
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            {providerTypes.map(p => (
                                <option key={p.providerClass} value={p.providerClass}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedProvider?.fields.map(field => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field}
                            </label>
                            <input
                                type="text"
                                value={config[field] || ''}
                                onChange={(e) => setConfig({ ...config, [field]: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder={`Enter ${field}`}
                            />
                        </div>
                    ))}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                            Agregar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function ProviderDashboard() {
    const [providers, setProviders] = useState<ProviderInstance[]>([]);
    const [healthData, setHealthData] = useState<Record<string, ProviderHealthInfo>>({});
    const [metricsData, setMetricsData] = useState<Record<string, ProviderMetricsInfo>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        try {
            const response = await fetch('/api/providers');
            const data = await response.json();
            setProviders(data.instances || []);
        } catch (error) {
            console.error('Failed to load providers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHealthCheck = async (id: string) => {
        try {
            const response = await fetch(`/api/providers/${id}?action=healthcheck`, { method: 'PATCH' });
            const result = await response.json();
            setHealthData({ ...healthData, [id]: result });
        } catch (error) {
            console.error('Health check failed:', error);
        }
    };

    const handleSetPrimary = async (id: string) => {
        try {
            await fetch(`/api/providers/${id}?action=setPrimary`, { method: 'PATCH' });
            loadProviders();
        } catch (error) {
            console.error('Failed to set primary:', error);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este proveedor?')) return;

        try {
            await fetch(`/api/providers/${id}`, { method: 'DELETE' });
            loadProviders();
        } catch (error) {
            console.error('Failed to remove provider:', error);
        }
    };

    const handleAddProvider = async (providerClass: string, config: Record<string, string>) => {
        try {
            // providerClass is something like 'openai_whisper', 'supabase_db', etc.
            // We need to derive the ProviderType from it or just use 'speech' as default
            const type = PROVIDER_TYPES.SPEECH; // Default type, API handles the mapping
            await fetch('/api/providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    config: {
                        providerClass,
                        isPrimary: false,
                        config,
                    },
                }),
            });
            loadProviders();
        } catch (error) {
            console.error('Failed to add provider:', error);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Cargando...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h2>
                    <p className="text-gray-500">Configure y monitoree todos los servicios externos</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar Proveedor
                </button>
            </div>

            {providers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">No hay proveedores configurados</h3>
                    <p className="text-gray-500">Comience agregando su primer proveedor de servicios</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {providers.map(provider => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            health={healthData[provider.id]}
                            metrics={metricsData[provider.id]}
                            onHealthCheck={() => handleHealthCheck(provider.id)}
                            onSetPrimary={() => handleSetPrimary(provider.id)}
                            onRemove={() => handleRemove(provider.id)}
                        />
                    ))}
                </div>
            )}

            <AddProviderModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddProvider}
            />
        </div>
    );
}