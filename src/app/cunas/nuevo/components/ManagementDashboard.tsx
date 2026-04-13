import React, { useEffect, useState } from 'react';
import { 
  BarChart2, Users, AlertTriangle, Activity, 
  CheckCircle, TrendingUp, AlertOctagon,
  Zap, Brain, FileText, Loader2
} from 'lucide-react';
import { ManagementAlertService, type OperationalMetrics, type AlertItem, type TeamMember } from '../services/ManagementAlertService';
import { ExecutiveReportingService } from '../services/ExecutiveReportingService';

export const ManagementDashboard = () => {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [cortex, setCortex] = useState<Record<string, unknown> | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    // ... loadData ...
    const loadData = async () => {
       setMetrics(await ManagementAlertService.getOperationalMetrics());
       setAlerts(await ManagementAlertService.generateIntelligentAlerts());
       setTeam(await ManagementAlertService.getTeamPerformance());
       setCortex(await ManagementAlertService.getCortexPredictions() as Record<string, unknown>);
    };
    loadData();
  }, []);

  const handleGenerateReport = async () => {
     setGeneratingReport(true);
     try {
        const result = await ExecutiveReportingService.autoSendReports();
        alert(`✅ Reporte enviado a: ${result.deliveredTo.join(', ')}\n🔗 Excel: ${result.links.excel}`);
     } catch {
        alert('Error generando reporte.');
     }
     setGeneratingReport(false);
  };
//...
// (skipping unchanged middle parts, using replace_chunk for specific parts or just target file?)
// Doing granular replaces.

  if (!metrics || !cortex) return <div className="p-10 text-center text-slate-400">Cargando Dashboard Gerencial...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-2">
      
      <div className="flex justify-between items-center mb-2">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
               <Activity className="w-8 h-8 text-violet-600" /> Dashboard Operativo Gerencial
            </h2>
            <p className="text-slate-500 ml-11">Visión estratégica en tiempo real</p>
         </div>
         <div className="flex gap-3">
            <button 
               onClick={handleGenerateReport}
               disabled={generatingReport}
               className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 shadow-lg transition-all"
            >
               {generatingReport ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4" />}
               {generatingReport ? 'Generando...' : 'Reporte Diario'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 h-fit self-center">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sistema Operativo
            </div>
         </div>
      </div>
// ... rest of code

      {/* 1. Métrica Clave Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard 
           title="Material Activo" 
           value={metrics.activeMaterial.total.toString()} 
           subtext={`+${metrics.activeMaterial.trend}% esta semana`}
           icon={BarChart2} color="violet"
         />
         <MetricCard 
           title="Vencen en 7 Días" 
           value={metrics.activeMaterial.expiringIn7Days.toString()} 
           subtext="Atención Requerida"
           icon={AlertOctagon} color="red"
         />
         <MetricCard 
           title="Score Calidad" 
           value={`${metrics.quality.averageScore}/100`} 
           subtext="Promedio Global"
           icon={CheckCircle} color="emerald"
         />
         <MetricCard 
           title="Entregas Exitosas" 
           value={`${metrics.distribution.successRate}%`} 
           subtext={`${metrics.distribution.pendingConfirmations} pendientes`}
           icon={TrendingUp} color="blue"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* 2. Alertas Críticas (2/3 width) */}
         <div className="lg:col-span-2 space-y-4">
            <SectionHeader title="Alertas Críticas y Riesgos" icon={AlertTriangle} />
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               {alerts.map((alert, idx) => (
                  <div key={alert.id} className={`p-4 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-red-50/30' : ''}`}>
                     <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${alert.priority === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                           {alert.type === 'technical' ? <Zap className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800 text-sm">{alert.title}</h4>
                           <p className="text-sm text-slate-500">{alert.description}</p>
                        </div>
                     </div>
                     <button className="px-4 py-2 bg-white border border-slate-200 hover:border-violet-300 text-slate-600 hover:text-violet-700 text-xs font-bold rounded-lg shadow-sm">
                        {alert.actionLabel}
                     </button>
                  </div>
               ))}
               <div className="p-3 bg-slate-50 text-center">
                  <button className="text-xs text-slate-500 hover:text-slate-800 font-bold">Ver todas las alertas</button>
               </div>
            </div>

            <SectionHeader title="Performance del Equipo" icon={Users} />
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                     <tr>
                        <th className="p-4">Miembro</th>
                        <th className="p-4">Rol</th>
                        <th className="p-4 text-center">Creadas/Proc.</th>
                        <th className="p-4 text-right">Velocidad</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {team.map((member) => (
                        <tr key={member.name} className="hover:bg-slate-50/50">
                           <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {member.name}
                           </td>
                           <td className="p-4 text-slate-500">{member.role}</td>
                           <td className="p-4 text-center font-mono">
                              <span className="text-violet-600 font-bold">{member.itemsCreated}</span> 
                              <span className="text-slate-300 mx-1">/</span>
                              <span className="text-slate-600">{member.itemsProcessed}</span>
                           </td>
                           <td className="p-4 text-right text-slate-600">{member.avgResponseTime}h avg</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* 3. Cortex Predictions (1/3 width) */}
         <div className="space-y-4">
            <SectionHeader title="Análisis Predictivo Cortex" icon={Brain} className="text-violet-600" />
            
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10"><Brain className="w-32 h-32" /></div>
               
               <h4 className="font-bold mb-4 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-4 h-4 text-yellow-300" /> Próximas 48 Horas
               </h4>
               
               <div className="space-y-4 relative z-10">
                  {(cortex?.predictions as Array<{ probability: number; impact: string; title: string }>).map((pred, i) => (
                     <div key={`${pred}-${i}`} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-xs font-bold text-violet-200">Probabilidad: {pred.probability}%</span>
                           <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${pred.impact==='High'?'bg-red-500/80':'bg-emerald-500/80'}`}>
                              {pred.impact}
                           </span>
                        </div>
                        <p className="text-sm font-medium">{pred.title}</p>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
               <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Recomendaciones IA
               </h4>
               <ul className="space-y-3">
                  {(cortex.recommendations as string[]).map((rec, i) => (
                     <li key={`${rec}-${i}`} className="flex gap-3 text-sm text-amber-900">
                        <span className="font-bold text-amber-400">•</span>
                        {rec}
                     </li>
                  ))}
               </ul>
               <button className="w-full mt-4 py-2 bg-white border border-amber-200 text-amber-700 font-bold rounded-lg text-xs hover:bg-amber-100">
                  Aplicar Recomendaciones
               </button>
            </div>

         </div>

      </div>
    </div>
  );
};

// --- Subcomponents ---

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  color: 'violet' | 'red' | 'emerald' | 'blue';
}

const MetricCard = ({ title, value, subtext, icon: Icon, color }: MetricCardProps) => {
   const colors: Record<string, string> = {
      violet: 'bg-violet-100 text-violet-600',
      red: 'bg-red-100 text-red-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      blue: 'bg-blue-100 text-blue-600'
   };

   return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
         <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            <p className="text-slate-400 text-xs mt-1">{subtext}</p>
         </div>
         <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
         </div>
      </div>
   );
};

interface SectionHeaderProps {
  title: string;
  icon: React.ElementType;
  className?: string;
}

const SectionHeader = ({ title, icon: Icon, className = 'text-slate-700' }: SectionHeaderProps) => (
   <h3 className={`font-bold flex items-center gap-2 ${className}`}>
      <Icon className="w-5 h-5" /> {title}
   </h3>
);

const Sparkles = ({ className }: { className?: string }) => (
   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
);
