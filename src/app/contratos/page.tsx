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

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'secondary', className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[4px_4px_12px_rgba(99,102,241,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]'
  };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] ${variants[variant]} ${className}`}>
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

const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div className="w-32">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-500">Ejecutado</span>
      <span className="font-bold text-slate-700">{percentage}%</span>
    </div>
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all ${
          percentage >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
          percentage >= 75 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
          percentage >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
          'bg-gradient-to-r from-red-400 to-red-500'
        }`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  </div>
);

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
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-indigo-600">{contrato.numeroContrato}</span>
            <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
              {contrato.tipoContrato}
            </span>
          </div>
          <h3 className="font-medium text-slate-800 mt-1">{contrato.titulo}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {contrato.clienteNombre}
            </span>
            {contrato.ejecutivoNombre && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {contrato.ejecutivoNombre}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(contrato.fechaInicio).toLocaleDateString('es-CL')} - {new Date(contrato.fechaFin).toLocaleDateString('es-CL')}
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-slate-800">{formatCurrency(contrato.valorTotalNeto)}</p>
          <p className="text-xs text-slate-400">{contrato.moneda}</p>
        </div>
        <ProgressBar percentage={contrato.porcentajeEjecutado} />
        <StatusBadge estado={contrato.estado} />
        <div className="flex gap-2">
          <button onClick={() => router.push(`/contratos/${contrato.id}`)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => router.push(`/contratos/${contrato.id}/editar`)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-500">
            <Edit3 className="w-4 h-4" />
          </button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <FileText className="w-10 h-10 text-indigo-500" />
              Gestión de Contratos
            </h1>
            <p className="text-slate-500 mt-2">Administra contratos comerciales y acuerdos con clientes</p>
          </div>
          <NeuromorphicButton variant="primary" onClick={() => router.push('/contratos/nuevo')}>
            <Plus className="w-5 h-5" /> Nuevo Contrato
          </NeuromorphicButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <NeuromorphicCard>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Contratos</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </NeuromorphicCard>
          
          <NeuromorphicCard>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Activos</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.activos}</p>
              </div>
            </div>
          </NeuromorphicCard>

          <NeuromorphicCard>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Valor Total</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.valorTotal)}</p>
              </div>
            </div>
          </NeuromorphicCard>

          <NeuromorphicCard>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Completados</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completados}</p>
              </div>
            </div>
          </NeuromorphicCard>
        </div>

        {/* Filtros */}
        <NeuromorphicCard>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar contratos..."
                aria-label="Buscar contratos"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl py-3 pl-12 pr-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] border-none outline-none focus:ring-2 focus:ring-indigo-400/50 text-slate-700"
              />
            </div>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="rounded-xl py-3 px-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] border-none text-slate-700">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="completado">Completados</option>
              <option value="pendiente_aprobacion">Pendientes</option>
              <option value="borrador">Borradores</option>
            </select>
            <NeuromorphicButton variant="secondary" onClick={fetchContratos}>
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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
                        }}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors"
                      >
                        <ContratoRow contrato={contrato} router={router} />
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Standard render for ≤50 items — no virtualization overhead
                contratos.map((contrato) => (
                  <div key={contrato.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
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