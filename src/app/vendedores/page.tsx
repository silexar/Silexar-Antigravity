/**
 * 👤 SILEXAR PULSE - Gestión de Vendedores
 * Diseño Neumórfico TIER 0 Oficial
 * Fondo #dfeaff | sombras #bec8de / #ffffff | acento #6888ff
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Search, Plus, Eye, Edit3, TrendingUp,
  Target, DollarSign, Award, RefreshCw, Mail,
  Star, BarChart3, ArrowLeft, LayoutDashboard
} from 'lucide-react';

// ─── Tokens Neumórficos Oficiales ────────────────────────────
const N = {
  base:    '#dfeaff',
  dark:    '#bec8de',
  light:   '#ffffff',
  accent:  '#6888ff',
  text:    '#69738c',
  textSub: '#9aa3b8',
};

// ─── Helpers Neumórficos ─────────────────────────────────────
const shadowOut = (s: number) => `${s}px ${s}px ${s*2}px ${N.dark}, -${s}px -${s}px ${s*2}px ${N.light}`;
const shadowIn  = (s: number) => `inset ${s}px ${s}px ${s*2}px ${N.dark}, inset -${s}px -${s}px ${s*2}px ${N.light}`;

function NeoCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-3xl p-5 ${className}`} style={{ background: N.base, boxShadow: shadowOut(6) }}>
      {children}
    </div>
  );
}

function NeoButton({ children, onClick, variant = 'secondary', size = 'md', className = '', title }: {
  children: React.ReactNode; onClick?: React.MouseEventHandler<HTMLButtonElement>; variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'icon'; className?: string; title?: string;
}) {
  const sizes = { sm: 'px-3 py-1.5 rounded-full text-[11px]', md: 'px-4 py-2 rounded-full text-xs', icon: 'w-8 h-8 rounded-xl' };
  const variants = {
    primary: { background: N.accent, color: '#fff', boxShadow: shadowOut(4) },
    secondary: { background: N.base, color: N.text, boxShadow: shadowOut(4) },
    ghost: { background: 'transparent', color: N.textSub, boxShadow: 'none' },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 border-none cursor-pointer ${s} ${className}`} style={v}
      onMouseEnter={e => { if (variant === 'secondary') (e.currentTarget as HTMLElement).style.boxShadow = shadowOut(2); }}
      onMouseLeave={e => { if (variant === 'secondary') (e.currentTarget as HTMLElement).style.boxShadow = shadowOut(4); }}>
      {children}
    </button>
  );
}

function NeoInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium placeholder-[#9aa3b8] border-none focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 ${className}`}
      style={{ background: N.base, boxShadow: shadowIn(3), color: N.text }} />
  );
}

function NeoBadge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' }) {
  const map: Record<string, string> = { blue: N.accent, green: '#22c55e', red: '#ef4444', yellow: '#f59e0b', purple: '#a855f7' };
  const c = map[color] || N.accent;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
      style={{ background: N.base, boxShadow: shadowIn(1), color: c }}>
      {children}
    </span>
  );
}

const ProgressRing = ({ percentage, size = 80 }: { percentage: number; size?: number }) => {
  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 100 ? '#22c55e' : percentage >= 75 ? N.accent : percentage >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="35" stroke={N.dark} strokeWidth="6" fill="none" />
        <circle cx="40" cy="40" r="35" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black" style={{ color: N.text }}>{percentage}%</span>
      </div>
    </div>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const colors: Record<string, string> = {
    gerente: 'purple', senior: 'blue', ejecutivo: 'green', junior: 'yellow', freelance: 'gray'
  };
  return <NeoBadge color={colors[tipo] as any}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</NeoBadge>;
};

// ─── Tipos ───────────────────────────────────────────────────
interface Vendedor {
  id: string; codigo: string; nombreCompleto: string; email: string; telefono: string | null;
  tipoVendedor: string; equipoNombre: string | null; equipoColor: string; estado: string; activo: boolean;
  metaActual: number | null; cumplimientoActual: number; ventasRealizadas: number; clientesAsignados: number; fechaCreacion: string;
}
interface Stats {
  total: number; activos: number; ventasTotales: number; cumplimientoPromedio: number;
}

// ─── Main ────────────────────────────────────────────────────
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
      if (data.success) { setVendedores(data.data); setStats(data.stats); }
    } catch { /* */ } finally { setLoading(false); }
  }, [debouncedSearch]);

  useEffect(() => { fetchVendedores(); }, [fetchVendedores]);
  const ranking = [...vendedores].sort((a, b) => b.cumplimientoActual - a.cumplimientoActual);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back + Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <NeoButton variant="secondary" size="icon" onClick={() => router.push('/dashboard')} title="Volver al Dashboard">
              <ArrowLeft className="w-4 h-4" style={{ color: N.textSub }} />
            </NeoButton>
            <div className="p-3 rounded-xl" style={{ background: N.accent, boxShadow: shadowOut(4) }}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: N.text }}>Gestión de Vendedores</h1>
              <p className="text-xs font-bold" style={{ color: N.textSub }}>Equipo comercial, metas y rendimiento</p>
            </div>
          </div>
          <NeoButton variant="primary" onClick={() => router.push('/vendedores/nuevo')}>
            <Plus className="w-4 h-4" /> Nuevo Vendedor
          </NeoButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Vendedores', value: stats.total, icon: Users, color: N.accent },
            { label: 'Activos', value: stats.activos, icon: TrendingUp, color: '#22c55e' },
            { label: 'Ventas Totales', value: formatCurrency(stats.ventasTotales), icon: DollarSign, color: '#14b8a6' },
            { label: 'Cumplimiento Prom.', value: `${stats.cumplimientoPromedio}%`, icon: Target, color: '#a855f7' }
          ].map((stat, i) => (
            <NeoCard key={`${stat.label}-${i}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: shadowOut(3) }}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>{stat.label}</p>
                  <p className="text-2xl font-black" style={{ color: N.text }}>{stat.value}</p>
                </div>
              </div>
            </NeoCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="lg:col-span-2 space-y-4">
            <NeoCard>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
                  <NeoInput placeholder="Buscar vendedores..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <NeoButton variant="secondary" size="icon" onClick={fetchVendedores}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: N.textSub }} />
                </NeoButton>
              </div>
            </NeoCard>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto" style={{ color: N.accent }} />
              </div>
            ) : vendedores.length === 0 ? (
              <NeoCard className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: N.textSub }} />
                <h3 className="text-lg font-black" style={{ color: N.text }}>No hay vendedores</h3>
              </NeoCard>
            ) : (
              <div className="space-y-3">
                {vendedores.map(v => (
                  <NeoCard key={v.id} className="hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => router.push(`/vendedores/${v.id}`)}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm"
                          style={{ background: N.accent, boxShadow: shadowOut(3) }}>
                          {v.nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm" style={{ color: N.text }}>{v.nombreCompleto}</h3>
                            <TipoBadge tipo={v.tipoVendedor} />
                          </div>
                          <p className="text-xs font-bold" style={{ color: N.textSub }}>{v.codigo}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs font-semibold" style={{ color: N.textSub }}>
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{v.email}</span>
                            {v.equipoNombre && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.equipoColor }} />
                                {v.equipoNombre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="text-sm font-black" style={{ color: N.text }}>{formatCurrency(v.ventasRealizadas)}</p>
                          <p className="text-[10px] font-bold" style={{ color: N.textSub }}>de {formatCurrency(v.metaActual || 0)}</p>
                        </div>
                        <ProgressRing percentage={v.cumplimientoActual} size={60} />
                        <div className="text-center">
                          <p className="text-lg font-black" style={{ color: N.text }}>{v.clientesAsignados}</p>
                          <p className="text-[10px] font-bold" style={{ color: N.textSub }}>clientes</p>
                        </div>
                        <div className="flex gap-1">
                          <NeoButton variant="secondary" size="icon" className="!w-7 !h-7" onClick={e => { e.stopPropagation(); router.push(`/vendedores/${v.id}`); }}>
                            <Eye className="w-3.5 h-3.5" style={{ color: N.textSub }} />
                          </NeoButton>
                          <NeoButton variant="secondary" size="icon" className="!w-7 !h-7" onClick={e => { e.stopPropagation(); router.push(`/vendedores/${v.id}/editar`); }}>
                            <Edit3 className="w-3.5 h-3.5" style={{ color: N.textSub }} />
                          </NeoButton>
                        </div>
                      </div>
                    </div>
                  </NeoCard>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Ranking */}
          <div className="space-y-4">
            <NeoCard>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: N.text }}>
                <Award className="w-4 h-4" style={{ color: '#f59e0b' }} /> Top Vendedores
              </h3>
              <div className="space-y-2">
                {ranking.slice(0, 5).map((v, index) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: N.base, boxShadow: shadowIn(2) }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{
                          background: index === 0 ? '#f59e0b' : index === 1 ? N.textSub : index === 2 ? '#f97316' : N.dark,
                          color: '#fff'
                        }}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: N.text }}>{v.nombreCompleto.split(' ').slice(0, 2).join(' ')}</p>
                        <p className="text-[10px] font-bold" style={{ color: N.textSub }}>{v.equipoNombre}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black" style={{
                      color: v.cumplimientoActual >= 100 ? '#22c55e' : v.cumplimientoActual >= 75 ? N.accent : '#f59e0b'
                    }}>{v.cumplimientoActual}%</span>
                  </div>
                ))}
              </div>
            </NeoCard>

            <NeoCard>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: N.text }}>
                <BarChart3 className="w-4 h-4" style={{ color: N.accent }} /> Resumen Mensual
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#22c55e' }}>Meta Sobre 100%</p>
                  <p className="text-xl font-black" style={{ color: '#22c55e' }}>{vendedores.filter(v => v.cumplimientoActual >= 100).length}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#f59e0b' }}>En Riesgo (&lt;50%)</p>
                  <p className="text-xl font-black" style={{ color: '#f59e0b' }}>{vendedores.filter(v => v.cumplimientoActual < 50).length}</p>
                </div>
              </div>
            </NeoCard>
          </div>
        </div>

        <div className="text-center pb-4">
          <p className="text-xs font-bold" style={{ color: N.textSub }}>Módulo de Gestión de Vendedores · SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
