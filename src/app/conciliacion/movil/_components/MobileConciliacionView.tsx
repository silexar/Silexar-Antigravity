"use client";

import React, { useState } from 'react';
import MobileDetalleDiscrepanciasView from './MobileDetalleDiscrepanciasView';
import MobileAnalyticsView from './MobileAnalyticsView';
import MobileConfigView from './MobileConfigView';
import MobileValidadorView from './MobileValidadorView';
import CortexSchedulingConfig from '../../_components/CortexSchedulingConfig';
import AuditLogView from '../../_components/AuditLogView';
import CortexPredictionView from '../../_components/CortexPredictionView';

export default function MobileConciliacionView() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'main' | 'analytics' | 'config' | 'validador' | 'ia-config' | 'audit' | 'prediction'>('main');
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedSpot, setSelectedSpot] = useState<{id: string, client: string} | null>(null);

  if (selectedSessionId) {
    return <MobileDetalleDiscrepanciasView onBack={() => setSelectedSessionId(null)} sessionId={selectedSessionId} />;
  }

  if (activeView === 'analytics') {
    return <MobileAnalyticsView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'config') {
    return <MobileConfigView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'validador') {
    return <MobileValidadorView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'ia-config') {
    return <CortexSchedulingConfig onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'audit') {
    return <AuditLogView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'prediction') {
    return <CortexPredictionView onBack={() => setActiveView('main')} />;
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    alert(`Ejecutando ${action} para ${selectedIds.length} spots.`);
    setSelectedIds([]);
  };

  if (showWizard) {
    return (
      <div className="space-y-6 pb-24 animate-in slide-in-from-bottom-5 duration-300">
        <header className="flex justify-between items-center bg-slate-900 -mx-4 px-4 py-3 border-b border-white/5 sticky top-[-16px] z-[60]">
           <button onClick={() => setShowWizard(false)} className="text-slate-400 text-xs font-bold uppercase tracking-widest">← Volver</button>
           <div className="text-center">
              <div className="text-xs font-black text-indigo-400">WIZARD CONCILIACIÓN</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Paso {wizardStep} de 6</div>
           </div>
           <div className="w-12 h-1 bg-slate-800 rounded-full">
              <div className={`h-full bg-indigo-500 rounded-full transition-all duration-500`} style={{ width: `${(wizardStep / 6) * 100}%` }}></div>
           </div>
        </header>

        {wizardStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">⚙️ Paso 1: Setup Inteligente</h3>
            
            <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl space-y-4 shadow-xl">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">📅 Fecha Objetivo</label>
                  <div className="grid grid-cols-2 gap-2">
                     <button className="bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20">HOY</button>
                     <button className="bg-slate-800 text-slate-400 py-2 rounded-xl text-xs font-bold border border-white/5">AYER</button>
                  </div>
               </div>

               <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">📻 Emisoras y Rutas</label>
                  <div className="space-y-2 text-[10px]">
                     <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-slate-200 font-bold">Corazón</span>
                        </div>
                        <span className="text-emerald-400 font-black">AUTO-FOUND ✅</span>
                     </div>
                     <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-slate-200 font-bold">Play FM</span>
                        </div>
                        <span className="text-emerald-400 font-black">AUTO-FOUND ✅</span>
                     </div>
                  </div>
               </div>
            </div>

            <button onClick={() => setWizardStep(2)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-4 rounded-2xl text-white font-black text-sm shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">
               INICIAR PARSING MAESTRO →
            </button>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-10">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">📄 Paso 2: Análisis Dalet</h3>
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
               <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                     <span className="text-xs font-bold text-slate-200">📻 Radio Corazón</span>
                     <span className="text-[10px] font-black text-blue-400">94% COMPLETO</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                     <div className="h-full bg-blue-600 rounded-full w-[94%] shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                  </div>
               </div>

               <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] font-black text-slate-500 uppercase mb-3 text-center tracking-widest pl-1">Preview de Datos</div>
                  <div className="space-y-2">
                     {[ {h:'06:15', sp:'SP123456', cl:'Banco Chile'}, {h:'06:45', sp:'SP789012', cl:'Coca Cola'} ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-900/50 p-2 rounded-lg pr-4">
                           <span className="text-slate-500 font-mono italic">{item.h}</span>
                           <span className="text-blue-400 font-black">{item.sp}</span>
                           <span className="text-slate-300 font-medium truncate ml-2 max-w-[80px]">{item.cl}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <button onClick={() => setWizardStep(3)} className="w-full bg-gradient-to-r from-emerald-600 to-blue-700 py-4 rounded-2xl text-white font-black text-sm shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">
               🎯 PROCESAR DISCREPANCIAS →
            </button>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-10">
             <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">🔍 Paso 3: Comparador Maestro</h3>
             
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Analizando Logs</span>
                    <span className="text-[10px] font-black text-indigo-400">89%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-indigo-500 w-[89%] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                </div>

                <div className="flex justify-around items-center border-b border-white/5 pb-4">
                   <div className="text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase">Impacto</div>
                      <div className="text-lg font-black text-red-500">$4.2M</div>
                   </div>
                   <div className="w-px h-8 bg-white/5"></div>
                   <div className="text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase">Recup. IA</div>
                      <div className="text-lg font-black text-emerald-400">20 spots</div>
                   </div>
                </div>

                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                   {[
                     { sp:'SP123456', cl:'Banco Chile', v:'$1.2M', t:'CRÍTICO' },
                     { sp:'SP789012', cl:'Coca Cola', v:'$800K', t:'CRÍTICO' }
                   ].map((row, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-red-500/20">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded italic">{row.t}</span>
                            <span className="text-[9px] font-mono text-slate-500">{row.sp}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <div className="text-xs font-bold text-slate-200">{row.cl}</div>
                            <div className="text-xs font-black text-slate-100">{row.v}</div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <button onClick={() => setWizardStep(4)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-4 rounded-2xl text-white font-black text-sm shadow-2xl active:scale-95 transition-all">
                🤖 SELECCIONAR MODO →
             </button>
          </div>
        )}

        {wizardStep === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-10">
             <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">🤖 Paso 4: Modo Recuperación</h3>

             <div className="space-y-3">
                <div className="bg-indigo-600/10 border-2 border-indigo-500 rounded-2xl p-4 relative">
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-indigo-500 bg-white shadow-[0_0_10px_white]"></div>
                    <div className="text-[10px] font-black text-indigo-200 uppercase mb-1">AUTOMÁTICO INTELIGENTE (IA)</div>
                    <p className="text-[9px] text-slate-400">Redistribución óptima inmediata basada en Cortex-Scheduling.</p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 opacity-50">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">SEMI-AUTOMÁTICO</div>
                    <p className="text-[9px] text-slate-500">IA sugiere y requiere aprobación manual por bloque.</p>
                </div>

                <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Horario Inicio</span>
                        <input type="time" defaultValue="16:00" className="bg-transparent text-xs text-indigo-400 font-bold text-right outline-none" />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Espaciado Mín</span>
                        <span className="text-xs text-slate-200 font-bold text-right">15 min</span>
                    </div>
                </div>
             </div>

             <button onClick={() => setWizardStep(5)} className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 py-4 rounded-2xl text-white font-black text-sm shadow-2xl active:scale-95 transition-all mt-4">
                🚀 EJECUTAR RECUPERACIÓN →
             </button>
          </div>
        )}

        {wizardStep === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-10">
             <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">⚙️ Paso 5: IA en Acción</h3>

             <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-5 space-y-6 shadow-xl">
                <div className="space-y-3 text-center">
                    <div className="text-2xl animate-spin-slow inline-block">⚙️</div>
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Cortex-Scheduling procesando...</div>
                    <div className="text-3xl font-black text-white">96%</div>
                    <div className="w-full h-3 bg-slate-950 rounded-full border border-white/5 p-0.5">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: '96%' }}></div>
                    </div>
                </div>

                <div className="flex justify-around pt-4 border-t border-white/5">
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Recup.</div>
                        <div className="text-xl font-black text-emerald-400">20/23</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Valor</div>
                        <div className="text-xl font-black text-indigo-400">$1.8M</div>
                    </div>
                </div>
             </div>

             <div className="space-y-3">
                <button onClick={() => setWizardStep(6)} className="w-full bg-gradient-to-r from-emerald-600 to-indigo-700 py-4 rounded-2xl text-white font-black text-sm shadow-xl active:scale-95 transition-all">
                    🏁 FINALIZAR Y AUDITAR →
                </button>
                <button onClick={() => setWizardStep(1)} className="w-full text-slate-500 text-[10px] font-bold uppercase tracking-widest">Reiniciar Proceso</button>
             </div>
          </div>
        )}

        {wizardStep === 6 && (
          <div className="space-y-6 animate-in slide-in-from-right-10 overflow-x-hidden">
             <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[80px] -mr-16 -mt-16"></div>
                <div className="text-4xl">✅</div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">CONCILIACIÓN COMPLETADA</h3>
                <p className="text-[10px] text-emerald-400 font-mono tracking-widest">ID: CONC-20250820-001</p>
             </div>

             <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 text-center">📊 RESUMEN EJECUTIVO</h4>
                <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center"><span className="text-slate-400">Total Verificados</span> <span className="text-slate-200 font-black">441</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Spots Emitidos</span> <span className="text-emerald-400 font-black">418</span></div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-2"><span className="text-slate-100 font-medium">Cumplimiento Final</span><span className="text-2xl font-black text-emerald-400">99.3%</span></div>
                </div>
             </div>

             <div className="bg-slate-950 border border-indigo-500/20 rounded-3xl p-5 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 text-center">💰 IMPACTO COMERCIAL</h4>
                <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center"><span className="text-slate-400">Valor Verificado</span> <span className="text-slate-200 font-black">$12.8M</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Valor Recuperado</span> <span className="text-emerald-400 font-black">$1.8M</span></div>
                </div>
                <div className="bg-indigo-600/10 p-3 rounded-2xl border border-indigo-500/20 grid grid-cols-2 gap-2">
                    <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">✅ Ejec (8)</div>
                    <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">✅ Slack</div>
                    <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">✅ Control</div>
                    <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">✅ Geren</div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pb-8">
                <button onClick={() => setShowWizard(false)} className="bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">🏠 DASHBOARD</button>
                <button onClick={() => setWizardStep(1)} className="bg-slate-800 text-slate-300 py-4 rounded-2xl text-[10px] font-black border border-white/5 active:scale-95 transition-all">🔄 NUEVA</button>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER SILEXAR MÓVIL */}
      <header className="bg-slate-900 -mx-4 px-4 py-4 border-b border-white/5 sticky top-[-16px] z-50">
         <div className="flex justify-between items-center">
            <h1 className="text-sm font-black text-white uppercase tracking-tighter">📱 SILEXAR CONCILIACIÓN MÓVIL</h1>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
         </div>
      </header>

      {/* DASHBOARD OPERATIVO MÓVIL */}
      <div className="bg-slate-900 border border-white/5 rounded-[32px] p-6 space-y-4 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">🏠 Dashboard Operativo</h3>
         <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="space-y-1">
               <div className="text-[9px] text-slate-400 font-bold uppercase">Cumplimiento hoy</div>
               <div className="text-2xl font-black text-emerald-400">98.7%</div>
            </div>
            <div className="space-y-1">
               <div className="text-[9px] text-slate-400 font-bold uppercase">Spots no emitidos</div>
               <div className="text-2xl font-black text-slate-100">23</div>
            </div>
            <div className="space-y-1">
               <div className="text-[9px] text-slate-400 font-bold uppercase">Recuperados auto</div>
               <div className="text-lg font-black text-blue-400">20</div>
            </div>
            <div className="space-y-1">
               <div className="text-[9px] text-slate-400 font-bold uppercase">Pendientes manual</div>
               <div className="text-lg font-black text-amber-500">3</div>
            </div>
         </div>
      </div>

      {/* ⚡ ACCIONES RÁPIDAS */}
      <div className="space-y-3">
         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">⚡ ACCIONES RÁPIDAS</h3>
         <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setShowWizard(true); setWizardStep(1); }} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all">
               <span className="text-lg">🔄</span>
               <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter text-left">Conciliación Express</span>
            </button>
            <button onClick={() => setActiveView('analytics')} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all">
               <span className="text-lg">👁️</span>
               <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter text-left">Ver Discrepancias</span>
            </button>
            <button className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all opacity-50">
               <span className="text-lg">🛠️</span>
               <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter text-left">Recuperación Manual</span>
            </button>
            <button onClick={() => setActiveView('analytics')} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-all">
               <span className="text-lg">📊</span>
               <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter text-left">Métricas del Día</span>
            </button>
         </div>
      </div>

      {/* 🚨 ALERTAS ACTIVAS */}
      <div className="bg-slate-900 border border-red-500/10 rounded-3xl p-5 space-y-4 shadow-xl">
         <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></span>
            🚨 ALERTAS ACTIVAS
         </h3>
         <div className="space-y-3">
            {[
               { s: 'Sonar FM', m: '3 spots Toyota pendientes', c: 'text-amber-400' },
               { s: 'Play FM', m: 'Falla técnica detectada', c: 'text-red-400' },
               { s: 'Radio Corazón', m: 'Todo operativo ✅', c: 'text-emerald-400' }
            ].map((a, i) => (
               <div key={i} className="flex justify-between items-center text-[10px] pb-2 border-b border-white/5 last:border-0">
                  <span className="font-bold text-slate-300">{a.s}:</span>
                  <span className={`${a.c} font-black uppercase`}>{a.m}</span>
               </div>
            ))}
         </div>
      </div>

      {/* 📊 EMISORAS STATUS */}
      <div className="space-y-3">
         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">📊 EMISORAS STATUS</h3>
         <div className="space-y-2">
            {[
               { s: 'Radio Corazón', p: '99.1%', st: '✅', c: 'text-emerald-400' },
               { s: 'Play FM', p: '96.8%', st: '⚠️', c: 'text-amber-400' },
               { s: 'Sonar FM', p: '94.2%', st: '🔴', c: 'text-red-400' }
            ].map((e, i) => (
               <div key={i} className="bg-slate-800/50 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <span className="text-lg">{e.st}</span>
                     <span className="text-xs font-bold text-slate-200">{e.s}</span>
                  </div>
                  <span className={`${e.c} font-black text-xs`}>{e.p}</span>
               </div>
            ))}
         </div>
      </div>

      {/* 🎯 ACCIONES PENDIENTES */}
      <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
         <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-2">🎯 ACCIONES PENDIENTES</h3>
         <div className="space-y-3">
            {[
               { c: 'Toyota', a: 'Programar manual', u: true },
               { c: 'Movistar', a: 'Resolver conflicto', u: false },
               { c: 'Banco Estado', a: 'Confirmar horario', u: false }
            ].map((ap, i) => (
               <div key={i} className="flex justify-between items-center">
                  <div>
                     <div className="text-[10px] font-black text-white uppercase">{ap.c}</div>
                     <div className="text-[9px] text-slate-500 font-bold">{ap.a}</div>
                  </div>
                  {ap.u && <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded italic">URGENTE</span>}
               </div>
            ))}
         </div>
         <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
            <button onClick={() => setActiveView('ia-config')} className="bg-slate-800 p-3 rounded-xl text-[9px] font-black text-indigo-400 uppercase border border-indigo-500/20">🤖 IA Setup</button>
            <button onClick={() => setActiveView('audit')} className="bg-slate-800 p-3 rounded-xl text-[9px] font-black text-red-400 uppercase border border-red-500/20">🛡️ Auditoría</button>
            <button onClick={() => setActiveView('prediction')} className="bg-slate-800 p-3 rounded-xl text-[9px] font-black text-slate-300 uppercase">📊 IA Predictions</button>
            <button className="bg-slate-800 p-3 rounded-xl text-[9px] font-black text-slate-300 uppercase">📧 Notificar</button>
         </div>
      </div>

      {/* TABBAR MÓVIL ESTILO SILEXAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 z-[100]">
         <div className="flex justify-between items-center">
            <button onClick={() => setActiveView('main')} className="text-xl opacity-100 scale-110">🏠</button>
            <button onClick={() => { setShowWizard(true); setWizardStep(1); }} className="text-xl opacity-50">🔄</button>
            <button onClick={() => setActiveView('analytics')} className="text-xl opacity-50">📊</button>
            <button onClick={() => setActiveView('config')} className="text-xl opacity-50">⚙️</button>
            <button onClick={() => setActiveView('validador')} className="text-xl opacity-50">🚨</button>
         </div>
      </div>

       {/* BÚSQUEDA IA MÓVIL */}
       <div className="space-y-3 px-1">
         <div className="relative group">
           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
           <input 
             type="text" 
             placeholder="'SP123456', 'Banco Chile'..."
             className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
           />
         </div>
         <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
           <div className="flex items-center gap-2 mb-2">
             <span className="text-sm">🤖</span>
             <span className="text-xs font-bold text-indigo-300 uppercase tracking-tighter">Predicciones Cortex IA</span>
           </div>
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             <button className="whitespace-nowrap text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-200/70 px-3 py-1.5 rounded-full italic shrink-0">
               "¿Fallas de Coca Cola ayer?"
             </button>
             <button className="whitespace-nowrap text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-200/70 px-3 py-1.5 rounded-full italic shrink-0">
               "Eficiencia Sonar FM"
             </button>
           </div>
         </div>
       </div>

       {/* ALERTA EMISORAS */}
       <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 py-1">
          <span className="whitespace-nowrap bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold">Corazón ✅</span>
          <span className="whitespace-nowrap bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold">Play ✅</span>
          <span className="whitespace-nowrap bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] px-2.5 py-1 rounded-full font-bold">Sonar ⚠️</span>
       </div>

      {/* TABLA DE CONCILIACIONES */}
      <div className="space-y-4 px-1">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
           Historial Operativo TIER 0
        </h3>
        
        {/* ITEM CARD 1 */}
        <div 
          onClick={() => setSelectedSessionId('CONC-20250820-001')}
          className="bg-slate-900/80 border border-slate-700 rounded-[24px] p-5 space-y-4 shadow-xl active:scale-95 transition-all cursor-pointer"
        >
           <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div className="space-y-1">
                 <div className="text-sm font-bold text-slate-100 flex items-center gap-2">📅 20/08/2025</div>
                 <div className="text-[10px] text-slate-500 font-mono">14:23:45 • Radio Corazón</div>
              </div>
              <div className="text-right">
                 <div className="text-emerald-400 font-black text-xs">98.7% OK</div>
                 <div className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 mt-1 inline-block">COMPLETADO</div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-[10px]">
                 <div className="text-slate-500 font-bold uppercase tracking-tighter">Resultados</div>
                 <div className="flex justify-between"><span className="text-slate-400">✅ Emit:</span> <span className="text-emerald-400 font-bold">2,824</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">❌ No Emit:</span> <span className="text-red-400 font-bold">23</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">🔄 Auto:</span> <span className="text-indigo-400 font-bold">20</span></div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                 <div className="text-slate-500 font-bold uppercase tracking-tighter">Impacto</div>
                 <div className="flex justify-between"><span className="text-slate-400">🏢 Client:</span> <span className="text-slate-200">8</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">💰 Valor:</span> <span className="text-emerald-400 font-bold">$450K</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">⚠️ Riesgo:</span> <span className="text-emerald-400 font-bold">BAJO</span></div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center ml-1">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">🚨 Requieren Acción</h3>
        {selectedIds.length > 0 && (
          <button onClick={() => setSelectedIds([])} className="text-xs text-indigo-400 font-bold">LIMPIAR ({selectedIds.length})</button>
        )}
      </div>
      
      <div className="space-y-3">
         {/* Alerta 1 */}
         <div className={`bg-slate-900 border-l-2 border-red-500 rounded-r-2xl p-4 shadow-lg transition-all flex gap-3 items-center ${selectedIds.includes('SP_TOY_01') ? 'ring-2 ring-indigo-500 bg-indigo-500/5' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedIds.includes('SP_TOY_01')} 
              onChange={() => toggleSelect('SP_TOY_01')}
              className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-indigo-500"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs text-red-400 font-bold">URGENTE: FALLA TÉCNICA</div>
                <div className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-500">QC PASS</div>
              </div>
              <div className="text-sm text-slate-200 font-medium">3 spots Toyota (Play FM)</div>
              
              <div className="mt-3 flex gap-2">
                 <button 
                   onClick={() => { setSelectedSpot({id: 'SP_TOY_01', client: 'Toyota'}); setShowSalesModal(true); }}
                   className="flex-1 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300"
                 >
                   📧 CONSULTAR
                 </button>
                 <button className="flex-1 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-[10px] font-bold text-emerald-400">
                   ⚡ RECUPERAR
                 </button>
              </div>
            </div>
         </div>
      </div>

      {/* MODAL MÓVIL */}
      {showSalesModal && selectedSpot && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 w-full rounded-t-[32px] p-6 pb-12 border-t border-slate-700 animate-in slide-in-from-bottom-20 duration-300">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6"></div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
                <span>📧</span> Consultar a Ventas
              </h3>
              
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 mb-6">
                 <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Discrepancia</div>
                 <div className="text-sm font-bold text-slate-200">{selectedSpot.id} - {selectedSpot.client}</div>
              </div>

              <textarea 
                placeholder="Escribe tu consulta..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32 mb-6"
              ></textarea>

              <div className="flex gap-3">
                 <button onClick={() => setShowSalesModal(false)} className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold text-sm">Cerrar</button>
                 <button onClick={() => { setShowSalesModal(false); alert('Enviado'); }} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20">ENVIAR CONSULTA</button>
              </div>
           </div>
        </div>
      )}

      {/* BARRA FLOTANTE MÓVIL */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-300">
           <div className="bg-indigo-600 rounded-2xl p-4 shadow-2xl shadow-indigo-500/40 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <span className="text-white text-sm font-bold">{selectedIds.length} spots seleccionados</span>
                 <button onClick={() => setSelectedIds([])} className="text-white/70 text-xs">Cancelar</button>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleBulkAction('CONS')} className="flex-1 bg-white/10 text-white py-2.5 rounded-xl text-xs font-bold border border-white/20">📧 CONSULTAR</button>
                 <button onClick={() => handleBulkAction('REC')} className="flex-1 bg-white text-indigo-600 py-2.5 rounded-xl text-xs font-black shadow-lg">⚡ RECUPERAR</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
