'use client'

import { useState } from 'react';

export default function WizardCrearPrograma() {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({ 
    emisora: 'SONAR FM', nombre: 'Mesa Central Matinal', desde: '07:00', hasta: '09:30',
    dias: ['L', 'M', 'X', 'J', 'V'], desc: 'Programa matinal de análisis político y actualidad dirigido a profesionales de 30-55 años, NSE ABC1.',
    cond1: 'María González', cond2: 'Roberto Silva', prod: 'Ana López'
  });

  const toggleDia = (d: string) => {
    setFormData(prev => ({ ...prev, dias: prev.dias.includes(d) ? prev.dias.filter(x => x !== d) : [...prev.dias, d] }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
         <div className="flex-1 h-2 relative rounded-full bg-white/80 overflow-hidden border border-gray-200/50">
            <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all ${paso === 1 ? 'w-1/5' : paso === 2 ? 'w-2/5' : paso === 3 ? 'w-3/5' : paso === 4 ? 'w-4/5' : 'w-full'}`}></div>
         </div>
         <span className="text-xs font-black uppercase tracking-widest text-emerald-600">PASO {paso}/5</span>
      </div>

      {paso === 1 && (
      <div className="rounded-3xl border border-gray-200 p-8 bg-white/70 backdrop-blur-md shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-bl-[100px] blur-3xl pointer-events-none"></div>

         <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 tracking-wide mb-8">
            <span className="text-2xl">📻</span> PASO 1: CONFIGURACIÓN BÁSICA DEL PROGRAMA
         </h2>

         <div className="space-y-8 relative z-10">
            {/* Información Fundamental */}
            <div>
               <h3 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">🎯 INFORMACIÓN FUNDAMENTAL</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5">📻 Emisora</label>
                     <select 
                        className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500/50 outline-none transition-all"
                        value={formData.emisora} onChange={e => setFormData({...formData, emisora: e.target.value})}
                     >
                        <option value="SONAR FM">SONAR FM</option>
                        <option value="Radio 103.3 FM">Radio 103.3 FM</option>
                        <option value="T13 Radio">T13 Radio</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5">📺 Nombre del Programa</label>
                     <input
                        type="text"
                        aria-label="Nombre del Programa"
                        className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500/50 outline-none transition-all placeholder-slate-600 font-medium"
                        value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                     />
                  </div>
               </div>
            </div>

            {/* Configuración Horaria */}
            <div>
               <h3 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">⏰ CONFIGURACIÓN HORARIA</h3>
               <div className="bg-[#ECEFF8]/30 border border-gray-200/50 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-5">
                     <div className="flex items-center gap-4">
                        <div className="flex-1">
                           <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Desde</label>
                           <input type="time" aria-label="Hora de inicio" className="w-full bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 font-medium outline-none focus:border-amber-500" value={formData.desde} onChange={e => setFormData({...formData, desde: e.target.value})} />
                        </div>
                        <div className="flex-1">
                           <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Hasta</label>
                           <input type="time" aria-label="Hora de fin" className="w-full bg-white/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 font-medium outline-none focus:border-amber-500" value={formData.hasta} onChange={e => setFormData({...formData, hasta: e.target.value})} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Días de Emisión</label>
                        <div className="flex gap-2">
                           {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                              <button 
                                 key={d} onClick={() => toggleDia(d)}
                                 className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${formData.dias.includes(d) ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/80 border border-gray-200 text-gray-500 hover:border-white/30'}`}
                              >{d === 'X' ? 'M' : d}</button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Panel Cortex Detecta */}
                  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-4 relative overflow-hidden group">
                     <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-50 blur-2xl rounded-full"></div>
                     <h4 className="text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest text-indigo-600 mb-3">
                        <span className="text-sm">🤖</span> Cortex Detecta: <span className="text-gray-800">HORARIO PRIME AM</span>
                     </h4>
                     <ul className="space-y-2 text-xs font-medium text-gray-600">
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Audiencia estimada: 45,000 oyentes</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Rating prom. sector: 8.5 pts</li>
                        <li className="flex items-center gap-2 text-amber-600 font-bold mt-3"><span className="text-lg">💰</span> Valor sugerido: $3,200,000/mes</li>
                     </ul>
                  </div>

               </div>
            </div>

            {/* Descripción */}
            <div>
               <h3 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2">🎭 DESCRIPCIÓN DEL PROGRAMA</h3>
               <textarea 
                  className="w-full bg-[#ECEFF8]/30 border border-gray-200/50 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed outline-none focus:border-amber-500/50 resize-none h-24"
                  value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}
               ></textarea>
            </div>

            {/* Equipo */}
            <div>
               <h3 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">👥 CONDUCTORES/EQUIPO</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-3 flexItems-center justify-between">
                     <div className="w-full">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">C. Principal</p>
                        <input type="text" aria-label="Conductor Principal" className="bg-transparent text-sm text-gray-800 font-medium outline-none w-full" value={formData.cond1} onChange={e => setFormData({...formData, cond1: e.target.value})} />
                     </div>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-3 flexItems-center justify-between">
                     <div className="w-full">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Co-conduc.</p>
                        <input type="text" aria-label="Co-conductor" className="bg-transparent text-sm text-gray-800 font-medium outline-none w-full" value={formData.cond2} onChange={e => setFormData({...formData, cond2: e.target.value})} />
                     </div>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-3 flexItems-center justify-between">
                     <div className="w-full">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Productor</p>
                        <input type="text" aria-label="Productor" className="bg-transparent text-sm text-gray-800 font-medium outline-none w-full" value={formData.prod} onChange={e => setFormData({...formData, prod: e.target.value})} />
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* PASO 2: CUPOS COMERCIALES */}
      {/* ========================================================= */}
      {paso === 2 && (
      <div className="rounded-3xl border border-gray-200 p-8 bg-white/70 backdrop-blur-md shadow-2xl relative overflow-hidden group animate-in slide-in-from-right-4 fade-in">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-bl-[100px] blur-3xl pointer-events-none"></div>

         <div className="flex justify-between items-start mb-8 relative z-10">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 tracking-wide">
               <span className="text-2xl">🎯</span> PASO 2: CONFIGURACIÓN DE CUPOS COMERCIALES
            </h2>
            <div className="text-right">
               <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Total Potencial</p>
               <p className="text-xl font-black text-gray-800">$48,400,000<span className="text-[10px] text-gray-500">/mes</span></p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* TIPO A */}
            <div className="bg-[#ECEFF8]/40 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl transition-all group-hover:bg-amber-50"></div>
               <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 flex justify-between items-center">
                  <span>🏆 TIPO A (Completo)</span> 
                  <span className="bg-amber-50 px-2 py-0.5 rounded text-[10px]">8 Max</span>
               </h3>
               <div className="space-y-3 mb-6">
                  {['Pres. Apertura', 'Mención x bloque', 'Cierre programa', 'Comercial 30"', 'Redes Sociales'].map(d => (
                     <label key={d} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-3 h-3 accent-amber-500" />
                        <span className="text-xs text-gray-600 font-medium">{d}</span>
                     </label>
                  ))}
               </div>
               <div className="border-t border-gray-200/50 pt-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Valor Unitario</p>
                  <div className="flex items-center gap-2">
                     <span className="text-lg font-black text-gray-800">$4.5M</span>
                     <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase font-bold">💡 IA Sugerido</span>
                  </div>
               </div>
            </div>

            {/* TIPO B */}
            <div className="bg-[#ECEFF8]/40 border border-slate-500/30 rounded-2xl p-5 relative overflow-hidden group">
               <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-4 flex justify-between items-center">
                  <span>🥈 TIPO B (Medio)</span> 
                  <span className="bg-slate-500/20 px-2 py-0.5 rounded text-[10px]">4 Max</span>
               </h3>
               <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-xs text-gray-600">Mención x programa</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-xs text-gray-600">Comercial 20"</span></label>
               </div>
               <div className="border-t border-gray-200/50 pt-4 md:mt-[88px]">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Valor Unitario</p>
                  <div className="flex items-center gap-2">
                     <span className="text-lg font-black text-gray-800">$2.2M</span>
                     <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase font-bold">💡 IA Sugerido</span>
                  </div>
               </div>
            </div>

            {/* MENCIONES */}
            <div className="bg-[#ECEFF8]/40 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden group">
               <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4 flex justify-between items-center">
                  <span>🎙️ MENCIONES</span> 
                  <span className="bg-emerald-50 px-2 py-0.5 rounded text-[10px]">20 Max</span>
               </h3>
               <ul className="space-y-2 text-xs text-gray-500 mb-6 font-medium">
                  <li>• Duración: 15 seg.</li>
                  <li>• Máx 2 por cliente</li>
                  <li>• Distribución equitativa</li>
               </ul>
               <div className="border-t border-gray-200/50 pt-4 md:mt-[100px]">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Valor Unitario</p>
                  <div className="flex items-center gap-2">
                     <span className="text-lg font-black text-gray-800">$180K</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Análisis Cortex Inferior */}
         <div className="mt-8 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex gap-8 items-center">
            <h4 className="flex flex-col text-indigo-600 font-black tracking-widest uppercase">
               <span className="text-2xl mb-1">🤖</span> CORTEX
            </h4>
            <div className="grid grid-cols-3 gap-8 w-full">
               <div>
                  <p className="text-[9px] text-indigo-600/60 uppercase font-black mb-1">Pricing Mercado</p>
                  <p className="text-xs text-emerald-600 font-bold">✅ Dentro del rango</p>
               </div>
               <div>
                  <p className="text-[9px] text-indigo-600/60 uppercase font-black mb-1">Capacidad / Audiencia</p>
                  <p className="text-xs text-emerald-600 font-bold">✅ Balanceado</p>
               </div>
               <div>
                  <p className="text-[9px] text-indigo-600/60 uppercase font-black mb-1">Mix Comercial Rec.</p>
                  <p className="text-xs text-gray-800 font-bold">60% Tipo A / 40% Tipo B</p>
               </div>
            </div>
         </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* PASO 3: EXCLUSIVIDADES */}
      {/* ========================================================= */}
      {paso === 3 && (
      <div className="rounded-3xl border border-gray-200 p-8 bg-white/70 backdrop-blur-md shadow-2xl relative overflow-hidden group animate-in slide-in-from-right-4 fade-in">
         <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-bl-[100px] blur-3xl pointer-events-none"></div>

         <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 tracking-wide mb-8 relative z-10">
            <span className="text-2xl">🚫</span> PASO 3: EXCLUSIVIDADES Y PREVENCIÓN DE CONFLICTOS
         </h2>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {/* Panel Izquierdo: Rubros */}
            <div>
               <h3 className="text-[10px] text-red-600 font-black uppercase tracking-widest mb-4">🏢 EXCLUSIVIDADES POR RUBRO</h3>
               <div className="space-y-4">
                  {[
                     { r: 'BANCA Y FINANZAS', stat: '1 cliente max', req: true },
                     { r: 'TELECOMUNICACIONES', stat: '1 cliente max', req: true },
                     { r: 'AUTOMOTRIZ', stat: 'Máx 2 (no directa)', req: true },
                     { r: 'RETAIL/SUPERMERCADOS', stat: 'Multicliente', req: false },
                     { r: 'BEBIDAS ALCOHÓLICAS', stat: '1 por cat.', req: true }
                  ].map((x, i) => (
                     <div key={`${x}-${i}`} className={`p-4 border rounded-xl flex items-center gap-4 transition-all ${x.req ? 'bg-red-500/5 border-red-500/20' : 'bg-white/70 border-gray-200'}`}>
                        <input type="checkbox" defaultChecked={x.req} className="w-4 h-4 accent-red-500 cursor-pointer" />
                        <div>
                           <p className="text-xs font-black text-gray-800 uppercase tracking-wider">{x.r}</p>
                           <p className="text-[10px] text-gray-500 mt-0.5">{x.stat}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Panel Derecho: Detcción Automática */}
            <div className="space-y-6">
               <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>
                  <h3 className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-4 flex gap-2"><span className="text-sm">🤖</span> DETECCIÓN ACTIVA CORTEX</h3>
                  <ul className="space-y-2 text-xs font-medium text-slate-200 mb-6">
                     <li>✅ Competencia directa vigilada</li>
                     <li>✅ Brand Safety garantizado</li>
                     <li>✅ Alertas ante superposición</li>
                  </ul>
                  <div className="bg-red-50 border border-red-500/20 rounded-xl p-4">
                     <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mb-2">🚨 Acción Auto Bloqueo</p>
                     <p className="text-[10px] text-gray-600">Si un contrato choca con estas reglas, Cortex detendrá la emisión y alertará a gerencia en 150ms.</p>
                  </div>
               </div>

               <div>
                  <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">📋 POLÍTICAS DE PAUTA</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <button className="bg-white/70 border border-gray-200 text-[9px] uppercase font-bold text-emerald-600 p-3 rounded-xl border-emerald-500/30 bg-emerald-500/5 text-left leading-tight">Prohibir Competencia (misma tanda)</button>
                     <button className="bg-white/70 border border-gray-200 text-[9px] uppercase font-bold text-emerald-600 p-3 rounded-xl border-emerald-500/30 bg-emerald-500/5 text-left leading-tight">Separación Mín 15m competidores</button>
                  </div>
               </div>
            </div>
         </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* PASO 4: TARIFARIO DINÁMICO */}
      {/* ========================================================= */}
      {paso === 4 && (
      <div className="rounded-3xl border border-gray-200 p-8 bg-white/70 backdrop-blur-md shadow-2xl relative overflow-hidden group animate-in slide-in-from-right-4 fade-in">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-[100px] blur-3xl pointer-events-none"></div>

         <div className="flex justify-between items-start mb-8 relative z-10">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 tracking-wide">
               <span className="text-2xl">💰</span> PASO 4: TARIFARIO DINÁMICO CORTEX
            </h2>
            <div className="text-right">
               <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">Vigencia Pricing</p>
               <input type="text" value="01 Ene 2025 - 31 Dic 2025" readOnly aria-label="Vigencia del Pricing" className="bg-transparent text-gray-800 font-bold text-sm outline-none text-right border-b border-indigo-500/30 pb-0.5" />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Factores de Ajuste Automático */}
            <div>
               <h3 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">🎯 MOTORES DE FLUCTUACIÓN (AUTOMÁTICOS)</h3>
               <div className="space-y-3">
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-4 flex justify-between items-center group-hover:border-gray-200 transition-all">
                     <div>
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Rating &gt; 10 pts</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Calidad superior de audiencia</p>
                     </div>
                     <span className="bg-emerald-50 text-emerald-600 tracking-widest px-3 py-1 font-black rounded text-xs">+15%</span>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-4 flex justify-between items-center">
                     <div>
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Ocupación &gt; 90%</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Alta Demanda (Escasez)</p>
                     </div>
                     <span className="bg-emerald-50 text-emerald-600 tracking-widest px-3 py-1 font-black rounded text-xs">+20%</span>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-4 flex justify-between items-center">
                     <div>
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Temporada Alta (Dic)</p>
                     </div>
                     <span className="bg-emerald-50 text-emerald-600 tracking-widest px-3 py-1 font-black rounded text-xs">+25%</span>
                  </div>
                  <div className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-4 flex justify-between items-center">
                     <div>
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Renovación Temprana</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Fidelización</p>
                     </div>
                     <span className="bg-amber-50 text-amber-600 tracking-widest px-3 py-1 font-black rounded text-xs">-10%</span>
                  </div>
               </div>
            </div>

            {/* Cortex Pricing Analysis */}
            <div className="flex flex-col gap-6">
               <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 flex-1">
                  <h3 className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-4 flex gap-2"><span className="text-sm">🤖</span> ANÁLISIS CORTEX PRICING</h3>
                  <ul className="space-y-4">
                     <li>
                        <p className="text-[10px] text-indigo-600 mb-0.5 uppercase tracking-widest font-black">Performance contra Mercado</p>
                        <p className="text-sm text-gray-800 font-medium">8% por encima del promedio</p>
                     </li>
                     <li>
                        <p className="text-[10px] text-indigo-600 mb-0.5 uppercase tracking-widest font-black">Historical Performance</p>
                        <p className="text-sm text-gray-800 font-medium">+23% vs programa bloque anterior</p>
                     </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-indigo-500/20">
                     <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-2">💡 Sugerencia Ejecutiva</p>
                     <p className="text-xs text-gray-600 italic border-l-2 border-amber-500/50 pl-3">"Mantener pre-bases actuales. Crear paquetes Early Bird al 20% para forzar catch rate agresivo en Marzo."</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* PASO 5: VALIDACIÓN FINAL Y ACTIVACIÓN */}
      {/* ========================================================= */}
      {paso === 5 && (
      <div className="rounded-3xl border border-gray-200 p-8 bg-white/70 backdrop-blur-md shadow-2xl relative overflow-hidden group animate-in slide-in-from-right-4 fade-in">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-bl-[100px] blur-3xl pointer-events-none"></div>

         <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 tracking-wide mb-8 relative z-10">
            <span className="text-2xl">✅</span> PASO 5: VALIDACIÓN FINAL Y ACTIVACIÓN
         </h2>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {/* Resumen & Validaciones */}
            <div className="space-y-6">
               <div className="bg-[#ECEFF8]/40 border border-gray-200/50 rounded-2xl p-6">
                  <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">🔍 RESUMEN DE CONFIGURACIÓN</h3>
                  <ul className="space-y-3">
                     <li>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Programa</p>
                        <p className="text-sm font-black text-gray-800">{formData.nombre}</p>
                     </li>
                     <li className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <p className="text-xs text-gray-600 font-medium">Horario</p>
                        <p className="text-xs text-gray-800 font-bold">{formData.dias.join('-')} | {formData.desde}-{formData.hasta}</p>
                     </li>
                     <li className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <p className="text-xs text-gray-600 font-medium">Cupos Totales</p>
                        <p className="text-xs text-gray-800 font-bold">12 (8 Tipo A + 4 Tipo B)</p>
                     </li>
                     <li className="flex justify-between items-center pb-2">
                        <p className="text-xs text-gray-600 font-medium">Revenue Potencial</p>
                        <p className="text-sm text-emerald-600 font-black">$48,400,000<span className="text-[10px] text-emerald-500/50">/mes</span></p>
                     </li>
                  </ul>
               </div>

               <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <h3 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">✅ VALIDACIONES AUTOMÁTICAS</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs font-medium text-gray-600">
                     <p className="flex items-center gap-2"><span className="text-emerald-600">✔️</span> Horario Libre</p>
                     <p className="flex items-center gap-2"><span className="text-emerald-600">✔️</span> Pricing Rango</p>
                     <p className="flex items-center gap-2"><span className="text-emerald-600">✔️</span> Capacidad OK</p>
                     <p className="flex items-center gap-2"><span className="text-emerald-600">✔️</span> Exclusividades</p>
                     <p className="col-span-2 flex items-center gap-2 pt-2 border-t border-emerald-500/10"><span className="text-emerald-600">✔️</span> Integración Contratos: OK</p>
                  </div>
               </div>
            </div>

            {/* Asignación y Activación */}
            <div className="space-y-6">
               <div className="bg-[#ECEFF8]/40 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
                  <h3 className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-4">🎯 ASIGNACIÓN COMERCIAL</h3>
                  <div className="space-y-4">
                     <div>
                        <p className="text-[10px] text-gray-800 font-bold uppercase">• Ana García <span className="text-gray-500 font-normal">(Principal)</span></p>
                        <div className="flex justify-between mt-1 text-xs">
                           <span className="text-gray-500">Banca, Telcos</span>
                           <span className="text-amber-600 font-black">Meta: $30M (6 A)</span>
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-800 font-bold uppercase">• Carlos Mendoza <span className="text-gray-500 font-normal">(Secundario)</span></p>
                        <div className="flex justify-between mt-1 text-xs">
                           <span className="text-gray-500">Retail, Auto</span>
                           <span className="text-amber-600 font-black">Meta: $15M (2 A + 4 B)</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                  <h3 className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-4">🚀 ACTIVACIÓN DEL PROGRAMA</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Inicio Ventas</p>
                        <p className="text-xs text-gray-800 bg-[#ECEFF8]/50 p-2 rounded-lg border border-gray-200/50">01 Ene 2025</p>
                     </div>
                     <div>
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Inicio Emisión</p>
                        <p className="text-xs text-gray-800 bg-[#ECEFF8]/50 p-2 rounded-lg border border-gray-200/50">01 Feb 2025</p>
                     </div>
                  </div>
                  <ul className="text-[10px] text-indigo-600 space-y-1 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                     <li>⚡ Al activar, se encenderá el Bot de Alertas y Monitoreo de Brand Safety en tiempo real.</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 mt-8 border-t border-gray-200/50">
         <button 
           onClick={() => paso > 1 ? setPaso(paso - 1) : null}
           className={`text-gray-500 hover:text-gray-800 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${paso === 1 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
         >
           ⬅️ Atrás
         </button>
         <div className="flex gap-3">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors">💾 Simular / Borrador</button>
            {paso < 5 ? (
               <button 
                  onClick={() => setPaso(paso + 1)} 
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
               >
                  ➡️ Siguiente 
               </button>
            ) : (
               <button 
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 border border-amber-400 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
               >
                  🚀 Activar Programa
               </button>
            )}
         </div>
      </div>
    </div>
  )
}
