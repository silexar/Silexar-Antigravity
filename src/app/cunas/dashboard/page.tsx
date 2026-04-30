/**
 * 📊 SILEXAR PULSE - Dashboard Gerencial TIER 0
 * 
 * Vista ejecutiva con métricas consolidadas,
 * alertas y KPIs para gerencia comercial
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Volume2, Calendar,
  AlertTriangle, CheckCircle, Clock, Target, Activity,
  ArrowUpRight, ArrowDownRight, RefreshCw, ArrowLeft, PieChart,
  Zap, Building, FileAudio
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface KPI {
  label: string;
  valor: string | number;
  cambio: number;
  tendencia: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

interface AlertaGerencial {
  id: string;
  tipo: 'critica' | 'alta' | 'media';
  categoria: string;
  mensaje: string;
  accion: string;
  link: string;
}

interface TopAnunciante {
  id: string;
  nombre: string;
  cunas: number;
  emisiones: number;
  inversion: number;
  cumplimiento: number;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const kpisMock: KPI[] = [
  { label: 'Cuñas Activas', valor: 127, cambio: 12.5, tendencia: 'up', icon: Volume2, color: 'from-blue-400 to-blue-600' },
  { label: 'Emisiones Mes', valor: '45.2K', cambio: 8.3, tendencia: 'up', icon: Activity, color: 'from-emerald-400 to-emerald-600' },
  { label: 'Clientes Activos', valor: 34, cambio: 2.1, tendencia: 'up', icon: Building, color: 'from-purple-400 to-purple-600' },
  { label: 'Tasa Cumplimiento', valor: '92%', cambio: -1.5, tendencia: 'down', icon: Target, color: 'from-amber-400 to-amber-600' },
  { label: 'Material Pendiente', valor: 8, cambio: 25, tendencia: 'up', icon: Clock, color: 'from-red-400 to-red-600' },
  { label: 'Aprobaciones Hoy', valor: 15, cambio: 5, tendencia: 'up', icon: CheckCircle, color: 'from-teal-400 to-teal-600' }
];

const alertasMock: AlertaGerencial[] = [
  { id: '1', tipo: 'critica', categoria: 'Material', mensaje: 'Falabella: Material vencido hace 4 días', accion: 'Contactar urgente', link: '/cunas/material-pendiente' },
  { id: '2', tipo: 'critica', categoria: 'Vencimientos', mensaje: '3 cuñas vencen hoy sin renovación', accion: 'Revisar contratos', link: '/cunas' },
  { id: '3', tipo: 'alta', categoria: 'Aprobación', mensaje: '5 cuñas pendientes de aprobación +24h', accion: 'Escalar', link: '/cunas' },
  { id: '4', tipo: 'media', categoria: 'Programación', mensaje: 'Prime Time solo 75% ocupación', accion: 'Optimizar', link: '/cunas/programacion' }
];

const topAnunciantesMock: TopAnunciante[] = [
  { id: '1', nombre: 'Banco de Chile', cunas: 12, emisiones: 8420, inversion: 45000000, cumplimiento: 98 },
  { id: '2', nombre: 'Coca-Cola', cunas: 8, emisiones: 6200, inversion: 38000000, cumplimiento: 100 },
  { id: '3', nombre: 'Falabella', cunas: 10, emisiones: 5800, inversion: 35000000, cumplimiento: 75 },
  { id: '4', nombre: 'Entel', cunas: 6, emisiones: 4500, inversion: 28000000, cumplimiento: 95 },
  { id: '5', nombre: 'Jumbo', cunas: 5, emisiones: 3200, inversion: 22000000, cumplimiento: 100 }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const KPICard = ({ kpi }: { kpi: KPI }) => {
  const Icon = kpi.icon;
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm">{kpi.label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{kpi.valor}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            kpi.tendencia === 'up' ? 'text-emerald-600' : 
            kpi.tendencia === 'down' ? 'text-red-600' : 'text-slate-500'
          }`}>
            {kpi.tendencia === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
             kpi.tendencia === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
            <span>{Math.abs(kpi.cambio)}% vs mes anterior</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const AlertaRow = ({ alerta, onClick }: { alerta: AlertaGerencial; onClick: () => void }) => {
  const colors = {
    critica: 'border-l-red-500 bg-red-50',
    alta: 'border-l-amber-500 bg-amber-50',
    media: 'border-l-blue-500 bg-blue-50'
  };
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-r-xl border-l-4 ${colors[alerta.tipo]} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase">{alerta.categoria}</span>
          <p className="font-medium text-slate-800 mt-1">{alerta.mensaje}</p>
        </div>
        <span className="text-sm text-blue-600 hover:underline">{alerta.accion} →</span>
      </div>
    </button>
  );
};

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function DashboardGerencialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('mes');

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  // Datos de ocupación por bloque (mock)
  const ocupacionBloques = [
    { nombre: 'Matinal', ocupacion: 85 },
    { nombre: 'Mediodía', ocupacion: 72 },
    { nombre: 'Tarde', ocupacion: 65 },
    { nombre: 'Prime', ocupacion: 98 },
    { nombre: 'Nocturno', ocupacion: 45 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 relative p-6">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/40 to-transparent pointer-events-none mix-blend-multiply"></div>
      
      <div className="max-w-[1920px] mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/cunas')}
            className="p-2 hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-500" />
              Dashboard Gerencial
            </h1>
            <p className="text-slate-500 mt-1">Vista ejecutiva de operaciones</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selector de período */}
          <div className="flex bg-white/70 backdrop-blur-md rounded-xl border border-slate-200 p-1 shadow-sm">
            {(['hoy', 'semana', 'mes'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodo === p ? 'bg-indigo-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleRefresh}
            className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:bg-white transition-all"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpisMock.map((kpi, idx) => (
          <KPICard key={idx} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Alertas */}
        <div className="space-y-6">
          {/* Alertas */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas Prioritarias
              <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                {alertasMock.filter(a => a.tipo === 'critica').length} críticas
              </span>
            </h2>
            <div className="space-y-3">
              {alertasMock.map(alerta => (
                <AlertaRow 
                  key={alerta.id} 
                  alerta={alerta} 
                  onClick={() => router.push(alerta.link)}
                />
              ))}
            </div>
          </div>

          {/* Ocupación de bloques */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              Ocupación por Bloque
            </h2>
            <div className="space-y-3">
              {ocupacionBloques.map((bloque, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{bloque.nombre}</span>
                    <span className={`font-medium ${
                      bloque.ocupacion >= 90 ? 'text-emerald-600' :
                      bloque.ocupacion >= 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>{bloque.ocupacion}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        bloque.ocupacion >= 90 ? 'bg-emerald-500' :
                        bloque.ocupacion >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${bloque.ocupacion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna central - Top Anunciantes */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              Top Anunciantes del Período
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase border-b">
                    <th className="pb-3">#</th>
                    <th className="pb-3">Anunciante</th>
                    <th className="pb-3 text-center">Cuñas</th>
                    <th className="pb-3 text-center">Emisiones</th>
                    <th className="pb-3 text-right">Inversión</th>
                    <th className="pb-3 text-center">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {topAnunciantesMock.map((anunciante, idx) => (
                    <tr key={anunciante.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-400 text-amber-900' :
                          idx === 1 ? 'bg-slate-300 text-slate-700' :
                          idx === 2 ? 'bg-orange-300 text-orange-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="font-medium text-slate-800">{anunciante.nombre}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-medium text-slate-700">{anunciante.cunas}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-medium text-slate-700">{anunciante.emisiones.toLocaleString()}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-medium text-emerald-600">{formatCurrency(anunciante.inversion)}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          anunciante.cumplimiento >= 95 ? 'bg-emerald-100 text-emerald-700' :
                          anunciante.cumplimiento >= 80 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {anunciante.cumplimiento}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Programación', icon: Calendar, color: 'from-purple-400 to-purple-600', link: '/cunas/programacion' },
              { label: 'Inbox', icon: FileAudio, color: 'from-blue-400 to-blue-600', link: '/cunas/inbox' },
              { label: 'Material', icon: Clock, color: 'from-amber-400 to-amber-600', link: '/cunas/material-pendiente' },
              { label: 'Nueva Cuña', icon: Zap, color: 'from-emerald-400 to-emerald-600', link: '/cunas/nuevo' }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => router.push(item.link)}
                className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:bg-white flex flex-col items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
