/**
 * 🎯 SILEXAR PULSE - Centro de Operaciones Activos Digitales TIER 0
 * 
 * Dashboard principal para gestión de activos publicitarios digitales
 * Banners, Videos, Audio, Native Ads con segmentación avanzada
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Target, Search, Plus, Eye, Edit3, Play, Pause, RefreshCw,
  Image, Video, Music, Layers, BarChart2, TrendingUp, DollarSign,
  CheckCircle, Clock, Archive, MoreVertical, Zap
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
// COMPONENTES UI
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'secondary', className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-[4px_4px_12px_rgba(168,85,247,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]'
  };
  
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 hover:scale-[1.02] ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, subtext }: { 
  label: string; value: string | number; icon: React.ElementType; color: string; subtext?: string;
}) => (
  <Card className="relative overflow-hidden">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />
  </Card>
);

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
    activo: { bg: 'from-emerald-400 to-emerald-500', icon: Play, label: 'Activo' },
    programado: { bg: 'from-blue-400 to-blue-500', icon: Clock, label: 'Programado' },
    pausado: { bg: 'from-amber-400 to-amber-500', icon: Pause, label: 'Pausado' },
    borrador: { bg: 'from-slate-400 to-slate-500', icon: Edit3, label: 'Borrador' },
    completado: { bg: 'from-gray-400 to-gray-500', icon: CheckCircle, label: 'Completado' },
    archivado: { bg: 'from-gray-500 to-gray-600', icon: Archive, label: 'Archivado' }
  };
  
  const { bg, icon: Icon, label } = config[estado] || config.borrador;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${bg} shadow-md`}>
      <Icon className="w-4 h-4" />{label}
    </span>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    banner: { color: 'bg-blue-100 text-blue-700', icon: Image },
    video: { color: 'bg-red-100 text-red-700', icon: Video },
    audio: { color: 'bg-purple-100 text-purple-700', icon: Music },
    native: { color: 'bg-amber-100 text-amber-700', icon: Layers },
    interactive: { color: 'bg-cyan-100 text-cyan-700', icon: Zap }
  };
  
  const { color, icon: Icon } = config[tipo] || config.banner;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />{tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    </span>
  );
};

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
    } catch (error) {
      /* console.error('Error:', error) */;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50/30 to-slate-100">
      <div className="max-w-[1920px] mx-auto p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-slate-800 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              Activos Digitales
            </h1>
            <p className="text-slate-500 mt-2">Gestión omnicanal de publicidad digital con segmentación avanzada</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push('/cunas')}>
              <Music className="w-5 h-5" /> Cuñas Radio
            </Button>
            <Button variant="primary" onClick={() => router.push('/cunas/digital/nuevo')}>
              <Plus className="w-5 h-5" /> Nuevo Activo Digital
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Activos Activos" value={metricas.activos} icon={Play} color="from-emerald-400 to-emerald-500" subtext={`${metricas.programados} programados`} />
          <MetricCard label="Impresiones Totales" value={metricas.impresionesTotales > 1000000 ? `${(metricas.impresionesTotales / 1000000).toFixed(1)}M` : `${(metricas.impresionesTotales / 1000).toFixed(0)}K`} icon={Eye} color="from-blue-400 to-blue-500" />
          <MetricCard label="Inversión Total" value={formatCurrency(metricas.inversionTotal)} icon={DollarSign} color="from-purple-400 to-purple-500" />
          <MetricCard label="ROAS Promedio" value={`${metricas.roasPromedio.toFixed(1)}x`} icon={TrendingUp} color="from-amber-400 to-amber-500" />
        </div>

        {/* Filtros y Lista */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar activos por código, nombre o anunciante..."
                aria-label="Buscar activos por código, nombre o anunciante"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl py-3 pl-12 pr-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] border-none outline-none focus:ring-2 focus:ring-purple-400/50"
              />
            </div>
            
            <div className="flex gap-2">
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="rounded-xl py-3 px-4 bg-slate-50 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05)] border-none text-sm">
                <option value="">Todos los tipos</option>
                <option value="banner">🖼️ Banner</option>
                <option value="video">🎬 Video</option>
                <option value="audio">🎵 Audio</option>
                <option value="native">📱 Native</option>
              </select>
              
              <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="rounded-xl py-3 px-4 bg-slate-50 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05)] border-none text-sm">
                <option value="">Todos los estados</option>
                <option value="activo">▶️ Activo</option>
                <option value="programado">🕐 Programado</option>
                <option value="pausado">⏸️ Pausado</option>
                <option value="completado">✅ Completado</option>
              </select>
              
              <Button variant="secondary" onClick={fetchData}>
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Lista */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-10 h-10 animate-spin text-purple-500" />
            </div>
          ) : activos.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-20 h-20 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600">No hay activos digitales</h3>
              <Button variant="primary" className="mt-6" onClick={() => router.push('/cunas/digital/nuevo')}>
                <Plus className="w-5 h-5" /> Crear Primer Activo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activos.map(activo => (
                <div
                  key={activo.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all"
                >
                  {/* Info Principal */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-purple-600 font-semibold">{activo.codigo}</span>
                        <TipoBadge tipo={activo.tipoCategoria} />
                        <EstadoBadge estado={activo.estado} />
                      </div>
                      <h3 className="font-medium text-slate-800 truncate mt-1">{activo.nombre}</h3>
                      <p className="text-sm text-slate-500">{activo.anuncianteNombre}</p>
                    </div>
                  </div>

                  {/* Segmentación */}
                  <div className="hidden xl:flex gap-2 px-4 max-w-[300px]">
                    {activo.segmentacionResumen.geografica.slice(0, 2).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{s}</span>
                    ))}
                    {activo.segmentacionResumen.dispositivos.slice(0, 1).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{s}</span>
                    ))}
                  </div>

                  {/* Métricas */}
                  <div className="hidden lg:grid grid-cols-4 gap-4 px-4 text-center min-w-[280px]">
                    <div>
                      <p className="text-lg font-bold text-slate-800">{activo.impresiones > 1000 ? `${(activo.impresiones / 1000).toFixed(0)}K` : activo.impresiones}</p>
                      <p className="text-xs text-slate-400">Impres.</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800">{activo.ctr.toFixed(2)}%</p>
                      <p className="text-xs text-slate-400">CTR</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800">{activo.conversiones}</p>
                      <p className="text-xs text-slate-400">Conv.</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${activo.roas >= 3 ? 'text-emerald-600' : activo.roas >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
                        {activo.roas.toFixed(1)}x
                      </p>
                      <p className="text-xs text-slate-400">ROAS</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    <button aria-label="Ver" className="p-2 rounded-lg hover:bg-purple-50 text-purple-600"><Eye className="w-5 h-5" /></button>
                    <button aria-label="Editar" className="p-2 rounded-lg hover:bg-amber-50 text-amber-600"><Edit3 className="w-5 h-5" /></button>
                    <button aria-label="Ver estadísticas" className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><BarChart2 className="w-5 h-5" /></button>
                    <button aria-label="Más opciones" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><MoreVertical className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
