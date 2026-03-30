/**
 * 💰 SILEXAR PULSE - Dashboard Facturación TIER 0
 * 
 * @description Dashboard completo de facturación con:
 * - KPIs en tiempo real
 * - Estado de cartera
 * - Facturas pendientes y vencidas
 * - Predicciones de cobro
 * - Acciones de cobranza
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Send,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Users,
  BarChart3,
  ArrowRight,
  Eye,
  Phone,
  Mail,
  Sparkles,
  ChevronRight,
  XCircle,
  Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface FacturaResumen {
  id: string;
  folio: string;
  clienteNombre: string;
  clienteRut: string;
  montoTotal: number;
  montoPendiente: number;
  fechaVencimiento: Date;
  diasMora: number;
  estado: string;
  probabilidadPago: number;
  riesgo: 'bajo' | 'medio' | 'alto' | 'critico';
}

interface KPI {
  label: string;
  valor: string;
  cambio?: number;
  icono: React.ReactNode;
  color: string;
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
  `,
  btnSuccess: `
    bg-gradient-to-br from-green-500 to-emerald-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const generarFacturasMock = (): FacturaResumen[] => [
  {
    id: 'f-1',
    folio: 'FAC-2025-001234',
    clienteNombre: 'Banco Chile',
    clienteRut: '97.004.000-5',
    montoTotal: 82450000,
    montoPendiente: 82450000,
    fechaVencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    diasMora: -5,
    estado: 'EMITIDA',
    probabilidadPago: 92,
    riesgo: 'bajo'
  },
  {
    id: 'f-2',
    folio: 'FAC-2025-001235',
    clienteNombre: 'Falabella',
    clienteRut: '90.749.000-9',
    montoTotal: 45800000,
    montoPendiente: 45800000,
    fechaVencimiento: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    diasMora: 8,
    estado: 'VENCIDA',
    probabilidadPago: 78,
    riesgo: 'medio'
  },
  {
    id: 'f-3',
    folio: 'FAC-2025-001236',
    clienteNombre: 'Cencosud',
    clienteRut: '93.834.000-5',
    montoTotal: 120000000,
    montoPendiente: 60000000,
    fechaVencimiento: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    diasMora: 25,
    estado: 'PAGADA_PARCIAL',
    probabilidadPago: 65,
    riesgo: 'alto'
  },
  {
    id: 'f-4',
    folio: 'FAC-2025-001237',
    clienteNombre: 'Ripley',
    clienteRut: '96.632.000-K',
    montoTotal: 38500000,
    montoPendiente: 38500000,
    fechaVencimiento: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    diasMora: 45,
    estado: 'EN_COBRANZA',
    probabilidadPago: 42,
    riesgo: 'critico'
  },
  {
    id: 'f-5',
    folio: 'FAC-2025-001238',
    clienteNombre: 'Paris',
    clienteRut: '93.458.000-1',
    montoTotal: 55200000,
    montoPendiente: 0,
    fechaVencimiento: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    diasMora: 0,
    estado: 'PAGADA_TOTAL',
    probabilidadPago: 100,
    riesgo: 'bajo'
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
};

const formatFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
};

const getEstadoConfig = (estado: string) => {
  const configs: Record<string, { label: string; color: string; bgColor: string }> = {
    'EMITIDA': { label: 'Emitida', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    'ENVIADA_CLIENTE': { label: 'Enviada', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    'PAGADA_PARCIAL': { label: 'Pago Parcial', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    'PAGADA_TOTAL': { label: 'Pagada', color: 'text-green-600', bgColor: 'bg-green-100' },
    'VENCIDA': { label: 'Vencida', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    'EN_COBRANZA': { label: 'En Cobranza', color: 'text-red-600', bgColor: 'bg-red-100' }
  };
  return configs[estado] || { label: estado, color: 'text-slate-600', bgColor: 'bg-slate-100' };
};

const getRiesgoConfig = (riesgo: FacturaResumen['riesgo']) => {
  const configs = {
    bajo: { color: 'text-green-600', bgColor: 'bg-green-100', ring: 'ring-green-500' },
    medio: { color: 'text-amber-600', bgColor: 'bg-amber-100', ring: 'ring-amber-500' },
    alto: { color: 'text-orange-600', bgColor: 'bg-orange-100', ring: 'ring-orange-500' },
    critico: { color: 'text-red-600', bgColor: 'bg-red-100', ring: 'ring-red-500' }
  };
  return configs[riesgo];
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function FacturacionDashboardPage() {
  const [facturas] = useState<FacturaResumen[]>(generarFacturasMock());
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<FacturaResumen | null>(null);

  // Calcular KPIs
  const kpis = useMemo((): KPI[] => {
    const pendientes = facturas.filter(f => f.montoPendiente > 0);
    const vencidas = facturas.filter(f => f.diasMora > 0);
    const totalPendiente = pendientes.reduce((acc, f) => acc + f.montoPendiente, 0);
    const totalVencido = vencidas.reduce((acc, f) => acc + f.montoPendiente, 0);
    
    return [
      {
        label: 'Cartera Total',
        valor: formatCurrency(totalPendiente),
        cambio: 12.5,
        icono: <DollarSign className="w-6 h-6" />,
        color: 'from-blue-500 to-indigo-600'
      },
      {
        label: 'Por Vencer (7 días)',
        valor: formatCurrency(pendientes.filter(f => f.diasMora > -7 && f.diasMora <= 0).reduce((acc, f) => acc + f.montoPendiente, 0)),
        icono: <Clock className="w-6 h-6" />,
        color: 'from-amber-500 to-orange-600'
      },
      {
        label: 'Cartera Vencida',
        valor: formatCurrency(totalVencido),
        cambio: -8.2,
        icono: <AlertTriangle className="w-6 h-6" />,
        color: 'from-red-500 to-pink-600'
      },
      {
        label: 'Cobrado este Mes',
        valor: formatCurrency(55200000),
        cambio: 23.1,
        icono: <CheckCircle className="w-6 h-6" />,
        color: 'from-green-500 to-emerald-600'
      }
    ];
  }, [facturas]);

  // Facturas filtradas
  const facturasFiltradas = useMemo(() => {
    if (filtroEstado === 'todos') return facturas;
    if (filtroEstado === 'vencidas') return facturas.filter(f => f.diasMora > 0);
    if (filtroEstado === 'porVencer') return facturas.filter(f => f.diasMora <= 0 && f.diasMora > -7);
    if (filtroEstado === 'pagadas') return facturas.filter(f => f.estado === 'PAGADA_TOTAL');
    return facturas.filter(f => f.estado === filtroEstado);
  }, [facturas, filtroEstado]);

  // Distribución de cartera
  const distribucion = useMemo(() => {
    const total = facturas.reduce((acc, f) => acc + f.montoPendiente, 0);
    const ranges = [
      { label: 'Vigente', color: 'bg-green-500', monto: facturas.filter(f => f.diasMora <= 0).reduce((acc, f) => acc + f.montoPendiente, 0) },
      { label: '1-30 días', color: 'bg-amber-500', monto: facturas.filter(f => f.diasMora > 0 && f.diasMora <= 30).reduce((acc, f) => acc + f.montoPendiente, 0) },
      { label: '31-60 días', color: 'bg-orange-500', monto: facturas.filter(f => f.diasMora > 30 && f.diasMora <= 60).reduce((acc, f) => acc + f.montoPendiente, 0) },
      { label: '60+ días', color: 'bg-red-500', monto: facturas.filter(f => f.diasMora > 60).reduce((acc, f) => acc + f.montoPendiente, 0) }
    ];
    return ranges.map(r => ({ ...r, porcentaje: total > 0 ? (r.monto / total) * 100 : 0 }));
  }, [facturas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Centro de Facturación</h1>
                <p className="text-slate-500">Gestión inteligente de cobros y cartera</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className={`${neuro.btnSecondary} px-4 py-2 flex items-center gap-2`}>
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button className={`${neuro.btnSecondary} p-2`}>
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}>
                <FileText className="w-5 h-5" />
                Nueva Factura
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={neuro.card}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} text-white`}>
                    {kpi.icono}
                  </div>
                  {kpi.cambio && (
                    <div className={`flex items-center gap-1 text-sm ${kpi.cambio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.cambio > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(kpi.cambio)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800">{kpi.valor}</p>
                <p className="text-sm text-slate-500">{kpi.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Lista de Facturas */}
          <div className={`${neuro.panel} p-6 col-span-2`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Facturas</h2>
              <div className="flex items-center gap-2">
                <select
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value)}
                  className={`${neuro.btnSecondary} px-3 py-2 text-sm`}
                >
                  <option value="todos">Todas</option>
                  <option value="vencidas">Vencidas</option>
                  <option value="porVencer">Por vencer</option>
                  <option value="pagadas">Pagadas</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {facturasFiltradas.map(factura => {
                const estadoConfig = getEstadoConfig(factura.estado);
                const riesgoConfig = getRiesgoConfig(factura.riesgo);
                
                return (
                  <motion.div
                    key={factura.id}
                    onClick={() => setFacturaSeleccionada(factura)}
                    className={`${neuro.card} p-4 cursor-pointer hover:shadow-lg transition-all ${
                      facturaSeleccionada?.id === factura.id ? 'ring-2 ring-indigo-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${
                          factura.diasMora > 30 ? 'bg-red-500' :
                          factura.diasMora > 0 ? 'bg-amber-500' :
                          factura.estado === 'PAGADA_TOTAL' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800">{factura.folio}</p>
                            <span className={`${neuro.badge} ${estadoConfig.bgColor} ${estadoConfig.color}`}>
                              {estadoConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{factura.clienteNombre}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Predicción IA */}
                        {factura.montoPendiente > 0 && (
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <Sparkles className={`w-4 h-4 ${riesgoConfig.color}`} />
                              <span className={`font-bold ${riesgoConfig.color}`}>
                                {factura.probabilidadPago}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">Prob. cobro</p>
                          </div>
                        )}

                        {/* Días mora */}
                        <div className="text-center">
                          <p className={`font-bold ${
                            factura.diasMora > 30 ? 'text-red-600' :
                            factura.diasMora > 0 ? 'text-amber-600' :
                            factura.diasMora < 0 ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {factura.diasMora > 0 ? `+${factura.diasMora}` : factura.diasMora}
                          </p>
                          <p className="text-xs text-slate-400">
                            {factura.diasMora > 0 ? 'días mora' : factura.diasMora < 0 ? 'días para vencer' : 'al día'}
                          </p>
                        </div>

                        {/* Monto */}
                        <div className="text-right min-w-28">
                          <p className="font-bold text-slate-800">{formatCurrency(factura.montoPendiente)}</p>
                          {factura.montoPendiente !== factura.montoTotal && (
                            <p className="text-xs text-slate-400">de {formatCurrency(factura.montoTotal)}</p>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Distribución de Cartera */}
            <div className={`${neuro.panel} p-6`}>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Antigüedad de Cartera
              </h3>

              <div className="space-y-3">
                {distribucion.map((d, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{d.label}</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(d.monto)}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.color}`}
                        style={{ width: `${d.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className={`${neuro.panel} p-6`}>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Acciones Rápidas
              </h3>

              <div className="space-y-2">
                <button className={`${neuro.card} w-full p-3 flex items-center gap-3 hover:ring-2 hover:ring-indigo-400 transition-all`}>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Send className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm text-slate-800">Enviar recordatorios</p>
                    <p className="text-xs text-slate-500">3 facturas por vencer</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button className={`${neuro.card} w-full p-3 flex items-center gap-3 hover:ring-2 hover:ring-indigo-400 transition-all`}>
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Phone className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm text-slate-800">Ejecutar cobranza</p>
                    <p className="text-xs text-slate-500">2 facturas vencidas</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button className={`${neuro.card} w-full p-3 flex items-center gap-3 hover:ring-2 hover:ring-indigo-400 transition-all`}>
                  <div className="p-2 rounded-lg bg-green-100">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm text-slate-800">Conciliar pagos</p>
                    <p className="text-xs text-slate-500">5 movimientos sin conciliar</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Predicción IA */}
            <div className={`${neuro.panel} p-6 bg-gradient-to-br from-indigo-50 to-purple-50`}>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Predicción Cortex-Flow
              </h3>

              <div className="space-y-4">
                <div className={neuro.card}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Recuperación 30 días</span>
                      <span className="font-bold text-green-600">{formatCurrency(98500000)}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '72%' }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">72% de la cartera pendiente</p>
                  </div>
                </div>

                <div className="text-sm text-slate-600">
                  <p className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    85% de clientes pagará a tiempo
                  </p>
                  <p className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    2 clientes en riesgo alto
                  </p>
                  <p className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    $38.5M requiere acción urgente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
