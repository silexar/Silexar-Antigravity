/**
 * Alerts Dashboard Component
 * Silexar Pulse - CEO Command Center
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getAlertManager, type Alert, type AlertSeverity } from '@/lib/monitoring/alert-manager';

interface AlertsDashboardProps {
    onAcknowledge?: (alertId: string) => void;
}

export function AlertsDashboard({ onAcknowledge }: AlertsDashboardProps) {
    const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
    const [history, setHistory] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showConfig, setShowConfig] = useState(false);

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadAlerts = async () => {
        try {
            const alertMgr = getAlertManager();
            const allAlerts = alertMgr.getAlerts({ limit: 100 });

            setActiveAlerts(allAlerts.filter(a => !a.acknowledgedBy));
            setHistory(allAlerts.filter(a => a.acknowledgedBy));
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcknowledge = async (alertId: string) => {
        try {
            await fetch(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
            const alertMgr = getAlertManager();
            await alertMgr.acknowledgeAlert(alertId, 'user');
            setActiveAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, acknowledgedBy: 'user' } : a
            ));
            onAcknowledge?.(alertId);
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    };

    const filteredAlerts = filter === 'all'
        ? activeAlerts
        : activeAlerts.filter(a => a.severity === filter);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Alertas Activas</h2>
                <div className="flex items-center gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as AlertSeverity | 'all')}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="all">Todas</option>
                        <option value="critical">Críticas</option>
                        <option value="high">Altas</option>
                        <option value="medium">Medias</option>
                        <option value="low">Bajas</option>
                        <option value="info">Info</option>
                    </select>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                        {showConfig ? 'Ocultar' : 'Configurar'} Reglas
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-red-600 text-sm">Críticas</p>
                    <p className="text-2xl font-bold text-red-700">
                        {activeAlerts.filter(a => a.severity === 'critical').length}
                    </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-orange-600 text-sm">Altas</p>
                    <p className="text-2xl font-bold text-orange-700">
                        {activeAlerts.filter(a => a.severity === 'high').length}
                    </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-yellow-600 text-sm">Medias</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {activeAlerts.filter(a => a.severity === 'medium').length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-600 text-sm">Resueltas</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {history.length}
                    </p>
                </div>
            </div>

            {/* Alert List */}
            <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No hay alertas activas
                    </div>
                ) : (
                    filteredAlerts.map(alert => (
                        <AlertItem
                            key={alert.id}
                            alert={alert}
                            onAcknowledge={() => handleAcknowledge(alert.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function AlertItem({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: () => void }) {
    const severityConfig = {
        critical: { icon: '🔥', bg: 'bg-red-50', border: 'border-red-500' },
        high: { icon: '⚠️', bg: 'bg-orange-50', border: 'border-orange-500' },
        medium: { icon: '⚡', bg: 'bg-yellow-50', border: 'border-yellow-500' },
        low: { icon: 'ℹ️', bg: 'bg-green-50', border: 'border-green-500' },
        info: { icon: '📢', bg: 'bg-blue-50', border: 'border-blue-500' },
    };

    const config = severityConfig[alert.severity] || severityConfig.info;

    return (
        <div className={`${config.bg} border-l-4 ${config.border} rounded-lg p-4`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Fuente: {alert.source}</span>
                            <span>{alert.createdAt.toLocaleString()}</span>
                        </div>
                        {alert.acknowledgedBy && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                Confirmada por {alert.acknowledgedBy}
                            </span>
                        )}
                    </div>
                </div>
                {!alert.acknowledgedBy && (
                    <button
                        onClick={onAcknowledge}
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-sm"
                    >
                        Confirmar
                    </button>
                )}
            </div>
        </div>
    );
}