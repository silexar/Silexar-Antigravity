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
    bg-gradient-to-br from-[#dfeaff] to-[#dfeaff]
    rounded-3xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
    border border-[#bec8de30]/50
  `,
  card: `
    bg-gradient-to-br from-[#ffffff] to-[#dfeaff]
    rounded-2xl shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
    border border-[#bec8de30]/30
  `,
  btn: `
    px-4 py-2 rounded-xl font-medium transition-all
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
  `,
  btnPrimary: `bg-[#6888ff] text-white`,
  btnSuccess: `bg-gradient-to-br from-[#6888ff] to-[#5572ee] text-white`,
  btnSecondary: `bg-gradient-to-br from-[#dfeaff] to-[#dfeaff] text-[#69738c]`,
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
      case 'PDF': return <FileText className="w-5 h-5 text-[#9aa3b8]" />;
      case 'EXCEL': return <FileSpreadsheet className="w-5 h-5 text-[#6888ff]" />;
      case 'CSV': return <FileSpreadsheet className="w-5 h-5 text-[#6888ff]" />;
      case 'ZIP': return <Archive className="w-5 h-5 text-[#6888ff]" />;
      default: return <Package className="w-5 h-5 text-[#69738c]" />;
    }
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return { color: 'text-[#69738c]', bg: 'bg-[#dfeaff]', icon: Clock };
      case 'PROCESANDO': return { color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10', icon: Loader2 };
      case 'COMPLETADO': return { color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10', icon: CheckCircle };
      case 'ERROR': return { color: 'text-[#9aa3b8]', bg: 'bg-[#dfeaff]', icon: XCircle };
      case 'CANCELADO': return { color: 'text-[#69738c]', bg: 'bg-[#dfeaff]', icon: XCircle };
      default: return { color: 'text-[#69738c]', bg: 'bg-[#dfeaff]', icon: Clock };
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
    <div className="min-h-screen bg-gradient-to-br from-[#dfeaff] via-slate-50 to-[#dfeaff] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6888ff] to-[#5572ee]">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#69738c]">Exportaciones</h1>
              <p className="text-[#69738c]">Gestiona tus descargas y reportes generados</p>
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
              <p className="text-sm text-[#69738c] mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-[#6888ff]">
                {trabajos.filter(t => t.estado === 'PROCESANDO').length}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="p-5">
              <p className="text-sm text-[#69738c] mb-1">Listos para Descarga</p>
              <p className="text-2xl font-bold text-[#6888ff]">
                {trabajos.filter(t => t.estado === 'COMPLETADO').length}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-5">
              <p className="text-sm text-[#69738c] mb-1">Documentos Hoy</p>
              <p className="text-2xl font-bold text-[#69738c]">
                {trabajos.reduce((acc, t) => acc + t.totalDocumentos, 0)}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="p-5">
              <p className="text-sm text-[#69738c] mb-1">Tamaño Total</p>
              <p className="text-2xl font-bold text-[#6888ff]">
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
                            <h3 className="font-semibold text-[#69738c]">
                              {trabajo.tipo === 'MASIVO' 
                                ? `${trabajo.totalDocumentos} documentos` 
                                : trabajo.documentos[0]?.titulo}
                            </h3>
                            <span className={`${neuro.badge} ${estadoConfig.bg} ${estadoConfig.color} flex items-center gap-1`}>
                              <IconoEstado className={`w-3 h-3 ${trabajo.estado === 'PROCESANDO' ? 'animate-spin' : ''}`} />
                              {trabajo.estado}
                            </span>
                          </div>
                          <p className="text-sm text-[#69738c]">
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
                        <button className="p-2 hover:bg-[#dfeaff] rounded-lg">
                          <MoreVertical className="w-5 h-5 text-[#9aa3b8]" />
                        </button>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {(trabajo.estado === 'PROCESANDO' || trabajo.estado === 'PENDIENTE') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#69738c]">
                            Procesando documento {trabajo.documentosProcesados} de {trabajo.totalDocumentos}
                          </span>
                          <span className="font-medium text-[#6888ff]">{trabajo.progreso}%</span>
                        </div>
                        <div className="h-2 bg-[#dfeaff] rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[#6888ff] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${trabajo.progreso}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {trabajo.error && (
                      <div className="mt-3 p-3 bg-[#dfeaff] rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#9aa3b8] flex-shrink-0" />
                        <span className="text-sm text-[#9aa3b8]">{trabajo.error}</span>
                      </div>
                    )}

                    {/* Lista de documentos (colapsable) */}
                    {trabajo.tipo === 'MASIVO' && trabajo.estado === 'COMPLETADO' && (
                      <details className="mt-4">
                        <summary className="text-sm text-[#6888ff] cursor-pointer hover:underline">
                          Ver {trabajo.totalDocumentos} documentos incluidos
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto grid grid-cols-2 gap-1">
                          {trabajo.documentos.map((doc) => (
                            <span key={doc.titulo} className="text-xs text-[#69738c] truncate">
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
                <Package className="w-12 h-12 text-[#9aa3b8] mx-auto mb-4" />
                <p className="text-[#69738c]">No hay exportaciones {filtroEstado !== 'todos' && `con estado "${filtroEstado}"`}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
