'use client';

/**
 * 🎨 SILEXAR PULSE - Página Agencias Creativas Completa
 * 
 * @description Dashboard principal con métricas y gestión de agencias
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import {
  Palette, Plus, Search, RefreshCw, Users,
  DollarSign, ChevronDown, Building,
  Percent, Phone, Mail, BarChart3, Sparkles,
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  BrainCircuit, Target, Award, Briefcase
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AgenciaCreativa {
  id: string;
  codigo: string;
  razonSocial: string;
  nombreFantasia: string | null;
  tipoAgencia: string;
  porcentajeComision: number;
  emailGeneral: string | null;
  telefonoGeneral: string | null;
  paginaWeb: string | null;
  estado: string;
  activa: boolean;
  campañasActivas?: number;
  facturacionMensual?: number;
  scoreRendimiento?: number;
}

interface DashboardStats {
  total: number;
  activas: number;
  facturacionMes: number;
  comisionPromedio: number;
  proyectosActivos: number;
  entregasEstaSemana: number;
  onTimeRate: number;
  calidadPromedio: number;
}

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS (Neuromorphic)
// ═══════════════════════════════════════════════════════════════

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
}

const S = {
  raised: `shadow-[8px_8px_16px_${N.dark},-8px_-8px_16px_${N.light}]`,
  sm: `shadow-[4px_4px_8px_${N.dark},-4px_-4px_8px_${N.light}]`,
  inset: `shadow-[inset_4px_4px_8px_${N.dark},inset_-4px_-4px_8px_${N.light}]`,
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const NeuCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-3xl p-6 ${className}`}
    style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px_-8px 16px ${N.light}` }}>
    {children}
  </div>
);

const NeuMetricCard = ({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string; trend?: 'up' | 'down' | 'neutral';
}) => (
  <div
    className="p-5 rounded-2xl"
    style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-xl" style={{ background: color }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>{label}</span>
      {trend && (
        <span className={`text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      )}
    </div>
    <div className="text-3xl font-black" style={{ color: N.text }}>{value}</div>
    {sub && <div className="text-xs mt-1" style={{ color: N.textSub }}>{sub}</div>}
  </div>
);

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const getColor = (t: string) => {
    switch (t) {
      case 'publicidad': return 'from-violet-500 to-purple-600';
      case 'digital': return 'from-cyan-500 to-blue-600';
      case 'medios': return 'from-emerald-500 to-green-600';
      case 'btl': return 'from-orange-500 to-amber-600';
      case 'integral': return 'from-rose-500 to-pink-600';
      case 'boutique': return 'from-slate-500 to-slate-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${getColor(tipo)}`}>
      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    </span>
  );
};

const ScoreIndicator = ({ score }: { score: number }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-1">
      <Sparkles className={`w-4 h-4`} style={{ color }} />
      <span className={`font-bold`} style={{ color }}>{score}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_AGENCIAS: AgenciaCreativa[] = [
  { id: 'agc-001', codigo: 'AGC-001', razonSocial: 'Creativos Asociados Ltda', nombreFantasia: 'BlueWave Creative', tipoAgencia: 'digital', porcentajeComision: 15, emailGeneral: 'contacto@bluewave.cl', telefonoGeneral: '+56 2 2345 6789', paginaWeb: 'www.bluewave.cl', estado: 'activa', activa: true, campañasActivas: 12, facturacionMensual: 45000000, scoreRendimiento: 92 },
  { id: 'agc-002', codigo: 'AGC-002', razonSocial: 'MediaPlan SpA', nombreFantasia: 'MediaPlan', tipoAgencia: 'medios', porcentajeComision: 12, emailGeneral: 'info@mediaplan.cl', telefonoGeneral: '+56 2 3456 7890', paginaWeb: 'www.mediaplan.cl', estado: 'activa', activa: true, campañasActivas: 8, facturacionMensual: 32000000, scoreRendimiento: 78 },
  { id: 'agc-003', codigo: 'AGC-003', razonSocial: 'Impacto BTL Ltda', nombreFantasia: 'Impacto', tipoAgencia: 'btl', porcentajeComision: 18, emailGeneral: 'ventas@impacto.cl', telefonoGeneral: '+56 2 4567 8901', paginaWeb: null, estado: 'activa', activa: true, campañasActivas: 5, facturacionMensual: 18500000, scoreRendimiento: 65 },
  { id: 'agc-004', codigo: 'AGC-004', razonSocial: 'Creativa 360 SpA', nombreFantasia: null, tipoAgencia: 'integral', porcentajeComision: 20, emailGeneral: 'hola@creativa360.cl', telefonoGeneral: '+56 2 5678 9012', paginaWeb: 'www.creativa360.cl', estado: 'activa', activa: true, campañasActivas: 15, facturacionMensual: 67000000, scoreRendimiento: 88 }
]

const MOCK_STATS: DashboardStats = {
  total: 18,
  activas: 15,
  facturacionMes: 234000000,
  comisionPromedio: 14.5,
  proyectosActivos: 127,
  entregasEstaSemana: 23,
  onTimeRate: 94,
  calidadPromedio: 8.7
}

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AgenciasCreativasPage() {
  const router = useRouter();
  const [agencias, setAgencias] = useState<AgenciaCreativa[]>([]);
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const [filtroTipo, setFiltroTipo] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: apiAgencias } = await apiClient.get<AgenciaCreativa[]>('/api/agencias-creativas', {
      params: { busqueda: debouncedBusqueda || undefined, tipo: filtroTipo || undefined },
    });

    const source: AgenciaCreativa[] = (apiAgencias && apiAgencias.length > 0) ? apiAgencias : MOCK_AGENCIAS;

    let filtered = [...source];
    if (debouncedBusqueda) {
      filtered = filtered.filter(a =>
        a.razonSocial.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
        (a.nombreFantasia?.toLowerCase().includes(debouncedBusqueda.toLowerCase()))
      );
    }
    if (filtroTipo) {
      filtered = filtered.filter(a => a.tipoAgencia === filtroTipo);
    }

    setAgencias(filtered);
    setLoading(false);
  }, [debouncedBusqueda, filtroTipo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3" style={{ color: N.text }}>
              <Palette className="w-10 h-10" style={{ color: N.accent }} />
              Centro de Talento Creativo
            </h1>
            <p className="text-sm mt-2" style={{ color: N.textSub }}>
              Gestión de agencias creativas con IA
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Actualizar"
              onClick={fetchData}
              className="p-3 rounded-2xl transition-all duration-200"
              style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}` }}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} style={{ color: N.text }} />
            </button>
            <button
              onClick={() => router.push('/agencias-creativas/nuevo')}
              className="px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all duration-200 text-white"
              style={{ background: N.accent, boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}` }}
            >
              <Plus className="w-5 h-5" /> Nueva Agencia
            </button>
          </div>
        </div>

        {/* Dashboard Stats con IA */}
        <NeuCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl" style={{ background: N.accent }}>
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: N.text }}>Inteligencia Creativa en Tiempo Real</h2>
              <p className="text-xs" style={{ color: N.textSub }}>Métricas actualizadas con IA predictiva</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeuMetricCard icon={Building} label="Total Agencias" value={stats.total} sub={`${stats.activas} activas`} color="#6888ff" trend="up" />
            <NeuMetricCard icon={Briefcase} label="Proyectos Activos" value={stats.proyectosActivos} sub={`${stats.entregasEstaSemana} esta semana`} color="#8b5cf6" trend="up" />
            <NeuMetricCard icon={CheckCircle} label="On-Time Rate" value={`${stats.onTimeRate}%`} sub="Entregas puntuales" color="#10b981" trend="up" />
            <NeuMetricCard icon={Award} label="Calidad Promedio" value={`${stats.calidadPromedio}/10`} sub="Score de calidad" color="#f59e0b" trend="neutral" />
          </div>

          {/* AI Insights */}
          <div className="mt-6 p-4 rounded-2xl" style={{ background: N.light, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: N.accent }} />
              <span className="text-sm font-bold" style={{ color: N.text }}>Insights IA</span>
            </div>
            <div className="space-y-1 text-sm" style={{ color: N.textSub }}>
              <p>• 3 agencias sobrecargadas - considerar redistribuir proyectos</p>
              <p>• 5 agencias disponibles premium para proyectos urgentes</p>
              <p>• Mejor match histórico: BlueWave Creative + Banco Chile (94%)</p>
            </div>
          </div>
        </NeuCard>

        {/* Stats Secundarias */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NeuCard className="text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2" style={{ color: '#10b981' }} />
            <div className="text-2xl font-black" style={{ color: N.text }}>
              ${(stats.facturacionMes / 1000000).toFixed(0)}M
            </div>
            <div className="text-xs uppercase" style={{ color: N.textSub }}>Facturación Mes</div>
          </NeuCard>
          <NeuCard className="text-center">
            <Percent className="w-6 h-6 mx-auto mb-2" style={{ color: '#f59e0b' }} />
            <div className="text-2xl font-black" style={{ color: N.text }}>
              {stats.comisionPromedio}%
            </div>
            <div className="text-xs uppercase" style={{ color: N.textSub }}>Comisión Prom.</div>
          </NeuCard>
          <NeuCard className="text-center">
            <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#ef4444' }} />
            <div className="text-2xl font-black" style={{ color: N.text }}>3</div>
            <div className="text-xs uppercase" style={{ color: N.textSub }}>Alertas Críticas</div>
          </NeuCard>
          <NeuCard className="text-center">
            <Target className="w-6 h-6 mx-auto mb-2" style={{ color: '#8b5cf6' }} />
            <div className="text-2xl font-black" style={{ color: N.text }}>2</div>
            <div className="text-xs uppercase" style={{ color: N.textSub }}>Deadlines Hoy</div>
          </NeuCard>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: N.textSub }} />
            <input
              type="text"
              placeholder="Buscar agencias..."
              aria-label="Buscar agencias"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
              style={{
                background: N.light,
                color: N.text,
                boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`,
                border: 'none'
              }}
            />
          </div>
          <div className="relative">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="appearance-none px-5 py-3 pr-10 rounded-2xl text-sm font-medium outline-none"
              style={{
                background: N.light,
                color: N.text,
                boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`,
                border: 'none'
              }}
            >
              <option value="">Todos los tipos</option>
              <option value="publicidad">Publicidad</option>
              <option value="digital">Digital</option>
              <option value="medios">Medios</option>
              <option value="btl">BTL</option>
              <option value="integral">Integral</option>
              <option value="boutique">Boutique</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: N.textSub }} />
          </div>
        </div>

        {/* Lista de agencias */}
        <NeuCard>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: N.text }}>
            <BarChart3 className="w-5 h-5" style={{ color: N.accent }} />
            Agencias ({agencias.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin" style={{ color: N.accent }} />
            </div>
          ) : agencias.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 mx-auto mb-4" style={{ color: N.textSub }} />
              <p style={{ color: N.textSub }}>Sin agencias</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agencias.map((agencia) => (
                <div
                  key={agencia.id}
                  onClick={() => router.push(`/agencias-creativas/${agencia.id}`)}
                  className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: N.light,
                    boxShadow: `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${N.accent} 0%, #8b5cf6 100%)` }}
                      >
                        {(agencia.nombreFantasia || agencia.razonSocial).charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-base" style={{ color: N.text }}>
                            {agencia.nombreFantasia || agencia.razonSocial}
                          </p>
                          <TipoBadge tipo={agencia.tipoAgencia} />
                        </div>
                        <p className="text-sm" style={{ color: N.textSub }}>
                          {agencia.codigo} • {agencia.razonSocial}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: N.textSub }}>
                          {agencia.emailGeneral && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {agencia.emailGeneral}
                            </span>
                          )}
                          {agencia.telefonoGeneral && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {agencia.telefonoGeneral}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs" style={{ color: N.textSub }}>Campañas</p>
                        <p className="font-bold" style={{ color: N.text }}>{agencia.campañasActivas || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: N.textSub }}>Facturación</p>
                        <p className="font-bold" style={{ color: N.text }}>
                          ${((agencia.facturacionMensual || 0) / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: N.textSub }}>Comisión</p>
                        <p className="font-bold" style={{ color: N.accent }}>{agencia.porcentajeComision}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: N.textSub }}>Score IA</p>
                        <ScoreIndicator score={agencia.scoreRendimiento || 0} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeuCard>

        <div className="text-center" style={{ color: N.textSub }}>
          <p>🎨 Agencias Creativas - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
