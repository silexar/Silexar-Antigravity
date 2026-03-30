/**
 * 📅 SILEXAR PULSE - Panel de Vigencia Enterprise TIER 0
 * 
 * Panel completo para configuración de vigencia con:
 * - Fecha/hora de inicio y fin
 * - Cálculo automático de días restantes
 * - Configuración de alertas automáticas
 * - Análisis inteligente de duración
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, Bell, AlertTriangle, CheckCircle, 
  Info, RefreshCw, User, Users, Briefcase
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AlertConfig {
  diasAntes7: boolean;
  diasAntes1: boolean;
  alertarEjecutivo: boolean;
  alertarOperador: boolean;
  alertarComercial: boolean;
}

interface DurationAnalysis {
  diasRestantes: number;
  diasRestantesFormateado: string;
  duracionTipica: number;
  recomendacion: string;
  estado: 'ok' | 'corta' | 'larga';
  analisis?: {
    recomendacion?: string;
    duracionTipica?: number;
  };
  alertasRecomendadas?: {
    diasAntes7?: boolean;
    diasAntes1?: boolean;
  };
}

interface VigenciaPanelProps {
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  tipoCuna: string;
  alertConfig: AlertConfig;
  onChange: (field: string, value: string | AlertConfig) => void;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const VigenciaPanel: React.FC<VigenciaPanelProps> = ({
  fechaInicio,
  horaInicio,
  fechaFin,
  horaFin,
  tipoCuna,
  alertConfig,
  onChange,
  disabled = false
}) => {
  const [analysis, setAnalysis] = useState<DurationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Análisis de duración al cambiar fecha fin
  const analyzeValidity = useCallback(async () => {
    if (!fechaFin) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cunas/alerts?fechaFin=${encodeURIComponent(fechaFin)}&tipoCuna=${encodeURIComponent(tipoCuna)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (error) {
      /* console.error('Error analyzing validity:', error) */;
    } finally {
      setLoading(false);
    }
  }, [fechaFin, tipoCuna]);

  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeValidity();
    }, 500);
    return () => clearTimeout(timer);
  }, [analyzeValidity]);

  // Handlers
  const handleAlertChange = (key: keyof AlertConfig) => {
    onChange('alertConfig', {
      ...alertConfig,
      [key]: !alertConfig[key]
    });
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    onChange('fechaInicioVigencia', today);
    onChange('horaInicioVigencia', now);
  };

  const setEndOfDay = () => {
    onChange('horaFinVigencia', '23:59');
  };

  // Cálculo de días restantes local
  const calcularDiasRestantes = (): number => {
    if (!fechaFin) return 0;
    const end = new Date(fechaFin);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const diasRestantes = calcularDiasRestantes();

  return (
    <div className="space-y-6">
      {/* Header con título */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Vigencia y Programación
          </h3>
          <p className="text-sm text-slate-500">
            Configure las fechas de activación y alertas automáticas
          </p>
        </div>
      </div>

      {/* Sección de Fechas */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fecha Inicio */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Fecha y Hora de Inicio
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => onChange('fechaInicioVigencia', e.target.value)}
                  disabled={disabled}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white 
                    focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                    disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <div className="relative w-28">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => onChange('horaInicioVigencia', e.target.value)}
                  disabled={disabled}
                  className="w-full pl-10 pr-2 py-2.5 rounded-lg border border-slate-200 bg-white 
                    focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                    disabled:bg-slate-100 transition-all"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={setToday}
              disabled={disabled}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
            >
              📅 Usar fecha y hora actual
            </button>
          </div>

          {/* Fecha Fin */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Fecha y Hora de Término
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => onChange('fechaFinVigencia', e.target.value)}
                  disabled={disabled}
                  min={fechaInicio}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white 
                    focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                    disabled:bg-slate-100 transition-all"
                />
              </div>
              <div className="relative w-28">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => onChange('horaFinVigencia', e.target.value)}
                  disabled={disabled}
                  className="w-full pl-10 pr-2 py-2.5 rounded-lg border border-slate-200 bg-white 
                    focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                    disabled:bg-slate-100 transition-all"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={setEndOfDay}
              disabled={disabled}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
            >
              🕐 Fin del día (23:59)
            </button>
          </div>
        </div>

        {/* Duración calculada */}
        {fechaFin && (
          <div className={`mt-5 p-4 rounded-lg flex items-center justify-between
            ${diasRestantes > 7 ? 'bg-emerald-50 border border-emerald-200' :
              diasRestantes > 0 ? 'bg-amber-50 border border-amber-200' :
              'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                diasRestantes > 7 ? 'bg-emerald-100' :
                diasRestantes > 0 ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                {loading ? (
                  <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />
                ) : diasRestantes > 7 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : diasRestantes > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className={`font-semibold ${
                  diasRestantes > 7 ? 'text-emerald-700' :
                  diasRestantes > 0 ? 'text-amber-700' : 'text-red-700'
                }`}>
                  ⏱️ {diasRestantes > 0 
                    ? `${diasRestantes} días restantes` 
                    : diasRestantes === 0 
                      ? '¡Termina hoy!'
                      : `Terminó hace ${Math.abs(diasRestantes)} días`
                  }
                </p>
                {analysis && (
                  <p className="text-sm text-slate-600 mt-0.5">
                    {analysis.analisis?.recomendacion || analysis.recomendacion}
                  </p>
                )}
              </div>
            </div>
            
            {analysis && (
              <div className="text-right text-xs text-slate-500">
                <p>Duración típica: {analysis.analisis?.duracionTipica || analysis.duracionTipica || 90} días</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Alertas */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-100">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Alertas Automáticas</h4>
            <p className="text-sm text-slate-500">
              Configure notificaciones antes del vencimiento
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* 7 días antes */}
          <label className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
            ${alertConfig.diasAntes7 
              ? 'bg-white border-amber-300 shadow-sm' 
              : 'bg-transparent border-transparent hover:bg-white/50'
            }`}
          >
            <input
              type="checkbox"
              checked={alertConfig.diasAntes7}
              onChange={() => handleAlertChange('diasAntes7')}
              disabled={disabled || diasRestantes <= 7}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
            />
            <div className="flex-1">
              <span className="font-medium text-slate-700">
                📅 Notificar 7 días antes del vencimiento
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Enviará alerta a las 09:00 hrs
              </span>
            </div>
            {diasRestantes <= 7 && diasRestantes > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Ya pasó
              </span>
            )}
          </label>

          {/* 1 día antes */}
          <label className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
            ${alertConfig.diasAntes1 
              ? 'bg-white border-amber-300 shadow-sm' 
              : 'bg-transparent border-transparent hover:bg-white/50'
            }`}
          >
            <input
              type="checkbox"
              checked={alertConfig.diasAntes1}
              onChange={() => handleAlertChange('diasAntes1')}
              disabled={disabled || diasRestantes <= 1}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
            />
            <div className="flex-1">
              <span className="font-medium text-slate-700">
                ⚠️ Notificar 1 día antes (al mediodía)
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Alerta urgente a las 12:00 hrs
              </span>
            </div>
            {diasRestantes <= 1 && diasRestantes > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Ya pasó
              </span>
            )}
          </label>

          {/* Separador */}
          <div className="border-t border-amber-200 my-2" />

          {/* Destinatarios */}
          <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Enviar alertas a:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer
              ${alertConfig.alertarEjecutivo 
                ? 'bg-indigo-50 border-indigo-300' 
                : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={alertConfig.alertarEjecutivo}
                onChange={() => handleAlertChange('alertarEjecutivo')}
                disabled={disabled}
                className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500"
              />
              <User className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-slate-700">Ejecutivo</span>
            </label>

            <label className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer
              ${alertConfig.alertarOperador 
                ? 'bg-emerald-50 border-emerald-300' 
                : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={alertConfig.alertarOperador}
                onChange={() => handleAlertChange('alertarOperador')}
                disabled={disabled}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
              />
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-700">Operador</span>
            </label>

            <label className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer
              ${alertConfig.alertarComercial 
                ? 'bg-purple-50 border-purple-300' 
                : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={alertConfig.alertarComercial}
                onChange={() => handleAlertChange('alertarComercial')}
                disabled={disabled}
                className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
              />
              <Briefcase className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-slate-700">Comercial</span>
            </label>
          </div>
        </div>
      </div>

      {/* Análisis Inteligente */}
      {analysis && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">📊 Análisis Inteligente</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>• Duración típica para <strong>{tipoCuna || 'audio'}</strong>: {analysis.analisis?.duracionTipica || 90} días</li>
                <li>• {analysis.analisis?.recomendacion || analysis.recomendacion}</li>
                {analysis.alertasRecomendadas && (
                  <li>• Alertas recomendadas: {
                    [
                      analysis.alertasRecomendadas.diasAntes7 && '7 días',
                      analysis.alertasRecomendadas.diasAntes1 && '1 día'
                    ].filter(Boolean).join(', ') || 'Ninguna'
                  }</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VigenciaPanel;
