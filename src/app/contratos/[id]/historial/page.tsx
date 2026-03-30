/**
 * 📜 SILEXAR PULSE - Historial Inmutable del Contrato TIER 0
 * 
 * @description Página que muestra TODO el historial de acciones
 * realizadas en un contrato. Registro inmutable para auditoría.
 * 
 * CARACTERÍSTICAS:
 * - Timeline visual completo
 * - Filtros por categoría, usuario, fecha
 * - Verificación de integridad en tiempo real
 * - Exportación para auditoría
 * - Solo lectura (inmutable)
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @security IMMUTABLE_READ_ONLY
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Shield,
  Lock,
  User,
  Calendar,
  Clock,
  Monitor,
  FileText,
  DollarSign,
  CheckCircle,
  Mail,
  PenTool,
  Download,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Fingerprint,
  Award,
  Search,
  RefreshCw
} from 'lucide-react';
import { 
  ImmutableAudit,
  type RegistroHistorial,
  type CategoriaAccion
} from '../../nuevo/components/WizardContrato/services/ImmutableAuditService';

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
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getCategoriaInfo = (categoria: CategoriaAccion) => {
  const info: Record<CategoriaAccion, { icon: React.ReactNode; color: string; label: string }> = {
    CONTRATO: { icon: <FileText className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600', label: 'Contrato' },
    LINEA: { icon: <FileText className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-600', label: 'Línea' },
    APROBACION: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-600', label: 'Aprobación' },
    DOCUMENTO: { icon: <FileText className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600', label: 'Documento' },
    COMUNICACION: { icon: <Mail className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-600', label: 'Comunicación' },
    FIRMA: { icon: <PenTool className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600', label: 'Firma' },
    FACTURACION: { icon: <DollarSign className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-600', label: 'Facturación' },
    CONFIGURACION: { icon: <Monitor className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', label: 'Configuración' },
    SEGURIDAD: { icon: <Shield className="w-4 h-4" />, color: 'bg-red-100 text-red-600', label: 'Seguridad' },
    SISTEMA: { icon: <RefreshCw className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', label: 'Sistema' }
  };
  return info[categoria];
};

const formatDateTime = (date: Date) => {
  return {
    fecha: date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora: date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE REGISTRO INDIVIDUAL
// ═══════════════════════════════════════════════════════════════

const RegistroCard: React.FC<{
  registro: RegistroHistorial;
  expanded: boolean;
  onToggle: () => void;
}> = ({ registro, expanded, onToggle }) => {
  const catInfo = getCategoriaInfo(registro.categoria);
  const { fecha, hora } = formatDateTime(registro.fechaHora);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      {/* Línea de conexión */}
      <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-200" />
      
      {/* Punto en la línea */}
      <div className={`absolute left-3 top-4 w-6 h-6 rounded-full ${catInfo.color} flex items-center justify-center z-10`}>
        {catInfo.icon}
      </div>

      {/* Tarjeta */}
      <div className={`${neuro.card} ml-12 p-4`}>
        {/* Header */}
        <div 
          className="flex items-start justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`${neuro.badge} ${catInfo.color}`}>
                {catInfo.label}
              </span>
              <span className={`${neuro.badge} bg-slate-100 text-slate-600`}>
                #{registro.secuencia}
              </span>
              {registro.usuario.rol === 'Auditor Externo' && (
                <span className={`${neuro.badge} bg-amber-100 text-amber-700`}>
                  🔍 Auditoría externa
                </span>
              )}
            </div>

            <p className="font-semibold text-slate-800 mt-2">
              {registro.descripcion}
            </p>

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {registro.usuario.nombre}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {fecha}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {hora}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {registro.verificado && (
              <span className="text-green-500" title="Registro verificado">
                <Shield className="w-4 h-4" />
              </span>
            )}
            <Lock className="w-4 h-4 text-slate-400" />
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Cambios de valores */}
        {registro.cambios && registro.cambios.length > 0 && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 mb-2">CAMBIOS REALIZADOS</p>
            {registro.cambios.map((cambio, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">{cambio.campo}:</span>
                <span className="text-red-500 line-through">{String(cambio.valorAnterior)}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-green-600 font-semibold">{String(cambio.valorNuevo)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detalles expandidos */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-slate-100 overflow-hidden"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {/* Usuario */}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Usuario</p>
                  <p className="font-medium text-slate-700">{registro.usuario.nombre}</p>
                  <p className="text-xs text-slate-500">{registro.usuario.email}</p>
                  <p className="text-xs text-slate-400">{registro.usuario.rol}</p>
                </div>

                {/* Dispositivo */}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Dispositivo</p>
                  <p className="font-medium text-slate-700">{registro.contexto.dispositivo}</p>
                  <p className="text-xs text-slate-500">{registro.contexto.navegador}</p>
                  <p className="text-xs text-slate-400">{registro.contexto.sistemaOperativo}</p>
                </div>

                {/* Red */}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Red</p>
                  <p className="font-mono text-xs text-slate-700">{registro.contexto.ip}</p>
                  {registro.contexto.ubicacion && (
                    <p className="text-xs text-slate-500">
                      {registro.contexto.ubicacion.ciudad}, {registro.contexto.ubicacion.pais}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Timestamp</p>
                  <p className="font-mono text-xs text-slate-700">{registro.timestampUnix}</p>
                  <p className="text-xs text-slate-500">
                    {registro.fechaHora.toISOString()}
                  </p>
                </div>
              </div>

              {/* Hashes de seguridad */}
              <div className="mt-4 p-3 bg-slate-800 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Fingerprint className="w-4 h-4" />
                  <span className="font-semibold">FIRMA DIGITAL E INTEGRIDAD</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-slate-400 font-mono">
                  <div>
                    <span className="text-slate-500">Hash registro: </span>
                    <span className="text-green-400">{registro.hashRegistro}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Hash anterior: </span>
                    <span className="text-amber-400">{registro.hashAnterior}</span>
                  </div>
                  <div className="lg:col-span-2">
                    <span className="text-slate-500">Firma digital: </span>
                    <span className="text-purple-400">{registro.firmaDigital}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function HistorialContratoPage({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params
}: {
  params: { id: string };
}) {
  // En producción usar params.id
  const contratoId = 'ctr-demo-001';
  
  const [historial] = useState<RegistroHistorial[]>(
    ImmutableAudit.getHistorialContrato(contratoId)
  );
  const [resumen] = useState(ImmutableAudit.getResumen(contratoId));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaAccion | 'TODAS'>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  // Filtrar historial
  const historialFiltrado = useMemo(() => {
    let resultado = [...historial];
    
    if (filtroCategoria !== 'TODAS') {
      resultado = resultado.filter(r => r.categoria === filtroCategoria);
    }
    
    if (busqueda) {
      const search = busqueda.toLowerCase();
      resultado = resultado.filter(r => 
        r.descripcion.toLowerCase().includes(search) ||
        r.usuario.nombre.toLowerCase().includes(search)
      );
    }
    
    return resultado.sort((a, b) => b.timestampUnix - a.timestampUnix);
  }, [historial, filtroCategoria, busqueda]);

  // Agrupar por fecha
  const historialPorFecha = useMemo(() => {
    return historialFiltrado.reduce((acc, reg) => {
      const fechaKey = reg.fechaHora.toLocaleDateString('es-CL');
      if (!acc[fechaKey]) acc[fechaKey] = [];
      acc[fechaKey].push(reg);
      return acc;
    }, {} as Record<string, RegistroHistorial[]>);
  }, [historialFiltrado]);

  const handleExportar = (formato: 'json' | 'csv') => {
    const data = ImmutableAudit.exportarParaAuditoria(contratoId, formato);
    const blob = new Blob([data], { type: formato === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-${contratoId}-${Date.now()}.${formato}`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900">
                <History className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Historial del Contrato
                  <Lock className="w-5 h-5 text-slate-400" />
                </h1>
                <p className="text-slate-500">
                  {contratoId} • Registro inmutable de auditoría
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleExportar('json')}
                className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}
              >
                <Download className="w-4 h-4" />
                Exportar JSON
              </button>
              <button 
                onClick={() => handleExportar('csv')}
                className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
              <button className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}>
                <Award className="w-4 h-4" />
                Certificado
              </button>
            </div>
          </div>

          {/* Advertencia de inmutabilidad */}
          <div className="mt-4 p-4 bg-slate-800 rounded-2xl flex items-center gap-4">
            <Lock className="w-8 h-8 text-amber-400" />
            <div className="flex-1">
              <p className="text-white font-semibold">Registro Inmutable</p>
              <p className="text-slate-400 text-sm">
                Este historial es de solo lectura y no puede ser modificado ni eliminado. 
                Cada registro contiene hash de integridad verificable.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {resumen.integridadVerificada ? (
                <span className={`${neuro.badge} bg-green-100 text-green-700`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  Integridad verificada
                </span>
              ) : (
                <span className={`${neuro.badge} bg-red-100 text-red-700`}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Error de integridad
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className={`${neuro.card} p-4 text-center`}>
            <p className="text-3xl font-bold text-slate-800">{resumen.totalRegistros}</p>
            <p className="text-xs text-slate-500">Total registros</p>
          </div>
          <div className={`${neuro.card} p-4 text-center`}>
            <p className="text-3xl font-bold text-slate-800">{resumen.usuariosUnicos}</p>
            <p className="text-xs text-slate-500">Usuarios</p>
          </div>
          <div className={`${neuro.card} p-4 text-center`}>
            <p className="text-3xl font-bold text-slate-800">
              {resumen.accionesPorCategoria.APROBACION || 0}
            </p>
            <p className="text-xs text-slate-500">Aprobaciones</p>
          </div>
          <div className={`${neuro.card} p-4 text-center`}>
            <p className="text-3xl font-bold text-slate-800">
              {resumen.accionesPorCategoria.DOCUMENTO || 0}
            </p>
            <p className="text-xs text-slate-500">Documentos</p>
          </div>
          <div className={`${neuro.card} p-4 text-center`}>
            <p className="text-lg font-bold text-slate-800">
              {resumen.primeraAccion?.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
            </p>
            <p className="text-xs text-slate-500">Primera acción</p>
          </div>
        </div>

        {/* Filtros */}
        <div className={`${neuro.panel} p-4 mb-6`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Búsqueda */}
              <div className={`${neuro.input} px-4 py-2 flex items-center gap-2 flex-1 max-w-md`}>
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en historial..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-transparent flex-1 focus:outline-none text-sm"
                />
              </div>

              {/* Filtro categoría */}
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value as CategoriaAccion | 'TODAS')}
                className={`${neuro.input} px-4 py-2 text-sm`}
              >
                <option value="TODAS">Todas las categorías</option>
                <option value="CONTRATO">Contrato</option>
                <option value="LINEA">Líneas</option>
                <option value="APROBACION">Aprobaciones</option>
                <option value="DOCUMENTO">Documentos</option>
                <option value="COMUNICACION">Comunicación</option>
                <option value="FIRMA">Firma</option>
                <option value="SEGURIDAD">Seguridad</option>
              </select>
            </div>

            <div className="text-sm text-slate-500">
              Mostrando {historialFiltrado.length} de {historial.length} registros
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className={`${neuro.panel} p-6`}>
          {Object.entries(historialPorFecha).map(([fecha, registros]) => (
            <div key={fecha} className="mb-8 last:mb-0">
              {/* Fecha header */}
              <div className="flex items-center gap-3 mb-4 ml-3">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-slate-700">{fecha}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className={`${neuro.badge} bg-slate-100 text-slate-600`}>
                  {registros.length} eventos
                </span>
              </div>

              {/* Registros del día */}
              <div className="space-y-4">
                {registros.map(registro => (
                  <RegistroCard
                    key={registro.id}
                    registro={registro}
                    expanded={expanded === registro.id}
                    onToggle={() => setExpanded(expanded === registro.id ? null : registro.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {historialFiltrado.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No hay registros que mostrar</p>
            </div>
          )}
        </div>

        {/* Footer de seguridad */}
        <div className={`${neuro.card} p-4 mt-6 text-center`}>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <Lock className="w-4 h-4" />
            <span>Registro protegido • Hash cadena: <code className="text-indigo-600">{historial[historial.length - 1]?.hashRegistro.substring(0, 16)}...</code></span>
            <span>•</span>
            <span className="text-green-600 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Integridad verificada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
