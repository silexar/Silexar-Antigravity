import React, { useState } from 'react';
import VistaOperativaTable from './VistaOperativaTable';
import DetalleDiscrepanciasView from './DetalleDiscrepanciasView';
import DashboardCumplimiento from './DashboardCumplimiento';
import AnalisisCausaRaiz from './AnalisisCausaRaiz';
import ConfiguradorRutasView from './ConfiguradorRutasView';
import ValidadorArchivosView from './ValidadorArchivosView';
import CortexSchedulingConfig from './CortexSchedulingConfig';
import AuditLogView from './AuditLogView';
import CortexPredictionView from './CortexPredictionView';

interface DashboardConciliacionViewProps {
  onStartConciliacion: () => void;
}

export default function DashboardConciliacionView({ onStartConciliacion }: DashboardConciliacionViewProps) {
  const [view, setView] = useState<'main' | 'detail' | 'analytics' | 'causa-raiz' | 'config' | 'validador' | 'ia-config' | 'audit' | 'prediction'>('main');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  if (view === 'detail') {
    return <DetalleDiscrepanciasView onBack={() => setView('main')} sessionId={selectedSessionId || ''} />;
  }

  if (view === 'analytics') {
    return <DashboardCumplimiento onBack={() => setView('main')} />;
  }

  if (view === 'causa-raiz') {
    return <AnalisisCausaRaiz onBack={() => setView('main')} />;
  }

  if (view === 'config') {
    return <ConfiguradorRutasView onBack={() => setView('main')} />;
  }

  if (view === 'validador') {
    return <ValidadorArchivosView onBack={() => setView('main')} />;
  }

  if (view === 'ia-config') {
    return <CortexSchedulingConfig onBack={() => setView('main')} />;
  }

  if (view === 'audit') {
    return <AuditLogView onBack={() => setView('main')} />;
  }

  if (view === 'prediction') {
    return <CortexPredictionView onBack={() => setView('main')} />;
  }

  return (
    <div className="space-y-6">
      {/* PANEL DE MÉTRICAS CRÍTICAS (TIER 0) */}
      <div className="p-6 bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🧠</span> ESTADO CONCILIACIÓN TIEMPO REAL
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metrica 1 */}
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-sm">
              <div className="text-sm text-slate-500 mb-1 font-semibold">Cumplimiento Hoy</div>
              <div className="text-3xl font-bold flex items-baseline gap-2">
                <span className="text-emerald-500">98.7%</span>
                <span className="text-sm text-slate-500 font-normal">✅</span>
              </div>
              <div className="text-xs text-slate-400 mt-2">14:23 - Última sync</div>
            </div>

            {/* Metrica 2 */}
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-sm">
              <div className="text-sm text-slate-500 mb-1 font-semibold">Spots Procesados</div>
              <div className="text-3xl font-bold flex items-baseline gap-2">
                <span className="text-blue-600">2,847</span>
                <span className="text-sm text-slate-500 font-normal">📊</span>
              </div>
              <div className="text-xs text-amber-500 mt-2 font-medium bg-amber-50 inline-block px-2 py-0.5 rounded-full border border-amber-100">⚠️ 23 pendientes</div>
            </div>

            {/* Metrica 3 */}
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/60 shadow-sm">
              <div className="text-sm text-slate-500 mb-1 font-semibold">Recuperaciones</div>
              <div className="flex gap-4">
               <div>
                  <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mb-1">Cortex Sync Engine</div>
                  <div className="flex items-center gap-2">
                     <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <div key={`dot-${i}`} className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: `${i*150}ms` }}></div>)}
                     </div>
                     <span className="text-[10px] font-black text-emerald-600 font-mono tracking-tighter">LIVE SYNC &lt;30s</span>
                  </div>
               </div>
               <div className="w-px h-8 bg-slate-200 mx-2"></div>
               <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 font-mono">Blockchain ID</div>
                  <div className="text-[10px] font-black text-slate-600 font-mono bg-slate-100 px-1 py-0.5 rounded">0x4F...E1A9</div>
               </div>
            </div>
         </div>

            {/* Metrica 4 (IA) */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-1 font-semibold">
                  <span className="text-indigo-600 flex items-center gap-1">🤖 Cortex IA Predice</span>
                </div>
                <div className="text-xl font-bold text-slate-800 mt-2 leading-tight">
                  2 fallas probables
                </div>
                <div className="text-xs text-indigo-400/80 font-medium mt-1">próximas 2 horas</div>
              </div>
            </div>
          </div>

          {/* Estado Emisoras */}
          <div className="mt-6 flex flex-wrap gap-3 items-center text-sm">
            <span className="text-slate-500 font-medium mr-2">📻 Emisoras:</span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full flex gap-1 items-center shadow-sm">
              Radio Corazón <span className="text-[10px]">✅</span>
            </span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full flex gap-1 items-center shadow-sm">
              Play FM <span className="text-[10px]">✅</span>
            </span>
            <span className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full flex gap-1 items-center shadow-sm">
              Sonar FM <span className="text-[10px]">⚠️</span>
            </span>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS INTELIGENTES (NUEVO TIER 0) */}
      <div className="p-6 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="relative w-full md:max-w-xl group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
            <input
              type="text"
              aria-label="Buscar en conciliación"
              placeholder="'SP123456', 'Banco Chile', 'no emitido', 'recuperado'..."
              className="w-full bg-white/80 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button className="whitespace-nowrap px-4 py-2 rounded-lg bg-slate-700/50 border border-white/5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
              Spots recuperados auto.
            </button>
            <button className="whitespace-nowrap px-4 py-2 rounded-lg bg-slate-700/50 border border-white/5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
              Discrepancias sin resolver
            </button>
            <button className="whitespace-nowrap px-4 py-2 rounded-lg bg-slate-700/50 border border-white/5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
              Fallas técnicas
            </button>
          </div>
        </div>

        {/* IA CONVERSACIONAL PROMPT ADVISOR */}
        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-4 flex items-start gap-4 shadow-inner">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-200">
            🤖
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-indigo-800">Cortex IA Predictor: Pregúntame lo que necesites</p>
            <div className="flex flex-wrap gap-2">
              <button className="text-[11px] bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-all shadow-sm italic font-medium">
                "¿Qué spots de Coca Cola no se emitieron ayer?"
              </button>
              <button className="text-[11px] bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-all shadow-sm italic font-medium">
                "Dime la eficiencia de recuperación de Sonar FM"
              </button>
              <button className="text-[11px] bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-all shadow-sm italic font-medium">
                "¿Hubo cruces de marca en el bloque matinal?"
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CENTRO DE ACCIONES OPERATIVAS (NUEVO TIER 0) */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={onStartConciliacion}
          className="flex-1 min-w-[180px] bg-gradient-to-br from-indigo-600 to-blue-600 p-4 rounded-2xl border border-indigo-500/50 shadow-md shadow-indigo-600/20 group hover:scale-[1.02] transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">▶️</div>
          <div className="text-left">
            <div className="text-sm font-black text-white uppercase tracking-tighter">Conciliación Express</div>
            <div className="text-[10px] text-indigo-100 font-medium">PROCESAR FECHA ACTUAL</div>
          </div>
        </button>

        <button 
          onClick={() => setView('analytics')}
          className="flex-1 min-w-[180px] bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md hover:bg-white/80 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📊</div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Dashboard Cumplimiento</div>
            <div className="text-[10px] text-slate-500 font-semibold italic">MÉTRICAS DETALLADAS</div>
          </div>
        </button>

        <button 
          onClick={() => setView('config')}
           className="flex-1 min-w-[180px] bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md hover:bg-white/80 transition-all flex items-center gap-4 group"
        >
           <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔧</div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Configurar Rutas</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SETUP INICIAL</div>
          </div>
        </button>

        <button 
          onClick={() => setView('ia-config')}
           className="flex-1 min-w-[180px] bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 shadow-sm backdrop-blur-md hover:bg-indigo-100/50 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl group-hover:scale-110 border border-indigo-200 transition-transform">🤖</div>
          <div className="text-left">
            <div className="text-sm font-bold text-indigo-800 uppercase tracking-tighter">IA Setup</div>
            <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Cortex AI</div>
          </div>
        </button>

        <button 
          onClick={() => setView('audit')}
           className="flex-1 min-w-[180px] bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 shadow-sm backdrop-blur-md hover:bg-rose-100/50 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-2xl group-hover:scale-110 border border-rose-200 transition-transform">🛡️</div>
          <div className="text-left">
            <div className="text-sm font-bold text-rose-800 uppercase tracking-tighter">Log Auditoría</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-widest">SEGURIDAD</div>
          </div>
        </button>

        <button 
          onClick={() => setView('prediction')}
           className="flex-1 min-w-[180px] bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md hover:bg-white/80 transition-all flex items-center gap-4 group"
        >
           <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📈</div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Analytics Recuperación</div>
            <div className="text-[10px] text-emerald-600 font-black italic">INSIGHTS IA</div>
          </div>
        </button>

        <button 
          onClick={() => setView('validador')}
           className="flex-1 min-w-[180px] bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md hover:bg-white/80 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl border border-red-200 text-red-600 animate-pulse">🚨</div>
          <div className="text-left">
            <div className="text-sm font-bold text-red-700 uppercase tracking-tighter">Validador de Archivos</div>
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">PRE-PROCESAMIENTO</div>
          </div>
        </button>
      </div>

      {/* TABLA DE CONCILIACIONES - VISTA OPERATIVA (NUEVO TIER 0) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
               <span className="w-2 h-8 bg-indigo-500 rounded-full shadow-sm shadow-indigo-300"></span>
               Historial de Conciliaciones Maestras
            </h3>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/80 border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">EXPORTAR VISTA</button>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all">RE-PROCESAR TODO</button>
            </div>
        </div>
        
        <VistaOperativaTable onSelectRow={(id) => { setSelectedSessionId(id); setView('detail'); }} />
      </div>
    </div>
  );
}
