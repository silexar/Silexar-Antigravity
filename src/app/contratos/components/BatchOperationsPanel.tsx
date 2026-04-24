/**
 * ? SILEXAR PULSE - Batch Operations Panel TIER 0
 * 
 * @description Panel de operaciones masivas para ejecutar
 * acciones en múltiples contratos simultáneamente.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Check,
  X,
  Download,
  Mail,
  Printer,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
  FileText,
  DollarSign,
  Users,
  Calendar,
  Send
} from 'lucide-react';
import { Productivity } from '../nuevo/components/WizardContrato/services/ProductivityService';

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

export interface ContratoSeleccionado {
  id: string;
  numero: string;
  cliente: string;
  estado: string;
  valor: number;
}

type OperacionBatch = 
  | 'aprobar'
  | 'rechazar'
  | 'exportar'
  | 'enviarEmail'
  | 'cambiarEstado'
  | 'generarPDF'
  | 'eliminar';

interface EstadoOperacion {
  ejecutando: boolean;
  completado: boolean;
  exitosos: string[];
  fallidos: { id: string; error: string }[];
  tiempoTotal?: number;
}

// ---------------------------------------------------------------
// ESTILOS NEUROMORPHIC
// ---------------------------------------------------------------

const neuro = {
  panel: `
    bg-[#dfeaff]
    rounded-3xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]

  `,
  card: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]

  `,
  btnPrimary: `
    bg-[#6888ff]
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  btnSecondary: `
    bg-[#dfeaff]
    text-[#69738c] font-medium rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnDanger: `
    bg-gradient-to-br from-red-500 to-red-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ---------------------------------------------------------------
// OPERACIONES DISPONIBLES
// ---------------------------------------------------------------

const OPERACIONES = [
  { 
    id: 'aprobar' as OperacionBatch, 
    label: 'Aprobar todos', 
    icon: <Check className="w-4 h-4" />,
    color: 'bg-green-100 text-green-600',
    confirmacion: '¿Aprobar {count} contratos seleccionados?'
  },
  { 
    id: 'rechazar' as OperacionBatch, 
    label: 'Rechazar todos', 
    icon: <X className="w-4 h-4" />,
    color: 'bg-red-100 text-red-600',
    confirmacion: '¿Rechazar {count} contratos? Esta acción requiere motivo.'
  },
  { 
    id: 'exportar' as OperacionBatch, 
    label: 'Exportar Excel', 
    icon: <Download className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-600',
    confirmacion: null // No requiere confirmación
  },
  { 
    id: 'generarPDF' as OperacionBatch, 
    label: 'Generar PDFs', 
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-600',
    confirmacion: null
  },
  { 
    id: 'enviarEmail' as OperacionBatch, 
    label: 'Enviar por email', 
    icon: <Mail className="w-4 h-4" />,
    color: 'bg-[#dfeaff] text-[#6888ff]',
    confirmacion: '¿Enviar {count} contratos a sus respectivos clientes?'
  },
  { 
    id: 'cambiarEstado' as OperacionBatch, 
    label: 'Cambiar estado', 
    icon: <RefreshCw className="w-4 h-4" />,
    color: 'bg-amber-100 text-amber-600',
    confirmacion: 'Seleccione el nuevo estado para {count} contratos'
  }
];

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export default function BatchOperationsPanel({
  contratosSeleccionados,
  onLimpiarSeleccion,
  onOperacionCompletada
}: {
  contratosSeleccionados: ContratoSeleccionado[];
  onLimpiarSeleccion: () => void;
  onOperacionCompletada?: (resultado: EstadoOperacion) => void;
}) {
  const [operacionActiva, setOperacionActiva] = useState<OperacionBatch | null>(null);
  const [estadoOperacion, setEstadoOperacion] = useState<EstadoOperacion>({
    ejecutando: false,
    completado: false,
    exitosos: [],
    fallidos: []
  });
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const valorTotal = contratosSeleccionados.reduce((sum, c) => sum + c.valor, 0);

  const handleOperacion = async (operacion: OperacionBatch) => {
    const opConfig = OPERACIONES.find(o => o.id === operacion);
    
    if (opConfig?.confirmacion) {
      setOperacionActiva(operacion);
      setShowConfirmacion(true);
      return;
    }

    await ejecutarOperacion(operacion);
  };

  const ejecutarOperacion = async (operacion: OperacionBatch) => {
    setShowConfirmacion(false);
    setEstadoOperacion({
      ejecutando: true,
      completado: false,
      exitosos: [],
      fallidos: []
    });

    const ids = contratosSeleccionados.map(c => c.id);
    
    try {
      const resultado = await Productivity.ejecutarBatch(ids, operacion as "aprobar" | "rechazar" | "exportar" | "enviarEmail" | "cambiarEstado");
      
      setEstadoOperacion({
        ejecutando: false,
        completado: true,
        exitosos: resultado.exitosos,
        fallidos: resultado.fallidos,
        tiempoTotal: resultado.tiempoTotal
      });

      onOperacionCompletada?.(estadoOperacion);
    } catch (error) {
      setEstadoOperacion({
        ejecutando: false,
        completado: true,
        exitosos: [],
        fallidos: ids.map(id => ({ id, error: String(error) }))
      });
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  if (contratosSeleccionados.length === 0) return null;

  return (
    <>
      {/* Barra flotante de acciones */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${neuro.panel} px-6 py-4 z-50`}
      >
        <div className="flex items-center gap-6">
          {/* Info de selección */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-[#dfeaff]">
              <Layers className="w-5 h-5 text-[#6888ff]" />
            </div>
            <div>
              <p className="font-bold text-[#69738c]">
                {contratosSeleccionados.length} contratos seleccionados
              </p>
              <p className="text-sm text-[#9aa3b8]">
                Valor total: {formatCurrency(valorTotal)}
              </p>
            </div>
          </div>

          <div className="w-px h-10 bg-[#bec8de]" />

          {/* Operaciones */}
          <div className="flex items-center gap-2">
            {OPERACIONES.slice(0, 4).map(op => (
              <button
                key={op.id}
                onClick={() => handleOperacion(op.id)}
                disabled={estadoOperacion.ejecutando}
                className={`${neuro.btnSecondary} p-2 flex items-center gap-2`}
                title={op.label}
              >
                <span className={`p-1 rounded-lg ${op.color}`}>
                  {op.icon}
                </span>
                <span className="text-sm hidden xl:inline">{op.label}</span>
              </button>
            ))}

            {/* Más opciones */}
            <div className="relative group">
              <button className={`${neuro.btnSecondary} p-2 flex items-center gap-1`}>
                <span className="text-sm">Más</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className={`absolute bottom-full left-0 mb-2 ${neuro.panel} p-2 min-w-48 hidden group-hover:block`}>
                {OPERACIONES.slice(4).map(op => (
                  <button
                    key={op.id}
                    onClick={() => handleOperacion(op.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#dfeaff] rounded-lg flex items-center gap-2"
                  >
                    <span className={`p-1 rounded-lg ${op.color}`}>
                      {op.icon}
                    </span>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-px h-10 bg-[#bec8de]" />

          {/* Limpiar selección */}
          <button
            onClick={onLimpiarSeleccion}
            className={`${neuro.btnSecondary} p-2`}
            title="Limpiar selección"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progreso */}
        {estadoOperacion.ejecutando && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-[#6888ff] rounded-b-3xl origin-left"
          />
        )}
      </motion.div>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {showConfirmacion && operacionActiva && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowConfirmacion(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`${neuro.panel} p-6 max-w-md w-full mx-4`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-amber-100">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-[#69738c]">Confirmar operación</h3>
              </div>

              <p className="text-[#69738c] mb-4">
                {OPERACIONES.find(o => o.id === operacionActiva)?.confirmacion?.replace(
                  '{count}',
                  String(contratosSeleccionados.length)
                )}
              </p>

              {/* Lista de contratos afectados */}
              <div className="max-h-40 overflow-y-auto mb-4 space-y-2">
                {contratosSeleccionados.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm p-2 bg-[#dfeaff] rounded-lg">
                    <span className="font-medium">{c.numero}</span>
                    <span className="text-[#9aa3b8]">{c.cliente}</span>
                  </div>
                ))}
                {contratosSeleccionados.length > 5 && (
                  <p className="text-sm text-[#9aa3b8] text-center">
                    y {contratosSeleccionados.length - 5} más...
                  </p>
                )}
              </div>

              {/* Campo de motivo para rechazo */}
              {operacionActiva === 'rechazar' && (
                <textarea
                  value={motivoRechazo}
                  onChange={e => setMotivoRechazo(e.target.value)}
                  placeholder="Motivo del rechazo (obligatorio)"
                  className={`${neuro.card} w-full p-3 text-sm mb-4`}
                  rows={3}
                />
              )}

              {/* Selector de estado */}
              {operacionActiva === 'cambiarEstado' && (
                <select
                  value={nuevoEstado}
                  onChange={e => setNuevoEstado(e.target.value)}
                  className={`${neuro.card} w-full p-3 text-sm mb-4`}
                >
                  <option value="">Seleccionar estado...</option>
                  <option value="BORRADOR">Borrador</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="PENDIENTE_APROBACION">Pendiente Aprobación</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="PAUSADO">Pausado</option>
                </select>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowConfirmacion(false)}
                  className={`${neuro.btnSecondary} px-4 py-2`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => ejecutarOperacion(operacionActiva)}
                  disabled={
                    (operacionActiva === 'rechazar' && !motivoRechazo) ||
                    (operacionActiva === 'cambiarEstado' && !nuevoEstado)
                  }
                  className={`${operacionActiva === 'rechazar' ? neuro.btnDanger : neuro.btnPrimary} px-4 py-2`}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de resultado */}
      <AnimatePresence>
        {estadoOperacion.completado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEstadoOperacion({ ...estadoOperacion, completado: false })}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`${neuro.panel} p-6 max-w-md w-full mx-4`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                {estadoOperacion.fallidos.length === 0 ? (
                  <>
                    <div className="p-3 rounded-xl bg-green-100">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#69738c]">Operación completada</h3>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-amber-100">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#69738c]">Operación parcial</h3>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-4">
                {estadoOperacion.exitosos.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <span className="text-green-700">Exitosos</span>
                    <span className="font-bold text-green-700">{estadoOperacion.exitosos.length}</span>
                  </div>
                )}
                {estadoOperacion.fallidos.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <span className="text-red-700">Fallidos</span>
                    <span className="font-bold text-red-700">{estadoOperacion.fallidos.length}</span>
                  </div>
                )}
                {estadoOperacion.tiempoTotal && (
                  <div className="flex items-center justify-between p-3 bg-[#dfeaff] rounded-xl">
                    <span className="text-[#69738c]">Tiempo total</span>
                    <span className="font-medium">{(estadoOperacion.tiempoTotal / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>

              {estadoOperacion.fallidos.length > 0 && (
                <div className="max-h-32 overflow-y-auto mb-4">
                  {estadoOperacion.fallidos.map(f => (
                    <div key={f.id} className="text-sm text-red-600 p-2">
                      {f.id}: {f.error}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setEstadoOperacion({ ejecutando: false, completado: false, exitosos: [], fallidos: [] });
                  onLimpiarSeleccion();
                }}
                className={`${neuro.btnPrimary} w-full py-3`}
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loader de operación */}
      <AnimatePresence>
        {estadoOperacion.ejecutando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className={`${neuro.panel} p-8 text-center`}>
              <Loader2 className="w-12 h-12 text-[#6888ff] animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-[#69738c]">Procesando operación...</p>
              <p className="text-sm text-[#9aa3b8] mt-1">
                {contratosSeleccionados.length} contratos
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
