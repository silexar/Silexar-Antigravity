'use client';

import { Bell, CheckCircle, Music, RefreshCw } from 'lucide-react';
import { NeuromorphicCard } from './components';
import type { AlertaOperativa } from './types';

interface AlertaGrupo {
  titulo: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  alertas: AlertaOperativa[];
}

interface AlertasPanelProps {
  alertas: AlertaOperativa[];
  onResolve: (id: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function AlertasPanel({ alertas, onResolve, onRefresh, loading = false }: AlertasPanelProps) {
  const grupos: AlertaGrupo[] = [
    { titulo: 'VENCEN HOY', emoji: '⏰', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', alertas: alertas.filter(a => a.tipo === 'vencimientos') },
    { titulo: 'SIN VALIDAR', emoji: '⚠️', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', alertas: alertas.filter(a => a.tipo === 'validacion') },
    { titulo: 'PENDIENTES ENVÍO', emoji: '📤', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', alertas: alertas.filter(a => a.tipo === 'distribucion') },
    { titulo: 'EMISIÓN', emoji: '📻', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', alertas: alertas.filter(a => a.tipo === 'emision') },
  ].filter(g => g.alertas.length > 0);

  const totalCriticas = alertas.filter(a => a.prioridad === 'critica').length;

  return (
    <NeuromorphicCard className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">🚨 ALERTAS DE OPERACIÓN</h3>
            <p className="text-xs text-slate-500">{alertas.length} activas</p>
          </div>
        </div>
        {totalCriticas > 0 && (
          <span className="px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
            {totalCriticas} críticas
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {grupos.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Sin alertas pendientes</p>
            <p className="text-xs mt-1">¡Todo está bajo control!</p>
          </div>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.titulo} className={`rounded-xl border ${grupo.borderColor} ${grupo.bgColor} overflow-hidden`}>
              <div className={`px-3 py-2 font-semibold text-sm flex items-center justify-between ${grupo.color}`}>
                <span className="flex items-center gap-2">
                  <span>{grupo.emoji}</span>
                  <span>{grupo.titulo}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${grupo.bgColor} ${grupo.color} border ${grupo.borderColor}`}>
                  {grupo.alertas.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {grupo.alertas.map((alerta) => (
                  <div key={alerta.id} className="px-3 py-2 bg-white/70 hover:bg-white transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {alerta.prioridad === 'critica' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium text-slate-700 truncate">{alerta.mensaje}</p>
                        </div>
                        {alerta.cunaCodigo && (
                          <p className="text-xs text-slate-500 mt-0.5 font-mono flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            {alerta.cunaCodigo}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onResolve(alerta.id)}
                        className={`px-2 py-1 text-xs rounded-lg shadow-sm hover:shadow-md transition-all font-medium flex-shrink-0
                          ${alerta.prioridad === 'critica'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }
                        `}
                      >
                        {alerta.accion}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
        <a
          href="/cunas/alertas"
          className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
        >
          📋 Ver Todo
        </a>
      </div>
    </NeuromorphicCard>
  );
}
