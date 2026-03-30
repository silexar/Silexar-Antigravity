/**
 * 🔔 SILEXAR PULSE - Alerts Panel Component TIER 0
 * 
 * @description Panel de alertas inteligentes con notificaciones
 * en tiempo real y acciones rápidas.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Clock,
  ExternalLink,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  BellOff
} from 'lucide-react';
import { 
  SmartAlerts, 
  type AlertaContrato, 
  type TipoAlerta,
  getAlertaInfo 
} from '../nuevo/components/WizardContrato/services/SmartAlertsService';

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
  `,
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-gradient-to-br from-slate-50 to-slate-100
    text-slate-700 font-medium rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case 'urgente': return 'bg-red-100 text-red-700 ring-2 ring-red-300';
    case 'alta': return 'bg-orange-100 text-orange-700';
    case 'media': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
  return `Hace ${Math.floor(diffMins / 1440)}d`;
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AlertasPanel({
  maxAlertas = 10,
  minimal = false
}: {
  maxAlertas?: number;
  minimal?: boolean;
}) {
  const [alertas, setAlertas] = useState<AlertaContrato[]>(SmartAlerts.getAlertasActivas());
  const [filtroTipo, setFiltroTipo] = useState<TipoAlerta | 'TODOS'>('TODOS');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const resumen = SmartAlerts.getResumen();

  const alertasFiltradas = alertas
    .filter(a => filtroTipo === 'TODOS' || a.tipo === filtroTipo)
    .slice(0, maxAlertas);

  const handleResolver = (alertaId: string) => {
    SmartAlerts.resolver(alertaId);
    setAlertas(SmartAlerts.getAlertasActivas());
  };

  const handleIgnorar = (alertaId: string) => {
    SmartAlerts.ignorar(alertaId);
    setAlertas(SmartAlerts.getAlertasActivas());
  };

  if (minimal) {
    // Vista minimal para header/sidebar
    return (
      <div className="relative">
        <button className={`${neuro.btnSecondary} p-2 relative`}>
          <Bell className="w-5 h-5" />
          {resumen.urgentes > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {resumen.urgentes}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Alertas</h3>
              <p className="text-xs text-slate-500">
                {resumen.total} activas • {resumen.urgentes} urgentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro rápido */}
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoAlerta | 'TODOS')}
              className={`${neuro.btnSecondary} px-3 py-1.5 text-xs`}
            >
              <option value="TODOS">Todas</option>
              <option value="APROBACION_REQUERIDA">Aprobaciones</option>
              <option value="VENCIMIENTO_PROXIMO">Vencimientos</option>
              <option value="PAGO_VENCIDO">Pagos</option>
              <option value="OPORTUNIDAD">Oportunidades</option>
            </select>

            <button 
              onClick={() => setAlertas(SmartAlerts.getAlertasActivas())}
              className={`${neuro.btnSecondary} p-1.5`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <AnimatePresence>
          {alertasFiltradas.map((alerta, idx) => {
            const tipoInfo = getAlertaInfo(alerta.tipo);
            
            return (
              <motion.div
                key={alerta.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className={`${neuro.card} p-4 ${
                  alerta.prioridad === 'urgente' ? 'ring-2 ring-red-300' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icono tipo */}
                  <div className={`p-2 rounded-xl ${tipoInfo.color} text-lg`}>
                    {tipoInfo.emoji}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`${neuro.badge} ${getPrioridadColor(alerta.prioridad)}`}>
                        {alerta.prioridad}
                      </span>
                      <span className={`${neuro.badge} ${tipoInfo.color}`}>
                        {tipoInfo.label}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 mt-2">
                      {alerta.titulo}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {alerta.mensaje}
                    </p>

                    {alerta.numeroContrato && (
                      <p className="text-xs text-slate-400 mt-2">
                        {alerta.numeroContrato} • {alerta.clienteNombre}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alerta.fechaCreacion)}
                      </span>
                      {alerta.creadoPor === 'IA' && (
                        <span className="text-indigo-500">✨ Detectado por IA</span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    {alerta.urlAccion && (
                      <a
                        href={alerta.urlAccion}
                        className={`${neuro.btnPrimary} p-2`}
                        title={alerta.accionSugerida}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === alerta.id ? null : alerta.id)}
                        className={`${neuro.btnSecondary} p-2`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {showMenu === alerta.id && (
                        <div className={`absolute right-0 top-full mt-2 ${neuro.panel} p-2 z-10 min-w-40`}>
                          <button
                            onClick={() => handleResolver(alerta.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 text-green-600 rounded-lg flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Resolver
                          </button>
                          <button
                            onClick={() => handleIgnorar(alerta.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 rounded-lg flex items-center gap-2"
                          >
                            <BellOff className="w-4 h-4" />
                            Ignorar
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 rounded-lg flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Ver contrato
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {alertasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No hay alertas activas</p>
            <p className="text-xs text-slate-400 mt-1">
              ¡Todo está bajo control!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {alertas.length > maxAlertas && (
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-200/50 text-center">
          <a href="/contratos/alertas" className="text-sm text-indigo-600 hover:underline">
            Ver todas las alertas ({alertas.length})
          </a>
        </div>
      )}
    </div>
  );
}
