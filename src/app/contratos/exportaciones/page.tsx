/**
 * 📤 SILEXAR PULSE - Exports Management Page TIER 0
 * 
 * @description Página de gestión de exportaciones masivas:
 * - Lista de trabajos de exportación
 * - Progreso en tiempo real
 * - Descargas disponibles
 * - Historial de exports
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Archive,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  MoreVertical,
  Package,
  Loader2,
  AlertCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface TrabajoExport {
  id: string;
  tipo: 'INDIVIDUAL' | 'MASIVO';
  formato: 'PDF' | 'EXCEL' | 'CSV' | 'ZIP';
  totalDocumentos: number;
  documentosProcesados: number;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR' | 'CANCELADO';
  progreso: number;
  urlDescarga?: string;
  tamañoBytes?: number;
  error?: string;
  fechaSolicitud: Date;
  fechaCompletado?: Date;
  documentos: { tipo: string; titulo: string }[];
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-2xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
  `,
  btn: `
    px-4 py-2 rounded-xl font-medium transition-all
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
  `,
  btnPrimary: `bg-gradient-to-br from-indigo-500 to-purple-600 text-white`,
  btnSuccess: `bg-gradient-to-br from-green-500 to-emerald-600 text-white`,
  btnSecondary: `bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700`,
  badge: `px-3 py-1 rounded-lg text-xs font-medium`
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockTrabajos: TrabajoExport[] = [
  {
    id: 'exp-001',
    tipo: 'MASIVO',
    formato: 'ZIP',
    totalDocumentos: 25,
    documentosProcesados: 25,
    estado: 'COMPLETADO',
    progreso: 100,
    urlDescarga: '/exports/contratos_diciembre_2024.zip',
    tamañoBytes: 15234567,
    fechaSolicitud: new Date(Date.now() - 2 * 60 * 60 * 1000),
    fechaCompletado: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    documentos: Array.from({ length: 25 }, (_, i) => ({ tipo: 'CONTRATO', titulo: `Contrato CTR-2024-${100 + i}` }))
  },
  {
    id: 'exp-002',
    tipo: 'MASIVO',
    formato: 'PDF',
    totalDocumentos: 12,
    documentosProcesados: 8,
    estado: 'PROCESANDO',
    progreso: 67,
    fechaSolicitud: new Date(Date.now() - 10 * 60 * 1000),
    documentos: Array.from({ length: 12 }, (_, i) => ({ tipo: 'FACTURA', titulo: `Factura FAC-2024-${200 + i}` }))
  },
  {
    id: 'exp-003',
    tipo: 'INDIVIDUAL',
    formato: 'EXCEL',
    totalDocumentos: 1,
    documentosProcesados: 1,
    estado: 'COMPLETADO',
    progreso: 100,
    urlDescarga: '/exports/reporte_cartera_2024.xlsx',
    tamañoBytes: 2345678,
    fechaSolicitud: new Date(Date.now() - 24 * 60 * 60 * 1000),
    fechaCompletado: new Date(Date.now() - 23.9 * 60 * 60 * 1000),
    documentos: [{ tipo: 'REPORTE_CARTERA', titulo: 'Reporte Cartera Q4 2024' }]
  },
  {
    id: 'exp-004',
    tipo: 'MASIVO',
    formato: 'PDF',
    totalDocumentos: 5,
    documentosProcesados: 3,
    estado: 'ERROR',
    progreso: 60,
    error: 'Timeout al generar documento 4',
    fechaSolicitud: new Date(Date.now() - 48 * 60 * 60 * 1000),
    documentos: Array.from({ length: 5 }, (_, i) => ({ tipo: 'ESTADO_CUENTA', titulo: `Estado Cuenta ${i + 1}` }))
  },
  {
    id: 'exp-005',
    tipo: 'INDIVIDUAL',
    formato: 'PDF',
    totalDocumentos: 1,
    documentosProcesados: 0,
    estado: 'PENDIENTE',
    progreso: 0,
    fechaSolicitud: new Date(),
    documentos: [{ tipo: 'CONTRATO', titulo: 'Contrato CTR-2024-999' }]
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ExportsPage() {
  const [trabajos, setTrabajos] = useState(mockTrabajos);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const getFormatoIcon = (formato: string) => {
    switch (formato) {
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      case 'EXCEL': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'CSV': return <FileSpreadsheet className="w-5 h-5 text-blue-500" />;
      case 'ZIP': return <Archive className="w-5 h-5 text-purple-500" />;
      default: return <Package className="w-5 h-5 text-slate-500" />;
    }
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return { color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock };
      case 'PROCESANDO': return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Loader2 };
      case 'COMPLETADO': return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
      case 'ERROR': return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
      case 'CANCELADO': return { color: 'text-slate-500', bg: 'bg-slate-100', icon: XCircle };
      default: return { color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock };
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTiempo = (fecha: Date) => {
    const diff = Date.now() - fecha.getTime();
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`;
    return fecha.toLocaleDateString();
  };

  const trabajosFiltrados = trabajos.filter(t => 
    filtroEstado === 'todos' || t.estado === filtroEstado
  );

  // Simular actualización de progreso
  useEffect(() => {
    const timer = setInterval(() => {
      setTrabajos(prev => prev.map(t => {
        if (t.estado === 'PROCESANDO' && t.progreso < 100) {
          const nuevoProgreso = Math.min(t.progreso + 5, 100);
          const nuevosProcesados = Math.floor((nuevoProgreso / 100) * t.totalDocumentos);
          return {
            ...t,
            progreso: nuevoProgreso,
            documentosProcesados: nuevosProcesados,
            estado: nuevoProgreso === 100 ? 'COMPLETADO' : 'PROCESANDO',
            fechaCompletado: nuevoProgreso === 100 ? new Date() : undefined,
            urlDescarga: nuevoProgreso === 100 ? `/exports/export_${t.id}.zip` : undefined
          };
        }
        return t;
      }));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Exportaciones</h1>
              <p className="text-slate-500">Gestiona tus descargas y reportes generados</p>
            </div>
          </div>
          
          <button className={`${neuro.btn} ${neuro.btnPrimary} flex items-center gap-2`}>
            <Plus className="w-5 h-5" />
            Nueva Exportación
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-blue-600">
                {trabajos.filter(t => t.estado === 'PROCESANDO').length}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">Listos para Descarga</p>
              <p className="text-2xl font-bold text-green-600">
                {trabajos.filter(t => t.estado === 'COMPLETADO').length}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">Documentos Hoy</p>
              <p className="text-2xl font-bold text-slate-800">
                {trabajos.reduce((acc, t) => acc + t.totalDocumentos, 0)}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">Tamaño Total</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatBytes(trabajos.reduce((acc, t) => acc + (t.tamañoBytes || 0), 0))}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['todos', 'PROCESANDO', 'COMPLETADO', 'ERROR'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`
                ${neuro.btn} ${filtroEstado === estado ? neuro.btnPrimary : neuro.btnSecondary}
              `}
            >
              {estado === 'todos' ? 'Todos' : estado.charAt(0) + estado.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Lista de Trabajos */}
        <div className={`${neuro.panel} p-6`}>
          <div className="space-y-4">
            {trabajosFiltrados.map(trabajo => {
              const estadoConfig = getEstadoConfig(trabajo.estado);
              const IconoEstado = estadoConfig.icon;
              
              return (
                <motion.div 
                  key={trabajo.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={neuro.card}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${estadoConfig.bg}`}>
                          {getFormatoIcon(trabajo.formato)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-800">
                              {trabajo.tipo === 'MASIVO' 
                                ? `${trabajo.totalDocumentos} documentos` 
                                : trabajo.documentos[0]?.titulo}
                            </h3>
                            <span className={`${neuro.badge} ${estadoConfig.bg} ${estadoConfig.color} flex items-center gap-1`}>
                              <IconoEstado className={`w-3 h-3 ${trabajo.estado === 'PROCESANDO' ? 'animate-spin' : ''}`} />
                              {trabajo.estado}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {trabajo.formato} • {formatTiempo(trabajo.fechaSolicitud)}
                            {trabajo.tamañoBytes && ` • ${formatBytes(trabajo.tamañoBytes)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {trabajo.estado === 'COMPLETADO' && trabajo.urlDescarga && (
                          <a 
                            href={trabajo.urlDescarga}
                            className={`${neuro.btn} ${neuro.btnSuccess} flex items-center gap-2`}
                          >
                            <Download className="w-4 h-4" />
                            Descargar
                          </a>
                        )}
                        {trabajo.estado === 'ERROR' && (
                          <button className={`${neuro.btn} ${neuro.btnSecondary} flex items-center gap-2`}>
                            <RefreshCw className="w-4 h-4" />
                            Reintentar
                          </button>
                        )}
                        <button className="p-2 hover:bg-slate-100 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {(trabajo.estado === 'PROCESANDO' || trabajo.estado === 'PENDIENTE') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Procesando documento {trabajo.documentosProcesados} de {trabajo.totalDocumentos}
                          </span>
                          <span className="font-medium text-indigo-600">{trabajo.progreso}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${trabajo.progreso}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {trabajo.error && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-600">{trabajo.error}</span>
                      </div>
                    )}

                    {/* Lista de documentos (colapsable) */}
                    {trabajo.tipo === 'MASIVO' && trabajo.estado === 'COMPLETADO' && (
                      <details className="mt-4">
                        <summary className="text-sm text-indigo-600 cursor-pointer hover:underline">
                          Ver {trabajo.totalDocumentos} documentos incluidos
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto grid grid-cols-2 gap-1">
                          {trabajo.documentos.map((doc, i) => (
                            <span key={i} className="text-xs text-slate-500 truncate">
                              • {doc.titulo}
                            </span>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {trabajosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay exportaciones {filtroEstado !== 'todos' && `con estado "${filtroEstado}"`}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
