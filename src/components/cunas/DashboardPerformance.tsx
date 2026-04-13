/**
 * 📊 SILEXAR PULSE - Dashboard Performance Real-Time TIER 0
 * 
 * Dashboard para métricas en tiempo real de cuñas
 * y activos digitales
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Volume2, Eye, MousePointer, TrendingUp, DollarSign,
  Activity, Radio, Target, Clock, AlertTriangle, CheckCircle,
  RefreshCw, ArrowUpRight, ArrowDownRight, Zap, Users
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface MetricasRadio {
  emisionesHoy: number;
  emisionesMes: number;
  cambioVsAyer: number;
  cunasEnAire: number;
  cunasPendientes: number;
  cunasPorVencer: number;
  tasaAprobacion: number;
  tiempoPromedioAprobacion: number; // horas
}

interface MetricasDigital {
  impresionesHoy: number;
  clicsHoy: number;
  ctrHoy: number;
  inversionHoy: number;
  conversionesHoy: number;
  roasHoy: number;
  activosActivos: number;
  cambioVsAyer: {
    impresiones: number;
    clics: number;
    conversiones: number;
  };
}

interface AlertaOperativa {
  id: string;
  tipo: 'critica' | 'alta' | 'media';
  categoria: string;
  mensaje: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES UI
// ═══════════════════════════════════════════════════════════════

const MetricCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  cambio, 
  subtext,
  large = false
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  cambio?: number;
  subtext?: string;
  large?: boolean;
}) => (
  <div className={`
    rounded-2xl p-4 bg-gradient-to-br from-slate-50 to-slate-100 
    shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]
    ${large ? 'col-span-2' : ''}
  `}>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-slate-500 text-sm">{label}</p>
        <p className={`font-bold text-slate-800 ${large ? 'text-4xl' : 'text-2xl'}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
        {cambio !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${cambio >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {cambio >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(cambio).toFixed(1)}% vs ayer</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const SparklineChart = ({ data, color = 'emerald' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg viewBox="0 0 100 50" className="w-full h-12">
      <polyline
        points={points}
        fill="none"
        stroke={`var(--${color}-500, #10b981)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`0,50 ${points} 100,50`}
        fill={`var(--${color}-100, #d1fae5)`}
        opacity="0.3"
      />
    </svg>
  );
};

const AlertaRow = ({ alerta }: { alerta: AlertaOperativa }) => {
  const colors = {
    critica: 'bg-red-100 border-red-300 text-red-800',
    alta: 'bg-amber-100 border-amber-300 text-amber-800',
    media: 'bg-blue-100 border-blue-300 text-blue-800'
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colors[alerta.tipo]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">{alerta.mensaje}</span>
        </div>
        <span className="text-xs opacity-60">
          {new Date(alerta.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function DashboardPerformance() {
  const [metricsRadio, setMetricsRadio] = useState<MetricasRadio>({
    emisionesHoy: 1247,
    emisionesMes: 38420,
    cambioVsAyer: 12.5,
    cunasEnAire: 89,
    cunasPendientes: 12,
    cunasPorVencer: 5,
    tasaAprobacion: 94.2,
    tiempoPromedioAprobacion: 2.3
  });

  const [metricsDigital, setMetricsDigital] = useState<MetricasDigital>({
    impresionesHoy: 458720,
    clicsHoy: 8456,
    ctrHoy: 1.84,
    inversionHoy: 2450000,
    conversionesHoy: 234,
    roasHoy: 3.2,
    activosActivos: 15,
    cambioVsAyer: {
      impresiones: 8.3,
      clics: 12.1,
      conversiones: -2.4
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [alertas, _setAlertas] = useState<AlertaOperativa[]>([
    { id: '1', tipo: 'critica', categoria: 'vencimiento', mensaje: 'SPX000124 vence hoy', timestamp: new Date() },
    { id: '2', tipo: 'alta', categoria: 'aprobacion', mensaje: '3 cuñas pendientes hace +4h', timestamp: new Date() },
    { id: '3', tipo: 'media', categoria: 'emision', mensaje: 'Banco Chile: emisiones -15% vs objetivo', timestamp: new Date() }
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [emisionesHora, _setEmisionesHora] = useState<number[]>([45, 52, 48, 61, 58, 72, 65, 80, 75, 82, 90, 85]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [impresionesHora, _setImpresionesHora] = useState<number[]>([12000, 15000, 18000, 22000, 28000, 35000, 42000, 38000, 45000, 52000, 48000, 55000]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simular refresh
    await new Promise(r => setTimeout(r, 1000));
    
    // Actualizar datos con pequeñas variaciones
    setMetricsRadio(prev => ({
      ...prev,
      emisionesHoy: prev.emisionesHoy + Math.floor(Math.random() * 10),
    }));
    setMetricsDigital(prev => ({
      ...prev,
      impresionesHoy: prev.impresionesHoy + Math.floor(Math.random() * 500),
      clicsHoy: prev.clicsHoy + Math.floor(Math.random() * 20)
    }));
    
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-7 h-7 text-emerald-500" />
            Dashboard en Tiempo Real
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
          </p>
        </div>
        
        <button 
          onClick={refresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Métricas Radio */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Radio / Cuñas
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Emisiones Hoy" 
            value={metricsRadio.emisionesHoy} 
            icon={Volume2} 
            color="from-blue-400 to-blue-500"
            cambio={metricsRadio.cambioVsAyer}
          />
          <MetricCard 
            label="Cuñas En Aire" 
            value={metricsRadio.cunasEnAire} 
            icon={Zap} 
            color="from-emerald-400 to-emerald-500"
          />
          <MetricCard 
            label="Pendientes" 
            value={metricsRadio.cunasPendientes} 
            icon={Clock} 
            color="from-amber-400 to-amber-500"
            subtext={`${metricsRadio.cunasPorVencer} por vencer`}
          />
          <MetricCard 
            label="Tasa Aprobación" 
            value={`${metricsRadio.tasaAprobacion}%`} 
            icon={CheckCircle} 
            color="from-purple-400 to-purple-500"
            subtext={`~${metricsRadio.tiempoPromedioAprobacion}h promedio`}
          />
        </div>
        
        <div className="mt-4 bg-white rounded-xl p-4">
          <p className="text-sm text-slate-500 mb-2">Emisiones por hora</p>
          <SparklineChart data={emisionesHora} color="blue" />
        </div>
      </div>

      {/* Métricas Digital */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Digital / Programático
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Impresiones Hoy" 
            value={metricsDigital.impresionesHoy >= 1000 ? `${(metricsDigital.impresionesHoy / 1000).toFixed(0)}K` : metricsDigital.impresionesHoy} 
            icon={Eye} 
            color="from-purple-400 to-purple-500"
            cambio={metricsDigital.cambioVsAyer.impresiones}
          />
          <MetricCard 
            label="Clics Hoy" 
            value={metricsDigital.clicsHoy} 
            icon={MousePointer} 
            color="from-pink-400 to-pink-500"
            cambio={metricsDigital.cambioVsAyer.clics}
            subtext={`CTR: ${metricsDigital.ctrHoy}%`}
          />
          <MetricCard 
            label="Inversión Hoy" 
            value={formatCurrency(metricsDigital.inversionHoy)} 
            icon={DollarSign} 
            color="from-green-400 to-green-500"
          />
          <MetricCard 
            label="ROAS" 
            value={`${metricsDigital.roasHoy}x`} 
            icon={TrendingUp} 
            color="from-amber-400 to-amber-500"
            subtext={`${metricsDigital.conversionesHoy} conversiones`}
          />
        </div>
        
        <div className="mt-4 bg-white rounded-xl p-4">
          <p className="text-sm text-slate-500 mb-2">Impresiones por hora</p>
          <SparklineChart data={impresionesHora} color="purple" />
        </div>
      </div>

      {/* Alertas Operativas */}
      <div className="rounded-2xl bg-white shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Alertas Operativas
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full ml-2">
            {alertas.filter(a => a.tipo === 'critica').length} críticas
          </span>
        </h3>
        <div className="space-y-2">
          {alertas.map(alerta => (
            <AlertaRow key={alerta.id} alerta={alerta} />
          ))}
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-emerald-50 p-4 text-center">
          <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-2 animate-pulse"></div>
          <p className="text-sm font-medium text-emerald-700">Sistema Operativo</p>
          <p className="text-xs text-emerald-600">99.99% uptime</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-4 text-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
          <p className="text-sm font-medium text-blue-700">Sync Activo</p>
          <p className="text-xs text-blue-600">Última: {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="rounded-xl bg-purple-50 p-4 text-center">
          <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-purple-700">Usuarios Online</p>
          <p className="text-xs text-purple-600">12 conectados</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPerformance;
