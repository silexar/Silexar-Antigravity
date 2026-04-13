/**
 * 👤 SILEXAR PULSE - Página de Gestión de Vendedores
 * 
 * @description Vista principal del módulo de Vendedores con diseño neuromórfico
 * Incluye métricas de rendimiento, cumplimiento de metas y equipos
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  TrendingUp,
  Target,
  DollarSign,
  Award,
  RefreshCw,
  Mail,
  Star,
  BarChart3
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Vendedor {
  id: string;
  codigo: string;
  nombreCompleto: string;
  email: string;
  telefono: string | null;
  tipoVendedor: string;
  equipoNombre: string | null;
  equipoColor: string;
  estado: string;
  activo: boolean;
  metaActual: number | null;
  cumplimientoActual: number;
  ventasRealizadas: number;
  clientesAsignados: number;
  fechaCreacion: string;
}

interface Stats {
  total: number;
  activos: number;
  ventasTotales: number;
  cumplimientoPromedio: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`} onClick={onClick}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'secondary', className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[4px_4px_12px_rgba(249,115,22,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]'
  };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const ProgressRing = ({ percentage, size = 80 }: { percentage: number; size?: number }) => {
  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 100 ? '#10B981' : percentage >= 75 ? '#3B82F6' : percentage >= 50 ? '#F59E0B' : '#EF4444';
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="35" stroke="#E2E8F0" strokeWidth="6" fill="none" />
        <circle cx="40" cy="40" r="35" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{percentage}%</span>
      </div>
    </div>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const colors: Record<string, string> = {
    gerente: 'from-purple-400 to-purple-500',
    senior: 'from-blue-400 to-blue-500',
    ejecutivo: 'from-emerald-400 to-emerald-500',
    junior: 'from-amber-400 to-amber-500',
    freelance: 'from-gray-400 to-gray-500'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colors[tipo] || colors.ejecutivo}`}>
      <Star className="w-3 h-3" />
      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function VendedoresPage() {
  const router = useRouter();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, activos: 0, ventasTotales: 0, cumplimientoPromedio: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const fetchVendedores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...(debouncedSearch && { search: debouncedSearch }) });
      const response = await fetch(`/api/vendedores?${params}`);
      const data = await response.json();
      if (data.success) {
        setVendedores(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      /* */;
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchVendedores(); }, [fetchVendedores]);

  // Ranking por cumplimiento
  const ranking = [...vendedores].sort((a, b) => b.cumplimientoActual - a.cumplimientoActual);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="w-10 h-10 text-orange-500" />
              Gestión de Vendedores
            </h1>
            <p className="text-slate-500 mt-2">Equipo comercial, metas y rendimiento</p>
          </div>
          <NeuromorphicButton variant="primary" onClick={() => router.push('/vendedores/nuevo')}>
            <Plus className="w-5 h-5" /> Nuevo Vendedor
          </NeuromorphicButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Vendedores', value: stats.total, icon: Users, color: 'from-orange-400 to-orange-500' },
            { label: 'Activos', value: stats.activos, icon: TrendingUp, color: 'from-emerald-400 to-emerald-500' },
            { label: 'Ventas Totales', value: formatCurrency(stats.ventasTotales), icon: DollarSign, color: 'from-blue-400 to-blue-500' },
            { label: 'Cumplimiento Prom.', value: `${stats.cumplimientoPromedio}%`, icon: Target, color: 'from-purple-400 to-purple-500' }
          ].map((stat, i) => (
            <NeuromorphicCard key={`${stat}-${i}`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </NeuromorphicCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de vendedores */}
          <div className="lg:col-span-2 space-y-6">
            {/* Búsqueda */}
            <NeuromorphicCard>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar vendedores..."
                    aria-label="Buscar vendedores"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl py-3 pl-12 pr-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] border-none outline-none focus:ring-2 focus:ring-orange-400/50 text-slate-700"
                  />
                </div>
                <NeuromorphicButton variant="secondary" onClick={fetchVendedores}>
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </NeuromorphicButton>
              </div>
            </NeuromorphicCard>

            {/* Cards de vendedores */}
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
              </div>
            ) : vendedores.length === 0 ? (
              <NeuromorphicCard className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-600">No hay vendedores</h3>
              </NeuromorphicCard>
            ) : (
              <div className="space-y-4">
                {vendedores.map((vendedor) => (
                  <NeuromorphicCard key={vendedor.id} className="hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => router.push(`/vendedores/${vendedor.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {vendedor.nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800">{vendedor.nombreCompleto}</h3>
                            <TipoBadge tipo={vendedor.tipoVendedor} />
                          </div>
                          <p className="text-sm text-slate-500">{vendedor.codigo}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {vendedor.email}
                            </span>
                            {vendedor.equipoNombre && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vendedor.equipoColor }} />
                                {vendedor.equipoNombre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Métricas */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-800">{formatCurrency(vendedor.ventasRealizadas)}</p>
                          <p className="text-xs text-slate-400">de {formatCurrency(vendedor.metaActual || 0)}</p>
                        </div>

                        {/* Cumplimiento */}
                        <ProgressRing percentage={vendedor.cumplimientoActual} />

                        {/* Clientes */}
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-800">{vendedor.clientesAsignados}</p>
                          <p className="text-xs text-slate-400">clientes</p>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/vendedores/${vendedor.id}`); }} className="p-2 rounded-lg hover:bg-orange-50 text-orange-500">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/vendedores/${vendedor.id}/editar`); }} className="p-2 rounded-lg hover:bg-amber-50 text-amber-500">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </NeuromorphicCard>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Ranking */}
          <div className="space-y-6">
            <NeuromorphicCard>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Top Vendedores
              </h3>
              <div className="space-y-3">
                {ranking.slice(0, 5).map((vendedor, index) => (
                  <div key={vendedor.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-amber-400 text-amber-900' :
                        index === 1 ? 'bg-slate-300 text-slate-700' :
                        index === 2 ? 'bg-orange-300 text-orange-800' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{vendedor.nombreCompleto.split(' ').slice(0, 2).join(' ')}</p>
                        <p className="text-xs text-slate-400">{vendedor.equipoNombre}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      vendedor.cumplimientoActual >= 100 ? 'text-emerald-600' : 
                      vendedor.cumplimientoActual >= 75 ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {vendedor.cumplimientoActual}%
                    </span>
                  </div>
                ))}
              </div>
            </NeuromorphicCard>

            <NeuromorphicCard>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" /> Resumen Mensual
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50">
                  <p className="text-sm text-emerald-600">Meta Sobre 100%</p>
                  <p className="text-2xl font-bold text-emerald-700">{vendedores.filter(v => v.cumplimientoActual >= 100).length}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50">
                  <p className="text-sm text-amber-600">En Riesgo ({"<"}50%)</p>
                  <p className="text-2xl font-bold text-amber-700">{vendedores.filter(v => v.cumplimientoActual < 50).length}</p>
                </div>
              </div>
            </NeuromorphicCard>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>👤 Módulo de Gestión de Vendedores - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
