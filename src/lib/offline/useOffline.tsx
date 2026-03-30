/**
 * 📴 SILEXAR PULSE - Offline React Hook & Components TIER 0
 * 
 * @description Hook y componentes para manejo offline:
 * - useOffline: Hook para estado de conexión y sync
 * - OfflineIndicator: Barra indicadora de estado
 * - OfflineBanner: Banner de modo offline
 * - SyncStatus: Estado de sincronización
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

/* eslint-disable react-refresh/only-export-components */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Cloud,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
  Clock,
  Upload,
  AlertCircle
} from 'lucide-react';
import { OfflineStorage, EstadoSync, ConflictoSync } from './OfflineStorageService';

// ═══════════════════════════════════════════════════════════════
// HOOK useOffline
// ═══════════════════════════════════════════════════════════════

export function useOffline() {
  const [estado, setEstado] = useState<EstadoSync>({
    online: true,
    ultimaSync: null,
    syncEnProgreso: false,
    operacionesPendientes: 0,
    conflictos: 0
  });

  useEffect(() => {
    const unsub = OfflineStorage.suscribir('useOffline', setEstado);
    return unsub;
  }, []);

  const guardarContrato = useCallback((datos: Record<string, unknown>, id?: string) => {
    return OfflineStorage.guardarContrato(datos, id);
  }, []);

  const guardarLinea = useCallback((contratoId: string, lineaId: string, datos: Record<string, unknown>) => {
    OfflineStorage.guardarLinea(contratoId, lineaId, datos);
  }, []);

  const sincronizar = useCallback(async () => {
    return OfflineStorage.sincronizar();
  }, []);

  const obtenerContrato = useCallback((id: string) => {
    return OfflineStorage.obtenerContrato(id);
  }, []);

  const obtenerNoSincronizados = useCallback(() => {
    return OfflineStorage.obtenerNoSincronizados();
  }, []);

  const obtenerConflictos = useCallback(() => {
    return OfflineStorage.obtenerConflictos();
  }, []);

  const resolverConflicto = useCallback((
    conflictoId: string, 
    resolucion: 'LOCAL' | 'SERVIDOR' | 'MERGE',
    datosMerge?: Record<string, unknown>
  ) => {
    return OfflineStorage.resolverConflicto(conflictoId, resolucion, datosMerge);
  }, []);

  return {
    // Estado
    online: estado.online,
    offline: !estado.online,
    ultimaSync: estado.ultimaSync,
    syncEnProgreso: estado.syncEnProgreso,
    operacionesPendientes: estado.operacionesPendientes,
    conflictos: estado.conflictos,
    hayPendientes: estado.operacionesPendientes > 0,
    hayConflictos: estado.conflictos > 0,
    
    // Acciones
    guardarContrato,
    guardarLinea,
    sincronizar,
    obtenerContrato,
    obtenerNoSincronizados,
    obtenerConflictos,
    resolverConflicto
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Indicador de Estado de Conexión
// ═══════════════════════════════════════════════════════════════

export function OfflineIndicator() {
  const { online, syncEnProgreso, operacionesPendientes } = useOffline();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Mostrar indicador cuando hay cambios de estado
    if (!online || operacionesPendientes > 0) {
      setVisible(true);
    }
  }, [online, operacionesPendientes]);

  if (!visible && online && operacionesPendientes === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div
        onClick={() => setShowDetails(!showDetails)}
        className={`
          cursor-pointer rounded-full px-4 py-2 flex items-center gap-2
          shadow-lg transition-all
          ${online 
            ? operacionesPendientes > 0 
              ? 'bg-amber-500 text-white' 
              : 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
          }
        `}
      >
        {online ? (
          syncEnProgreso ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Sincronizando...</span>
            </>
          ) : operacionesPendientes > 0 ? (
            <>
              <Cloud className="w-4 h-4" />
              <span className="text-sm font-medium">{operacionesPendientes} pendientes</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Sincronizado</span>
            </>
          )
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Sin conexión</span>
          </>
        )}
      </div>

      {/* Panel de detalles */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-72"
          >
            <SyncStatus />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Banner de Modo Offline
// ═══════════════════════════════════════════════════════════════

export function OfflineBanner() {
  const { offline, operacionesPendientes } = useOffline();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Resetear dismiss cuando cambia el estado
    if (!offline) {
      setDismissed(false);
    }
  }, [offline]);

  if (!offline || dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-amber-500 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5" />
          <div>
            <p className="font-medium">Trabajando sin conexión</p>
            <p className="text-sm text-amber-100">
              Tus cambios se guardarán localmente y se sincronizarán automáticamente cuando recuperes conexión.
              {operacionesPendientes > 0 && ` (${operacionesPendientes} operaciones pendientes)`}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-600 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Estado de Sincronización Detallado
// ═══════════════════════════════════════════════════════════════

export function SyncStatus() {
  const { 
    online, 
    syncEnProgreso, 
    operacionesPendientes, 
    conflictos,
    ultimaSync,
    sincronizar
  } = useOffline();

  const formatTiempo = (fecha: Date | null) => {
    if (!fecha) return 'Nunca';
    const diff = Date.now() - fecha.getTime();
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    return fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Estado de conexión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {online ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium text-slate-800">
            {online ? 'Conectado' : 'Sin conexión'}
          </span>
        </div>
        {online && (
          <button
            onClick={() => sincronizar()}
            disabled={syncEnProgreso}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1
              ${syncEnProgreso 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              }
            `}
          >
            <RefreshCw className={`w-4 h-4 ${syncEnProgreso ? 'animate-spin' : ''}`} />
            {syncEnProgreso ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        )}
      </div>

      {/* Última sincronización */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Última sincronización</span>
        <span className="text-slate-700">{formatTiempo(ultimaSync)}</span>
      </div>

      {/* Operaciones pendientes */}
      {operacionesPendientes > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
          <Upload className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-700">
              {operacionesPendientes} cambios sin sincronizar
            </p>
            <p className="text-xs text-amber-600">
              Se sincronizarán al recuperar conexión
            </p>
          </div>
        </div>
      )}

      {/* Conflictos */}
      {conflictos > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-700">
              {conflictos} conflicto(s) de sincronización
            </p>
            <p className="text-xs text-red-600">
              Requieren resolución manual
            </p>
          </div>
        </div>
      )}

      {/* Todo sincronizado */}
      {online && operacionesPendientes === 0 && conflictos === 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 font-medium">Todo sincronizado</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Modal de Resolución de Conflictos
// ═══════════════════════════════════════════════════════════════

export function ConflictResolutionModal({
  conflicto,
  onResolver,
  onCerrar
}: {
  conflicto: ConflictoSync;
  onResolver: (resolucion: 'LOCAL' | 'SERVIDOR' | 'MERGE') => void;
  onCerrar: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden"
      >
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-bold text-lg text-amber-800">Conflicto de Sincronización</h3>
              <p className="text-sm text-amber-600">
                El contrato fue modificado en otro lugar. Elige qué versión conservar.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Versión local */}
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Tu versión</span>
              </div>
              <p className="text-xs text-blue-600 mb-2">
                Modificado: {conflicto.fechaLocal.toLocaleString()}
              </p>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(conflicto.versionLocal, null, 2)}
              </pre>
            </div>

            {/* Versión servidor */}
            <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Versión del servidor</span>
              </div>
              <p className="text-xs text-purple-600 mb-2">
                Modificado: {conflicto.fechaServidor.toLocaleString()}
              </p>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(conflicto.versionServidor, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onResolver('LOCAL')}
              className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
            >
              Mantener mi versión
            </button>
            <button
              onClick={() => onResolver('SERVIDOR')}
              className="flex-1 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
            >
              Usar versión del servidor
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end">
          <button
            onClick={onCerrar}
            className="px-4 py-2 text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Wrapper con Auto-Save
// ═══════════════════════════════════════════════════════════════

export function WithAutoSave({
  contratoId,
  datos,
  intervalo = 5000, // ms
  children
}: {
  contratoId: string;
  datos: Record<string, unknown>;
  intervalo?: number;
  children: React.ReactNode;
}) {
  const { guardarContrato } = useOffline();
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      guardarContrato(datos, contratoId);
      setUltimoGuardado(new Date());
    }, intervalo);

    return () => clearInterval(timer);
  }, [contratoId, datos, intervalo, guardarContrato]);

  // Guardar al desmontar
  useEffect(() => {
    return () => {
      guardarContrato(datos, contratoId);
    };
  }, [contratoId, datos, guardarContrato]);

  return (
    <div className="relative">
      {children}
      {ultimoGuardado && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Guardado automático
        </div>
      )}
    </div>
  );
}

export default {
  useOffline,
  OfflineIndicator,
  OfflineBanner,
  SyncStatus,
  ConflictResolutionModal,
  WithAutoSave
};
