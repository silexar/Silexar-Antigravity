import React, { useEffect, useState } from 'react';
import { BarChart, Users, Activity, Radio, TrendingUp, DollarSign } from 'lucide-react';
import { UsageAnalyticsService, type UsageMetrics } from '../services/UsageAnalyticsService';

const Card = ({ children, title, icon: Icon }: { children: React.ReactNode; title?: string; icon?: React.ElementType }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
    {title && (
      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
        {Icon && <Icon className="w-4 h-4" />} {title}
      </h4>
    )}
    {children}
  </div>
);

const MetricItem = ({ label, value, subtext }: { label: string; value: string; subtext?: string }) => (
  <div>
    <div className="text-xs text-slate-500 mb-1">{label}</div>
    <div className="text-xl font-bold text-slate-800">{value}</div>
    {subtext && <div className="text-xs text-slate-400">{subtext}</div>}
  </div>
);

export const UsageAnalysisPanel = ({ cunaId = 'SPX001847' }: { cunaId?: string }) => {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);

  useEffect(() => {
    UsageAnalyticsService.getMetrics(cunaId).then(setMetrics);
  }, [cunaId]);

  if (!metrics) return <div className="p-8 text-center text-slate-400">Cargando métricas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Campaña */}
      <div className="flex justify-between items-center">
         <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Activity className="w-6 h-6 text-violet-600" /> Análisis de Uso y Performance
            </h3>
            <p className="text-slate-500">Métricas en tiempo real para <strong>{cunaId}</strong></p>
         </div>
         <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
               Comparar
            </button>
            <button className="px-4 py-2 bg-[#EAF0F6] text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 shadow-md">
               Exportar PDF
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* KPI Cards */}
         <Card icon={Radio} title="Métricas de Uso">
            <div className="space-y-4">
               <MetricItem label="Total Emisiones" value={`${metrics.totalEmissions} veces`} subtext={`Promedio ${metrics.dailyAverage}/día`} />
               <MetricItem label="Período Activo" value={`${metrics.periodActiveDays} días`} />
            </div>
         </Card>
         
         <Card icon={Users} title="Interacciones">
            <div className="grid grid-cols-2 gap-4">
               <MetricItem label="Usuarios" value={metrics.interactions.usersAccessed.toString()} />
               <MetricItem label="Descargas" value={metrics.interactions.downloads.toString()} />
               <MetricItem label="Ediciones" value={metrics.interactions.modifications.toString()} />
               <MetricItem label="Envíos" value={metrics.interactions.distributions.toString()} />
            </div>
         </Card>

         <Card icon={TrendingUp} title="Performance">
            <div className="space-y-4">
               <MetricItem label="Reach Estimado" value={`${metrics.performance.estimatedReach}M`} subtext="Personas alcanzadas" />
               <div className="grid grid-cols-2 gap-2">
                  <MetricItem label="Frecuencia" value={metrics.performance.frequency.toString()} />
                  <MetricItem label="GRP Total" value={metrics.performance.grp.toString()} />
               </div>
            </div>
         </Card>

         <Card icon={DollarSign} title="Eficiencia">
            <div className="h-full flex flex-col justify-center">
               <MetricItem label="CPM Estimado" value={`$${metrics.performance.cpm.toLocaleString()}`} />
               <div className="mt-4 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded inline-block">
                  +12% vs Promedio
               </div>
            </div>
         </Card>
      </div>

      {/* Emisiones por Emisora (Visual Bar Mock) */}
      <Card title="Distribución de Emisiones por Emisora" icon={BarChart}>
         <div className="space-y-4">
            {metrics.stations.map((station) => (
               <div key={station.name}>
                  <div className="flex justify-between text-sm mb-1">
                     <span className="font-bold text-slate-700">{station.name}</span>
                     <span className="text-slate-500">{station.count} emisiones ({station.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${station.percentage}%`, opacity: Math.max(0.4, station.percentage / 100) }}
                     />
                  </div>
               </div>
            ))}
         </div>
      </Card>

    </div>
  );
}
