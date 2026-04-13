"use client";

import React, { useState } from 'react';

interface WizardConciliacionViewProps {
  onCancel: () => void;
}

export default function WizardConciliacionView({ onCancel }: WizardConciliacionViewProps) {
  const [step, setStep] = useState<number>(1);
  const [_isProcessing, setIsProcessing] = useState<boolean>(true);

  // Drag and Drop State
  const [pendingSpots, setPendingSpots] = useState<number[]>([1, 2, 3, 4, 5]);
  const [_placedSpots, setPlacedSpots] = useState<Record<string, number | null>>({});
  const [draggedSpot, setDraggedSpot] = useState<number | null>(null);

  const handleAbort = (targetStep: number) => {
    setIsProcessing(false);
    setStep(targetStep);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedSpot(id);
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const _handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedSpot !== null) {
       setPlacedSpots(prev => ({ ...prev, [targetId]: draggedSpot }));
       setPendingSpots(prev => prev.filter(spot => spot !== draggedSpot));
       setDraggedSpot(null);
    }
  };

  const _handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="p-0 bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden max-w-4xl mx-auto">
      {/* HEADER WIZARD */}
      <div className="bg-white/80 p-6 border-b border-slate-200 flex items-center justify-between shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-slate-800">🤖 Setup Conciliación Inteligente</h2>
           <p className="text-sm text-[#888780] mt-1 font-medium">Configura los parámetros para la ingesta y recuperación TIER 0</p>
        </div>
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <span key={`step-${i}`} className={`w-3 h-3 rounded-full transition-all ${step >= i ? 'bg-gradient-to-r from-indigo-500 to-blue-500 shadow-[0_0_8px_rgba(99,102,241,0.4)] scale-110' : 'bg-slate-200'}`}></span>
            ))}
        </div>
      </div>

      {/* BODY WIZARD */}
      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-sm shadow-indigo-200"></span>
                 ⚙️ Paso 1: Configuración Inicial - Setup Inteligente
               </h3>
               <div className="text-xs text-indigo-700 font-mono font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                 TIER 0 CERTIFIED
               </div>
            </div>
            
            <div className="space-y-6">
               {/* FECHA TARGET */}
               <div className="flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
                 <span className="text-sm font-bold text-slate-600">📅 Fecha objetivo:</span>
                 <input type="date" defaultValue="2025-08-20" aria-label="Fecha objetivo" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono font-medium shadow-inner" />
                 <div className="flex gap-2 ml-auto">
                    <button className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-[#2C2C2A] text-[10px] font-bold rounded shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5">HOY</button>
                    <button className="px-3 py-1 bg-white border border-slate-200 text-[#888780] hover:text-indigo-600 hover:bg-slate-50 text-[10px] font-bold rounded transition-colors shadow-sm">AYER</button>
                 </div>
               </div>

               {/* EMISORAS Y RUTAS (TABLA DETALLADA) */}
               <div className="space-y-3">
                 <label className="text-xs font-black text-[#888780] uppercase tracking-widest">📻 Emisoras y Rutas Dalet Galaxy:</label>
                 <div className="grid grid-cols-1 gap-3">
                    {/* Radio Corazon */}
                    <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex justify-between items-start group hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                             <span className="text-sm font-bold text-slate-800">Radio Corazón</span>
                             <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 rounded-md font-bold border border-emerald-100">FOUND</span>
                          </div>
                          <div className="space-y-1 pl-4">
                             <div className="text-[10px] text-[#888780] font-mono font-medium">📁 Ruta: \\dalet\exports\radio_corazon\</div>
                             <div className="text-[10px] text-[#888780] font-mono font-medium">📄 Patrón: radio_corazon_YYYYMMDD.csv</div>
                             <div className="text-[10px] text-indigo-600 font-bold italic">🕐 Última sync: 14:20 (hace 3 min)</div>
                          </div>
                       </div>
                       <button className="text-[10px] text-[#888780] hover:text-indigo-600 transition-colors font-bold">⚙️ EDITAR</button>
                    </div>

                    {/* Play FM */}
                    <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex justify-between items-start group hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                             <span className="text-sm font-bold text-slate-800">Play FM</span>
                             <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 rounded-md font-bold border border-emerald-100">FOUND</span>
                          </div>
                          <div className="space-y-1 pl-4">
                             <div className="text-[10px] text-[#888780] font-mono font-medium">📁 Ruta: \\dalet\exports\play_fm\</div>
                             <div className="text-[10px] text-[#888780] font-mono font-medium">📄 Patrón: playfm_YYYYMMDD.csv</div>
                             <div className="text-[10px] text-indigo-600 font-bold italic">🕐 Última sync: 14:18 (hace 5 min)</div>
                          </div>
                       </div>
                       <button className="text-[10px] text-[#888780] hover:text-indigo-600 transition-colors font-bold">⚙️ EDITAR</button>
                    </div>

                    {/* Sonar FM */}
                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex justify-between items-start relative overflow-hidden shadow-sm">
                       <div className="absolute top-0 right-0 p-2">
                          <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase border border-amber-200">Subir Manual Requerido</span>
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-200"></div>
                             <span className="text-sm font-bold text-slate-800">Sonar FM</span>
                             <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 rounded-md font-bold italic">NOT FOUND</span>
                          </div>
                          <div className="space-y-1 pl-4 opacity-70">
                             <div className="text-[10px] text-slate-600 font-mono font-medium">📁 Ruta: \\dalet\exports\sonar_fm\</div>
                             <div className="text-[10px] text-slate-600 font-mono font-medium">📄 Patrón: sonar_YYYYMMDD.csv</div>
                             <div className="text-[10px] text-amber-600 font-bold italic">🕐 Última sync: 13:45 (hace 38 min)</div>
                          </div>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4 text-slate-800">
               <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></span>
                 📄 Paso 2: Procesamiento Archivos Dalet
               </h3>
            </div>
            <div className="flex justify-between items-center bg-indigo-50/80 border border-indigo-200 p-4 rounded-xl mt-8 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                  <span className="text-indigo-800 text-sm italic font-medium">Procesando logs...</span>
               </div>
               <button 
                  onClick={() => handleAbort(1)}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm active:scale-95"
               >
                  🛑 ABORTAR PROCESO
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4 text-slate-800">
               <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-amber-500 rounded-full shadow-sm shadow-amber-200"></span>
                 🔍 Paso 3: "COMPARACIÓN Y DETECCIÓN" - ANÁLISIS DISCREPANCIAS
               </h3>
               <div className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full border border-indigo-100 shadow-sm">
                 🤖 CORTEX-COMPLIANCE ACTIVE
               </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-xs font-black text-[#888780] uppercase tracking-widest">📊 PROGRESO COMPARACIÓN:</span>
                        <span className="text-sm font-black text-indigo-600">89% Completado</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full border border-slate-200 p-1 overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-sm transition-all duration-1000" style={{ width: '89%' }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] text-[#888780] font-black uppercase mb-2">Radio Corazón</div>
                        <div className="text-xl font-black text-emerald-600">189/195 <span className="text-xs text-[#888780] font-bold">(96.9%)</span></div>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] text-[#888780] font-black uppercase mb-2">Play FM</div>
                        <div className="text-xl font-black text-emerald-600">147/152 <span className="text-xs text-[#888780] font-bold">(96.7%)</span></div>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] text-[#888780] font-black uppercase mb-2">Sonar FM</div>
                        <div className="text-xl font-black text-amber-500">89/94 <span className="text-xs text-[#888780] font-bold">(94.7%)</span></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                        🔴 CRÍTICAS (Acción inmediata requerida)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* RED CARD 1 */}
                        <div className="bg-white border border-rose-100 border-l-4 border-l-rose-500 p-5 rounded-r-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h5 className="text-sm font-black text-slate-800">SP123456 - Banco Chile</h5>
                                    <p className="text-[10px] text-[#888780] font-mono mt-1 font-medium">📻 Radio Corazón • 🕐 Programado: 06:15:30</p>
                                </div>
                                <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black rounded-md shadow-sm">NO EMITIDO</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 mb-4">
                                <div><span className="text-[10px] text-[#888780] block uppercase font-black">Valor</span><span className="text-emerald-600 font-black text-xs">$85,000</span></div>
                                <div><span className="text-[10px] text-[#888780] block uppercase font-black">Duración</span><span className="text-slate-700 font-black text-xs">20s</span></div>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                <div className="text-[9px] font-black text-indigo-600 uppercase mb-1">🤖 IA recomienda:</div>
                                <div className="text-[10px] text-indigo-700 font-bold italic">Recuperación automática en bloque 16:45 - 17:00</div>
                            </div>
                        </div>

                        {/* RED CARD 2 */}
                        <div className="bg-white border border-rose-100 border-l-4 border-l-rose-500 p-5 rounded-r-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h5 className="text-sm font-black text-slate-800">SP789012 - Coca Cola</h5>
                                    <p className="text-[10px] text-[#888780] font-mono mt-1 font-medium">📻 Play FM • 🕐 Programado: 08:22:15</p>
                                </div>
                                <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black rounded-md shadow-sm">NO EMITIDO</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 mb-4">
                                <div><span className="text-[10px] text-[#888780] block uppercase font-black">Valor</span><span className="text-emerald-600 font-black text-xs">$120,000</span></div>
                                <div><span className="text-[10px] text-[#888780] block uppercase font-black">Duración</span><span className="text-slate-700 font-black text-xs">30s</span></div>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                <div className="text-[9px] font-black text-indigo-600 uppercase mb-1">🤖 IA recomienda:</div>
                                <div className="text-[10px] text-indigo-700 font-bold italic">Recuperación automática en bloque 19:30 - 20:00</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">🟡 MENORES (Revisión recomendada)</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 italic">
                            <span className="font-medium">• SP345678: Emitido 15 segundos después (timing menor)</span>
                            <span className="text-[#888780] font-mono font-bold bg-white px-1.5 rounded border border-slate-200 shadow-sm">ID_LOG_882</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 italic">
                            <span className="font-medium">• SP901234: Duración real 32s vs programado 30s</span>
                            <span className="text-[#888780] font-mono font-bold bg-white px-1.5 rounded border border-slate-200 shadow-sm">ID_LOG_901</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 flex justify-between items-center shadow-inner">
                    <div>
                        <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-4">📈 ANÁLISIS AUTOMÁTICO COMPLETADO</h4>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-xs">
                            <div className="flex justify-between border-b border-indigo-100 pb-1"><span className="text-slate-600 font-medium">Total discrepancias:</span> <span className="text-slate-800 font-black">23 spots</span></div>
                            <div className="flex justify-between border-b border-indigo-100 pb-1"><span className="text-slate-600 font-medium">Recuperación automática:</span> <span className="text-indigo-600 font-black">20 spots</span></div>
                            <div className="flex justify-between border-b border-indigo-100 pb-1"><span className="text-slate-600 font-medium">Revisión manual:</span> <span className="text-rose-600 font-black">3 spots</span></div>
                            <div className="flex justify-between border-b border-indigo-100 pb-1"><span className="text-slate-600 font-medium">Impacto comercial:</span> <span className="text-emerald-600 font-black">$2.1M</span></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                         <button className="px-6 py-2 bg-white text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all uppercase tracking-widest">👁️ Ver Detalle</button>
                         <button className="px-6 py-2 bg-white text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all uppercase tracking-widest">📊 Analytics</button>
                    </div>
                </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4 text-slate-800">
               <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></span>
                 🤖 Paso 4: Distribución Inteligente Cortex
               </h3>
               <div className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                 IA OPTIMIZATION MODE
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LISTA DE RECUPERACIÓN */}
                <div className="md:col-span-1 space-y-4">
                   <h4 className="text-[10px] font-black text-[#888780] uppercase tracking-widest">Pendientes de Re-Ingesta:</h4>
                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {pendingSpots.length === 0 && (
                          <div className="text-center p-4 text-emerald-700 font-black text-xs uppercase bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
                              ✅ Todos los spots distribuidos
                          </div>
                      )}
                      {pendingSpots.map((i) => (
                        <div
                           key={`spot-${i}`}
                           draggable
                           onDragStart={(e) => handleDragStart(e, i)}
                           className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center group hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing hover:shadow-md shadow-sm"
                        >
                           <div className="space-y-1">
                              <div className="text-xs font-bold text-slate-800 pointer-events-none">Campana Nike #{i}</div>
                              <div className="text-[9px] text-[#888780] font-mono font-medium pointer-events-none">CODE: SP9988{i} • 20s</div>
                           </div>
                           <div className="bg-indigo-50 w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-indigo-100">
                              ✋
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* VISOR DE HUECOS IA */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-inner">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-[80px] -mr-32 -mt-16"></div>
                   <h4 className="text-[10px] font-black text-[#888780] uppercase tracking-widest border-b border-slate-200 pb-2 relative z-10">📊 MAPA DE HUECOS COMERCIALES (RADIO CORAZÓN)</h4>
                   
                   <div className="space-y-4 relative z-10">
                      {['Franja Mañana', 'Franja Tarde', 'Franja Noche'].map((franja, fIdx) => (
                        <div key={fIdx} className="space-y-2">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold text-slate-600 uppercase">{franja}</span>
                              <span className="text-[9px] text-indigo-600 font-black bg-indigo-50 px-2 rounded-sm border border-indigo-100">2 GAPS DETECTADOS</span>
                           </div>
                           <div className="h-10 bg-white rounded-xl border border-slate-200 flex p-1 gap-1 relative overflow-hidden shadow-sm">
                              <div className="h-full bg-slate-100 rounded-lg w-1/4 border border-slate-200"></div>
                              <div className="h-full bg-slate-100 rounded-lg w-1/6 border border-slate-200"></div>
                              <div className="h-full bg-indigo-50 border border-dashed border-indigo-300 rounded-lg w-1/12 animate-pulse flex items-center justify-center text-[10px] text-indigo-600 font-black">GAP</div>
                              <div className="h-full bg-slate-100 rounded-lg w-1/4 border border-slate-200"></div>
                              <div className="h-full bg-indigo-50 border border-dashed border-indigo-300 rounded-lg w-1/8 animate-pulse flex items-center justify-center text-[10px] text-indigo-600 font-black">GAP</div>
                           </div>
                        </div>
                      ))}
                   </div>

                    {/* AI INSIGHT */}
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mt-4 relative z-10 shadow-sm">
                       <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl drop-shadow-sm">💡</span>
                          <span className="text-xs font-black text-indigo-700 uppercase">Cortex Recommendation:</span>
                       </div>
                       <p className="text-[11px] text-indigo-900/80 leading-relaxed italic font-medium">
                         "He encontrado 12 huecos óptimos que respetan el espaciado de marcas (exclusividad). La eficiencia de recuperación proyectada es del <strong>100%</strong> sin saturar bloques prime."
                       </p>
                    </div>
                 </div>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4 text-[#2C2C2A]">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  🤖 Paso 4: "DECISIÓN DE RECUPERACIÓN" - MODO INTELIGENTE
                </h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* SELECTOR DE MODOS */}
                 <div className="space-y-4">
                     <div className="bg-indigo-600/10 border-2 border-indigo-500 rounded-2xl p-4 cursor-pointer hover:bg-indigo-600/20 transition-all group relative">
                         <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-4 border-indigo-500 bg-white"></div>
                         <div className="flex items-center gap-3 mb-2">
                             <span className="text-xl">⚫</span>
                             <h4 className="text-sm font-black text-indigo-100 uppercase tracking-widest">AUTOMÁTICO INTELIGENTE</h4>
                         </div>
                         <p className="text-[11px] text-[#888780] pl-8">🤖 IA redistribuye optimalmente sin intervención manual. Proceso inmediato ⚡</p>
                     </div>

                     <div className="bg-[#F0EDE8] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-all opacity-60">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="text-xl">⚪</span>
                             <h4 className="text-sm font-black text-[#5F5E5A] uppercase tracking-widest">SEMI-AUTOMÁTICO</h4>
                         </div>
                         <p className="text-[11px] text-[#888780] pl-8">🤖 IA sugiere + 👤 Usuario aprueba cada bloque. Revisión manual previa.</p>
                     </div>

                     <div className="bg-[#F0EDE8] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-all opacity-60">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="text-xl">⚪</span>
                             <h4 className="text-sm font-black text-[#5F5E5A] uppercase tracking-widest">MANUAL COMPLETO</h4>
                         </div>
                         <p className="text-[11px] text-[#888780] pl-8">👤 Control total del proceso. Usuario programa cada spot manualmente.</p>
                     </div>
                 </div>

                 {/* CONFIGURACIÓN AUTOMÁTICO */}
                 <div className="bg-[#F0EDE8]/50 border border-white/5 rounded-2xl p-6 space-y-4">
                     <h4 className="text-[10px] font-black text-[#888780] uppercase tracking-widest border-b border-white/5 pb-2">🎯 CONFIGURACIÓN AUTOMÁTICO</h4>
                     
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                             <label className="text-[10px] text-[#888780] uppercase font-black">Distribución</label>
                             <select className="w-full bg-[#F0EDE8] border border-[#D4D1CC] rounded-lg px-3 py-2 text-xs text-[#2C2C2A] outline-none focus:border-indigo-500"><option>Repartido</option><option>Prime Only</option></select>
                         </div>
                         <div className="space-y-1">
                             <label className="text-[10px] text-[#888780] uppercase font-black">Espaciado Mín</label>
                             <select className="w-full bg-[#F0EDE8] border border-[#D4D1CC] rounded-lg px-3 py-2 text-xs text-[#2C2C2A] outline-none focus:border-indigo-500"><option>15 minutos</option><option>30 minutos</option></select>
                         </div>
                         <div className="space-y-1">
                             <label className="text-[10px] text-[#888780] uppercase font-black">Horario Inicio</label>
                             <input type="time" defaultValue="16:00" aria-label="Horario Inicio" className="w-full bg-[#F0EDE8] border border-[#D4D1CC] rounded-lg px-3 py-2 text-xs text-[#2C2C2A] outline-none focus:border-indigo-500" />
                         </div>
                         <div className="space-y-1">
                             <label className="text-[10px] text-[#888780] uppercase font-black">Horario Fin</label>
                             <input type="time" defaultValue="22:00" aria-label="Horario Fin" className="w-full bg-[#F0EDE8] border border-[#D4D1CC] rounded-lg px-3 py-2 text-xs text-[#2C2C2A] outline-none focus:border-indigo-500" />
                         </div>
                     </div>

                     <div className="pt-4 space-y-3">
                         <h5 className="text-[10px] font-black text-[#888780] uppercase tracking-widest">🔔 NOTIFICACIONES</h5>
                         <div className="space-y-2">
                             <label className="flex items-center gap-3 text-xs text-[#888780] group cursor-pointer"><div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center text-[10px] text-[#2C2C2A]">✓</div> Email ejecutivos responsables</label>
                             <label className="flex items-center gap-3 text-xs text-[#888780] group cursor-pointer"><div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center text-[10px] text-[#2C2C2A]">✓</div> Slack canal #traffic</label>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4 text-slate-800">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></span>
                  🤖 Paso 5: "RECUPERACIÓN AUTOMÁTICA" - IA EN ACCIÓN
                </h3>
             </div>

             <div className="space-y-6">
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-3">
                             <span className="text-2xl animate-spin-slow drop-shadow-sm">⚙️</span>
                             <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Cortex-Scheduling procesando...</span>
                         </div>
                         <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">96% Completado</span>
                     </div>
                     <div className="w-full h-4 bg-slate-100 rounded-full border border-slate-200 p-1 mb-6 shadow-inner">
                         <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full shadow-sm" style={{ width: '96%' }}></div>
                     </div>
                     <div className="flex justify-end mb-6">
                        <button 
                           onClick={() => handleAbort(4)}
                           className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm active:scale-95"
                        >
                           🛑 ABORTAR Y RECONFIGURAR
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                             <h5 className="text-[10px] font-black text-[#888780] uppercase tracking-widest border-b border-slate-200 pb-1">📻 RADIO CORAZÓN - Recuperando 6 spots</h5>
                             <div className="space-y-2">
                                 <div className="bg-white p-3 rounded-xl border border-emerald-200 flex justify-between items-center shadow-sm">
                                     <div className="text-[11px]">
                                         <div className="font-black text-slate-800">✅ SP123456 - Banco Chile</div>
                                         <div className="text-[#888780] font-mono mt-1 font-medium">Nuevo horario: 16:45:30 (Repartido)</div>
                                     </div>
                                     <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-black shadow-sm">PROGRAMADO</span>
                                 </div>
                             </div>
                         </div>

                         <div className="space-y-3">
                             <h5 className="text-[10px] font-black text-[#888780] uppercase tracking-widest border-b border-slate-200 pb-1">⚠️ CASOS REQUIEREN ATENCIÓN MANUAL</h5>
                             <div className="space-y-2">
                                 <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 flex justify-between items-center shadow-sm">
                                     <div className="text-[11px]">
                                         <div className="font-black text-rose-600">🔴 SP901234 - Toyota</div>
                                         <div className="text-slate-600 mt-1 italic font-medium">Exclusividad automotriz saturada</div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 flex justify-around items-center shadow-inner">
                     <div className="text-center">
                         <div className="text-[10px] text-[#888780] font-black uppercase mb-1">Recuperados</div>
                         <div className="text-3xl font-black text-emerald-600">20/23</div>
                     </div>
                     <div className="w-px h-12 bg-slate-200"></div>
                     <div className="text-center">
                         <div className="text-[10px] text-[#888780] font-black uppercase mb-1">Valor Recuperado</div>
                         <div className="text-3xl font-black text-emerald-600">$1.8M</div>
                     </div>
                 </div>
             </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/50 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="text-5xl mb-4 drop-shadow-sm">✅</div>
                <h3 className="text-2xl font-black text-emerald-800 uppercase tracking-tighter relative z-10">CONCILIACIÓN COMPLETADA EXITOSAMENTE</h3>
                <p className="text-emerald-700 font-mono text-sm underline underline-offset-4 decoration-emerald-300 relative z-10 font-bold">Proceso finalizado: 20/08/2025 15:47</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-xs font-black text-[#888780] uppercase tracking-widest border-b border-slate-200 pb-2">📊 RESUMEN EJECUTIVO</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-600 font-medium">• Total spots verificados:</span> <span className="text-slate-800 font-black">441</span></div>
                        <div className="flex justify-between"><span className="text-slate-600 font-medium">• Spots emitidos correctly:</span> <span className="text-emerald-600 font-bold">418</span></div>
                        <div className="flex justify-between"><span className="text-slate-600 font-medium">• Spots no emitidos:</span> <span className="text-rose-600 font-bold">23</span></div>
                        <div className="flex justify-between pl-4 text-[#888780]"><span className="italic">└ Recuperados:</span> <span className="text-indigo-600 font-bold">20</span></div>
                        <div className="flex justify-between pl-4 text-[#888780]"><span className="italic">└ Pendientes manual:</span> <span className="text-amber-600 font-bold">3</span></div>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-[10px] font-black text-[#888780] uppercase tracking-widest">Cumplimiento Final</span>
                            <span className="text-3xl font-black text-emerald-600 bg-emerald-50 px-2 rounded-lg border border-emerald-100 shadow-sm">99.3%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-xs font-black text-[#888780] uppercase tracking-widest border-b border-slate-200 pb-2">💰 IMPACTO COMERCIAL</h4>
                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between"><span className="text-slate-600 font-medium">Valor total verificado:</span> <span className="text-slate-800 font-black">$12.8M</span></div>
                        <div className="flex justify-between"><span className="text-slate-600 font-medium">Valor recuperado:</span> <span className="text-emerald-600 font-black text-lg bg-emerald-50 px-1 border border-emerald-100 rounded shadow-sm">$1.8M</span></div>
                        <div className="flex justify-between"><span className="text-slate-600 font-medium">Pendiente recuperación:</span> <span className="text-rose-600 font-bold">$300K</span></div>
                        <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-inner">
                            <div className="text-[9px] font-black text-[#888780] uppercase mb-2">📧 NOTIFICACIONES ENVIADAS</div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="text-emerald-700 font-bold flex items-center gap-1"><span>✅</span> Ejecutivos (8)</div>
                                <div className="text-emerald-700 font-bold flex items-center gap-1"><span>✅</span> Slack #traffic</div>
                                <div className="text-emerald-700 font-bold flex items-center gap-1"><span>✅</span> Controller Fin.</div>
                                <div className="text-emerald-700 font-bold flex items-center gap-1"><span>✅</span> Gerencia Ops.</div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                <div className="space-y-1">
                    <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest">📋 AUDITORÍA CREADA</h4>
                    <p className="text-[10px] text-slate-600 font-medium">ID Proceso: <span className="text-slate-700 font-mono font-bold bg-white px-1.5 rounded shadow-sm border border-slate-200">CONC-20250820-001</span></p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center px-4 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default"><div className="text-[8px] text-[#888780] font-black tracking-widest uppercase">BACKUP</div><div className="text-[10px] text-emerald-600 font-bold">✅ OK</div></div>
                    <div className="text-center px-4 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default"><div className="text-[8px] text-[#888780] font-black tracking-widest uppercase">LOGS</div><div className="text-[10px] text-emerald-600 font-bold">✅ OK</div></div>
                    <div className="text-center px-4 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default"><div className="text-[8px] text-[#888780] font-black tracking-widest uppercase">TRAZA</div><div className="text-[10px] text-emerald-600 font-bold">✅ OK</div></div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* FOOTER WIZARD */}
      <div className="bg-slate-50/80 p-6 flex justify-between items-center border-t border-slate-200 backdrop-blur-sm">
        <button 
          onClick={step === 1 ? onCancel : () => setStep(step - 1)}
          className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors text-sm font-bold uppercase tracking-widest shadow-sm active:scale-95"
        >
          {step === 1 ? '❌ Cancelar' : step === 6 ? '← Volver al Resumen' : '← Atrás'}
        </button>
        
        {step < 5 ? (
            <div className="flex gap-4">
               {step === 1 && <button className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-xs font-bold shadow-sm active:scale-95">⚙️ CONFIG RUTAS</button>}
               <button 
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-[#2C2C2A] shadow-md shadow-indigo-200 transition-all text-sm font-black tracking-widest uppercase hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
               >
                  {step === 2 ? '🚀 INICIAR COMPARACIÓN →' : step === 3 ? '🤖 SELECCIONAR MODO →' : step === 4 ? '🚀 EJECUTAR RECUPERACIÓN' : 'SIGUIENTE PASO →'}
               </button>
            </div>
        ) : step === 5 ? (
            <button 
                onClick={() => setStep(6)}
                className="px-12 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-[#2C2C2A] shadow-lg shadow-emerald-200 transition-all flex items-center gap-3 font-black tracking-[0.2em] uppercase text-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
                🏁 FINALIZAR Y AUDITAR
            </button>
        ) : (
            <div className="flex gap-4">
                <button className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-colors active:scale-95">👁️ Ver Reporte</button>
                <button className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-colors active:scale-95">📧 Enviar</button>
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl bg-white text-indigo-600 text-xs font-black uppercase tracking-widest shadow-sm border border-indigo-200 hover:bg-indigo-50 transition-colors active:scale-95">🔄 Nueva</button>
                <button onClick={onCancel} className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[#2C2C2A] text-xs font-black uppercase tracking-widest shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95">🏠 Dashboard</button>
            </div>
        )}
      </div>
    </div>
  );
}
