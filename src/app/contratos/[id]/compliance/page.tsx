/**
 * 📊 SILEXAR PULSE - Compliance Dashboard TIER 0
 * 
 * @description Dashboard de cumplimiento normativo para auditorías
 * externas. Muestra estado de compliance, riesgos y validaciones.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Users,
  DollarSign,
  Lock,
  Eye,
  Download,
  Scale,
  Fingerprint,
  Award,
  AlertCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type EstadoCompliance = 'cumple' | 'parcial' | 'no_cumple' | 'pendiente' | 'no_aplica';

interface ControlCompliance {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  estado: EstadoCompliance;
  criticidad: 'baja' | 'media' | 'alta' | 'critica';
  fechaUltimaVerificacion?: Date;
  evidencia?: string;
  observaciones?: string;
  responsable?: string;
}

interface MetricaRiesgo {
  categoria: string;
  valor: number;
  limite: number;
  estado: 'ok' | 'warning' | 'danger';
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

const mockControles: ControlCompliance[] = [
  // APROBACIONES
  {
    id: 'ctrl-001',
    categoria: 'Aprobaciones',
    nombre: 'Cadena de aprobación completa',
    descripcion: 'Todas las aprobaciones requeridas según el monto del contrato fueron obtenidas',
    estado: 'cumple',
    criticidad: 'critica',
    fechaUltimaVerificacion: new Date(),
    evidencia: 'ev-aprobaciones.pdf',
    responsable: 'Ana García'
  },
  {
    id: 'ctrl-002',
    categoria: 'Aprobaciones',
    nombre: 'Descuentos dentro de límite',
    descripcion: 'Descuento aplicado está dentro del límite autorizado para el rol aprobador',
    estado: 'cumple',
    criticidad: 'alta',
    evidencia: 'politica-descuentos.pdf'
  },
  {
    id: 'ctrl-003',
    categoria: 'Aprobaciones',
    nombre: 'Tiempo de respuesta SLA',
    descripcion: 'Aprobaciones realizadas dentro del tiempo máximo establecido (48h)',
    estado: 'cumple',
    criticidad: 'media'
  },
  // DOCUMENTACIÓN
  {
    id: 'ctrl-004',
    categoria: 'Documentación',
    nombre: 'Orden de compra adjunta',
    descripcion: 'OC del cliente debidamente adjunta y validada',
    estado: 'cumple',
    criticidad: 'critica',
    evidencia: 'OC-45678.pdf'
  },
  {
    id: 'ctrl-005',
    categoria: 'Documentación',
    nombre: 'Contrato firmado',
    descripcion: 'Contrato firmado por representantes legales de ambas partes',
    estado: 'cumple',
    criticidad: 'critica',
    evidencia: 'contrato-firmado.pdf'
  },
  {
    id: 'ctrl-006',
    categoria: 'Documentación',
    nombre: 'Información tributaria cliente',
    descripcion: 'RUT, razón social y datos tributarios validados',
    estado: 'cumple',
    criticidad: 'alta'
  },
  // COMERCIAL
  {
    id: 'ctrl-007',
    categoria: 'Comercial',
    nombre: 'Precios según tarifa vigente',
    descripcion: 'Valores aplicados corresponden a la tarifa oficial vigente',
    estado: 'cumple',
    criticidad: 'alta'
  },
  {
    id: 'ctrl-008',
    categoria: 'Comercial',
    nombre: 'Condiciones de pago aprobadas',
    descripcion: 'Términos de pago están dentro de la política comercial',
    estado: 'cumple',
    criticidad: 'media'
  },
  // SEGREGACIÓN DE FUNCIONES
  {
    id: 'ctrl-009',
    categoria: 'Segregación de funciones',
    nombre: 'Creador ≠ Aprobador',
    descripcion: 'El usuario que creó el contrato es diferente a quien lo aprobó',
    estado: 'cumple',
    criticidad: 'critica'
  },
  {
    id: 'ctrl-010',
    categoria: 'Segregación de funciones',
    nombre: 'Múltiples niveles de aprobación',
    descripcion: 'El contrato pasó por todos los niveles de aprobación requeridos',
    estado: 'cumple',
    criticidad: 'alta'
  },
  // LEGAL
  {
    id: 'ctrl-011',
    categoria: 'Legal',
    nombre: 'Cláusulas obligatorias presentes',
    descripcion: 'Todas las cláusulas legales obligatorias están incluidas',
    estado: 'cumple',
    criticidad: 'critica'
  },
  {
    id: 'ctrl-012',
    categoria: 'Legal',
    nombre: 'Vigencia dentro de parámetros',
    descripcion: 'La duración del contrato está dentro de los límites permitidos',
    estado: 'cumple',
    criticidad: 'media'
  },
  // AUDITORÍA
  {
    id: 'ctrl-013',
    categoria: 'Auditoría',
    nombre: 'Trazabilidad completa',
    descripcion: 'Todos los cambios tienen registro de auditoría con usuario, fecha e IP',
    estado: 'cumple',
    criticidad: 'critica'
  },
  {
    id: 'ctrl-014',
    categoria: 'Auditoría',
    nombre: 'Sin modificaciones post-firma',
    descripcion: 'No existen cambios materiales después de la firma del contrato',
    estado: 'cumple',
    criticidad: 'critica'
  }
];

const mockMetricas: MetricaRiesgo[] = [
  { categoria: 'Descuento promedio', valor: 12.5, limite: 20, estado: 'ok' },
  { categoria: 'Días promedio aprobación', valor: 1.2, limite: 2, estado: 'ok' },
  { categoria: 'Contratos sin OC', valor: 0, limite: 5, estado: 'ok' },
  { categoria: 'Modificaciones post-firma', valor: 0, limite: 0, estado: 'ok' }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getEstadoInfo = (estado: EstadoCompliance) => {
  const info = {
    cumple: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600 bg-green-100', label: 'Cumple' },
    parcial: { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100', label: 'Parcial' },
    no_cumple: { icon: <XCircle className="w-5 h-5" />, color: 'text-red-600 bg-red-100', label: 'No cumple' },
    pendiente: { icon: <Clock className="w-5 h-5" />, color: 'text-slate-600 bg-slate-100', label: 'Pendiente' },
    no_aplica: { icon: <AlertCircle className="w-5 h-5" />, color: 'text-slate-400 bg-slate-50', label: 'N/A' }
  };
  return info[estado];
};

const getCriticidadColor = (crit: string) => {
  switch (crit) {
    case 'critica': return 'bg-red-100 text-red-700';
    case 'alta': return 'bg-orange-100 text-orange-700';
    case 'media': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ComplianceDashboard({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contratoId: _contratoId,
  numeroContrato = 'CTR-2025-001'
}: {
  contratoId: string;
  numeroContrato?: string;
}) {
  const [controles] = useState<ControlCompliance[]>(mockControles);
  const [metricas] = useState<MetricaRiesgo[]>(mockMetricas);
  const [categoriaExpanded, setCategoriaExpanded] = useState<string | null>(null);

  // Calcular score
  const totalControles = controles.length;
  const controlesCumplen = controles.filter(c => c.estado === 'cumple').length;
  const scoreCompliance = Math.round((controlesCumplen / totalControles) * 100);

  // Agrupar por categoría
  const controlesPorCategoria = controles.reduce((acc, ctrl) => {
    if (!acc[ctrl.categoria]) acc[ctrl.categoria] = [];
    acc[ctrl.categoria].push(ctrl);
    return acc;
  }, {} as Record<string, ControlCompliance[]>);

  const categoriaIcons: Record<string, React.ReactNode> = {
    'Aprobaciones': <Users className="w-5 h-5" />,
    'Documentación': <FileText className="w-5 h-5" />,
    'Comercial': <DollarSign className="w-5 h-5" />,
    'Segregación de funciones': <Lock className="w-5 h-5" />,
    'Legal': <Scale className="w-5 h-5" />,
    'Auditoría': <Fingerprint className="w-5 h-5" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Dashboard de Cumplimiento
                </h1>
                <p className="text-slate-500">
                  {numeroContrato} • Control interno y auditoría
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}>
                <Download className="w-4 h-4" />
                Exportar reporte
              </button>
              <button className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}>
                <ExternalLink className="w-4 h-4" />
                Informe auditoría
              </button>
            </div>
          </div>
        </div>

        {/* Score y métricas principales */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          {/* Score principal */}
          <div className={`${neuro.card} p-6 col-span-2`}>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="56"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64" cy="64" r="56"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${scoreCompliance * 3.52} 352`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{scoreCompliance}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-800">Score de Cumplimiento</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {controlesCumplen} de {totalControles} controles cumplen
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    Apto para auditoría externa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas de riesgo */}
          {metricas.map((metrica, idx) => (
            <div key={idx} className={`${neuro.card} p-4`}>
              <p className="text-xs text-slate-500 mb-2">{metrica.categoria}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-800">
                  {metrica.valor}
                  {metrica.categoria.includes('promedio') ? '%' : ''}
                </span>
                <span className={`${neuro.badge} ${
                  metrica.estado === 'ok' ? 'bg-green-100 text-green-700' :
                  metrica.estado === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {metrica.estado === 'ok' ? '✓' : '⚠'} / {metrica.limite}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    metrica.estado === 'ok' ? 'bg-green-500' :
                    metrica.estado === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((metrica.valor / metrica.limite) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Resumen por categoría */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {Object.entries(controlesPorCategoria).map(([cat, ctrls]) => {
            const cumple = ctrls.filter(c => c.estado === 'cumple').length;
            const total = ctrls.length;
            const allOk = cumple === total;

            return (
              <motion.div
                key={cat}
                whileHover={{ scale: 1.02 }}
                className={`${neuro.card} p-4 cursor-pointer ${
                  categoriaExpanded === cat ? 'ring-2 ring-indigo-400' : ''
                }`}
                onClick={() => setCategoriaExpanded(categoriaExpanded === cat ? null : cat)}
              >
                <div className={`p-2 rounded-xl w-fit mb-3 ${
                  allOk ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {categoriaIcons[cat] || <Shield className="w-5 h-5" />}
                </div>
                <p className="font-semibold text-slate-800 text-sm">{cat}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(cumple / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {cumple}/{total}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Lista de controles */}
        <div className={`${neuro.panel} p-6`}>
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Controles de Cumplimiento
            <span className={`${neuro.badge} bg-green-100 text-green-700`}>
              {controlesCumplen}/{totalControles} OK
            </span>
          </h3>

          <div className="space-y-3">
            {Object.entries(controlesPorCategoria).map(([categoria, ctrls]) => (
              <div key={categoria}>
                {/* Categoría header */}
                <div
                  className={`${neuro.card} p-4 cursor-pointer flex items-center justify-between`}
                  onClick={() => setCategoriaExpanded(categoriaExpanded === categoria ? null : categoria)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                      {categoriaIcons[categoria] || <Shield className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{categoria}</p>
                      <p className="text-xs text-slate-500">
                        {ctrls.filter(c => c.estado === 'cumple').length} de {ctrls.length} controles cumplen
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {ctrls.every(c => c.estado === 'cumple') ? (
                      <span className={`${neuro.badge} bg-green-100 text-green-700`}>
                        ✓ Completo
                      </span>
                    ) : (
                      <span className={`${neuro.badge} bg-amber-100 text-amber-700`}>
                        ⚠ Revisar
                      </span>
                    )}
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                      categoriaExpanded === categoria ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {/* Controles de la categoría */}
                {categoriaExpanded === categoria && (
                  <div className="ml-8 mt-2 space-y-2">
                    {ctrls.map(ctrl => {
                      const estadoInfo = getEstadoInfo(ctrl.estado);
                      
                      return (
                        <motion.div
                          key={ctrl.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`${neuro.card} p-4`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${estadoInfo.color}`}>
                                {estadoInfo.icon}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{ctrl.nombre}</p>
                                <p className="text-sm text-slate-500 mt-1">{ctrl.descripcion}</p>
                                
                                {ctrl.evidencia && (
                                  <a href="#" className="flex items-center gap-1 text-xs text-indigo-600 mt-2 hover:underline">
                                    <Eye className="w-3 h-3" />
                                    Ver evidencia: {ctrl.evidencia}
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`${neuro.badge} ${getCriticidadColor(ctrl.criticidad)}`}>
                                {ctrl.criticidad}
                              </span>
                              <span className={`${neuro.badge} ${estadoInfo.color}`}>
                                {estadoInfo.label}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer certificación */}
        <div className={`${neuro.card} p-6 mt-6 text-center`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Award className="w-8 h-8 text-green-600" />
            <h3 className="text-xl font-bold text-slate-800">
              Certificación de Cumplimiento
            </h3>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Este contrato cumple con todos los controles internos establecidos y está
            listo para revisión de auditoría externa. Última verificación: {new Date().toLocaleString('es-CL')}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button className={`${neuro.btnSecondary} px-6 py-2`}>
              <Download className="w-4 h-4 inline mr-2" />
              Descargar certificado
            </button>
            <button className={`${neuro.btnPrimary} px-6 py-2`}>
              <FileText className="w-4 h-4 inline mr-2" />
              Generar informe SOX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
