/**
 * 🆔 SILEXAR PULSE - Panel de Display de ID Enterprise
 * 
 * Componente que muestra el ID SPX reservado prominentemente
 * con estado de lock, tiempo de generación y número secuencial
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Hash, Lock, Clock, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ReservedIdData {
  spxCodigo: string;
  secuencia: number;
  secuenciaFormateada: string;
  reservadoHasta: string;
  tiempoRestanteMs: number;
  locked: boolean;
  timestamp: string;
  timestampFormateado: string;
}

interface IdDisplayPanelProps {
  onIdReserved?: (data: ReservedIdData) => void;
  context?: 'manual' | 'contract' | 'vencimientos' | 'inbox' | 'campana';
  tipoCuna?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function IdDisplayPanel({ 
  onIdReserved, 
  context = 'manual',
  tipoCuna = 'audio',
  className = ''
}: IdDisplayPanelProps) {
  const [idData, setIdData] = useState<ReservedIdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);

  // Reservar ID al montar
  const reserveId = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cunas/reserve-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          tipoCuna,
          userId: 'user-current' // En producción: obtener del contexto de autenticación
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIdData(result.data);
        setTiempoRestante(result.data.tiempoRestanteMs);
        if (onIdReserved) {
          onIdReserved(result.data);
        }
      } else {
        setError(result.error || 'Error al reservar ID');
      }
    } catch (err) {
      /* console.error('Error reservando ID:', err) */;
      setError('Error de conexión al reservar ID');
    } finally {
      setLoading(false);
    }
  }, [context, tipoCuna, onIdReserved]);

  useEffect(() => {
    reserveId();
  }, [reserveId]);

  // Timer de cuenta regresiva
  useEffect(() => {
    if (tiempoRestante <= 0) return;
    
    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1000) {
          // Reserva expirada, renovar automáticamente
          reserveId();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [tiempoRestante, reserveId]);

  // Formatear tiempo restante
  const formatTiempoRestante = (ms: number): string => {
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`p-4 bg-slate-50 border border-slate-200 rounded-xl animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-200 rounded-lg">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-700 font-medium">Error al reservar ID</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
          <button
            onClick={reserveId}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium text-red-700 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!idData) return null;

  const tiempoRestantePorcentaje = (tiempoRestante / idData.tiempoRestanteMs) * 100;

  return (
    <div className={`p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
          <Hash className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
            🆔 ID ASIGNADO AUTOMÁTICAMENTE
            <span className="px-2 py-0.5 bg-emerald-200 rounded-full text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Reservado
            </span>
          </p>
        </div>
      </div>

      {/* ID Principal */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-mono font-bold text-emerald-600 tracking-wider">
            {idData.spxCodigo}
          </span>
          <CheckCircle className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      {/* Barra de tiempo restante */}
      <div className="mb-3">
        <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
            style={{ width: `${tiempoRestantePorcentaje}%` }}
          />
        </div>
      </div>

      {/* Info adicional */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 bg-white/60 rounded-lg">
          <p className="text-xs text-slate-500">Número secuencial</p>
          <p className="text-sm font-bold text-slate-700">#{idData.secuenciaFormateada}</p>
        </div>
        <div className="p-2 bg-white/60 rounded-lg">
          <p className="text-xs text-slate-500">Generado</p>
          <p className="text-sm font-bold text-slate-700 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            {idData.timestampFormateado}
          </p>
        </div>
        <div className="p-2 bg-white/60 rounded-lg">
          <p className="text-xs text-slate-500">Reserva válida</p>
          <p className={`text-sm font-bold ${tiempoRestante < 60000 ? 'text-amber-600' : 'text-slate-700'}`}>
            {formatTiempoRestante(tiempoRestante)}
          </p>
        </div>
      </div>

      {/* Estado */}
      <div className="mt-3 p-2 bg-emerald-100/50 rounded-lg text-center">
        <p className="text-xs text-emerald-700 flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          ✅ Listo para operación • ID bloqueado para seguridad
        </p>
      </div>
    </div>
  );
}
