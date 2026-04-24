/**
 * VIEW: DASHBOARD GERENCIAL - MÓDULO CUÑAS
 * 
 * Dashboard ejecutivo con vistas de alto nivel para gerencia:
 * - KPIs principales
 * - Tendencias temporales
 * - Distribución por segmento
 * - Eficiencia del equipo
 * - ROI y performance
 * - Reportes exportables
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NeumorphicCard, NeumorphicButton } from '../ui/NeumorphicComponents';

interface GerencialMetrics {
    kpis: {
        totalCunas: number;
        cunasActivas: number;
        tasaAprobacion: number;
        tiempoPromedioAprobacion: number;
        enviosExitosos: number;
        tasaEntrega: number;
    };
    tendencias: {
        mes: string;
        creadas: number;
        aprobadas: number;
        exportadas: number;
    }[];
    porSegmento: {
        segmento: string;
        cantidad: number;
        porcentaje: number;
    }[];
    topRendimiento: {
        usuario: string;
        cunasCreadas: number;
        tasaAprobacion: number;
    }[];
    recentActivity: {
        tipo: string;
        descripcion: string;
        tiempo: string;
    }[];
}

interface CunasGerencialDashboardProps {
    tenantId?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    onExport?: (formato: 'pdf' | 'excel' | 'csv') => void;
}

export const CunasGerencialDashboard: React.FC<CunasGerencialDashboardProps> = ({
    tenantId = 'default-tenant',
    fechaInicio,
    fechaFin,
    onExport,
}) => {
    const [metrics, setMetrics] = useState<GerencialMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'trimestre' | 'año'>('mes');

    // Cargar métricas
    useEffect(() => {
        const loadMetrics = async () => {
            setIsLoading(true);

            // Simular datos
            await new Promise(resolve => setTimeout(resolve, 800));

            setMetrics({
                kpis: {
                    totalCunas: 1247,
                    cunasActivas: 892,
                    tasaAprobacion: 94.2,
                    tiempoPromedioAprobacion: 4.5,
                    enviosExitosos: 3421,
                    tasaEntrega: 98.7,
                },
                tendencias: [
                    { mes: 'Ene', creadas: 120, aprobadas: 115, exportadas: 110 },
                    { mes: 'Feb', creadas: 135, aprobadas: 128, exportadas: 122 },
                    { mes: 'Mar', creadas: 142, aprobadas: 138, exportadas: 135 },
                    { mes: 'Abr', creadas: 158, aprobadas: 152, exportadas: 148 },
                    { mes: 'May', creadas: 165, aprobadas: 160, exportadas: 155 },
                    { mes: 'Jun', creadas: 172, aprobadas: 168, exportadas: 162 },
                ],
                porSegmento: [
                    { segmento: 'Retail', cantidad: 425, porcentaje: 34.1 },
                    { segmento: 'Automotriz', cantidad: 298, porcentaje: 23.9 },
                    { segmento: 'Tecnología', cantidad: 245, porcentaje: 19.6 },
                    { segmento: 'Alimentos', cantidad: 187, porcentaje: 15.0 },
                    { segmento: 'Otros', cantidad: 92, porcentaje: 7.4 },
                ],
                topRendimiento: [
                    { usuario: 'Carlos Mendoza', cunasCreadas: 145, tasaAprobacion: 98.2 },
                    { usuario: 'María Elena Soto', cunasCreadas: 132, tasaAprobacion: 96.5 },
                    { usuario: 'Juan Pérez', cunasCreadas: 118, tasaAprobacion: 94.8 },
                    { usuario: 'Ana López', cunasCreadas: 105, tasaAprobacion: 93.2 },
                    { usuario: 'Roberto Díaz', cunasCreadas: 98, tasaAprobacion: 91.5 },
                ],
                recentActivity: [
                    { tipo: 'export', descripcion: 'Cuña exportada a WideOrbit', tiempo: 'Hace 5 min' },
                    { tipo: 'approve', descripcion: 'Spot aprobado por supervisor', tiempo: 'Hace 12 min' },
                    { tipo: 'create', descripcion: 'Nueva cuña creada para McDonalds', tiempo: 'Hace 25 min' },
                    { tipo: 'send', descripcion: 'Email enviado a operadores', tiempo: 'Hace 1 hr' },
                    { tipo: 'create', descripcion: 'Mención creada para Nike', tiempo: 'Hace 2 hr' },
                ],
            });

            setIsLoading(false);
        };

        loadMetrics();
    }, [periodo]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">📊</div>
                    <div className="text-gray-500">Cargando dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        📊 Dashboard Gerencial
                    </h1>
                    <p className="text-sm text-gray-500">
                        Módulo Cuñas - Vista ejecutiva
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Selector de período */}
                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value as typeof periodo)}
                        className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                    >
                        <option value="semana">Esta semana</option>
                        <option value="mes">Este mes</option>
                        <option value="trimestre">Este trimestre</option>
                        <option value="año">Este año</option>
                    </select>

                    {/* Exportar */}
                    <div className="flex gap-2">
                        <NeumorphicButton variant="secondary" size="sm" onClick={() => onExport?.('pdf')}>
                            📄 PDF
                        </NeumorphicButton>
                        <NeumorphicButton variant="secondary" size="sm" onClick={() => onExport?.('excel')}>
                            📊 Excel
                        </NeumorphicButton>
                    </div>
                </div>
            </div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <NeumorphicCard padding="md" className="text-center">
                    <div className="text-3xl font-bold text-primary">{metrics?.kpis.totalCunas}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Cuñas</div>
                </NeumorphicCard>

                <NeumorphicCard padding="md" className="text-center">
                    <div className="text-3xl font-bold text-green-500">{metrics?.kpis.cunasActivas}</div>
                    <div className="text-xs text-gray-500 mt-1">Activas</div>
                </NeumorphicCard>

                <NeumorphicCard padding="md" className="text-center">
                    <div className="text-3xl font-bold text-blue-500">{metrics?.kpis.tasaAprobacion}%</div>
                    <div className="text-xs text-gray-500 mt-1">Tasa Aprobación</div>
                </NeumorphicCard>

                <NeumorphicCard padding="md" className="text-center">
                    <div className="text-3xl font-bold text-purple-500">{metrics?.kpis.tiempoPromedioAprobacion}h</div>
                    <div className="text-xs text-gray-500 mt-1">Tiempo Aprobación</div>
                </NeumorphicCard>

                <NeumorphicCard padding="md" className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{metrics?.kpis.enviosExitosos}</div>
                    <div className="text-xs text-gray-500 mt-1">Envíos Exitosos</div>
                </NeumorphicCard>

                <NeumorphicCard padding="md" className="text-center">
                    <div className="text-3xl font-bold text-cyan-500">{metrics?.kpis.tasaEntrega}%</div>
                    <div className="text-xs text-gray-500 mt-1">Tasa Entrega</div>
                </NeumorphicCard>
            </div>

            {/* Grids principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tendencias */}
                <NeumorphicCard padding="md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        📈 Tendencias
                    </h3>
                    <div className="space-y-3">
                        {metrics?.tendencias.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <span className="w-8 text-sm text-gray-500">{item.mes}</span>
                                <div className="flex-1 flex gap-2">
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 mb-1">Creadas</div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${(item.creadas / 200) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 mb-1">Aprobadas</div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full"
                                                style={{ width: `${(item.aprobadas / 200) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 mb-1">Exportadas</div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${(item.exportadas / 200) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16 text-right">
                                    {item.creadas}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <span className="text-xs text-gray-500">Creadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-xs text-gray-500">Aprobadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-xs text-gray-500">Exportadas</span>
                        </div>
                    </div>
                </NeumorphicCard>

                {/* Por Segmento */}
                <NeumorphicCard padding="md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        🎯 Distribución por Segmento
                    </h3>
                    <div className="space-y-3">
                        {metrics?.porSegmento.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {item.segmento}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {item.cantidad} ({item.porcentaje}%)
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx === 0 ? 'bg-primary' :
                                                    idx === 1 ? 'bg-blue-500' :
                                                        idx === 2 ? 'bg-green-500' :
                                                            idx === 3 ? 'bg-yellow-500' :
                                                                'bg-gray-400'
                                                }`}
                                            style={{ width: `${item.porcentaje}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </NeumorphicCard>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Rendimiento */}
                <NeumorphicCard padding="md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        🏆 Top Rendimiento del Equipo
                    </h3>
                    <div className="space-y-3">
                        {metrics?.topRendimiento.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                                        idx === 1 ? 'bg-gray-200 text-gray-600' :
                                            idx === 2 ? 'bg-orange-100 text-orange-600' :
                                                'bg-gray-100 text-gray-500'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800 dark:text-white">
                                        {item.usuario}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {item.cunasCreadas} cuñas creadas
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-500">
                                        {item.tasaAprobacion}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        aprobación
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </NeumorphicCard>

                {/* Actividad Reciente */}
                <NeumorphicCard padding="md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        🕐 Actividad Reciente
                    </h3>
                    <div className="space-y-3">
                        {metrics?.recentActivity.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <span className="text-lg">
                                    {item.tipo === 'create' ? '✨' :
                                        item.tipo === 'approve' ? '✅' :
                                            item.tipo === 'export' ? '🚀' :
                                                item.tipo === 'send' ? '📤' : '📌'}
                                </span>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-800 dark:text-white">
                                        {item.descripcion}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.tiempo}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </NeumorphicCard>
            </div>

            {/* Accesos Rápidos a Reportes */}
            <NeumorphicCard padding="md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    📊 Reportes Disponibles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: '📈', title: 'Reporte de Performance', desc: 'Análisis mensual' },
                        { icon: '🎯', title: 'Distribución por Segmento', desc: 'Retail, Auto, Tech' },
                        { icon: '👥', title: 'Rendimiento Equipo', desc: 'Top creators' },
                        { icon: '📅', title: 'Vencimientos', desc: 'Próximos a vencer' },
                        { icon: '🚀', title: 'Exportaciones', desc: 'Sistemas de emisión' },
                        { icon: '📧', title: 'Envíos', desc: 'Tracking de distribución' },
                        { icon: '⚠️', title: 'Alertas', desc: 'MaterialPendiente' },
                        { icon: '💰', title: 'ROI por Anunciante', desc: 'Inversión vs resultados' },
                    ].map((reporte, idx) => (
                        <button
                            key={idx}
                            className="p-4 text-left bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            <div className="text-2xl mb-2">{reporte.icon}</div>
                            <div className="font-medium text-gray-800 dark:text-white text-sm">
                                {reporte.title}
                            </div>
                            <div className="text-xs text-gray-500">
                                {reporte.desc}
                            </div>
                        </button>
                    ))}
                </div>
            </NeumorphicCard>
        </div>
    );
};

export default CunasGerencialDashboard;
