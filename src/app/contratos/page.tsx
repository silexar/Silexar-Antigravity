/**
 * 📝 SILEXAR PULSE - Página de Gestión de Contratos
 * 
 * @description Vista principal del módulo de Contratos con diseño neuromórfico
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause,
  User,
  Building2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Contrato {
  id: string;
  numeroContrato: string;
  titulo: string;
  clienteNombre: string;
  tipoContrato: string;
  fechaInicio: string;
  fechaFin: string;
  valorTotalNeto: number;
  moneda: string;
  estado: string;
  porcentajeEjecutado: number;
  ejecutivoNombre: string | null;
  fechaCreacion: string;
}

interface Stats {
  total: number;
  activos: number;
  valorTotal: number;
  completados: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const N = { base:'#dfeaff', dark:'#bec8de', light:'#ffffff', accent:'#6888ff', text:'#69738c', sub:'#9aa3b8' };
const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 ${className}`} style={{ background: N.base, boxShadow: neu }}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'secondary', className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) => {
  const s = variant === 'primary'
    ? { background: N.accent, color: '#fff', boxShadow: neuSm }
    : { background: N.base, color: N.text, boxShadow: neu };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${className}`} style={s}>
      {children}
    </button>
  );
};

const StatusBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType }> = {
    activo: { bg: 'from-emerald-400 to-emerald-500', icon: CheckCircle },
    completado: { bg: 'from-blue-400 to-blue-500', icon: CheckCircle },
    pendiente_aprobacion: { bg: 'from-amber-400 to-amber-500', icon: AlertCircle },
    borrador: { bg: 'from-slate-400 to-slate-500', icon: FileText },
    pausado: { bg: 'from-orange-400 to-orange-500', icon: Pause },
    cancelado: { bg: 'from-red-400 to-red-500', icon: XCircle },
    vencido: { bg: 'from-gray-400 to-gray-500', icon: Clock }
  };
  const { bg, icon: Icon } = config[estado] || config.borrador;
  const label = estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${bg} shadow-md`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

const ProgressBar = ({ percentage }: { percentage: number }) => {
  const barColor = percentage >= 100 ? '#22c55e' : percentage >= 75 ? '#6888ff' : percentage >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-32">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: N.sub }}>Ejecutado</span>
        <span className="font-bold" style={{ color: N.text }}>{percentage}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(percentage,100)}%`, background: barColor }} />
      </div>
    </div>
  );
};

const formatCurrency = (value: number, currency: string = 'CLP') => {
  if (currency === 'CLP') {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(value);
};

// ═══════════════════════════════════════════════════════════════
// CONTRATO ROW — extracted to avoid duplication in virtual list
// ═══════════════════════════════════════════════════════════════

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

function ContratoRow({ contrato, router }: { contrato: Contrato; router: AppRouterInstance }) {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
          <FileText className="w-6 h-6" style={{ color: N.accent }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold" style={{ color: N.accent }}>{contrato.numeroContrato}</span>
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium" style={{ background: N.base, boxShadow: 'inset 2px 2px 4px #bec8de,inset -2px -2px 4px #ffffff', color: N.sub }}>{contrato.tipoContrato}</span>
          </div>
          <h3 className="font-bold text-sm mt-1" style={{ color: N.text }}>{contrato.titulo}</h3>
          <div className="flex items-center gap-4 text-xs mt-1" style={{ color: N.sub }}>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{contrato.clienteNombre}</span>
            {contrato.ejecutivoNombre && <span className="flex items-center gap-1"><User className="w-3 h-3" />{contrato.ejecutivoNombre}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-xs" style={{ color: N.sub }}>
          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(contrato.fechaInicio).toLocaleDateString('es-CL')} - {new Date(contrato.fechaFin).toLocaleDateString('es-CL')}</div>
        </div>
        <div className="text-right">
          <p className="font-black text-base" style={{ color: N.text }}>{formatCurrency(contrato.valorTotalNeto)}</p>
          <p className="text-xs" style={{ color: N.sub }}>{contrato.moneda}</p>
        </div>
        <ProgressBar percentage={contrato.porcentajeEjecutado} />
        <StatusBadge estado={contrato.estado} />
        <div className="flex gap-1.5">
          <button onClick={() => router.push(`/contratos/${contrato.id}`)} className="p-2 rounded-xl transition-all" style={{ background: N.base, boxShadow: 'inset 2px 2px 4px #bec8de,inset -2px -2px 4px #ffffff', color: N.accent }}><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={() => router.push(`/contratos/${contrato.id}/editar`)} className="p-2 rounded-xl transition-all" style={{ background: N.base, boxShadow: 'inset 2px 2px 4px #bec8de,inset -2px -2px 4px #ffffff', color: '#f59e0b' }}><Edit3 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ContratosPage() {
  const router = useRouter();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, activos: 0, valorTotal: 0, completados: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Virtual list — only activates when list exceeds 50 items
  const listContainerRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: contratos.length,
    getScrollElement: () => listContainerRef.current,
    estimateSize: () => 90, // estimated row height in px
    overscan: 5,
    enabled: contratos.length > 50,
  })

  const fetchContratos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filterEstado && { estado: filterEstado })
      });
      const { data } = await apiClient.get<{ data: typeof contratos; stats: typeof stats }>(`/api/contratos?${params}`);
      if (data?.data) {
        setContratos(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      /* handled by apiClient */ void error;
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterEstado]);

  useEffect(() => { fetchContratos(); }, [fetchContratos]);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3" style={{ color: N.text }}>
              <FileText className="w-8 h-8" style={{ color: N.accent }} />
              Gestión de Contratos
            </h1>
            <p className="mt-1 text-sm" style={{ color: N.sub }}>Administra contratos comerciales y acuerdos con clientes</p>
          </div>
          <NeuromorphicButton variant="primary" onClick={() => router.push('/contratos/nuevo')}>
            <Plus className="w-5 h-5" /> Nuevo Contrato
          </NeuromorphicButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label:'Total Contratos', value: stats.total,              icon: FileText,    color: N.accent   },
            { label:'Activos',         value: stats.activos,            icon: TrendingUp,  color: '#22c55e'  },
            { label:'Valor Total',     value: formatCurrency(stats.valorTotal), icon: DollarSign, color: N.accent },
            { label:'Completados',     value: stats.completados,        icon: CheckCircle, color: '#a855f7'  },
          ].map(({ label, value, icon: Icon, color }) => (
            <NeuromorphicCard key={label}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.sub }}>{label}</p>
                  <p className="text-3xl font-black" style={{ color: N.text }}>{value}</p>
                </div>
              </div>
            </NeuromorphicCard>
          ))}
        </div>

        {/* Filtros */}
        <NeuromorphicCard>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.sub }} />
              <input
                type="text" placeholder="Buscar contratos..." aria-label="Buscar contratos"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none"
                style={{ background: N.base, boxShadow: inset, color: N.text }}
              />
            </div>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
              className="rounded-xl py-3 px-4 text-sm focus:outline-none cursor-pointer"
              style={{ background: N.base, boxShadow: inset, color: N.text }}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="completado">Completados</option>
              <option value="pendiente_aprobacion">Pendientes</option>
              <option value="borrador">Borradores</option>
            </select>
            <NeuromorphicButton variant="secondary" onClick={fetchContratos}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </NeuromorphicButton>
          </div>
        </NeuromorphicCard>

        {/* Lista de contratos */}
        <NeuromorphicCard className="overflow-hidden">
          {loading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4].map(i => (
                <div key={`skeleton-${i}`} className="flex items-center gap-4 p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-xl animate-pulse bg-[#E8E5E0]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 animate-pulse bg-[#E8E5E0] rounded w-1/3" />
                    <div className="h-3 animate-pulse bg-[#E8E5E0] rounded w-1/2" />
                  </div>
                  <div className="h-6 w-20 animate-pulse bg-[#E8E5E0] rounded-full" />
                </div>
              ))}
            </div>
          ) : contratos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600">No hay contratos</h3>
            </div>
          ) : (
            // Virtual list: scrollable container with fixed height when >50 items
            <div
              ref={listContainerRef}
              className="space-y-4"
              style={contratos.length > 50 ? { height: '600px', overflowY: 'auto' } : undefined}
            >
              {contratos.length > 50 ? (
                // Virtualized render — only DOM nodes for visible rows
                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const contrato = contratos[virtualRow.index]
                    return (
                      <div
                        key={contrato.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                          background: '#dfeaff',
                          boxShadow: neuSm,
                        }}
                        className="flex items-center justify-between p-4 rounded-xl transition-all"
                      >
                        <ContratoRow contrato={contrato} router={router} />
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Standard render for ≤50 items — no virtualization overhead
                contratos.map((contrato) => (
                  <div key={contrato.id} className="flex items-center justify-between p-4 rounded-xl transition-all" style={{ background: '#dfeaff', boxShadow: neuSm }}>
                    <ContratoRow contrato={contrato} router={router} />
                  </div>
                ))
              )}
            </div>
          )}
        </NeuromorphicCard>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>📝 Módulo de Gestión de Contratos - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}