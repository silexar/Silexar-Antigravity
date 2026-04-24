/**
 * VIEW: DASHBOARD OPERATIVO - MÓDULO CUÑAS
 * 
 * Dashboard completo con métricas operativas en tiempo real:
 * - Resumen de cuñas (total, activas, en aire, pendientes)
 * - Distribución por tipo y estado
 * - Alertas de vencimiento
 * - Accesos rápidos
 * - Actividad reciente
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NeumorphicCard, NeumorphicButton } from '../ui/NeumorphicComponents';

interface DashboardMetrics {
  resumen: {
    total: number;
    activas: number;
    enAire: number;
    pendientesAprobacion: number;
    vencenEstaSemana: number;
    vencenEsteMes: number;
  };
  porTipo: Array<{ tipo: string; cantidad: number }>;
  porEstado: Array<{ estado: string; cantidad: number }>;
  ultimasCreadas: Array<{
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    estado: string;
    fechaCreacion: string;
  }>;
  topAnunciantes: Array<{
    id: string;
    nombre: string;
    cantidadCunas: number;
  }>;
  alertasActivas: {
    vencenHoy: number;
    vencenManana: number;
    requiereAtencion: number;
  };
}

interface CunasDashboardViewProps {
  tenantId?: string;
  onNavigateToCuna?: (cunaId: string) => void;
  onCreateNew?: () => void;
}

export const CunasDashboardView: React.FC<CunasDashboardViewProps> = ({
  tenantId = 'default-tenant',
  onNavigateToCuna,
  onCreateNew,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Cargar métricas
  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cunas/metricas?tenantId=${tenantId}`);
      if (!response.ok) throw new Error('Error cargando métricas');

      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Cargar al montar y cada 30 segundos
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [loadMetrics]);

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener color de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'en_aire': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'pendiente_aprobacion': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rechazada': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'pausada': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Formatear estado
  const formatEstado = (estado: string) => {
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Formatear tipo
  const formatTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
      spot: '🎵 Spot',
      mencion: '🎤 Mención',
      presentacion: '📋 Presentación',
      cierre: '🎬 Cierre',
      promo_ida: '📢 Promo IDA',
    };
    return tipos[tipo] || tipo;
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <div className="text-gray-500">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <NeumorphicCard padding="lg" className="w-full">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <NeumorphicButton variant="primary" onClick={loadMetrics}>
            🔄 Reintentar
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            📻 Dashboard de Cuñas
          </h1>
          <p className="text-sm text-gray-500">
            Panel operativo en tiempo real
            {lastUpdate && (
              <span className="ml-2">
                • Actualizado hace {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <NeumorphicButton variant="secondary" size="sm" onClick={loadMetrics}>
            🔄
          </NeumorphicButton>
          <NeumorphicButton variant="primary" onClick={onCreateNew}>
            ➕ Nueva Cuña
          </NeumorphicButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <NeumorphicCard padding="md" className="text-center">
          <div className="text-3xl font-bold text-primary">{metrics?.resumen.total || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </NeumorphicCard>

        <NeumorphicCard padding="md" className="text-center">
          <div className="text-3xl font-bold text-green-500">{metrics?.resumen.activas || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Activas</div>
        </NeumorphicCard>

        <NeumorphicCard padding="md" className="text-center">
          <div className="text-3xl font-bold text-blue-500">{metrics?.resumen.enAire || 0}</div>
          <div className="text-xs text-gray-500 mt-1">En Aire</div>
        </NeumorphicCard>

        <NeumorphicCard padding="md" className="text-center">
          <div className="text-3xl font-bold text-yellow-500">{metrics?.resumen.pendientesAprobacion || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Pendientes</div>
        </NeumorphicCard>

        <NeumorphicCard padding="md" className="text-center">
          <div className="text-3xl font-bold text-orange-500">{metrics?.resumen.vencenEstaSemana || 0}</div>
          <div className="text-xs text-gray-500 mt-1">x Vencer (7d)</div>
        </NeumorphicCard>

        <NeumorphicCard padding="md" className="text-center">
          <div className="text-3xl font-bold text-red-500">{metrics?.resumen.vencenEsteMes || 0}</div>
          <div className="text-xs text-gray-500 mt-1">x Vencer (30d)</div>
        </NeumorphicCard>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas */}
        <NeumorphicCard padding="md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            🚨 Alertas Activas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ⚠️ Vencen Hoy
              </span>
              <span className="text-xl font-bold text-red-500">
                {metrics?.alertasActivas.vencenHoy || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                📅 Vencen Mañana
              </span>
              <span className="text-xl font-bold text-orange-500">
                {metrics?.alertasActivas.vencenManana || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ⏳ Requiere Atención
              </span>
              <span className="text-xl font-bold text-yellow-500">
                {metrics?.alertasActivas.requiereAtencion || 0}
              </span>
            </div>
          </div>
        </NeumorphicCard>

        {/* Por Tipo */}
        <NeumorphicCard padding="md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            📊 Distribución por Tipo
          </h3>
          <div className="space-y-2">
            {metrics?.porTipo.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTipo(item.tipo)}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.cantidad / (metrics?.resumen.total || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                    {item.cantidad}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </NeumorphicCard>

        {/* Por Estado */}
        <NeumorphicCard padding="md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            📈 Distribución por Estado
          </h3>
          <div className="space-y-2">
            {metrics?.porEstado.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs ${getEstadoColor(item.estado)}`}>
                  {formatEstado(item.estado)}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.cantidad / (metrics?.resumen.total || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                    {item.cantidad}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Creadas */}
        <NeumorphicCard padding="md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            🕐 Últimas Cuñas Creadas
          </h3>
          <div className="space-y-3">
            {metrics?.ultimasCreadas.slice(0, 5).map((cuna, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => onNavigateToCuna?.(cuna.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    🎵
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      {cuna.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cuna.codigo} • {formatTipo(cuna.tipo)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-xs ${getEstadoColor(cuna.estado)}`}>
                    {formatEstado(cuna.estado)}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(cuna.fechaCreacion)}
                  </div>
                </div>
              </div>
            ))}
            {(!metrics?.ultimasCreadas || metrics.ultimasCreadas.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No hay cuñas creadas recientemente
              </div>
            )}
          </div>
        </NeumorphicCard>

        {/* Top Anunciantes */}
        <NeumorphicCard padding="md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            🏢 Top Anunciantes
          </h3>
          <div className="space-y-3">
            {metrics?.topAnunciantes.map((anunciante, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                      idx === 1 ? 'bg-gray-200 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-500'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {anunciante.nombre}
                  </div>
                </div>
                <div className="text-lg font-bold text-primary">
                  {anunciante.cantidadCunas}
                </div>
              </div>
            ))}
            {(!metrics?.topAnunciantes || metrics.topAnunciantes.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No hay datos de anunciantes
              </div>
            )}
          </div>
        </NeumorphicCard>
      </div>

      {/* Quick Actions */}
      <NeumorphicCard padding="md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          ⚡ Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NeumorphicButton variant="secondary" onClick={onCreateNew} className="h-20 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">➕</span>
            <span className="text-xs">Nueva Cuña</span>
          </NeumorphicButton>
          <NeumorphicButton variant="secondary" onClick={() => { }} className="h-20 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">📤</span>
            <span className="text-xs">Exportar</span>
          </NeumorphicButton>
          <NeumorphicButton variant="secondary" onClick={() => { }} className="h-20 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">📧</span>
            <span className="text-xs">Distribuir</span>
          </NeumorphicButton>
          <NeumorphicButton variant="secondary" onClick={() => { }} className="h-20 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">📊</span>
            <span className="text-xs">Reportes</span>
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default CunasDashboardView;
