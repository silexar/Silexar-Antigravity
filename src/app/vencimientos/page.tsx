/**
 * 📅 SILEXAR PULSE - Vencimientos Dashboard TIER 0
 *
 * @description Dashboard principal del módulo de vencimientos.
 *              Centro de comando de inventario comercial.
 *              Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Plus,
  RefreshCw,
  Search,
  X,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Radio,
  Zap,
  CalendarClock,
  Package,
  Bell,
  Pencil,
  Users,
  Play,
  Pause,
  UserCheck
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
// IMPORTS MOCK DATA
// ═══════════════════════════════════════════════════════════════

import {
  programasMock,
  vencimientosMock,
  alertasMock,
  metricasMock
} from '@/lib/mock-data/vencimientos-mock';

interface Programa {
  id: string;
  codigo: string;
  emiId: string;
  emiNombre: string;
  nombre: string;
  descripcion: string;
  horario: { horaInicio: string; horaFin: string; diasSemana: number[] };
  cupos: {
    tipoA: { total: number; ocupados: number; disponibles: number };
    tipoB: { total: number; ocupados: number; disponibles: number };
    menciones: { total: number; ocupados: number; disponibles: number };
  };
  conductores: Array<{ id: string; nombre: string; rol: string }>;
  estado: string;
  revenueActual: number;
  revenuePotencial: number;
  listaEsperaCount: number;
  disponibilidad: { totalCupos: number; totalOcupados: number; totalDisponibles: number; ocupacionPorcentaje: number };
  esPrime: boolean;
  tieneCuposDisponibles: boolean;
}

interface Vencimientos {
  id: string;
  programaId: string;
  programaNombre: string;
  emiId: string;
  emiNombre: string;
  clienteId: string;
  clienteNombre: string;
  clienteRubro: string;
  ejecutivoId: string;
  ejecutivoNombre: string;
  tipoAuspicio: string;
  fechaFin: string;
  diasRestantes: number;
  nivelAlerta: string;
  accionSugerida: string;
  valor: number;
  estado: string;
}

interface Alerta {
  id: string;
  tipo: string;
  prioridad: string;
  titulo: string;
  mensaje: string;
  programaId: string;
  programaNombre: string;
  emiNombre: string;
  clienteNombre?: string;
  diasRestantes?: number;
  leida: boolean;
  createdAt: string;
}

interface ClientePrograma {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteRubro: string;
  tipoCupo: 'PREMIUM' | 'STANDARD' | 'MENSAJE';
  estado: 'ACTIVO' | 'POR_COMENZAR' | 'LISTA_ESPERA';
  fechaInicio: string;
  fechaFin: string;
  valor: number;
  ejecutivoNombre: string;
}

interface ProgramaEditModal {
  isOpen: boolean;
  programa: Programa | null;
  clientesActivos: ClientePrograma[];
  clientesPorComenzar: ClientePrograma[];
  clientesListaEspera: ClientePrograma[];
  loading: boolean;
}

interface EditarProgramaFormData {
  nombre: string;
  emiId: string;
  emiNombre: string;
  descripcion: string;
  estado: string;
  horarioInicio: string;
  horarioFin: string;
  diasSemana: number[];
  vigenciaDesde: string;
  vigenciaHasta: string;
}

interface MetricaCard {
  titulo: string;
  valor: string | number;
  cambio: number;
  icono: React.ElementType;
  color: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
function formatDiasSemana(dias: number[]): string {
  return dias.map((d) => diasSemanaNombres[d]).join(', ');
}

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

function StatCard({ title, value, subtitle, icon: Icon, trend, className }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  trend?: { value: number; positive: boolean };
  className?: string;
}) {
  return (
    <NeuCard className={`p-6 relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>{title}</p>
          <h3 className="text-3xl font-black mt-1" style={{ color: N.text }}>{value}</h3>
          {subtitle && <p className="text-sm mt-1" style={{ color: N.textSub }}>{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className={`w-4 h-4 ${trend.value < 0 ? 'rotate-180' : ''}`} style={{ color: trend.value >= 0 ? '#22c55e' : '#ef4444' }} />
              <span style={{ color: trend.value >= 0 ? '#22c55e' : '#ef4444' }}>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
              <span style={{ color: N.textSub }}>vs mes anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
            <Icon className="w-6 h-6" style={{ color: N.accent }} />
          </div>
        )}
      </div>
    </NeuCard>
  );
}

function ProgramaCard({ programa, onSelect, onEdit }: { programa: Programa; onSelect: (p: Programa) => void; onEdit: (p: Programa) => void }) {
  const ocupacionColor =
    programa.disponibilidad.ocupacionPorcentaje >= 90
      ? '#22c55e'
      : programa.disponibilidad.ocupacionPorcentaje >= 70
        ? '#f59e0b'
        : '#ef4444';

  return (
    <div
      className="p-5 rounded-2xl transition-all duration-300"
      style={{ background: N.base, boxShadow: neu }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate" style={{ color: N.text }}>{programa.nombre}</h3>
          <p className="text-sm truncate mt-0.5" style={{ color: N.textSub }}>{programa.emiNombre}</p>
        </div>
        <div className="flex items-center gap-2">
          {programa.esPrime && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              PRIME
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(programa); }}
            className="p-2 rounded-lg transition-all duration-200 hover:opacity-70"
            style={{ background: N.base, boxShadow: neuSm }}
            title="Editar programa"
          >
            <Pencil className="w-4 h-4" style={{ color: N.accent }} />
          </button>
        </div>
      </div>

      {/* Click en la tarjeta abre modal de clientes */}
      <button onClick={() => onSelect(programa)} className="w-full text-left mt-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" style={{ color: N.textSub }} />
            <span style={{ color: N.text }}>{programa.horario.horaInicio} - {programa.horario.horaFin}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" style={{ color: N.textSub }} />
            <span style={{ color: N.textSub }}>{formatDiasSemana(programa.horario.diasSemana)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: insetSm }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Tipo A</p>
            <p className="text-lg font-black mt-1" style={{ color: '#3b82f6' }}>
              {programa.cupos.tipoA.disponibles}/{programa.cupos.tipoA.total}
            </p>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: insetSm }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Tipo B</p>
            <p className="text-lg font-black mt-1" style={{ color: '#22c55e' }}>
              {programa.cupos.tipoB.disponibles}/{programa.cupos.tipoB.total}
            </p>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: insetSm }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Menc.</p>
            <p className="text-lg font-black mt-1" style={{ color: '#a855f7' }}>
              {programa.cupos.menciones.disponibles}/{programa.cupos.menciones.total}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: N.textSub }}>Ocupación:</span>
            <span className="font-bold" style={{ color: ocupacionColor }}>
              {programa.disponibilidad.ocupacionPorcentaje}%
            </span>
          </div>
          {programa.listaEsperaCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c' }}>
              {programa.listaEsperaCount} en lista
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

function VencimientosItem({ vencimientos, onAction }: { vencimientos: Vencimientos; onAction?: () => void }) {
  const nivelConfig = {
    verde: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: CheckCircle2 },
    amarillo: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock },
    rojo: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
    critico: { color: '#dc2626', bg: 'rgba(220,38,38,0.12)', icon: AlertTriangle },
    no_iniciado: { color: '#a855f7', bg: 'rgba(168,85,247,0.08)', icon: Clock },
    vencido: { color: '#69738c', bg: 'rgba(105,115,140,0.08)', icon: Clock },
  }[vencimientos.nivelAlerta] || { color: N.text, bg: N.base, icon: Clock };

  const Icon = nivelConfig.icon;
  const diasTexto = vencimientos.diasRestantes === 0
    ? 'Vence hoy'
    : vencimientos.diasRestantes === 1
      ? 'Vence mañana'
      : `Vence en ${vencimientos.diasRestantes} días`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-2xl"
      style={{ background: nivelConfig.bg }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl flex-shrink-0" style={{ background: N.base, boxShadow: neuXs }}>
          <Icon className="w-5 h-5" style={{ color: nivelConfig.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: N.text }}>{vencimientos.clienteNombre}</p>
              <p className="text-sm truncate mt-0.5" style={{ color: N.textSub }}>
                {vencimientos.programaNombre} - {vencimientos.emiNombre}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm" style={{ color: nivelConfig.color }}>{formatCurrency(vencimientos.valor)}</p>
              <p className="text-xs" style={{ color: N.textSub }}>{vencimientos.tipoAuspicio}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: N.base, boxShadow: insetSm, color: nivelConfig.color }}>
              {diasTexto}
            </span>
            <span className="text-xs" style={{ color: N.textSub }}>Ejecutivo: {vencimientos.ejecutivoNombre}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AlertaItem({ alerta, onMarcarLeida }: { alerta: Alerta; onMarcarLeida?: () => void }) {
  const prioridadConfig = {
    alta: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
    media: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock },
    baja: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: Bell }
  }[alerta.prioridad] || { color: N.text, bg: N.base, icon: Bell };

  const Icon = prioridadConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-2xl"
      style={{ background: prioridadConfig.bg }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 ${!alerta.leida ? 'ring-2 ring-yellow-400/30' : ''}`} style={{ background: N.base, boxShadow: neuXs }}>
          <Icon className="w-4 h-4" style={{ color: prioridadConfig.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm truncate" style={{ color: N.text }}>{alerta.titulo}</p>
            <span className="text-xs flex-shrink-0" style={{ color: N.textSub }}>
              {new Date(alerta.createdAt).toLocaleDateString('es-CL')}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: N.textSub }}>{alerta.mensaje}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: N.base, boxShadow: insetSm, color: N.text }}>
              {alerta.tipo}
            </span>
            {alerta.clienteNombre && <span className="text-xs" style={{ color: N.textSub }}>{alerta.clienteNombre}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SearchBar({ value, onChange, onSearch }: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: N.textSub }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="Buscar programa, cliente o rubro..."
        className="w-full px-4 py-3 pl-12 pr-12 rounded-xl text-sm"
        style={{
          background: N.base,
          boxShadow: inset,
          color: N.text,
          outline: 'none'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-black/5"
          style={{ color: N.textSub }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function FilterTabs({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex p-1 rounded-xl" style={{ background: N.base, boxShadow: inset }}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${value === option ? '' : ''
            }`}
          style={
            value === option
              ? { background: N.accent, color: '#fff', boxShadow: neuSm }
              : { background: 'transparent', color: N.textSub }
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function TabButton({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-3 text-sm font-bold transition-all duration-200"
      style={{
        color: active ? N.accent : N.textSub,
        background: active ? N.base : 'transparent',
        boxShadow: active ? inset : 'none',
        borderBottom: active ? `2px solid ${N.accent}` : '2px solid transparent'
      }}
    >
      <span className="flex items-center gap-2">
        {label}
        {badge !== undefined && badge > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

function EditarProgramaModal({
  isOpen,
  programa,
  loading,
  onClose
}: { isOpen: boolean; programa: Programa | null; loading: boolean; onClose: () => void; onSave: (data: EditarProgramaFormData) => void }) {
  if (!isOpen || !programa) return null;

  const [formData, setFormData] = useState<EditarProgramaFormData>({
    nombre: programa.nombre,
    emiId: programa.emiId,
    emiNombre: programa.emiNombre,
    descripcion: programa.descripcion,
    estado: programa.estado,
    horarioInicio: programa.horario.horaInicio,
    horarioFin: programa.horario.horaFin,
    diasSemana: programa.horario.diasSemana,
    vigenciaDesde: '',
    vigenciaHasta: '',
  });

  const diasSemanaOpciones = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
  ];

  const toggleDiaSemana = (dia: number) => {
    setFormData(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia].sort((a, b) => a - b),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl"
        style={{ background: N.base, boxShadow: neu }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: N.dark }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                <Pencil className="w-6 h-6" style={{ color: N.accent }} />
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: N.text }}>Editar Programa</h2>
                <p className="text-sm" style={{ color: N.textSub }}>{programa.codigo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:opacity-70"
              style={{ background: N.base, boxShadow: neuSm }}
            >
              <X className="w-5 h-5" style={{ color: N.text }} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Nombre del Programa</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: N.base, boxShadow: inset, color: N.text, outline: 'none' }}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={e => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: N.base, boxShadow: inset, color: N.text, outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Estado</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.estado === 'BORRADOR'}
                    onChange={() => setFormData(prev => ({ ...prev, estado: 'BORRADOR' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold" style={{ color: N.text }}>Borrador</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.estado === 'ACTIVO'}
                    onChange={() => setFormData(prev => ({ ...prev, estado: 'ACTIVO' }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold" style={{ color: N.text }}>Activo</span>
                </label>
              </div>
            </div>

            {/* Horario */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Hora Inicio</label>
                <input
                  type="time"
                  value={formData.horarioInicio}
                  onChange={e => setFormData(prev => ({ ...prev, horarioInicio: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: N.base, boxShadow: inset, color: N.text, outline: 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Hora Fin</label>
                <input
                  type="time"
                  value={formData.horarioFin}
                  onChange={e => setFormData(prev => ({ ...prev, horarioFin: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: N.base, boxShadow: inset, color: N.text, outline: 'none' }}
                />
              </div>
            </div>

            {/* Días */}
            <div>
              <label className="block text-xs font-bold mb-3" style={{ color: N.textSub }}>Días de Transmisión</label>
              <div className="flex flex-wrap gap-2">
                {diasSemanaOpciones.map(dia => {
                  const isSelected = formData.diasSemana.includes(dia.value);
                  return (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.value)}
                      className="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200"
                      style={{
                        background: isSelected ? N.accent : N.base,
                        color: isSelected ? '#fff' : N.text,
                        boxShadow: isSelected ? neuSm : inset,
                      }}
                    >
                      {dia.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vigencia */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Vigencia Desde</label>
                <input
                  type="date"
                  value={formData.vigenciaDesde}
                  onChange={e => setFormData(prev => ({ ...prev, vigenciaDesde: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: N.base, boxShadow: inset, color: N.text, outline: 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Vigencia Hasta</label>
                <input
                  type="date"
                  value={formData.vigenciaHasta}
                  onChange={e => setFormData(prev => ({ ...prev, vigenciaHasta: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: N.base, boxShadow: inset, color: N.text, outline: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: N.dark }}>
          <NeuButton onClick={onClose}>Cancelar</NeuButton>
          <NeuButton variant="primary" onClick={() => { /* TODO: guardar cambios */ onClose(); }}>
            Guardar Cambios
          </NeuButton>
        </div>
      </motion.div>
    </div>
  );
}

function VerClientesModal({
  isOpen,
  programa,
  clientesActivos,
  clientesPorComenzar,
  clientesListaEspera,
  loading,
  onClose
}: ProgramaEditModal & { onClose: () => void }) {
  if (!isOpen || !programa) return null;

  const clientesPorSeccion = [
    { titulo: 'Clientes Activos', icono: UserCheck, color: '#22c55e', clientes: clientesActivos },
    { titulo: 'Por Comenzar', icono: Play, color: '#f59e0b', clientes: clientesPorComenzar },
    { titulo: 'Lista de Espera', icono: Users, color: '#ef4444', clientes: clientesListaEspera },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl"
        style={{ background: N.base, boxShadow: neu }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: N.dark }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                <Calendar className="w-6 h-6" style={{ color: N.accent }} />
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: N.text }}>{programa.nombre}</h2>
                <p className="text-sm" style={{ color: N.textSub }}>{programa.emiNombre} - {programa.horario.horaInicio} a {programa.horario.horaFin}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:opacity-70"
              style={{ background: N.base, boxShadow: neuSm }}
            >
              <X className="w-5 h-5" style={{ color: N.text }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: N.base, boxShadow: neu }}
              >
                <CalendarClock className="w-5 h-5" style={{ color: N.accent }} />
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              {clientesPorSeccion.map(seccion => (
                <div key={seccion.titulo}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg" style={{ background: N.base, boxShadow: neuXs }}>
                      <seccion.icono className="w-5 h-5" style={{ color: seccion.color }} />
                    </div>
                    <h3 className="font-bold" style={{ color: N.text }}>
                      {seccion.titulo}
                      <span className="ml-2 text-sm font-normal" style={{ color: N.textSub }}>
                        ({seccion.clientes.length})
                      </span>
                    </h3>
                  </div>

                  {seccion.clientes.length === 0 ? (
                    <div className="p-6 rounded-xl text-center" style={{ background: N.base, boxShadow: inset }}>
                      <p className="text-sm" style={{ color: N.textSub }}>No hay clientes en esta sección</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {seccion.clientes.map(cliente => (
                        <div
                          key={cliente.id}
                          className="p-4 rounded-xl flex items-center justify-between"
                          style={{ background: N.base, boxShadow: insetSm }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: seccion.color + '20' }}
                            >
                              <span className="font-bold" style={{ color: seccion.color }}>
                                {cliente.clienteNombre.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ color: N.text }}>{cliente.clienteNombre}</p>
                              <p className="text-xs" style={{ color: N.textSub }}>{cliente.clienteRubro} - {cliente.tipoCupo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm" style={{ color: seccion.color }}>{formatCurrency(cliente.valor)}</p>
                            <p className="text-xs" style={{ color: N.textSub }}>{cliente.ejecutivoNombre}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: N.dark }}>
          <div className="flex justify-end">
            <NeuButton onClick={onClose}>
              Cerrar
            </NeuButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function VencimientosDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('programas');
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [vencimientos, setVencimientos] = useState<Vencimientos[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [metricas, setMetricas] = useState({
    totalProgramas: 0,
    programasActivos: 0,
    totalCuposDisponibles: 0,
    ocupacionPromedio: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmisora, setFilterEmisora] = useState('todas');
  const [filterDisponibilidad, setFilterDisponibilidad] = useState('todos');

  // Modal state
  const [modalState, setModalState] = useState<ProgramaEditModal>({
    isOpen: false,
    programa: null,
    clientesActivos: [],
    clientesPorComenzar: [],
    clientesListaEspera: [],
    loading: false,
  });

  // Edit modal state (separate)
  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    programa: null as Programa | null,
  });

  // Fetch data - Usa datos mock para desarrollo local sin BD
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Usar datos mock directamente (sin llamada a API)
      setProgramas(programasMock as unknown as Programa[]);
      setMetricas(metricasMock);
      setVencimientos(vencimientosMock as unknown as Vencimientos[]);
      setAlertas(alertasMock as unknown as Alerta[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch clientes for programa - Usa datos mock
  const fetchClientesPrograma = useCallback(async (programa: Programa) => {
    setModalState(prev => ({ ...prev, isOpen: true, programa, loading: true }));

    // Importar clientes mock dinámicamente para evitar dependencia circular
    const { clientesProgramaMock } = await import('@/lib/mock-data/vencimientos-mock');

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const clientesActivos = clientesProgramaMock.filter(c => c.estado === 'ACTIVO');
    const clientesPorComenzar = clientesProgramaMock.filter(c => c.estado === 'POR_COMENZAR');
    const clientesListaEspera = clientesProgramaMock.filter(c => c.estado === 'LISTA_ESPERA');

    setModalState({
      isOpen: true,
      programa,
      clientesActivos: clientesActivos as unknown as ClientePrograma[],
      clientesPorComenzar: clientesPorComenzar as unknown as ClientePrograma[],
      clientesListaEspera: clientesListaEspera as unknown as ClientePrograma[],
      loading: false,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false, programa: null }));
  }, []);

  // Filter programas
  const filteredProgramas = programas.filter((p) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !p.nombre.toLowerCase().includes(query) &&
        !p.emiNombre.toLowerCase().includes(query) &&
        !p.descripcion.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (filterEmisora !== 'todas' && p.emiId !== filterEmisora) {
      return false;
    }
    if (filterDisponibilidad === 'disponibles' && !p.tieneCuposDisponibles) {
      return false;
    }
    if (filterDisponibilidad === 'completos' && p.tieneCuposDisponibles) {
      return false;
    }
    return true;
  });

  // Unique emisoras - deduplicar por emiId manteniendo el primer nombre
  const emisorasMap = programas.reduce((acc, p) => {
    if (!acc.has(p.emiId)) {
      acc.set(p.emiId, { id: p.emiId, nombre: p.emiNombre });
    }
    return acc;
  }, new Map<string, { id: string; nombre: string }>());
  const emisoras = Array.from(emisorasMap.values()).sort(
    (a, b) => a.nombre.localeCompare(b.nombre)
  );

  // Get alerts count
  const alertasNoLeidas = alertas.filter((a) => !a.leida).length;
  const vencimientosCriticos = vencimientos.filter((v) => v.nivelAlerta === 'rojo' || v.nivelAlerta === 'critico').length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: N.base }}>
        <NeuCard className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: N.base, boxShadow: neu }}
          >
            <CalendarClock className="w-6 h-6" style={{ color: N.accent }} />
          </motion.div>
          <p className="text-sm font-bold" style={{ color: N.textSub }}>Cargando módulo de vencimientos...</p>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
              <CalendarClock className="w-8 h-8" style={{ color: N.accent }} />
            </div>
            <div>
              <h1 className="text-3xl font-black" style={{ color: N.text }}>Centro de Comando de Inventario</h1>
              <p className="text-sm mt-1 flex items-center gap-2" style={{ color: N.textSub }}>
                <Zap className="w-4 h-4" style={{ color: N.accent }} />
                Gestión de programas, cupos y vencimientos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeuButton onClick={fetchData}>
              <RefreshCw className="w-5 h-5" /> Actualizar
            </NeuButton>
            <NeuButton variant="primary" onClick={() => router.push('/vencimientos/crear')}>
              <Plus className="w-5 h-5" /> Nuevo Programa
            </NeuButton>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Programas Activos"
            value={metricas.programasActivos}
            subtitle={`de ${metricas.totalProgramas} total`}
            icon={Package}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Cupos Disponibles"
            value={metricas.totalCuposDisponibles}
            subtitle="en todos los programas"
            icon={CheckCircle2}
            trend={{ value: 5, positive: true }}
          />
          <StatCard
            title="Ocupación Global"
            value={`${metricas.ocupacionPromedio}%`}
            subtitle="promedio del inventario"
            icon={TrendingUp}
            trend={{ value: 5, positive: true }}
          />
          <StatCard
            title="Alertas Pendientes"
            value={alertasNoLeidas}
            subtitle="requieren atención"
            icon={Bell}
            trend={{ value: -3, positive: false }}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: N.base, boxShadow: inset }}>
          <TabButton
            label="Programas"
            active={activeTab === 'programas'}
            onClick={() => setActiveTab('programas')}
          />
          <TabButton
            label="Vencimientos"
            active={activeTab === 'vencimientos'}
            onClick={() => setActiveTab('vencimientos')}
            badge={vencimientosCriticos}
          />
          <TabButton
            label="Alertas"
            active={activeTab === 'alertas'}
            onClick={() => setActiveTab('alertas')}
            badge={alertasNoLeidas}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'programas' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={() => { }} />
              <div className="flex gap-3">
                <select
                  value={filterEmisora}
                  onChange={(e) => setFilterEmisora(e.target.value)}
                  className="px-4 py-3 rounded-xl text-sm font-medium cursor-pointer"
                  style={{
                    background: N.base,
                    boxShadow: inset,
                    color: N.text,
                    outline: 'none'
                  }}
                >
                  <option value="todas">Todas las emisoras</option>
                  {emisoras.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
                <FilterTabs
                  value={filterDisponibilidad}
                  onChange={setFilterDisponibilidad}
                  options={['todos', 'disponibles', 'completos']}
                />
              </div>
            </div>

            {/* Programas Grid */}
            {filteredProgramas.length === 0 ? (
              <NeuCard className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: N.textSub }} />
                <p className="text-sm font-bold" style={{ color: N.textSub }}>No se encontraron programas</p>
              </NeuCard>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProgramas.map((programa) => (
                  <ProgramaCard
                    key={programa.id}
                    programa={programa}
                    onSelect={fetchClientesPrograma}
                    onEdit={(p) => setEditModalState({ isOpen: true, programa: p })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vencimientos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                  <Calendar className="w-6 h-6" style={{ color: N.accent }} />
                </div>
                <h2 className="text-lg font-black" style={{ color: N.text }}>Vencimientos Próximos (30 días)</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: N.base, boxShadow: insetSm, color: N.textSub }}>
                {vencimientos.length} vencimientos
              </span>
            </div>
            <div className="space-y-3">
              {vencimientos.length === 0 ? (
                <NeuCard className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#22c55e' }} />
                  <p className="text-sm font-bold" style={{ color: N.textSub }}>No hay vencimientos próximos</p>
                </NeuCard>
              ) : (
                vencimientos.map((venc) => <VencimientosItem key={venc.id} vencimientos={venc} />)
              )}
            </div>
          </div>
        )}

        {activeTab === 'alertas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                  <Bell className="w-6 h-6" style={{ color: N.accent }} />
                </div>
                <h2 className="text-lg font-black" style={{ color: N.text }}>Alertas Recientes</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                {alertasNoLeidas} sin leer
              </span>
            </div>
            <div className="space-y-3">
              {alertas.length === 0 ? (
                <NeuCard className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#22c55e' }} />
                  <p className="text-sm font-bold" style={{ color: N.textSub }}>No hay alertas pendientes</p>
                </NeuCard>
              ) : (
                alertas.map((alerta) => <AlertaItem key={alerta.id} alerta={alerta} />)
              )}
            </div>
          </div>
        )}

        {/* Modal de edición de programa */}
        <EditarProgramaModal
          isOpen={editModalState.isOpen}
          programa={editModalState.programa}
          loading={false}
          onClose={() => setEditModalState({ isOpen: false, programa: null })}
          onSave={() => { }}
        />

        {/* Modal de clientes */}
        <VerClientesModal
          isOpen={modalState.isOpen}
          programa={modalState.programa}
          clientesActivos={modalState.clientesActivos}
          clientesPorComenzar={modalState.clientesPorComenzar}
          clientesListaEspera={modalState.clientesListaEspera}
          loading={modalState.loading}
          onClose={closeModal}
        />

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs font-medium" style={{ color: N.textSub }}>
            📅 Módulo de Vencimientos - SILEXAR PULSE TIER 0
          </p>
        </div>
      </div>
    </div>
  );
}
