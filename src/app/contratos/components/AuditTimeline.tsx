/**
 * 📜 SILEXAR PULSE - Audit Timeline Component TIER 0
 * 
 * @description Línea de tiempo completa de auditoría que muestra
 * cada acción realizada en el contrato. Esencial para auditorías externas.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  FileText,
  Edit,
  Check,
  X,
  User,
  DollarSign,
  AlertTriangle,
  Mail,
  Download,
  Eye,
  Shield,
  Printer,
  Upload,
  Trash2,
  RefreshCw,
  MessageSquare,
  PenTool,
  Calendar,
  ChevronDown,
  ExternalLink,
  GitBranch,
  ArrowRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoAccion = 
  | 'CREACION'
  | 'EDICION'
  | 'APROBACION'
  | 'RECHAZO'
  | 'FIRMA'
  | 'ENVIO_EMAIL'
  | 'ENVIO_WHATSAPP'
  | 'SUBIDA_DOCUMENTO'
  | 'DESCARGA'
  | 'VISUALIZACION'
  | 'IMPRESION'
  | 'CAMBIO_ESTADO'
  | 'CAMBIO_DESCUENTO'
  | 'CAMBIO_PRECIO'
  | 'COMENTARIO'
  | 'ALERTA'
  | 'VERSIONADO'
  | 'ELIMINACION'
  | 'RESTAURACION'
  | 'CAMBIO_PERMISO'
  | 'ACCESO_AUDITORIA';

type NivelRiesgo = 'bajo' | 'medio' | 'alto' | 'critico';

interface EventoAuditoria {
  id: string;
  tipo: TipoAccion;
  fecha: Date;
  
  // Usuario
  usuario: {
    id: string;
    nombre: string;
    rol: string;
    email: string;
    ip?: string;
  };
  
  // Detalle
  descripcion: string;
  detalleJson?: Record<string, unknown>;
  
  // Valores cambiados
  valorAnterior?: string;
  valorNuevo?: string;
  
  // Contexto
  seccion?: string;
  campoAfectado?: string;
  documentoId?: string;
  
  // Riesgo
  nivelRiesgo: NivelRiesgo;
  requiereAtencion: boolean;
  
  // Metadatos
  dispositivo?: string;
  navegador?: string;
  ubicacion?: string;
}

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
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
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
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockEventos: EventoAuditoria[] = [
  {
    id: 'ev-001',
    tipo: 'CREACION',
    fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    usuario: { id: 'u-001', nombre: 'Carlos Mendoza', rol: 'Ejecutivo Senior', email: 'carlos@silexar.cl', ip: '192.168.1.100' },
    descripcion: 'Contrato creado desde wizard',
    seccion: 'Wizard',
    nivelRiesgo: 'bajo',
    requiereAtencion: false,
    dispositivo: 'Desktop Chrome',
    ubicacion: 'Santiago, Chile'
  },
  {
    id: 'ev-002',
    tipo: 'EDICION',
    fecha: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    usuario: { id: 'u-001', nombre: 'Carlos Mendoza', rol: 'Ejecutivo Senior', email: 'carlos@silexar.cl' },
    descripcion: 'Modificación de valor total',
    campoAfectado: 'valorTotal',
    valorAnterior: '$75.000.000',
    valorNuevo: '$80.000.000',
    nivelRiesgo: 'medio',
    requiereAtencion: false
  },
  {
    id: 'ev-003',
    tipo: 'CAMBIO_DESCUENTO',
    fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    usuario: { id: 'u-001', nombre: 'Carlos Mendoza', rol: 'Ejecutivo Senior', email: 'carlos@silexar.cl' },
    descripcion: 'Solicitud de descuento especial',
    campoAfectado: 'descuento',
    valorAnterior: '10%',
    valorNuevo: '18%',
    nivelRiesgo: 'alto',
    requiereAtencion: true
  },
  {
    id: 'ev-004',
    tipo: 'APROBACION',
    fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    usuario: { id: 'u-002', nombre: 'Ana García', rol: 'Supervisora', email: 'ana@silexar.cl' },
    descripcion: 'Aprobación nivel 1 - Supervisora',
    detalleJson: { nivel: 1, comentario: 'Cliente estratégico, descuento autorizado' },
    nivelRiesgo: 'bajo',
    requiereAtencion: false
  },
  {
    id: 'ev-005',
    tipo: 'APROBACION',
    fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    usuario: { id: 'u-003', nombre: 'Roberto Silva', rol: 'Gerente Comercial', email: 'roberto@silexar.cl' },
    descripcion: 'Aprobación nivel 2 - Gerente Comercial',
    detalleJson: { nivel: 2, tiempoRespuesta: '4 horas' },
    nivelRiesgo: 'bajo',
    requiereAtencion: false
  },
  {
    id: 'ev-006',
    tipo: 'SUBIDA_DOCUMENTO',
    fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    usuario: { id: 'u-001', nombre: 'Carlos Mendoza', rol: 'Ejecutivo Senior', email: 'carlos@silexar.cl' },
    descripcion: 'Subida de Orden de Compra #45678',
    documentoId: 'doc-003',
    nivelRiesgo: 'bajo',
    requiereAtencion: false
  },
  {
    id: 'ev-007',
    tipo: 'FIRMA',
    fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    usuario: { id: 'u-005', nombre: 'Patricia Muñoz', rol: 'Gerente General', email: 'patricia@silexar.cl' },
    descripcion: 'Firma digital de representante legal',
    detalleJson: { proveedor: 'DocuSign', envelopeId: 'env-abc123' },
    nivelRiesgo: 'bajo',
    requiereAtencion: false
  },
  {
    id: 'ev-008',
    tipo: 'ENVIO_EMAIL',
    fecha: new Date(Date.now() - 12 * 60 * 60 * 1000),
    usuario: { id: 'u-001', nombre: 'Carlos Mendoza', rol: 'Ejecutivo Senior', email: 'carlos@silexar.cl' },
    descripcion: 'Envío de contrato firmado al cliente',
    detalleJson: { destinatario: 'contacto@bancochile.cl', estado: 'entregado' },
    nivelRiesgo: 'bajo',
    requiereAtencion: false
  },
  {
    id: 'ev-009',
    tipo: 'VISUALIZACION',
    fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
    usuario: { id: 'ext-001', nombre: 'Auditor Externo - Deloitte', rol: 'Auditor', email: 'auditor@deloitte.com', ip: '200.73.45.123' },
    descripcion: 'Acceso de auditoría externa',
    nivelRiesgo: 'medio',
    requiereAtencion: false,
    dispositivo: 'Desktop Firefox',
    ubicacion: 'Santiago, Chile'
  },
  {
    id: 'ev-010',
    tipo: 'DESCARGA',
    fecha: new Date(Date.now() - 1 * 60 * 60 * 1000),
    usuario: { id: 'ext-001', nombre: 'Auditor Externo - Deloitte', rol: 'Auditor', email: 'auditor@deloitte.com' },
    descripcion: 'Descarga de documentación para auditoría',
    documentoId: 'doc-005',
    nivelRiesgo: 'medio',
    requiereAtencion: false
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getAccionInfo = (tipo: TipoAccion) => {
  const info: Record<TipoAccion, { icon: React.ReactNode; color: string; label: string }> = {
    CREACION: { icon: <FileText className="w-4 h-4" />, color: 'bg-green-100 text-green-600', label: 'Creación' },
    EDICION: { icon: <Edit className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600', label: 'Edición' },
    APROBACION: { icon: <Check className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-600', label: 'Aprobación' },
    RECHAZO: { icon: <X className="w-4 h-4" />, color: 'bg-red-100 text-red-600', label: 'Rechazo' },
    FIRMA: { icon: <PenTool className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600', label: 'Firma' },
    ENVIO_EMAIL: { icon: <Mail className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-600', label: 'Email' },
    ENVIO_WHATSAPP: { icon: <MessageSquare className="w-4 h-4" />, color: 'bg-green-100 text-green-600', label: 'WhatsApp' },
    SUBIDA_DOCUMENTO: { icon: <Upload className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-600', label: 'Subida' },
    DESCARGA: { icon: <Download className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600', label: 'Descarga' },
    VISUALIZACION: { icon: <Eye className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', label: 'Visualización' },
    IMPRESION: { icon: <Printer className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', label: 'Impresión' },
    CAMBIO_ESTADO: { icon: <RefreshCw className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600', label: 'Cambio Estado' },
    CAMBIO_DESCUENTO: { icon: <DollarSign className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600', label: 'Descuento' },
    CAMBIO_PRECIO: { icon: <DollarSign className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600', label: 'Precio' },
    COMENTARIO: { icon: <MessageSquare className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', label: 'Comentario' },
    ALERTA: { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-100 text-red-600', label: 'Alerta' },
    VERSIONADO: { icon: <GitBranch className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600', label: 'Versión' },
    ELIMINACION: { icon: <Trash2 className="w-4 h-4" />, color: 'bg-red-100 text-red-600', label: 'Eliminación' },
    RESTAURACION: { icon: <RefreshCw className="w-4 h-4" />, color: 'bg-green-100 text-green-600', label: 'Restauración' },
    CAMBIO_PERMISO: { icon: <Shield className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600', label: 'Permiso' },
    ACCESO_AUDITORIA: { icon: <Shield className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600', label: 'Auditoría' }
  };
  return info[tipo] || info.VISUALIZACION;
};

const getRiesgoColor = (nivel: NivelRiesgo) => {
  switch (nivel) {
    case 'bajo': return 'bg-green-100 text-green-700';
    case 'medio': return 'bg-amber-100 text-amber-700';
    case 'alto': return 'bg-orange-100 text-orange-700';
    case 'critico': return 'bg-red-100 text-red-700';
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatFecha = (date: Date) => {
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AuditTimeline({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contratoId,
  numeroContrato = 'CTR-2025-001'
}: {
  contratoId: string;
  numeroContrato?: string;
}) {
  const [eventos] = useState<EventoAuditoria[]>(mockEventos);
  const [filtroTipo, setFiltroTipo] = useState<TipoAccion | 'TODOS'>('TODOS');
  const [filtroRiesgo, setFiltroRiesgo] = useState<NivelRiesgo | 'TODOS'>('TODOS');
  const [expandido, setExpandido] = useState<string | null>(null);

  const eventosFiltrados = eventos.filter(ev => {
    if (filtroTipo !== 'TODOS' && ev.tipo !== filtroTipo) return false;
    if (filtroRiesgo !== 'TODOS' && ev.nivelRiesgo !== filtroRiesgo) return false;
    return true;
  }).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  // Agrupar por fecha
  const eventosPorFecha = eventosFiltrados.reduce((acc, ev) => {
    const fechaKey = ev.fecha.toLocaleDateString('es-CL');
    if (!acc[fechaKey]) acc[fechaKey] = [];
    acc[fechaKey].push(ev);
    return acc;
  }, {} as Record<string, EventoAuditoria[]>);

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Línea de Tiempo de Auditoría
              </h3>
              <p className="text-sm text-slate-500">
                {eventos.length} eventos registrados • {numeroContrato}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}>
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            <button className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}>
              <ExternalLink className="w-4 h-4" />
              Reporte Auditoría
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mt-4">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoAccion | 'TODOS')}
            className={`${neuro.input} px-4 py-2 text-sm`}
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="CREACION">Creación</option>
            <option value="EDICION">Edición</option>
            <option value="APROBACION">Aprobación</option>
            <option value="FIRMA">Firma</option>
            <option value="CAMBIO_DESCUENTO">Cambios de descuento</option>
            <option value="VISUALIZACION">Visualizaciones</option>
            <option value="DESCARGA">Descargas</option>
          </select>

          <select
            value={filtroRiesgo}
            onChange={(e) => setFiltroRiesgo(e.target.value as NivelRiesgo | 'TODOS')}
            className={`${neuro.input} px-4 py-2 text-sm`}
          >
            <option value="TODOS">Todos los niveles</option>
            <option value="bajo">🟢 Bajo riesgo</option>
            <option value="medio">🟡 Riesgo medio</option>
            <option value="alto">🟠 Alto riesgo</option>
            <option value="critico">🔴 Crítico</option>
          </select>

          {eventos.filter(e => e.requiereAtencion).length > 0 && (
            <span className={`${neuro.badge} bg-red-100 text-red-700`}>
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {eventos.filter(e => e.requiereAtencion).length} requieren atención
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {Object.entries(eventosPorFecha).map(([fecha, eventosDelDia]) => (
          <div key={fecha} className="mb-8">
            {/* Fecha header */}
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">{fecha}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Eventos del día */}
            <div className="relative pl-8">
              {/* Línea vertical */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />

              {eventosDelDia.map((evento, idx) => {
                const accionInfo = getAccionInfo(evento.tipo);
                const isExpanded = expandido === evento.id;

                return (
                  <motion.div
                    key={evento.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative mb-4"
                  >
                    {/* Punto en la línea */}
                    <div className={`absolute left-[-20px] w-6 h-6 rounded-full ${accionInfo.color} flex items-center justify-center`}>
                      {accionInfo.icon}
                    </div>

                    {/* Tarjeta del evento */}
                    <div 
                      className={`${neuro.card} p-4 ml-4 cursor-pointer ${
                        evento.requiereAtencion ? 'ring-2 ring-red-300' : ''
                      }`}
                      onClick={() => setExpandido(isExpanded ? null : evento.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`${neuro.badge} ${accionInfo.color}`}>
                              {accionInfo.label}
                            </span>
                            <span className={`${neuro.badge} ${getRiesgoColor(evento.nivelRiesgo)}`}>
                              {evento.nivelRiesgo}
                            </span>
                            {evento.requiereAtencion && (
                              <span className={`${neuro.badge} bg-red-100 text-red-700`}>
                                ⚠️ Requiere atención
                              </span>
                            )}
                          </div>

                          <p className="font-semibold text-slate-800 mt-2">
                            {evento.descripcion}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {evento.usuario.nombre}
                            </span>
                            <span>{evento.usuario.rol}</span>
                            <span>{evento.fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Cambios de valor */}
                      {evento.valorAnterior && evento.valorNuevo && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                          <span className="text-red-500 line-through">{evento.valorAnterior}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <span className="text-green-600 font-semibold">{evento.valorNuevo}</span>
                        </div>
                      )}

                      {/* Detalles expandidos */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-slate-100 overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Email</p>
                                <p className="font-medium">{evento.usuario.email}</p>
                              </div>
                              {evento.usuario.ip && (
                                <div>
                                  <p className="text-slate-500">IP</p>
                                  <p className="font-mono text-xs">{evento.usuario.ip}</p>
                                </div>
                              )}
                              {evento.dispositivo && (
                                <div>
                                  <p className="text-slate-500">Dispositivo</p>
                                  <p className="font-medium">{evento.dispositivo}</p>
                                </div>
                              )}
                              {evento.ubicacion && (
                                <div>
                                  <p className="text-slate-500">Ubicación</p>
                                  <p className="font-medium">{evento.ubicacion}</p>
                                </div>
                              )}
                              {evento.seccion && (
                                <div>
                                  <p className="text-slate-500">Sección</p>
                                  <p className="font-medium">{evento.seccion}</p>
                                </div>
                              )}
                              {evento.campoAfectado && (
                                <div>
                                  <p className="text-slate-500">Campo afectado</p>
                                  <p className="font-mono text-xs">{evento.campoAfectado}</p>
                                </div>
                              )}
                            </div>

                            {evento.detalleJson && (
                              <div className="mt-4">
                                <p className="text-slate-500 text-sm mb-2">Datos adicionales</p>
                                <pre className="bg-slate-800 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                                  {JSON.stringify(evento.detalleJson, null, 2)}
                                </pre>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {eventosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay eventos que mostrar</p>
          </div>
        )}
      </div>

      {/* Footer con resumen */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/50">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-6">
            <span><strong>{eventos.length}</strong> eventos totales</span>
            <span><strong>{eventos.filter(e => e.tipo === 'APROBACION').length}</strong> aprobaciones</span>
            <span><strong>{eventos.filter(e => e.nivelRiesgo === 'alto' || e.nivelRiesgo === 'critico').length}</strong> alto riesgo</span>
          </div>
          <p className="text-xs text-slate-400">
            Última actualización: {new Date().toLocaleString('es-CL')}
          </p>
        </div>
      </div>
    </div>
  );
}
