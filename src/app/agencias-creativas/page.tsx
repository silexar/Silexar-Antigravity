/**
 * 🎨 SILEXAR PULSE - Página Agencias Creativas Completa
 * 
 * @description Gestión de agencias con portafolio, comisiones y análisis
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { 
  Palette, Plus, Search, RefreshCw, TrendingUp, Users, 
  DollarSign, Award, Filter, ChevronDown, Building,
  Percent, Phone, Mail, Globe, BarChart3, Sparkles
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
  // Métricas IA
  campañasActivas?: number;
  facturacionMensual?: number;
  scoreRendimiento?: number;
}

interface Stats {
  total: number;
  activas: number;
  facturacionMes: number;
  comisionPromedio: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-violet-200/50 ${className}`}>
    {children}
  </div>
);

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const colores: Record<string, string> = {
    publicidad: 'from-violet-500 to-purple-600',
    digital: 'from-cyan-500 to-blue-600',
    medios: 'from-emerald-500 to-green-600',
    btl: 'from-orange-500 to-amber-600',
    integral: 'from-rose-500 to-pink-600',
    boutique: 'from-slate-500 to-slate-600'
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${colores[tipo] || 'from-slate-400 to-slate-500'}`}>
      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    </span>
  );
};

const ScoreIndicator = ({ score }: { score: number }) => {
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  return (
    <div className="flex items-center gap-1">
      <Sparkles className={`w-4 h-4 ${color}`} />
      <span className={`font-bold ${color}`}>{score}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AgenciasCreativasPage() {
  const router = useRouter();
  const [agencias, setAgencias] = useState<AgenciaCreativa[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, activas: 0, facturacionMes: 0, comisionPromedio: 0 });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Mock data con métricas IA
  const mockAgencias: AgenciaCreativa[] = [
    { id: '1', codigo: 'AGC-001', razonSocial: 'Creativos Asociados Ltda', nombreFantasia: 'BlueWave Creative', tipoAgencia: 'digital', porcentajeComision: 15, emailGeneral: 'contacto@bluewave.cl', telefonoGeneral: '+56 2 2345 6789', paginaWeb: 'www.bluewave.cl', estado: 'activa', activa: true, campañasActivas: 12, facturacionMensual: 45000000, scoreRendimiento: 92 },
    { id: '2', codigo: 'AGC-002', razonSocial: 'MediaPlan SpA', nombreFantasia: 'MediaPlan', tipoAgencia: 'medios', porcentajeComision: 12, emailGeneral: 'info@mediaplan.cl', telefonoGeneral: '+56 2 3456 7890', paginaWeb: 'www.mediaplan.cl', estado: 'activa', activa: true, campañasActivas: 8, facturacionMensual: 32000000, scoreRendimiento: 78 },
    { id: '3', codigo: 'AGC-003', razonSocial: 'Impacto BTL Ltda', nombreFantasia: 'Impacto', tipoAgencia: 'btl', porcentajeComision: 18, emailGeneral: 'ventas@impacto.cl', telefonoGeneral: '+56 2 4567 8901', paginaWeb: null, estado: 'activa', activa: true, campañasActivas: 5, facturacionMensual: 18500000, scoreRendimiento: 65 },
    { id: '4', codigo: 'AGC-004', razonSocial: 'Creativa 360 SpA', nombreFantasia: null, tipoAgencia: 'integral', porcentajeComision: 20, emailGeneral: 'hola@creativa360.cl', telefonoGeneral: '+56 2 5678 9012', paginaWeb: 'www.creativa360.cl', estado: 'activa', activa: true, campañasActivas: 15, facturacionMensual: 67000000, scoreRendimiento: 88 }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Try real API first — falls back to mock data if DB not connected (503)
    const { data: apiAgencias } = await apiClient.get<AgenciaCreativa[]>('/api/agencias-creativas', {
      params: { busqueda: busqueda || undefined, tipo: filtroTipo || undefined },
    });

    const source: AgenciaCreativa[] = (apiAgencias && apiAgencias.length > 0) ? apiAgencias : mockAgencias;

    let filtered = [...source];
    if (busqueda) {
      filtered = filtered.filter(a =>
        a.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.nombreFantasia?.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }
    if (filtroTipo) {
      filtered = filtered.filter(a => a.tipoAgencia === filtroTipo);
    }

    setAgencias(filtered);
    setStats({
      total:            source.length,
      activas:          source.filter(a => a.activa).length,
      facturacionMes:   source.reduce((sum, a) => sum + (a.facturacionMensual || 0), 0),
      comisionPromedio: source.length > 0
        ? Math.round(source.reduce((sum, a) => sum + a.porcentajeComision, 0) / source.length)
        : 0,
    });
    setLoading(false);
  }, [busqueda, filtroTipo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-violet-600 bg-clip-text text-transparent flex items-center gap-3">
              <Palette className="w-10 h-10 text-violet-500" />
              Agencias Creativas
            </h1>
            <p className="text-slate-500 mt-2">Gestión de agencias de publicidad y medios</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button aria-label="Actualizar" onClick={fetchData} className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-violet-200/50 hover:bg-white text-violet-500 border border-white/60 transition-all">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => router.push('/agencias-creativas/nuevo')} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-md shadow-violet-200/50 hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" /> Nueva Agencia
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Agencias', value: stats.total, icon: Building, color: 'from-violet-400 to-violet-500' },
            { label: 'Activas', value: stats.activas, icon: Users, color: 'from-emerald-400 to-emerald-500' },
            { label: 'Facturación Mes', value: `$${(stats.facturacionMes / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'from-blue-400 to-blue-500' },
            { label: 'Comisión Promedio', value: `${stats.comisionPromedio}%`, icon: Percent, color: 'from-amber-400 to-amber-500' }
          ].map((stat, i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-md shadow-violet-200/50`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar agencias..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/60 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div className="relative">
            <select 
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="appearance-none bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 pr-10 shadow-sm border border-white/60 font-medium text-slate-700 focus:outline-none"
            >
              <option value="">Todos los tipos</option>
              <option value="publicidad">Publicidad</option>
              <option value="digital">Digital</option>
              <option value="medios">Medios</option>
              <option value="btl">BTL</option>
              <option value="integral">Integral</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Lista de agencias */}
        <GlassCard>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            Agencias ({agencias.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-violet-500 mx-auto" /></div>
          ) : agencias.length === 0 ? (
            <div className="text-center py-12"><Building className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Sin agencias</p></div>
          ) : (
            <div className="space-y-4">
              {agencias.map((agencia) => (
                <div key={agencia.id} onClick={() => router.push(`/agencias-creativas/${agencia.id}`)} className="p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm shadow-slate-200/50 border border-white/60 hover:shadow-md cursor-pointer hover:scale-[1.01] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {(agencia.nombreFantasia || agencia.razonSocial).charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">{agencia.nombreFantasia || agencia.razonSocial}</p>
                          <TipoBadge tipo={agencia.tipoAgencia} />
                        </div>
                        <p className="text-sm text-slate-500">{agencia.codigo} • {agencia.razonSocial}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          {agencia.emailGeneral && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{agencia.emailGeneral}</span>}
                          {agencia.telefonoGeneral && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{agencia.telefonoGeneral}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {/* Métricas */}
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Campañas</p>
                        <p className="font-bold text-slate-700">{agencia.campañasActivas}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Facturación</p>
                        <p className="font-bold text-slate-700">${((agencia.facturacionMensual || 0) / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Comisión</p>
                        <p className="font-bold text-violet-600">{agencia.porcentajeComision}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Score IA</p>
                        <ScoreIndicator score={agencia.scoreRendimiento || 0} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <div className="text-center text-slate-400 text-sm">
          <p>🎨 Agencias Creativas - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
