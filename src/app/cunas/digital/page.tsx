/**
 * 🎯 SILEXAR PULSE - Centro de Operaciones Activos Digitales TIER 0
 *
 * Dashboard principal para gestión de activos publicitarios digitales
 * Diseño neumórfico refinado, mobile-first, responsive pixel-perfect.
 *
 * @version 2026.2.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Target, Search, Plus, Eye, Edit3, Play, Pause, RefreshCw,
  Image, Video, Music, Layers, BarChart2, TrendingUp, DollarSign,
  CheckCircle, Clock, Archive, MoreVertical, Zap, Filter, X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ActivoDigital {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  tipoCategoria: string;
  estado: string;
  anuncianteNombre: string;
  formatoPrincipal: string;
  segmentacionResumen: {
    demografica: string[];
    geografica: string[];
    dispositivos: string[];
    intereses: string[];
  };
  alcanceEstimado: string;
  impresiones: number;
  clics: number;
  ctr: number;
  conversiones: number;
  costoTotal: number;
  roas: number;
  presupuestoTipo: string;
  presupuestoMonto: number;
  presupuestoGastado: number;
  fechaInicio: string;
  fechaFin: string;
  plataformas: string[];
}

interface Metricas {
  total: number;
  activos: number;
  programados: number;
  pausados: number;
  impresionesTotales: number;
  clicsTotales: number;
  inversionTotal: number;
  roasPromedio: number;
}

// ═══════════════════════════════════════════════════════════════
// NEUMORPHIC UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════

const NeumorphicCard = ({ children, className = '', raised = true, onClick }: {
  children: React.ReactNode; className?: string; raised?: boolean; onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`rounded-2xl p-4 sm:p-6 transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
    style={raised
      ? {
        background: 'linear-gradient(145deg, #f0f2f5, #e6e8eb)',
        boxShadow: '8px 8px 16px #c8cacd, -8px -8px 16px #ffffff',
      }
      : {
        background: 'linear-gradient(145deg, #e6e8eb, #f0f2f5)',
        boxShadow: 'inset 4px 4px 8px #c8cacd, inset -4px -4px 8px #ffffff',
      }
    }
  >
    {children}
  </div>
);

const NeumorphicButton = ({ children, onClick, variant = 'secondary' as 'primary' | 'secondary' | 'danger', disabled = false, className = '', size = 'md' as 'sm' | 'md' | 'lg' }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean; className?: string; size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variantStyles = {
    primary: {
      background: 'linear-gradient(145deg, #7C3AED, #6D28D9)',
      color: '#fff',
      boxShadow: '5px 5px 12px rgba(124,58,237,0.35), -3px -3px 8px rgba(255,255,255,0.7)',
    },
    secondary: {
      background: 'linear-gradient(145deg, #f0f2f5, #e2e4e7)',
      color: '#4B5563',
      boxShadow: '4px 4px 10px rgba(0,0,0,0.08), -3px -3px 8px rgba(255,255,255,0.8)',
    },
    danger: {
      background: 'linear-gradient(145deg, #EF4444, #DC2626)',
      color: '#fff',
      boxShadow: '5px 5px 12px rgba(239,68,68,0.35), -3px -3px 8px rgba(255,255,255,0.7)',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${sizeClasses[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.97]'
        } ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </button>
  );
};

const NeumorphicInput = ({ value, onChange, placeholder, icon, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; className?: string;
}) => (
  <div className={`relative ${className}`}>
    {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl py-3 ${icon ? 'pl-12' : 'pl-4'} pr-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-400/30`}
      style={{
        background: 'linear-gradient(145deg, #e6e8eb, #f0f2f5)',
        boxShadow: 'inset 3px 3px 6px #c8cacd, inset -3px -3px 6px #ffffff',
        border: 'none',
      }}
    />
  </div>
);

const NeumorphicSelect = ({ value, onChange, options, className = '' }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`rounded-xl py-3 px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-400/30 ${className}`}
    style={{
      background: 'linear-gradient(145deg, #e6e8eb, #f0f2f5)',
      boxShadow: 'inset 3px 3px 6px #c8cacd, inset -3px -3px 6px #ffffff',
      border: 'none',
    }}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// ═══════════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════════

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
    activo: { bg: 'linear-gradient(145deg, #10B981, #059669)', icon: Play, label: 'Activo' },
    programado: { bg: 'linear-gradient(145deg, #3B82F6, #2563EB)', icon: Clock, label: 'Programado' },
    pausado: { bg: 'linear-gradient(145deg, #F59E0B, #D97706)', icon: Pause, label: 'Pausado' },
    borrador: { bg: 'linear-gradient(145deg, #6B7280, #4B5563)', icon: Edit3, label: 'Borrador' },
    completado: { bg: 'linear-gradient(145deg, #6366F1, #4F46E5)', icon: CheckCircle, label: 'Completado' },
    archivado: { bg: 'linear-gradient(145deg, #9CA3AF, #6B7280)', icon: Archive, label: 'Archivado' },
  };

  const { bg, icon: Icon, label } = config[estado] || config.borrador;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
      style={{ background: bg }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
    banner: { bg: 'linear-gradient(145deg, #3B82F6, #2563EB)', icon: Image, label: 'Banner' },
    video: { bg: 'linear-gradient(145deg, #EF4444, #DC2626)', icon: Video, label: 'Video' },
    audio: { bg: 'linear-gradient(145deg, #8B5CF6, #7C3AED)', icon: Music, label: 'Audio' },
    native: { bg: 'linear-gradient(145deg, #F59E0B, #D97706)', icon: Layers, label: 'Native' },
    interactive: { bg: 'linear-gradient(145deg, #10B981, #059669)', icon: Zap, label: 'Interactivo' },
  };

  const { bg, icon: Icon, label } = config[tipo] || config.banner;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-md"
      style={{ background: bg }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════

const MetricCard = ({ label, value, icon: Icon, gradient, subtext }: {
  label: string; value: string | number; icon: React.ElementType;
  gradient: string; subtext?: string;
}) => (
  <NeumorphicCard className="relative overflow-hidden !p-4 sm:!p-5">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtext && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{subtext}</p>}
      </div>
      <div
        className="p-3 sm:p-4 rounded-xl flex-shrink-0 shadow-lg"
        style={{ background: gradient }}
      >
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>
    </div>
    <div
      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
      style={{ background: gradient }}
    />
  </NeumorphicCard>
);

// ═══════════════════════════════════════════════════════════════
// ACTIVE DIGITAL ROW (Mobile + Desktop)
// ═══════════════════════════════════════════════════════════════

const ActivoDigitalRow = ({ activo }: { activo: ActivoDigital }) => (
  <NeumorphicCard
    raised
    className="!p-4 hover:!scale-[1.005] transition-all duration-200"
  >
    {/* Mobile: stacked layout */}
    <div className="sm:hidden space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-purple-600">{activo.codigo}</span>
            <TipoBadge tipo={activo.tipoCategoria} />
            <EstadoBadge estado={activo.estado} />
          </div>
          <h3 className="font-semibold text-gray-800 truncate mt-1">{activo.nombre}</h3>
          <p className="text-xs text-gray-500">{activo.anuncianteNombre}</p>
        </div>
      </div>

      {/* Métricas en fila */}
      <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-gray-200">
        <div>
          <p className="text-sm font-bold text-gray-800">
            {activo.impresiones > 1000 ? `${(activo.impresiones / 1000).toFixed(0)}K` : activo.impresiones}
          </p>
          <p className="text-[10px] text-gray-400">Impres.</p>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">{activo.ctr.toFixed(2)}%</p>
          <p className="text-[10px] text-gray-400">CTR</p>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">{activo.conversiones}</p>
          <p className="text-[10px] text-gray-400">Conv.</p>
        </div>
        <div>
          <p className={`text-sm font-bold ${activo.roas >= 3 ? 'text-emerald-600' : activo.roas >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
            {activo.roas.toFixed(1)}x
          </p>
          <p className="text-[10px] text-gray-400">ROAS</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-1">
        <button aria-label="Ver" className="p-2 rounded-lg text-purple-600" style={{ background: 'linear-gradient(145deg, #EDE9FE, #DDD6FE)' }}>
          <Eye className="w-4 h-4" />
        </button>
        <button aria-label="Editar" className="p-2 rounded-lg text-amber-600" style={{ background: 'linear-gradient(145deg, #FEF3C7, #FDE68A)' }}>
          <Edit3 className="w-4 h-4" />
        </button>
        <button aria-label="Más opciones" className="p-2 rounded-lg text-gray-500" style={{ background: 'linear-gradient(145deg, #F3F4F6, #E5E7EB)' }}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Desktop: horizontal layout */}
    <div className="hidden sm:flex items-center justify-between gap-4">
      {/* Info Principal */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-purple-600">{activo.codigo}</span>
            <TipoBadge tipo={activo.tipoCategoria} />
            <EstadoBadge estado={activo.estado} />
          </div>
          <h3 className="font-medium text-gray-800 truncate mt-1">{activo.nombre}</h3>
          <p className="text-sm text-gray-500">{activo.anuncianteNombre}</p>
        </div>
      </div>

      {/* Segmentación */}
      <div className="hidden xl:flex gap-2 px-4 max-w-[280px] flex-shrink-0">
        {activo.segmentacionResumen.geografica.slice(0, 2).map((s, i) => (
          <span key={`${s}-${i}`} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
            {s}
          </span>
        ))}
        {activo.segmentacionResumen.dispositivos.slice(0, 1).map((s, i) => (
          <span key={`${s}-${i}`} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
            {s}
          </span>
        ))}
      </div>

      {/* Métricas */}
      <div className="hidden lg:grid grid-cols-4 gap-4 px-4 text-center flex-shrink-0">
        <div>
          <p className="text-lg font-bold text-gray-800">
            {activo.impresiones > 1000 ? `${(activo.impresiones / 1000).toFixed(0)}K` : activo.impresiones}
          </p>
          <p className="text-xs text-gray-400">Impres.</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800">{activo.ctr.toFixed(2)}%</p>
          <p className="text-xs text-gray-400">CTR</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800">{activo.conversiones}</p>
          <p className="text-xs text-gray-400">Conv.</p>
        </div>
        <div>
          <p className={`text-lg font-bold ${activo.roas >= 3 ? 'text-emerald-600' : activo.roas >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
            {activo.roas.toFixed(1)}x
          </p>
          <p className="text-xs text-gray-400">ROAS</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button aria-label="Ver" className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors">
          <Eye className="w-5 h-5" />
        </button>
        <button aria-label="Editar" className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">
          <Edit3 className="w-5 h-5" />
        </button>
        <button aria-label="Ver estadísticas" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
          <BarChart2 className="w-5 h-5" />
        </button>
        <button aria-label="Más opciones" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  </NeumorphicCard>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ActivosDigitalesPage() {
  const router = useRouter();
  const [activos, setActivos] = useState<ActivoDigital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [metricas, setMetricas] = useState<Metricas>({
    total: 0, activos: 0, programados: 0, pausados: 0,
    impresionesTotales: 0, clicsTotales: 0, inversionTotal: 0, roasPromedio: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterTipo) params.set('tipo', filterTipo);
      if (filterEstado) params.set('estado', filterEstado);

      const res = await fetch(`/api/activos-digitales?${params}`);
      const data = await res.json();

      if (data.success) {
        setActivos(data.data);
        setMetricas(data.metricas);
      }
    } catch {
      // Error silencioso — mostrar estado vacío
    } finally {
      setLoading(false);
    }
  }, [search, filterTipo, filterEstado]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #F0F2F5, #E8ECF1, #F5F7FA)' }}>
      <div className="max-w-[1920px] mx-auto p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6">

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 sm:gap-3"
              style={{
                background: 'linear-gradient(135deg, #1E293B, #7C3AED, #1E293B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              <span className="p-2 sm:p-3 rounded-xl shadow-lg"
                style={{ background: 'linear-gradient(145deg, #7C3AED, #6D28D9)', boxShadow: '5px 5px 12px rgba(124,58,237,0.3)' }}>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </span>
              Activos Digitales
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
              Gestión omnicanal de publicidad digital con segmentación avanzada
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <NeumorphicButton variant="secondary" onClick={() => router.push('/cunas')} size="sm">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Cuñas Radio</span>
            </NeumorphicButton>
            <NeumorphicButton variant="primary" onClick={() => router.push('/cunas/digital/nuevo')} size="sm">
              <Plus className="w-4 h-4" />
              <span>Nuevo Activo</span>
            </NeumorphicButton>
          </div>
        </div>

        {/* ═══ MÉTRICAS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="Activos Activos" value={metricas.activos} icon={Play}
            gradient="linear-gradient(145deg, #10B981, #059669)"
            subtext={`${metricas.programados} programados`}
          />
          <MetricCard
            label="Impresiones" value={metricas.impresionesTotales > 1000000 ? `${(metricas.impresionesTotales / 1000000).toFixed(1)}M` : `${(metricas.impresionesTotales / 1000).toFixed(0)}K`}
            icon={Eye}
            gradient="linear-gradient(145deg, #3B82F6, #2563EB)"
          />
          <MetricCard
            label="Inversión Total" value={formatCurrency(metricas.inversionTotal)} icon={DollarSign}
            gradient="linear-gradient(145deg, #8B5CF6, #7C3AED)"
          />
          <MetricCard
            label="ROAS Promedio" value={`${metricas.roasPromedio.toFixed(1)}x`} icon={TrendingUp}
            gradient="linear-gradient(145deg, #F59E0B, #D97706)"
          />
        </div>

        {/* ═══ FILTROS ═══ */}
        <NeumorphicCard raised className="!p-4 sm:!p-6">
          {/* Search + Toggle Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <NeumorphicInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por código, nombre o anunciante..."
              icon={<Search className="w-5 h-5" />}
              className="flex-1"
            />
            <div className="flex gap-2">
              <NeumorphicButton variant="secondary" onClick={() => setShowFilters(!showFilters)} size="sm">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </NeumorphicButton>
              <NeumorphicButton variant="secondary" onClick={fetchData} size="sm">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </NeumorphicButton>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
              <NeumorphicSelect
                value={filterTipo}
                onChange={setFilterTipo}
                options={[
                  { value: '', label: '📦 Todos los tipos' },
                  { value: 'banner', label: '🖼️ Banner' },
                  { value: 'video', label: '🎬 Video' },
                  { value: 'audio', label: '🎵 Audio' },
                  { value: 'native', label: '📱 Native' },
                  { value: 'interactive', label: '🎮 Interactivo' },
                ]}
                className="flex-1"
              />
              <NeumorphicSelect
                value={filterEstado}
                onChange={setFilterEstado}
                options={[
                  { value: '', label: '📋 Todos los estados' },
                  { value: 'activo', label: '▶️ Activo' },
                  { value: 'programado', label: '🕐 Programado' },
                  { value: 'pausado', label: '⏸️ Pausado' },
                  { value: 'completado', label: '✅ Completado' },
                ]}
                className="flex-1"
              />
              {(filterTipo || filterEstado) && (
                <NeumorphicButton variant="danger" onClick={() => { setFilterTipo(''); setFilterEstado(''); }} size="sm">
                  <X className="w-4 h-4" />
                  Limpiar
                </NeumorphicButton>
              )}
            </div>
          )}

          {/* ═══ LISTA ═══ */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
              <p className="text-sm text-gray-400 mt-4">Cargando activos...</p>
            </div>
          ) : activos.length === 0 ? (
            <NeumorphicCard raised={false} className="!p-8 sm:!p-12 text-center">
              <Target className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-500">
                {activos.length === 0 && !search && !filterTipo && !filterEstado
                  ? 'No hay activos digitales'
                  : 'Sin resultados'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {activos.length === 0 && !search && !filterTipo && !filterEstado
                  ? 'Crea tu primer activo digital para comenzar'
                  : 'Intenta con otros filtros o búsqueda'}
              </p>
              {activos.length === 0 && !search && !filterTipo && !filterEstado && (
                <NeumorphicButton variant="primary" onClick={() => router.push('/cunas/digital/nuevo')} className="mt-4">
                  <Plus className="w-5 h-5" /> Crear Primer Activo
                </NeumorphicButton>
              )}
            </NeumorphicCard>
          ) : (
            <div className="space-y-3 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#C4B5FD #E8ECF1' }}>
              {activos.map(activo => (
                <ActivoDigitalRow key={activo.id} activo={activo} />
              ))}
            </div>
          )}
        </NeumorphicCard>
      </div>
    </div>
  );
}
