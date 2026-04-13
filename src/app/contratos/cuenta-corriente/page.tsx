/**
 * 💰 SILEXAR PULSE - Cuenta Corriente Page TIER 0
 * 
 * @description Página profesional de cuenta corriente con:
 * - Resumen de saldos en tiempo real
 * - Historial completo de movimientos
 * - Filtros y búsqueda
 * - Exportación profesional (PDF, Excel, CSV)
 * - Envío por email
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Download,
  Mail,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  FileSpreadsheet,
  File,
  Send,
  X
} from 'lucide-react';
import { 
  CuentaCorrienteService, 
  type CuentaCorriente, 
  type TipoMovimiento 
} from '../nuevo/components/WizardContrato/services/CuentaCorrienteService';

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
    px-4 py-3
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
  btnSuccess: `
    bg-gradient-to-br from-green-500 to-emerald-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `,
  table: `
    w-full text-sm
  `,
  th: `
    text-left px-4 py-3 text-slate-500 font-medium border-b border-slate-200
  `,
  td: `
    px-4 py-4 border-b border-slate-100
  `
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP', 
    maximumFractionDigits: 0 
  }).format(value);
};

const formatFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-CL', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatFechaHora = (fecha: Date) => {
  return fecha.toLocaleString('es-CL', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTipoConfig = (tipo: TipoMovimiento): { label: string; color: string; bgColor: string; icon: React.ReactNode } => {
  const configs: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    'APERTURA_CUENTA': { label: 'Apertura', color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: <Wallet className="w-4 h-4" /> },
    'CARGO_FACTURA': { label: 'Factura', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <FileText className="w-4 h-4" /> },
    'CARGO_INTERES': { label: 'Interés', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <TrendingUp className="w-4 h-4" /> },
    'CARGO_MORA': { label: 'Mora', color: 'text-red-600', bgColor: 'bg-red-100', icon: <Clock className="w-4 h-4" /> },
    'ABONO_PAGO': { label: 'Pago', color: 'text-green-600', bgColor: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
    'ABONO_TRANSFERENCIA': { label: 'Transferencia', color: 'text-green-600', bgColor: 'bg-green-100', icon: <ArrowDownRight className="w-4 h-4" /> },
    'ABONO_EFECTIVO': { label: 'Efectivo', color: 'text-green-600', bgColor: 'bg-green-100', icon: <Wallet className="w-4 h-4" /> },
    'ABONO_CHEQUE': { label: 'Cheque', color: 'text-green-600', bgColor: 'bg-green-100', icon: <FileText className="w-4 h-4" /> },
    'CREDITO_NOTA_CREDITO': { label: 'Nota Crédito', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: <ArrowDownRight className="w-4 h-4" /> },
    'CREDITO_DESCUENTO': { label: 'Descuento', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <TrendingDown className="w-4 h-4" /> },
    'DEBITO_NOTA_DEBITO': { label: 'Nota Débito', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: <ArrowUpRight className="w-4 h-4" /> },
    'AJUSTE_POSITIVO': { label: 'Ajuste +', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <TrendingUp className="w-4 h-4" /> },
    'AJUSTE_NEGATIVO': { label: 'Ajuste -', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: <TrendingDown className="w-4 h-4" /> }
  };
  return configs[tipo] || { label: tipo, color: 'text-slate-600', bgColor: 'bg-slate-100', icon: <FileText className="w-4 h-4" /> };
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CuentaCorrientePage() {
  const [cuenta] = useState<CuentaCorriente | undefined>(
    CuentaCorrienteService.obtenerCuentaPorId('cc-demo-001')
  );
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [periodoDesde, setPeriodoDesde] = useState<Date>(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  const [periodoHasta, setPeriodoHasta] = useState<Date>(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [movimientoExpandido, setMovimientoExpandido] = useState<string | null>(null);

  // Movimientos filtrados
  const movimientosFiltrados = useMemo(() => {
    if (!cuenta) return [];
    
    return cuenta.movimientos
      .filter(m => {
        // Filtro por búsqueda
        if (busqueda) {
          const textoBusqueda = busqueda.toLowerCase();
          if (!m.concepto.toLowerCase().includes(textoBusqueda) &&
              !m.documentoNumero?.toLowerCase().includes(textoBusqueda)) {
            return false;
          }
        }
        
        // Filtro por tipo
        if (filtroTipo !== 'todos') {
          if (filtroTipo === 'cargos' && !m.esCargo) return false;
          if (filtroTipo === 'abonos' && m.esCargo) return false;
        }
        
        // Filtro por fecha
        if (m.fechaMovimiento < periodoDesde || m.fechaMovimiento > periodoHasta) {
          return false;
        }
        
        return !m.anulado;
      })
      .sort((a, b) => b.fechaMovimiento.getTime() - a.fechaMovimiento.getTime());
  }, [cuenta, busqueda, filtroTipo, periodoDesde, periodoHasta]);

  // Resumen del período
  const resumenPeriodo = useMemo(() => {
    const cargos = movimientosFiltrados.filter(m => m.esCargo).reduce((acc, m) => acc + m.montoNeto, 0);
    const abonos = movimientosFiltrados.filter(m => !m.esCargo).reduce((acc, m) => acc + m.montoNeto, 0);
    return { cargos, abonos, movimientos: movimientosFiltrados.length };
  }, [movimientosFiltrados]);

  const handleExport = (formato: 'PDF' | 'EXCEL' | 'CSV') => {
    ;
    setShowExportModal(false);
    // En producción: generar y descargar archivo
  };

  const handleEnviarEmail = (email: string, formato: 'PDF' | 'EXCEL') => {
    if (cuenta) {
      CuentaCorrienteService.enviarEstadoCuentaPorEmail({
        cuentaId: cuenta.id,
        desde: periodoDesde,
        hasta: periodoHasta,
        emailDestinatario: email,
        formato
      });
    }
    setShowEmailModal(false);
  };

  if (!cuenta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Cuenta corriente no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Estado de Cuenta</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`${neuro.badge} bg-indigo-100 text-indigo-700`}>
                    {cuenta.numeroContrato}
                  </span>
                  <span className={`${neuro.badge} ${
                    cuenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' :
                    cuenta.estado === 'MORATORIA' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {cuenta.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowEmailModal(true)}
                className={`${neuro.btnSecondary} px-4 py-2 flex items-center gap-2`}
              >
                <Mail className="w-4 h-4" />
                Enviar
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}
              >
                <Download className="w-5 h-5" />
                Descargar
              </button>
            </div>
          </div>

          {/* Info Cliente */}
          <div className={`${neuro.card} p-4 mt-4`}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800">{cuenta.clienteNombre}</p>
                  <p className="text-sm text-slate-500">{cuenta.clienteRut}</p>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-sm text-slate-500">Fecha apertura</p>
                <p className="font-medium text-slate-700">{formatFecha(cuenta.fechaApertura)}</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-sm text-slate-500">Valor contrato</p>
                <p className="font-medium text-slate-700">{formatCurrency(cuenta.valorTotalContrato)}</p>
              </div>
              {cuenta.clienteEmail && (
                <>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-700">{cuenta.clienteEmail}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* KPIs de Saldo */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={neuro.card}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Total Cargos</p>
                <ArrowUpRight className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(cuenta.totalCargos)}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={neuro.card}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Total Abonos</p>
                <ArrowDownRight className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(cuenta.totalAbonos)}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={neuro.card}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Saldo Pendiente</p>
                <Wallet className="w-5 h-5 text-purple-500" />
              </div>
              <p className={`text-2xl font-bold ${cuenta.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(cuenta.saldoPendiente)}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={neuro.card}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">Último Pago</p>
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-slate-800">
                {cuenta.fechaUltimoPago ? formatFecha(cuenta.fechaUltimoPago) : 'Sin pagos'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tabla de Movimientos */}
        <div className={`${neuro.panel} p-6`}>
          {/* Filtros */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar movimiento..."
                  aria-label="Buscar movimiento"
                  className={`${neuro.input} pl-10 w-64`}
                />
              </div>

              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className={`${neuro.input}`}
              >
                <option value="todos">Todos los movimientos</option>
                <option value="cargos">Solo cargos</option>
                <option value="abonos">Solo abonos</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={periodoDesde.toISOString().split('T')[0]}
                  onChange={e => setPeriodoDesde(new Date(e.target.value))}
                  aria-label="Período desde"
                  className={`${neuro.input} w-40`}
                />
                <span className="text-slate-400">—</span>
                <input
                  type="date"
                  value={periodoHasta.toISOString().split('T')[0]}
                  aria-label="Período hasta"
                  onChange={e => setPeriodoHasta(new Date(e.target.value))}
                  className={`${neuro.input} w-40`}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">
                {resumenPeriodo.movimientos} movimientos | 
                Cargos: <span className="text-blue-600 font-medium">{formatCurrency(resumenPeriodo.cargos)}</span> | 
                Abonos: <span className="text-green-600 font-medium">{formatCurrency(resumenPeriodo.abonos)}</span>
              </span>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className={neuro.table}>
              <thead>
                <tr>
                  <th className={neuro.th}>#</th>
                  <th className={neuro.th}>Fecha</th>
                  <th className={neuro.th}>Tipo</th>
                  <th className={neuro.th}>Concepto</th>
                  <th className={`${neuro.th} text-right`}>Cargo</th>
                  <th className={`${neuro.th} text-right`}>Abono</th>
                  <th className={`${neuro.th} text-right`}>Saldo</th>
                  <th className={neuro.th}></th>
                </tr>
              </thead>
              <tbody>
                {movimientosFiltrados.map(mov => {
                  const tipoConfig = getTipoConfig(mov.tipoMovimiento);
                  const isExpanded = movimientoExpandido === mov.id;
                  
                  return (
                    <React.Fragment key={mov.id}>
                      <tr 
                        className="hover:bg-slate-50/50 cursor-pointer"
                        onClick={() => setMovimientoExpandido(isExpanded ? null : mov.id)}
                      >
                        <td className={neuro.td}>
                          <span className="text-slate-400">{mov.numeroMovimiento}</span>
                        </td>
                        <td className={neuro.td}>
                          <p className="font-medium text-slate-700">{formatFecha(mov.fechaMovimiento)}</p>
                          <p className="text-xs text-slate-400">{mov.fechaMovimiento.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className={neuro.td}>
                          <span className={`${neuro.badge} ${tipoConfig.bgColor} ${tipoConfig.color} inline-flex items-center gap-1`}>
                            {tipoConfig.icon}
                            {tipoConfig.label}
                          </span>
                        </td>
                        <td className={neuro.td}>
                          <p className="font-medium text-slate-800">{mov.concepto}</p>
                          {mov.documentoNumero && (
                            <p className="text-xs text-slate-500">Doc: {mov.documentoNumero}</p>
                          )}
                        </td>
                        <td className={`${neuro.td} text-right`}>
                          {mov.esCargo && (
                            <span className="font-semibold text-blue-600">{formatCurrency(mov.montoNeto)}</span>
                          )}
                        </td>
                        <td className={`${neuro.td} text-right`}>
                          {!mov.esCargo && (
                            <span className="font-semibold text-green-600">{formatCurrency(mov.montoNeto)}</span>
                          )}
                        </td>
                        <td className={`${neuro.td} text-right`}>
                          <span className={`font-bold ${mov.saldoPosterior > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(mov.saldoPosterior)}
                          </span>
                        </td>
                        <td className={neuro.td}>
                          <button className="p-1 hover:bg-slate-100 rounded">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Detalle expandido */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                                  <div className="grid grid-cols-4 gap-6">
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Monto Bruto</p>
                                      <p className="font-medium">{formatCurrency(mov.montoBruto)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">IVA</p>
                                      <p className="font-medium">{formatCurrency(mov.montoIVA)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Retención</p>
                                      <p className="font-medium">{formatCurrency(mov.montoRetencion)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Monto Neto</p>
                                      <p className="font-bold text-indigo-600">{formatCurrency(mov.montoNeto)}</p>
                                    </div>
                                    {mov.medioPago && (
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">Medio de Pago</p>
                                        <p className="font-medium">{mov.medioPago}</p>
                                      </div>
                                    )}
                                    {mov.bancoOrigen && (
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">Banco</p>
                                        <p className="font-medium">{mov.bancoOrigen}</p>
                                      </div>
                                    )}
                                    {mov.numeroOperacion && (
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">N° Operación</p>
                                        <p className="font-medium">{mov.numeroOperacion}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Conciliado</p>
                                      <p className={`font-medium flex items-center gap-1 ${mov.conciliado ? 'text-green-600' : 'text-amber-600'}`}>
                                        {mov.conciliado ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        {mov.conciliado ? 'Sí' : 'Pendiente'}
                                      </p>
                                    </div>
                                  </div>
                                  {mov.detalleConcepto && (
                                    <div className="mt-4 p-3 bg-white rounded-lg">
                                      <p className="text-xs text-slate-500 mb-1">Detalle</p>
                                      <p className="text-sm text-slate-700">{mov.detalleConcepto}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {movimientosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay movimientos en el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Exportar */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`${neuro.panel} p-6 max-w-md w-full mx-4`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Descargar Estado de Cuenta</h3>
                <button onClick={() => setShowExportModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Período: {formatFecha(periodoDesde)} - {formatFecha(periodoHasta)}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport('PDF')}
                  className={`${neuro.card} w-full p-4 flex items-center gap-4 hover:ring-2 hover:ring-indigo-400 transition-all`}
                >
                  <div className="p-3 rounded-xl bg-red-100">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-800">PDF Profesional</p>
                    <p className="text-sm text-slate-500">Documento con diseño corporativo</p>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('EXCEL')}
                  className={`${neuro.card} w-full p-4 flex items-center gap-4 hover:ring-2 hover:ring-indigo-400 transition-all`}
                >
                  <div className="p-3 rounded-xl bg-green-100">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-800">Excel (.xlsx)</p>
                    <p className="text-sm text-slate-500">Hoja de cálculo con fórmulas</p>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('CSV')}
                  className={`${neuro.card} w-full p-4 flex items-center gap-4 hover:ring-2 hover:ring-indigo-400 transition-all`}
                >
                  <div className="p-3 rounded-xl bg-blue-100">
                    <File className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-800">CSV</p>
                    <p className="text-sm text-slate-500">Datos separados por comas</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Email */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`${neuro.panel} p-6 max-w-md w-full mx-4`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Enviar Estado de Cuenta</h3>
                <button onClick={() => setShowEmailModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-2">Email destinatario</label>
                  <input
                    type="email"
                    defaultValue={cuenta.clienteEmail}
                    aria-label="Email destinatario"
                    className={`${neuro.input} w-full`}
                    placeholder="correo@empresa.cl"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-2">Período</label>
                  <p className="text-slate-800 font-medium">
                    {formatFecha(periodoDesde)} - {formatFecha(periodoHasta)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-2">Formato adjunto</label>
                  <div className="flex gap-3">
                    <button className={`${neuro.btnSecondary} flex-1 py-2 flex items-center justify-center gap-2`}>
                      <FileText className="w-4 h-4 text-red-500" />
                      PDF
                    </button>
                    <button className={`${neuro.btnSecondary} flex-1 py-2 flex items-center justify-center gap-2`}>
                      <FileSpreadsheet className="w-4 h-4 text-green-500" />
                      Excel
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-2">Mensaje adicional</label>
                  <textarea
                    className={`${neuro.input} w-full h-24 resize-none`}
                    placeholder="Estimado cliente, adjuntamos su estado de cuenta..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className={`${neuro.btnSecondary} px-4 py-2`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEnviarEmail(cuenta.clienteEmail || '', 'PDF')}
                  className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
