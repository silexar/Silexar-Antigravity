/**
 * 📊 COMPONENT: ExpertAnalyticsDashboard
 * 
 * Centro de inteligencia de negocios para el registro de emisión.
 * Muestra KPIs operativos, performance de verificadores y análisis de problemas.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Target, CheckCircle2, AlertTriangle, Users, Radio, Music, Award, BarChart2 } from 'lucide-react';

const MOCK_DATA_EMISORAS = [
  { name: 'Radio Corazón', value: 98.7, count: 1234 },
  { name: 'FM Dos', value: 95.1, count: 987 },
  { name: 'La Clave', value: 94.8, count: 626 },
  { name: 'Futuro', value: 92.4, count: 450 },
];

const MOCK_DATA_PROBLEMAS = [
  { name: 'Cambios Last-Min', value: 45, color: '#ef4444' },
  { name: 'Falla Técnica', value: 23, color: '#f97316' },
  { name: 'No Cargado', value: 18, color: '#eab308' },
  { name: 'Conflicto', value: 14, color: '#3b82f6' },
];

export function ExpertAnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <BarChart2 className="w-8 h-8 text-indigo-600" />
                ANALYTICS DE VERIFICACIÓN
            </h1>
            <p className="text-slate-500 font-medium mt-1">Business Intelligence • Últimos 30 días</p>
        </div>
        <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">Descargar Reporte</button>
             <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700">Tendencias</button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <KPICard title="Verificaciones" value="2,847" icon={Activity} color="indigo" trend="+12.5%" />
         <KPICard title="Tiempo Promedio" value="42s" icon={Clock} color="blue" trend="-5.2%" inverseTrend />
         <KPICard title="Tasa de Éxito" value="96.3%" icon={Target} color="emerald" trend="+0.8%" />
         <KPICard title="Spots Auditados" value="15,234" icon={CheckCircle2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN CHART: PERFORMANCE BY STATION */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Radio className="w-5 h-5 text-slate-400" /> Performance por Emisora
             </h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_DATA_EMISORAS} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[80, 100]} hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#f8fafc' }} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* PROBLEM ANALYSIS (PARETO) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5 text-amber-500" /> Top Problemas
             </h3>
             <div className="space-y-4">
                 {MOCK_DATA_PROBLEMAS.map((item) => (
                     <div key={item.name} className="relative">
                         <div className="flex justify-between text-sm mb-1">
                             <span className="font-bold text-slate-600">{item.name}</span>
                             <span className="font-bold text-slate-800">{item.value}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full rounded-full" 
                                style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                             />
                         </div>
                     </div>
                 ))}
             </div>
             <div className="mt-8 p-4 bg-amber-50 rounded-xl text-xs text-amber-800 leading-relaxed">
                 <span className="font-bold">Insight IA:</span> El 45% de los fallos se deben a cambios de pauta no notificados antes de las 14:00 hrs.
             </div>
          </div>

      </div>

      {/* BOTTOM ROW: MATERIAL BREAKDOWN & TOP USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Music className="w-5 h-5 text-pink-500" /> Accuracy por Tipo
             </h3>
             <div className="grid grid-cols-2 gap-4">
                 <StatBox label="Pregrabados" value="99.2%" sub="Standard" color="bg-emerald-50 text-emerald-700" />
                 <StatBox label="Menciones Vivo" value="93.4%" sub="Requiere revisión" color="bg-orange-50 text-orange-700" />
                 <StatBox label="Presentaciones" value="97.8%" sub="High Trust" color="bg-blue-50 text-blue-700" />
                 <StatBox label="Cierres" value="96.5%" sub="High Trust" color="bg-purple-50 text-purple-700" />
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Users className="w-5 h-5 text-teal-500" /> Top Usuarios
             </h3>
             <div className="space-y-4">
                 <UserRow name="Ana García" count={234} score={98.5} rank={1} />
                 <UserRow name="Carlos Mendoza" count={198} score={97.2} rank={2} />
                 <UserRow name="Roberto Silva" count={156} score={95.8} rank={3} />
             </div>
          </div>

      </div>

      {/* RECORDS BANNER */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Award className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                  <h3 className="text-xl font-bold">Récords del Mes</h3>
                  <p className="text-slate-400 text-sm">Hitos operativos alcanzados</p>
              </div>
          </div>
          <div className="flex gap-8 text-center">
              <div>
                  <div className="text-2xl font-black text-yellow-400">23s</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Verif. Más Rápida</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                  <div className="text-2xl font-black text-white">156</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Spots / Campaña</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                  <div className="text-2xl font-black text-emerald-400">99.9%</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Mejor Accuracy</div>
              </div>
          </div>
      </div>

    </div>
  );
}

// --- HELPERS ---

 // --- HELPERS ---
 
 interface KPICardProps { title: string; value: string; icon: React.ElementType; color: 'indigo' | 'blue' | 'emerald' | 'purple'; trend?: string; inverseTrend?: boolean; }
 const KPICard = ({ title, value, icon: Icon, color, trend, inverseTrend }: KPICardProps) => {
     const textColors: Record<string, string> = { indigo: 'text-indigo-600', blue: 'text-blue-600', emerald: 'text-emerald-600', purple: 'text-purple-600' };
     const bgColors: Record<string, string> = { indigo: 'bg-indigo-50', blue: 'bg-blue-50', emerald: 'bg-emerald-50', purple: 'bg-purple-50' };
     
     return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bgColors[color]} ${textColors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        (trend.startsWith('+') && !inverseTrend) || (trend.startsWith('-') && inverseTrend) 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-1">{title}</div>
        </div>
    );
};

interface StatBoxProps { label: string; value: string; sub: string; color: string; }
const StatBox = ({ label, value, sub, color }: StatBoxProps) => (
    <div className={`p-4 rounded-xl ${color}`}>
        <div className="text-2xl font-black">{value}</div>
        <div className="font-bold text-sm opacity-80">{label}</div>
        <div className="text-[10px] uppercase font-bold mt-1 opacity-60">{sub}</div>
    </div>
);

interface UserRowProps { name: string; count: number; score: number; rank: number; }
const UserRow = ({ name, count, score, rank }: UserRowProps) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
        <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                 rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                 rank === 2 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-700'
             }`}>
                 {rank}
             </div>
             <div>
                 <div className="font-bold text-slate-700">{name}</div>
                 <div className="text-xs text-slate-400">{count} verif.</div>
             </div>
        </div>
        <div className="text-right">
             <div className="text-emerald-600 font-bold">{score}%</div>
             <div className="text-[10px] text-slate-400 uppercase">Éxito</div>
        </div>
    </div>
);
