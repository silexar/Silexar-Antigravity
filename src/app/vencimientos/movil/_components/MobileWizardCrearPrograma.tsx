'use client'

import { useState } from 'react';

export default function MobileWizardCrearPrograma() {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({ 
    emisora: 'SONAR FM', nombre: 'Mesa Central Matinal', desde: '07:00', hasta: '09:30',
    dias: ['L', 'M', 'X', 'J', 'V'], desc: '',
    cond1: 'María González', cond2: 'Roberto Silva', prod: 'Ana López'
  });

  const toggleDia = (d: string) => {
    setFormData(prev => ({ ...prev, dias: prev.dias.includes(d) ? prev.dias.filter(x => x !== d) : [...prev.dias, d] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
         <div className="flex-1 h-1.5 relative rounded-full bg-white/80 overflow-hidden border border-gray-200/50">
            <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all ${paso === 1 ? 'w-1/5' : paso === 2 ? 'w-2/5' : paso === 3 ? 'w-3/5' : paso === 4 ? 'w-4/5' : 'w-full'}`}></div>
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">P. {paso}/5</span>
      </div>

      {paso === 1 && (
      <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] blur-2xl pointer-events-none"></div>

         <h2 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-wide mb-4 relative z-10">
            <span>📻</span> PASO 1: INFO BÁSICA
         </h2>

         <div className="space-y-5 relative z-10">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-[9px] text-gray-500 font-black uppercase mb-1">📻 Emisora</label>
                  <select 
                     className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-slate-200 outline-none"
                     value={formData.emisora} onChange={e => setFormData({...formData, emisora: e.target.value})}
                  >
                     <option value="SONAR FM">SONAR FM</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[9px] text-gray-500 font-black uppercase mb-1">📺 Programa</label>
                  <input
                     type="text"
                     aria-label="Nombre del Programa"
                     className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-slate-200 outline-none"
                     value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                  />
               </div>
            </div>

            {/* Configuración Horaria */}
            <div>
               <h3 className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-2">⏰ HORARIO</h3>
               <div className="bg-white/70 border border-gray-200/50 p-3 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                     <div className="flex-1">
                        <label className="block text-[8px] text-gray-500 font-black uppercase mb-1">Desde</label>
                        <input type="time" aria-label="Hora desde" className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-800 outline-none" value={formData.desde} onChange={e => setFormData({...formData, desde: e.target.value})} />
                     </div>
                     <div className="flex-1">
                        <label className="block text-[8px] text-gray-500 font-black uppercase mb-1">Hasta</label>
                        <input type="time" aria-label="Hora hasta" className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-800 outline-none" value={formData.hasta} onChange={e => setFormData({...formData, hasta: e.target.value})} />
                     </div>
                  </div>
                  <div>
                     <label className="block text-[8px] text-gray-500 font-black uppercase mb-2">Días</label>
                     <div className="flex justify-between gap-1">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                           <button 
                              key={d} onClick={() => toggleDia(d)}
                              className={`w-8 h-8 rounded shrink-0 font-black text-[10px] transition-all ${formData.dias.includes(d) ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-[#ECEFF8] border border-gray-200 text-gray-500'}`}
                           >{d === 'X' ? 'M' : d}</button>
                        ))}
                     </div>
                  </div>

                  {/* Panel Cortex Detecta */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mt-2">
                     <h4 className="text-[9px] flex items-center gap-1 font-black uppercase text-indigo-600 mb-2">
                        <span>🤖</span> Cortex: <span className="text-gray-800">PRIME AM</span>
                     </h4>
                     <ul className="space-y-1 text-[9px] font-medium text-gray-600">
                        <li>• Rating prom. sector: 8.5 pts</li>
                        <li className="text-amber-600 font-bold mt-1.5 text-xs">💰 Sugerido: $3.2M/mes</li>
                     </ul>
                  </div>
               </div>
            </div>

            {/* Equipo Breve */}
            <div>
               <h3 className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-2">👥 PRINCIPAL</h3>
               <input type="text" aria-label="Conductor Principal" className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 outline-none" value={formData.cond1} onChange={e => setFormData({...formData, cond1: e.target.value})} />
            </div>

         </div>
      </div>
      )}

      {/* ==================================== */}
      {/* PASO 2: CUPOS (MOBILE)               */}
      {/* ==================================== */}
      {paso === 2 && (
      <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden animate-in fade-in slide-in-from-right-4">
         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] blur-2xl pointer-events-none"></div>

         <div className="flex justify-between items-start mb-4 relative z-10">
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-wide">
               <span>🎯</span> PASO 2: CUPOS
            </h2>
            <div className="text-right">
               <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Revenue Potencial</p>
               <p className="text-sm font-black text-gray-800">$48.4M</p>
            </div>
         </div>

         <div className="space-y-4 relative z-10 mx-auto max-w-full overflow-x-hidden">
            <div className="bg-[#ECEFF8]/40 border border-amber-500/20 rounded-xl p-4">
               <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>🏆 TIPO A (Completo)</span><span className="bg-amber-50 px-1.5 py-0.5 rounded text-[9px]">8 Max</span>
               </h3>
               <div className="grid grid-cols-2 gap-2 mb-3">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-amber-500 w-3 h-3" /><span className="text-[10px] text-gray-600">Apertura</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-amber-500 w-3 h-3" /><span className="text-[10px] text-gray-600">Cierre</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-amber-500 w-3 h-3" /><span className="text-[10px] text-gray-600">Mención</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-amber-500 w-3 h-3" /><span className="text-[10px] text-gray-600">Com. 30"</span></label>
               </div>
               <div className="border-t border-gray-200/50 pt-3 flex justify-between items-center">
                  <p className="text-[9px] text-gray-500 font-black uppercase">Valor: <span className="text-gray-800 text-sm">$4.5M</span></p>
                  <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-1 py-0.5 rounded uppercase font-bold">💡 IA Sugiere</span>
               </div>
            </div>

            <div className="bg-[#ECEFF8]/40 border border-slate-500/30 rounded-xl p-4">
               <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>🥈 TIPO B (Medio)</span><span className="bg-slate-500/20 px-1.5 py-0.5 rounded text-[9px]">4 Max</span>
               </h3>
               <div className="grid grid-cols-2 gap-2 mb-3">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-[10px] text-gray-600">Mención x progr.</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-[10px] text-gray-600">Com. 20"</span></label>
               </div>
               <div className="border-t border-gray-200/50 pt-3 flex justify-between items-center">
                  <p className="text-[9px] text-gray-500 font-black uppercase">Valor: <span className="text-gray-800 text-sm">$2.2M</span></p>
                  <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-1 py-0.5 rounded uppercase font-bold">💡 IA Sugiere</span>
               </div>
            </div>
         </div>

         <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
            <h4 className="flex items-center gap-1 text-[10px] text-indigo-600 font-black tracking-widest uppercase mb-2">
               <span>🤖</span> CORTEX MIX
            </h4>
            <div className="grid grid-cols-2 gap-2">
               <p className="text-[9px] text-emerald-600 font-bold bg-emerald-50 p-1.5 rounded">✅ Precio en Rango</p>
               <p className="text-[9px] text-gray-800 font-bold bg-white/70 p-1.5 rounded">Mix: 60% A / 40% B</p>
            </div>
         </div>
      </div>
      )}

      {/* ==================================== */}
      {/* PASO 3: EXCLUSIVIDADES (MOBILE)      */}
      {/* ==================================== */}
      {paso === 3 && (
      <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden animate-in fade-in slide-in-from-right-4">
         <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] blur-2xl pointer-events-none"></div>

         <h2 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-wide mb-4 relative z-10">
            <span>🚫</span> PASO 3: EXCLUSIVIDADES
         </h2>

         <div className="space-y-4 relative z-10">
            <div>
               <h3 className="text-[9px] text-red-600 font-black uppercase tracking-widest mb-2">🏢 POR RUBRO</h3>
               <div className="space-y-2">
                  {[
                     { r: 'BANCA/FINANZAS', stat: '1 cliente max', req: true },
                     { r: 'TELECOM', stat: '1 cliente max', req: true },
                     { r: 'AUTOMOTRIZ', stat: 'Máx 2 (no directa)', req: true },
                  ].map((x, i) => (
                     <div key={`${x}-${i}`} className={`p-2.5 rounded-lg flex items-center gap-3 border ${x.req ? 'bg-red-500/5 border-red-500/20' : 'bg-white/70 border-gray-200'}`}>
                        <input type="checkbox" defaultChecked={x.req} className="w-3.5 h-3.5 accent-red-500" />
                        <div>
                           <p className="text-[10px] font-black text-gray-800 uppercase">{x.r}</p>
                           <p className="text-[9px] text-gray-500">{x.stat}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
               <h3 className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mb-2">🤖 DETECCIÓN ACTIVA</h3>
               <p className="text-[9px] text-gray-600 leading-tight mb-2">Cortex monitoreará y bloqueará automáticamente superposición de marcas y riesgos de Brand Safety.</p>
               <button className="w-full bg-white/70 border border-emerald-500/30 text-[9px] uppercase font-bold text-emerald-600 py-2 rounded-lg bg-emerald-500/5">✅ Prevención Misma Tanda ACTIVA</button>
            </div>
         </div>
      </div>
      )}

      {/* ==================================== */}
      {/* PASO 4: TARIFARIO (MOBILE)           */}
      {/* ==================================== */}
      {paso === 4 && (
      <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden animate-in fade-in slide-in-from-right-4">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] blur-2xl pointer-events-none"></div>

         <div className="flex justify-between items-start mb-4 relative z-10">
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-wide">
               <span>💰</span> PASO 4: TARIFARIO DINÁMICO
            </h2>
         </div>

         <div className="space-y-4 relative z-10">
            <div>
               <h3 className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-2">🎯 MOTORES DE FLUCTUACIÓN</h3>
               <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 p-2 rounded-lg flex flex-col justify-between">
                     <p className="text-[9px] font-bold text-gray-800 uppercase">Rating &gt; 10 pts</p>
                     <p className="text-xs text-emerald-600 font-black mt-1">+15%</p>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 p-2 rounded-lg flex flex-col justify-between">
                     <p className="text-[9px] font-bold text-gray-800 uppercase">Ocupación &gt; 90%</p>
                     <p className="text-xs text-emerald-600 font-black mt-1">+20%</p>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 p-2 rounded-lg flex flex-col justify-between">
                     <p className="text-[9px] font-bold text-gray-800 uppercase">Temp. Alta</p>
                     <p className="text-xs text-emerald-600 font-black mt-1">+25%</p>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 p-2 rounded-lg flex flex-col justify-between">
                     <p className="text-[9px] font-bold text-gray-800 uppercase">Renov. Temprana</p>
                     <p className="text-xs text-amber-600 font-black mt-1">-10%</p>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
               <h3 className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mb-2">💡 SUGERENCIA CORTEX</h3>
               <p className="text-[10px] text-gray-600 italic border-l-2 border-amber-500/50 pl-2">"Mantener pre-bases actuales. Crear paquetes Early Bird al 20% para forzar catch rate agresivo en Marzo."</p>
            </div>
         </div>
      </div>
      )}

      {/* ==================================== */}
      {/* PASO 5: ACTIVACIÓN FINAL (MOBILE)   */}
      {/* ==================================== */}
      {paso === 5 && (
      <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden animate-in fade-in slide-in-from-right-4">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] blur-2xl pointer-events-none"></div>

         <div className="flex justify-between items-start mb-4 relative z-10">
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-wide">
               <span>✅</span> PASO 5: ACTIVACIÓN
            </h2>
         </div>

         <div className="space-y-4 relative z-10">
            <div className="bg-[#ECEFF8]/40 border border-emerald-500/20 rounded-xl p-4">
               <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-3">✅ CHECKLIST CORTEX</p>
               <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
                  <p>🟢 Horario Libre</p>
                  <p>🟢 Capacidad OK</p>
                  <p>🟢 Precio Ajustado</p>
                  <p>🟢 Reglas Exclus.</p>
               </div>
            </div>

            <div className="bg-[#ECEFF8]/40 border border-amber-500/20 rounded-xl p-4">
               <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-3">🎯 METAS (EQUIPO)</p>
               <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                     <span className="text-gray-800 font-bold">A. García <span className="text-gray-500 block font-normal">(Banca/Telco)</span></span>
                     <span className="text-amber-600 font-black">$30M (6)</span>
                  </div>
                  <div className="flex justify-between pt-1">
                     <span className="text-gray-800 font-bold">C. Mendoza <span className="text-gray-500 block font-normal">(Retail/Auto)</span></span>
                     <span className="text-amber-600 font-black">$15M (6)</span>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
               <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mb-2">🚀 HITO DE INICIO</p>
               <div className="flex justify-between text-[10px]">
                  <div>
                     <span className="text-gray-500 block mb-0.5">Ventas</span>
                     <span className="text-gray-800 font-bold">1 Ene 2025</span>
                  </div>
                  <div className="text-right">
                     <span className="text-gray-500 block mb-0.5">Emisión</span>
                     <span className="text-gray-800 font-bold">1 Feb 2025</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
      )}

      {/* Acciones de Navegación */}
      <div className="flex gap-2 justify-between mt-6 border-t border-gray-200/50 pt-4">
         <button 
           onClick={() => paso > 1 ? setPaso(paso - 1) : null}
           className={`flex-1 bg-slate-800 text-gray-600 border border-gray-200 py-3 rounded-xl font-bold uppercase text-[9px] ${paso === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
         >
           Atrás
         </button>
         
         {paso < 5 ? (
            <button 
               onClick={() => setPaso(paso + 1)} 
               className="flex-[2] bg-emerald-500 text-slate-900 border border-emerald-400 py-3 rounded-xl font-bold uppercase text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
               Siguiente
            </button>
         ) : (
            <button 
               className="flex-[2] bg-amber-500 text-slate-900 border border-amber-500 py-3 rounded-xl font-black uppercase text-[9px] shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
            >
               Activar Prog.
            </button>
         )}
      </div>
    </div>
  )
}
