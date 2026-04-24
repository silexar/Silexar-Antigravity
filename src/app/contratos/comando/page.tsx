/**
 * 📋 SILEXAR PULSE - Centro de Comando Comercial TIER 0
 * 
 * @description Pantalla principal para gestión comercial diaria
 * con métricas en tiempo real, búsqueda inteligente y tabla avanzada.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
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
// TOKENS OFICIALES NEUMORPHISM
// ═══════════════════════════════════════════════════════════════

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const neuXs = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;
const insetSm = `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`;

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
// COMPONENTES NEUMORPHIC
// ═══════════════════════════════════════════════════════════════

function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: neu, ...style }}>
      {children}
    </div>
  );
}

function NeuButton({ children, onClick, variant = 'secondary', className = '', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string; disabled?: boolean;
}) {
  const s = variant === 'primary'
    ? { background: N.accent, color: '#fff', boxShadow: neuSm }
    : { background: N.base, color: N.text, boxShadow: neu };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`} style={s}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const _EstadoBadge: React.FC<{ estado: ContratoComercial['estado'] }> = ({ estado }) => {
  const config = {
    borrador: { bg: 'rgba(104,136,255,0.12)', text: N.accent, label: 'Borrador' },
    negociacion: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'Negociación' },
    aprobacion: { bg: 'rgba(249,115,22,0.12)', text: '#f97316', label: 'Aprobación' },
    aprobado: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', label: 'Aprobado' },
    rechazado: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'Rechazado' },
    renovacion: { bg: 'rgba(168,85,247,0.12)', text: '#a855f7', label: 'Renovación' }
  }[estado];

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold" style={{ background: config.bg, color: config.text, boxShadow: insetSm }}>
      {config.label}
    </span>
  );
};

const UrgenciaBadge: React.FC<{ urgencia: ContratoComercial['urgencia']; horas?: number }> = ({ urgencia, horas }) => {
  const config = {
    critico: { bg: '#ef4444', text: '#fff', label: horas ? `${horas}h` : 'Crítico' },
    urgente: { bg: '#f97316', text: '#fff', label: horas ? `${horas}h` : 'Urgente' },
    semana: { bg: N.accent, text: '#fff', label: 'Esta Semana' },
    normal: { bg: N.dark, text: N.text, label: 'Sin Prisa' }
  }[urgencia];

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: config.bg, color: config.text }}>
      {config.label}
    </span>
  );
};

const ValidacionIcon: React.FC<{ ok: boolean; procesando?: boolean; label: string }> = ({ ok, procesando, label }) => {
  if (procesando) {
    return (
      <div className="flex items-center gap-1" style={{ color: N.accent }}>
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span className="text-xs">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1" style={{ color: ok ? '#22c55e' : '#f59e0b' }}>
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
}> = ({ valor, label, icono, color = N.text, subvalor }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2">
      {icono}
      <span className="text-2xl font-black" style={{ color }}>{valor}</span>
    </div>
    <span className="text-xs" style={{ color: N.textSub }}>{label}</span>
    {subvalor && <span className="text-xs" style={{ color: N.textSub }}>{subvalor}</span>}
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
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="transition-all hover:bg-[#6888ff]/5"
      style={{ borderBottom: `1px solid ${N.dark}30` }}
    >
      {/* Estado/Urgencia */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <UrgenciaBadge urgencia={contrato.urgencia} horas={contrato.horasRestantes} />
          <p className="text-xs font-mono font-bold cursor-pointer hover:underline" style={{ color: N.accent }} onClick={onView}>
            {contrato.numeroContrato}
          </p>
          <p className="font-black text-sm" style={{ color: N.text }}>{formatCurrency(contrato.valorNeto)}</p>
          <p className="text-xs" style={{ color: N.textSub }}>{contrato.ejecutivoNombre}</p>
        </div>
      </td>

      {/* Cliente/Oportunidad */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: N.textSub }} />
            <span className="font-bold text-sm" style={{ color: N.text }}>{contrato.clienteNombre}</span>
          </div>
          <p className="text-sm pl-6" style={{ color: N.textSub }}>{contrato.campana}</p>
          <div className="flex items-center gap-3 text-xs pl-6">
            <span style={{ color: N.textSub }}>
              📊 Score: <strong style={{ color: contrato.scoreRiesgo >= 700 ? '#22c55e' : '#f59e0b' }}>
                {contrato.scoreRiesgo}/1000
              </strong> • {contrato.scoreRiesgo >= 700 ? 'Bajo Riesgo' : 'Revisar'}
            </span>
          </div>
          <div className="text-xs pl-6">
            <span style={{ color: N.textSub }}>
              🎯 Renovación: <strong style={{ color: contrato.probabilidadRenovacion >= 80 ? '#22c55e' : '#f59e0b' }}>
                {contrato.probabilidadRenovacion}%
              </strong> probable
            </span>
          </div>
        </div>
      </td>

      {/* Fechas/Timeline */}
      <td className="px-4 py-3">
        <div className="space-y-2">
          <p className="text-sm" style={{ color: N.text }}>
            📅 {contrato.fechaInicio.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} - {contrato.fechaFin.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
          </p>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${contrato.porcentajeTiempo}%`,
                background: contrato.porcentajeTiempo > 80 ? '#ef4444' : contrato.porcentajeTiempo > 50 ? '#f59e0b' : '#22c55e'
              }}
            />
          </div>
          <p className="text-xs" style={{ color: N.textSub }}>{contrato.porcentajeTiempo}% tiempo usado</p>
          <p className="text-xs" style={{ color: N.text }}>
            ⏰ Vence: <strong>{contrato.diasRestantes} días</strong>
          </p>
        </div>
      </td>

      {/* Valores/Rentabilidad */}
      <td className="px-4 py-3">
        <div className="space-y-1 text-sm">
          <p style={{ color: N.textSub }}>💰 Bruto: <strong style={{ color: N.text }}>{formatCurrency(contrato.valorBruto)}</strong></p>
          <p style={{ color: N.textSub }}>💵 Neto: <strong style={{ color: '#22c55e' }}>{formatCurrency(contrato.valorNeto)}</strong></p>
          <p style={{ color: N.textSub }}>
            📊 Margen: <strong style={{ color: contrato.margen >= 35 ? '#22c55e' : '#f59e0b' }}>
              {contrato.margen}%
            </strong>
          </p>
          <p style={{ color: N.textSub }}>
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
          <button onClick={onView} aria-label="Ver" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: N.accent }} title="Ver">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onEdit} aria-label="Editar" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: '#f59e0b' }} title="Editar">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={onApprove} aria-label="Aprobar" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: '#22c55e' }} title="Aprobar">
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button aria-label="Llamar" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }} title="Llamar">
            <Phone className="w-4 h-4" />
          </button>
          <button aria-label="Email" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }} title="Email">
            <Mail className="w-4 h-4" />
          </button>
          <button aria-label="Duplicar" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }} title="Duplicar">
            <Copy className="w-4 h-4" />
          </button>
          <button aria-label="Renovar" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: '#a855f7' }} title="Renovar">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button aria-label="Analizar" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }} title="Analizar">
            <TrendingUp className="w-4 h-4" />
          </button>
          <button aria-label="Activar" className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: N.accent }} title="Activar">
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
    <div className="min-h-screen flex flex-col" style={{ background: N.base }}>
      {/* Header */}
      <header className="shrink-0 px-6 py-4" style={{ background: N.base, boxShadow: neuSm }}>
        <div className="max-w-[1800px] mx-auto">
          {/* Breadcrumb + Título */}
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: N.textSub }}>
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-bold" style={{ color: N.text }}>Contratos</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                <Layout className="w-7 h-7" style={{ color: N.accent }} />
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: N.text }}>📋 Centro de Comando Comercial</h1>
                <p className="text-sm" style={{ color: N.textSub }}>Gestión comercial en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Notificaciones" className="p-2.5 rounded-xl relative transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Panel de Métricas en Tiempo Real */}
          <NeuCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 20% 50%, #6888ff 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#f59e0b' }} />
                </div>
                <h2 className="font-black" style={{ color: N.text }}>📊 ESTADO COMERCIAL TIEMPO REAL</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <MetricaCard 
                  valor={metricas.contratosActivos} 
                  label="Contratos Activos" 
                  color={N.text}
                />
                <MetricaCard 
                  valor={formatCurrency(metricas.valorPipeline)} 
                  label="Pipeline" 
                  color="#22c55e"
                />
                <MetricaCard 
                  valor={metricas.esperandoAprobacion} 
                  label="Esperando Aprobación" 
                  color="#f59e0b"
                />
                <MetricaCard 
                  valor={metricas.firmadosHoy} 
                  label="Firmados Hoy" 
                  color="#22c55e"
                />
                <MetricaCard 
                  valor={`${metricas.tasaCierre}%`} 
                  label="Tasa Cierre" 
                  color={N.accent}
                />
                <MetricaCard 
                  valor={metricas.vencenSemana} 
                  label="Vencen Esta Semana" 
                  color="#f97316"
                />
              </div>

              <div className="mt-4 pt-4 flex flex-wrap items-center gap-6" style={{ borderTop: `1px solid ${N.dark}40` }}>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: N.accent }} />
                  <span style={{ color: N.text }}>
                    💰 Meta Mensual: <strong>{formatCurrency(metricas.metaMensual)}</strong>
                    <span className="ml-2 font-bold" style={{ color: '#22c55e' }}>({metricas.metaCompletada}% completado)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  <span style={{ color: N.text }}>🎯 Faltan: <strong style={{ color: '#f59e0b' }}>{formatCurrency(faltaParaMeta)}</strong></span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #ef444440' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />
                  <span className="text-sm" style={{ color: N.text }}>
                    🚨 Próxima Acción: <strong>{metricas.proximaAccion.cliente}</strong> - Decisión en {metricas.proximaAccion.tiempo}
                  </span>
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Barra de Herramientas */}
          <NeuCard className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Búsqueda Inteligente */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onFocus={() => setShowSugerencias(true)}
                  onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
                  aria-label="Buscar contratos"
                  placeholder="🔍 CON-2025-0123, SuperMax, '$50K-100K', 'aprobación pendiente'..."
                  className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
                  style={{ background: N.base, boxShadow: inset, color: N.text }}
                />
                <AnimatePresence>
                  {showSugerencias && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20 p-2"
                      style={{ background: N.base, boxShadow: neu }}
                    >
                      <p className="text-xs px-3 py-1" style={{ color: N.textSub }}>Sugerencias predictivas:</p>
                      {sugerenciasBusqueda.map((sug) => (
                        <button
                          key={sug}
                          onClick={() => setBusqueda(sug)}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                          style={{ color: N.text }}
                        >
                          <Sparkles className="w-4 h-4" style={{ color: N.accent }} />
                          {sug}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: N.textSub }} />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="rounded-xl py-2.5 px-4 text-sm focus:outline-none cursor-pointer"
                  style={{ background: N.base, boxShadow: inset, color: N.text }}
                >
                  <option value="todos">Estado Comercial</option>
                  <option value="borrador">Borrador</option>
                  <option value="negociacion">Negociación</option>
                  <option value="aprobacion">Esperando Aprobación</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="renovacion">Renovación</option>
                </select>

                <select
                  value={filtroValor}
                  onChange={(e) => setFiltroValor(e.target.value)}
                  className="rounded-xl py-2.5 px-4 text-sm focus:outline-none cursor-pointer"
                  style={{ background: N.base, boxShadow: inset, color: N.text }}
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
                  className="rounded-xl py-2.5 px-4 text-sm focus:outline-none cursor-pointer"
                  style={{ background: N.base, boxShadow: inset, color: N.text }}
                >
                  <option value="todos">Urgencia</option>
                  <option value="critico">Crítico (&lt;24h)</option>
                  <option value="urgente">Urgente (&lt;48h)</option>
                  <option value="semana">Esta Semana</option>
                  <option value="normal">Sin Prisa</option>
                </select>
              </div>

              {/* Acciones Rápidas */}
              <div className="flex items-center gap-2 ml-auto">
                <NeuButton variant="primary" onClick={() => router.push('/contratos/nuevo')}>
                  <Plus className="w-4 h-4" />
                  Nuevo Contrato
                </NeuButton>
                <NeuButton variant="secondary" onClick={() => router.push('/contratos/pipeline')}>
                  <Columns3 className="w-4 h-4" />
                  Pipeline
                </NeuButton>
                <NeuButton variant="secondary" onClick={() => router.push('/contratos/dashboard')}>
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </NeuButton>
                <NeuButton variant="secondary">
                  <Sparkles className="w-4 h-4" style={{ color: N.accent }} />
                  Predicciones IA
                </NeuButton>
                <NeuButton variant="secondary">
                  <Smartphone className="w-4 h-4" />
                  Móvil
                </NeuButton>
              </div>
            </div>
          </NeuCard>

          {/* Tabla Comercial */}
          <NeuCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${N.dark}40` }}>
                    {['Estado/Urgencia', 'Cliente/Oportunidad', 'Fechas/Timeline', 'Valores/Rentabilidad', 'Validaciones', 'Acciones'].map(h => (
                      <th key={h} className="text-left py-4 px-4 text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>
                        {h}
                      </th>
                    ))}
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
                <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: N.base, boxShadow: inset }}>
                  <FileText className="w-8 h-8" style={{ color: N.textSub }} />
                </div>
                <p style={{ color: N.textSub }}>No hay contratos que coincidan con los filtros</p>
              </div>
            )}

            {/* Footer de tabla */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${N.dark}30`, background: 'rgba(190,200,222,0.08)' }}>
              <span className="text-sm" style={{ color: N.textSub }}>
                Mostrando <strong style={{ color: N.text }}>{contratosFiltrados.length}</strong> de <strong style={{ color: N.text }}>{contratos.length}</strong> contratos
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-xl text-sm font-bold transition-all" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
                  Anterior
                </button>
                <span className="px-3 py-1 rounded-xl text-sm font-bold text-white" style={{ background: N.accent, boxShadow: neuXs }}>1</span>
                <button className="px-3 py-1 rounded-xl text-sm font-bold transition-all" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
                  2
                </button>
                <button className="px-3 py-1 rounded-xl text-sm font-bold transition-all" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
                  Siguiente
                </button>
              </div>
            </div>
          </NeuCard>
        </div>
      </main>
    </div>
  );
}
