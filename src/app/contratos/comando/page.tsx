/**
 * 📋 SILEXAR PULSE - Centro de Comando Comercial TIER 0
 * 
 * @description Pantalla principal para gestión comercial diaria
 * con métricas en tiempo real, búsqueda inteligente y tabla avanzada.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Layout,
  Search,
  Filter,
  Plus,
  Columns3,
  BarChart3,
  Sparkles,
  Smartphone,
  Eye,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  Copy,
  RefreshCw,
  TrendingUp,
  Rocket,
  AlertTriangle,
  Target,
  Building2,
  FileText,
  ChevronRight,
  Bell
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ContratoComercial {
  id: string;
  numeroContrato: string;
  estado: 'borrador' | 'negociacion' | 'aprobacion' | 'aprobado' | 'rechazado' | 'renovacion';
  urgencia: 'critico' | 'urgente' | 'semana' | 'normal';
  horasRestantes?: number;
  
  // Cliente
  clienteNombre: string;
  clienteRut?: string;
  campana: string;
  scoreRiesgo: number;
  probabilidadRenovacion: number;
  
  // Fechas
  fechaInicio: Date;
  fechaFin: Date;
  diasRestantes: number;
  porcentajeTiempo: number;
  
  // Valores
  valorBruto: number;
  valorNeto: number;
  margen: number;
  cuotasPagadas: number;
  cuotasTotal: number;
  
  // Validaciones
  inventarioOk: boolean;
  riesgoOk: boolean;
  materialOk: boolean;
  procesando: boolean;
  
  // Responsable
  ejecutivoNombre: string;
  ejecutivoId: string;
}

interface MetricasComerciales {
  contratosActivos: number;
  valorPipeline: number;
  esperandoAprobacion: number;
  firmadosHoy: number;
  tasaCierre: number;
  vencenSemana: number;
  metaMensual: number;
  metaCompletada: number;
  proximaAccion: { cliente: string; tiempo: string };
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockMetricas: MetricasComerciales = {
  contratosActivos: 47,
  valorPipeline: 2800000000,
  esperandoAprobacion: 8,
  firmadosHoy: 12,
  tasaCierre: 85,
  vencenSemana: 3,
  metaMensual: 1200000000,
  metaCompletada: 78,
  proximaAccion: { cliente: 'Banco XYZ', tiempo: '2 horas' }
};

const mockContratos: ContratoComercial[] = [
  {
    id: '1',
    numeroContrato: 'CON-2025-00123',
    estado: 'aprobacion',
    urgencia: 'critico',
    horasRestantes: 4,
    clienteNombre: 'SuperMax SpA',
    clienteRut: '76.123.456-7',
    campana: 'Campaña Navidad Premium',
    scoreRiesgo: 750,
    probabilidadRenovacion: 85,
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    diasRestantes: 45,
    porcentajeTiempo: 85,
    valorBruto: 125000000,
    valorNeto: 105000000,
    margen: 35,
    cuotasPagadas: 3,
    cuotasTotal: 5,
    inventarioOk: true,
    riesgoOk: true,
    materialOk: false,
    procesando: false,
    ejecutivoNombre: 'Ana García',
    ejecutivoId: 'ej-001'
  },
  {
    id: '2',
    numeroContrato: 'CON-2025-00124',
    estado: 'negociacion',
    urgencia: 'urgente',
    horasRestantes: 36,
    clienteNombre: 'Banco Nacional S.A.',
    clienteRut: '97.030.000-7',
    campana: 'Campaña Cuentas Ahorro',
    scoreRiesgo: 920,
    probabilidadRenovacion: 72,
    fechaInicio: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    fechaFin: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    diasRestantes: 90,
    porcentajeTiempo: 25,
    valorBruto: 280000000,
    valorNeto: 238000000,
    margen: 42,
    cuotasPagadas: 0,
    cuotasTotal: 4,
    inventarioOk: true,
    riesgoOk: true,
    materialOk: true,
    procesando: true,
    ejecutivoNombre: 'Carlos Mendoza',
    ejecutivoId: 'ej-002'
  },
  {
    id: '3',
    numeroContrato: 'CON-2025-00125',
    estado: 'aprobado',
    urgencia: 'normal',
    clienteNombre: 'Retail Chile',
    clienteRut: '76.890.123-4',
    campana: 'Cyber Monday 2025',
    scoreRiesgo: 680,
    probabilidadRenovacion: 90,
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    fechaFin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    diasRestantes: 60,
    porcentajeTiempo: 33,
    valorBruto: 95000000,
    valorNeto: 80750000,
    margen: 28,
    cuotasPagadas: 2,
    cuotasTotal: 3,
    inventarioOk: true,
    riesgoOk: true,
    materialOk: true,
    procesando: false,
    ejecutivoNombre: 'Ana García',
    ejecutivoId: 'ej-001'
  },
  {
    id: '4',
    numeroContrato: 'CON-2025-00126',
    estado: 'borrador',
    urgencia: 'semana',
    clienteNombre: 'TechCorp SpA',
    campana: 'Lanzamiento Producto Tech',
    scoreRiesgo: 820,
    probabilidadRenovacion: 65,
    fechaInicio: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    fechaFin: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    diasRestantes: 75,
    porcentajeTiempo: 0,
    valorBruto: 45000000,
    valorNeto: 38250000,
    margen: 32,
    cuotasPagadas: 0,
    cuotasTotal: 2,
    inventarioOk: false,
    riesgoOk: true,
    materialOk: false,
    procesando: true,
    ejecutivoNombre: 'Pedro Soto',
    ejecutivoId: 'ej-003'
  },
  {
    id: '5',
    numeroContrato: 'CON-2025-00127',
    estado: 'renovacion',
    urgencia: 'urgente',
    horasRestantes: 24,
    clienteNombre: 'AutoMax Ltda',
    clienteRut: '76.456.789-0',
    campana: 'Renovación Anual 2025',
    scoreRiesgo: 880,
    probabilidadRenovacion: 92,
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    diasRestantes: 365,
    porcentajeTiempo: 0,
    valorBruto: 180000000,
    valorNeto: 153000000,
    margen: 38,
    cuotasPagadas: 0,
    cuotasTotal: 12,
    inventarioOk: true,
    riesgoOk: true,
    materialOk: true,
    procesando: false,
    ejecutivoNombre: 'Carlos Mendoza',
    ejecutivoId: 'ej-002'
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _EstadoBadge: React.FC<{ estado: ContratoComercial['estado'] }> = ({ estado }) => {
  const config = {
    borrador: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🆕', label: 'Borrador' },
    negociacion: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🔄', label: 'Negociación' },
    aprobacion: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⏳', label: 'Aprobación' },
    aprobado: { bg: 'bg-green-100', text: 'text-green-700', icon: '✅', label: 'Aprobado' },
    rechazado: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚫', label: 'Rechazado' },
    renovacion: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🔄', label: 'Renovación' }
  }[estado];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const UrgenciaBadge: React.FC<{ urgencia: ContratoComercial['urgencia']; horas?: number }> = ({ urgencia, horas }) => {
  const config = {
    critico: { bg: 'bg-red-500', text: 'text-white', icon: '🚨', label: horas ? `${horas}h` : 'Crítico' },
    urgente: { bg: 'bg-orange-500', text: 'text-white', icon: '⚡', label: horas ? `${horas}h` : 'Urgente' },
    semana: { bg: 'bg-blue-500', text: 'text-white', icon: '📅', label: 'Esta Semana' },
    normal: { bg: 'bg-slate-200', text: 'text-slate-700', icon: '📋', label: 'Sin Prisa' }
  }[urgencia];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const ValidacionIcon: React.FC<{ ok: boolean; procesando?: boolean; label: string }> = ({ ok, procesando, label }) => {
  if (procesando) {
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span className="text-xs">{label}</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-1 ${ok ? 'text-green-600' : 'text-amber-600'}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      <span className="text-xs">{label}</span>
    </div>
  );
};

const MetricaCard: React.FC<{
  valor: string | number;
  label: string;
  icono?: React.ReactNode;
  color?: string;
  subvalor?: string;
}> = ({ valor, label, icono, color = 'text-slate-800', subvalor }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2">
      {icono}
      <span className={`text-2xl font-bold ${color}`}>{valor}</span>
    </div>
    <span className="text-xs text-slate-500">{label}</span>
    {subvalor && <span className="text-xs text-slate-400 mt-0.5">{subvalor}</span>}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// FILA DE LA TABLA
// ═══════════════════════════════════════════════════════════════

const ContratoRow: React.FC<{
  contrato: ContratoComercial;
  onView: () => void;
  onEdit: () => void;
  onApprove: () => void;
}> = ({ contrato, onView, onEdit, onApprove }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showActions, _setShowActions] = useState(false);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
    >
      {/* Estado/Urgencia */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <UrgenciaBadge urgencia={contrato.urgencia} horas={contrato.horasRestantes} />
          <p className="text-xs font-mono text-indigo-600 hover:underline cursor-pointer" onClick={onView}>
            {contrato.numeroContrato}
          </p>
          <p className="text-sm font-bold text-slate-800">{formatCurrency(contrato.valorNeto)}</p>
          <p className="text-xs text-slate-500">{contrato.ejecutivoNombre}</p>
        </div>
      </td>

      {/* Cliente/Oportunidad */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{contrato.clienteNombre}</span>
          </div>
          <p className="text-sm text-slate-600 pl-6">{contrato.campana}</p>
          <div className="flex items-center gap-3 text-xs pl-6">
            <span className="text-slate-500">
              📊 Score: <strong className={contrato.scoreRiesgo >= 700 ? 'text-green-600' : 'text-amber-600'}>
                {contrato.scoreRiesgo}/1000
              </strong> • {contrato.scoreRiesgo >= 700 ? 'Bajo Riesgo' : 'Revisar'}
            </span>
          </div>
          <div className="text-xs pl-6">
            <span className="text-slate-500">
              🎯 Renovación: <strong className={contrato.probabilidadRenovacion >= 80 ? 'text-green-600' : 'text-amber-600'}>
                {contrato.probabilidadRenovacion}%
              </strong> probable
            </span>
          </div>
        </div>
      </td>

      {/* Fechas/Timeline */}
      <td className="px-4 py-3">
        <div className="space-y-2">
          <p className="text-sm text-slate-700">
            📅 {contrato.fechaInicio.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} - {contrato.fechaFin.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
          </p>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                contrato.porcentajeTiempo > 80 ? 'bg-red-500' :
                contrato.porcentajeTiempo > 50 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${contrato.porcentajeTiempo}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{contrato.porcentajeTiempo}% tiempo usado</p>
          <p className="text-xs text-slate-600">
            ⏰ Vence: <strong>{contrato.diasRestantes} días</strong>
          </p>
        </div>
      </td>

      {/* Valores/Rentabilidad */}
      <td className="px-4 py-3">
        <div className="space-y-1 text-sm">
          <p className="text-slate-600">💰 Bruto: <strong>{formatCurrency(contrato.valorBruto)}</strong></p>
          <p className="text-slate-600">💵 Neto: <strong className="text-emerald-600">{formatCurrency(contrato.valorNeto)}</strong></p>
          <p className="text-slate-600">
            📊 Margen: <strong className={contrato.margen >= 35 ? 'text-green-600' : 'text-amber-600'}>
              {contrato.margen}%
            </strong>
          </p>
          <p className="text-slate-600">
            💳 <strong>{contrato.cuotasPagadas}/{contrato.cuotasTotal}</strong> Cuotas
          </p>
        </div>
      </td>

      {/* Validaciones */}
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          <ValidacionIcon ok={contrato.inventarioOk} label="Inventario" />
          <ValidacionIcon ok={contrato.riesgoOk} label="Riesgo OK" />
          <ValidacionIcon ok={contrato.materialOk} label={contrato.materialOk ? 'Material' : 'Sin Material'} />
          {contrato.procesando && <ValidacionIcon ok={false} procesando label="Procesando" />}
        </div>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <button onClick={onView} aria-label="Ver" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Ver">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onEdit} aria-label="Editar" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Editar">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={onApprove} aria-label="Aprobar" className="p-1.5 rounded-lg hover:bg-green-100 text-green-600" title="Aprobar">
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button aria-label="Llamar" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Llamar">
            <Phone className="w-4 h-4" />
          </button>
          <button aria-label="Email" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Email">
            <Mail className="w-4 h-4" />
          </button>
          <button aria-label="Duplicar" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Duplicar">
            <Copy className="w-4 h-4" />
          </button>
          <button aria-label="Renovar" className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600" title="Renovar">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button aria-label="Analizar" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Analizar">
            <TrendingUp className="w-4 h-4" />
          </button>
          <button aria-label="Activar" className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600" title="Activar">
            <Rocket className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CentroComandoPage() {
  const router = useRouter();
  const [metricas] = useState<MetricasComerciales>(mockMetricas);
  const [contratos] = useState<ContratoComercial[]>(mockContratos);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroValor, setFiltroValor] = useState<string>('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('todos');
  const [showSugerencias, setShowSugerencias] = useState(false);

  const sugerenciasBusqueda = [
    'Contratos que cierran esta semana',
    'Pipeline de Carlos Mendoza',
    'Renovaciones automáticas próximas',
    'Clientes con riesgo de cancelación'
  ];

  const contratosFiltrados = useMemo(() => {
    return contratos.filter(c => {
      if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
      if (filtroUrgencia !== 'todos' && c.urgencia !== filtroUrgencia) return false;
      if (busqueda) {
        const query = busqueda.toLowerCase();
        return (
          c.numeroContrato.toLowerCase().includes(query) ||
          c.clienteNombre.toLowerCase().includes(query) ||
          c.campana.toLowerCase().includes(query)
        );
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contratos, filtroEstado, filtroValor, filtroUrgencia, busqueda]);

  const faltaParaMeta = metricas.metaMensual * (1 - metricas.metaCompletada / 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          {/* Breadcrumb + Título */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-800 font-medium">Contratos</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Layout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">📋 Centro de Comando Comercial</h1>
                <p className="text-slate-500 text-sm">Gestión comercial en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Notificaciones" className="p-2 rounded-lg hover:bg-slate-100 relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Panel de Métricas en Tiempo Real */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 rounded-2xl p-6 mb-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold">📊 ESTADO COMERCIAL TIEMPO REAL</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <MetricaCard 
              valor={metricas.contratosActivos} 
              label="Contratos Activos" 
              color="text-white"
            />
            <MetricaCard 
              valor={formatCurrency(metricas.valorPipeline)} 
              label="Pipeline" 
              color="text-emerald-400"
            />
            <MetricaCard 
              valor={metricas.esperandoAprobacion} 
              label="Esperando Aprobación" 
              color="text-amber-400"
            />
            <MetricaCard 
              valor={metricas.firmadosHoy} 
              label="Firmados Hoy" 
              color="text-green-400"
            />
            <MetricaCard 
              valor={`${metricas.tasaCierre}%`} 
              label="Tasa Cierre" 
              color="text-blue-400"
            />
            <MetricaCard 
              valor={metricas.vencenSemana} 
              label="Vencen Esta Semana" 
              color="text-orange-400"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <span>
                💰 Meta Mensual: <strong>{formatCurrency(metricas.metaMensual)}</strong>
                <span className="text-emerald-400 ml-2">({metricas.metaCompletada}% completado)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>🎯 Faltan: <strong className="text-amber-400">{formatCurrency(faltaParaMeta)}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm">
                🚨 Próxima Acción: <strong>{metricas.proximaAccion.cliente}</strong> - Decisión en {metricas.proximaAccion.tiempo}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Barra de Herramientas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Búsqueda Inteligente */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onFocus={() => setShowSugerencias(true)}
                onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
                aria-label="Buscar contratos"
                placeholder="🔍 CON-2025-0123, SuperMax, '$50K-100K', 'aprobación pendiente'..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50 text-sm"
              />
              <AnimatePresence>
                {showSugerencias && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-20 p-2"
                  >
                    <p className="text-xs text-slate-500 px-3 py-1">Sugerencias predictivas:</p>
                    {sugerenciasBusqueda.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => setBusqueda(sug)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        {sug}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                <option value="todos">Estado Comercial</option>
                <option value="borrador">🆕 Borrador</option>
                <option value="negociacion">🔄 Negociación</option>
                <option value="aprobacion">⏳ Esperando Aprobación</option>
                <option value="aprobado">✅ Aprobado</option>
                <option value="rechazado">🚫 Rechazado</option>
                <option value="renovacion">🔄 Renovación</option>
              </select>

              <select
                value={filtroValor}
                onChange={(e) => setFiltroValor(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                <option value="todos">Valor Comercial</option>
                <option value="0-10k">$0-10K</option>
                <option value="10k-50k">$10K-50K</option>
                <option value="50k-100k">$50K-100K</option>
                <option value="100k-500k">$100K-500K</option>
                <option value="500k+">$500K+</option>
              </select>

              <select
                value={filtroUrgencia}
                onChange={(e) => setFiltroUrgencia(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                <option value="todos">Urgencia</option>
                <option value="critico">🚨 Crítico (&lt;24h)</option>
                <option value="urgente">⚡ Urgente (&lt;48h)</option>
                <option value="semana">📅 Esta Semana</option>
                <option value="normal">📋 Sin Prisa</option>
              </select>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => router.push('/contratos/nuevo')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex items-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Plus className="w-4 h-4" />
                Nuevo Contrato
              </button>
              <button
                onClick={() => router.push('/contratos/pipeline')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50"
              >
                <Columns3 className="w-4 h-4" />
                Pipeline
              </button>
              <button
                onClick={() => router.push('/contratos/dashboard')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Predicciones IA
              </button>
              <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50">
                <Smartphone className="w-4 h-4" />
                Móvil
              </button>
            </div>
          </div>
        </div>

        {/* Tabla Comercial */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[140px]">
                    Estado/Urgencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[280px]">
                    Cliente/Oportunidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[150px]">
                    Fechas/Timeline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[140px]">
                    Valores/Rentabilidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[120px]">
                    Validaciones
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[160px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {contratosFiltrados.map(contrato => (
                    <ContratoRow
                      key={contrato.id}
                      contrato={contrato}
                      onView={() => router.push(`/contratos/${contrato.id}`)}
                      onEdit={() => router.push(`/contratos/${contrato.id}/editar`)}
                      onApprove={() => {}}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {contratosFiltrados.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay contratos que coincidan con los filtros</p>
            </div>
          )}

          {/* Footer de tabla */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Mostrando <strong>{contratosFiltrados.length}</strong> de <strong>{contratos.length}</strong> contratos
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-white">
                Anterior
              </button>
              <span className="px-3 py-1 rounded-lg bg-indigo-500 text-white text-sm">1</span>
              <button className="px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-white">
                2
              </button>
              <button className="px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-white">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
