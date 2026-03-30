'use client'
import { useState } from 'react'

export default function MobileSecurityComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'RBAC' | 'CORTEX'>('AUDIT');

  return (
    <div className="space-y-4 pb-20">
      
      {/* HEADER DE SEGURIDAD MÓVIL */}
      <div className="bg-[#ECEFF8]/80 p-5 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full blur-2xl pointer-events-none"></div>
         <div className="flex justify-between items-center relative z-10 mb-3">
            <h1 className="text-sm font-black text-gray-800 flex items-center gap-2">
               <span className="text-emerald-500 animate-pulse text-lg">🛡️</span> COMPLIANCE TIER 0
            </h1>
            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
               <span className="text-[9px] text-emerald-600 font-bold uppercase">Secure Node</span>
            </div>
         </div>
      </div>

      {/* TABS DE NAVEGACIÓN MÓVIL (SCROLL HORIZONTAL) */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 px-1">
         <button 
           onClick={() => setActiveTab('AUDIT')}
           className={`px-4 py-2 rounded-lg text-[10px] whitespace-nowrap font-bold transition-all uppercase tracking-wider ${activeTab === 'AUDIT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/50' : 'bg-white/80/60 text-gray-500 border border-gray-200/50'}`}
         >
           ⛓️ Auditoría Log
         </button>
         <button 
           onClick={() => setActiveTab('RBAC')}
           className={`px-4 py-2 rounded-lg text-[10px] whitespace-nowrap font-bold transition-all uppercase tracking-wider ${activeTab === 'RBAC' ? 'bg-indigo-50 text-indigo-600 border border-indigo-500/50' : 'bg-white/80/60 text-gray-500 border border-gray-200/50'}`}
         >
           🔑 Acceso RBAC
         </button>
         <button 
           onClick={() => setActiveTab('CORTEX')}
           className={`px-4 py-2 rounded-lg text-[10px] whitespace-nowrap font-bold transition-all uppercase tracking-wider ${activeTab === 'CORTEX' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/80/60 text-gray-500 border border-gray-200/50'}`}
         >
           🧠 Motores IA
         </button>
      </div>

      {/* CONTENIDO DEPENDIENDO DE LA PESTAÑA */}
      <div className="px-1">
         
         {activeTab === 'AUDIT' && (
            <div className="bg-white/80/60 rounded-xl border border-gray-200/50 p-4 flex flex-col h-[60vh]">
               <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="text-emerald-500">⛓️</span> Transaction Log
               </h3>
               
               <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[9px] custom-scrollbar pr-1">
                  {[
                     { time: "10:45", action: "OVERRIDE", desc: "Forzó tarifa Mesa Central", hash: "0x8f2a" },
                     { time: "10:32", action: "RESERVA", desc: "Reservó Tarde Deportiva", hash: "0x1a9c" },
                     { time: "10:15", action: "CORTEX", desc: "+10% Pricing en Sonar FM", hash: "0xcc21" },
                     { time: "09:55", action: "LOGIN_FAIL", desc: "Intento desde IP 192...", hash: "0x00fa", alert: true },
                     { time: "09:30", action: "SYNC_OK", desc: "Validación Dual Automática", hash: "0xff11" }
                  ].map((log, i) => (
                     <div key={i} className={`p-2 rounded border flex flex-col gap-1 ${log.alert ? 'bg-red-950/20 border-red-500/30' : 'bg-[#ECEFF8]/50 border-gray-200/50'}`}>
                        <div className="flex justify-between items-center border-b border-gray-200/50 pb-1">
                           <span className={`${log.alert ? 'text-red-600' : 'text-emerald-600'} font-bold`}>[{log.action}]</span>
                           <span className="text-gray-500">{log.time}</span>
                        </div>
                        <span className="text-gray-600 truncate">{log.desc}</span>
                        <span className="text-emerald-700 font-black text-right">{log.hash}</span>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'RBAC' && (
            <div className="bg-white/80/60 rounded-xl border border-indigo-500/20 p-4 space-y-3">
               <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="text-indigo-600">🔑</span> Permisos (Roles)
               </h3>
               
               {[
                  { section: "Consultar Inventario", jr: "✅", sr: "✅", ger: "✅" },
                  { section: "Reserva Temporal (24h)", jr: "❌", sr: "✅", ger: "✅" },
                  { section: "Modificar Precio Base", jr: "❌", sr: "❌", ger: "✅" },
                  { section: "Override Reglas IA", jr: "❌", sr: "❌", ger: "⚠️ (Dual)" }
               ].map((t, idx) => (
                  <div key={idx} className="bg-[#ECEFF8]/50 p-2.5 rounded-lg border border-gray-200/50">
                     <p className="text-[10px] font-bold text-gray-600 mb-2 border-b border-gray-200/50 pb-1">{t.section}</p>
                     <div className="flex justify-between text-[9px] text-center">
                        <div>
                           <span className="block text-gray-500 mb-0.5">Ej. Jr</span>
                           <span className={t.jr === '❌' ? 'opacity-50 grayscale' : ''}>{t.jr}</span>
                        </div>
                        <div>
                           <span className="block text-gray-500 mb-0.5">Ej. Sr</span>
                           <span className={t.sr === '❌' ? 'opacity-50 grayscale' : ''}>{t.sr}</span>
                        </div>
                        <div>
                           <span className="block text-gray-500 mb-0.5">Gerente</span>
                           <span>{t.ger}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {activeTab === 'CORTEX' && (
            <div className="bg-white/80/60 rounded-xl border border-cyan-500/20 p-4 space-y-3">
               <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="text-cyan-400">🧠</span> Centro Cortex AI
               </h3>

               <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/10 blur-xl"></div>
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-[10px] font-bold text-cyan-400 uppercase">Yield Management</h4>
                     <div className="w-6 h-3.5 bg-cyan-500 rounded-full relative"><div className="absolute right-1 top-0.5 w-2.5 h-2.5 bg-white rounded-full"></div></div>
                  </div>
                  <p className="text-[9px] text-gray-500 mb-2">Ajuste de tarifario dinámico x ocupación.</p>
                  <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Activo. +12% Delta Rev.</span>
               </div>

               <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-[10px] font-bold text-indigo-600 uppercase">Conflict Engine</h4>
                     <div className="w-6 h-3.5 bg-indigo-500 rounded-full relative"><div className="absolute right-1 top-0.5 w-2.5 h-2.5 bg-white rounded-full"></div></div>
                  </div>
                  <p className="text-[9px] text-gray-500 mb-2">Detección Brand Safety anti-choques (CocaCola vs Pepsi).</p>
                  <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">0 Infracciones hoy.</span>
               </div>
               
               <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-[10px] font-bold text-amber-600 uppercase">Lifecycle & Churn</h4>
                     <div className="w-6 h-3.5 bg-amber-500 rounded-full relative"><div className="absolute right-1 top-0.5 w-2.5 h-2.5 bg-white rounded-full"></div></div>
                  </div>
                  <p className="text-[9px] text-gray-500 mb-2">Renovaciones algorítmicas y prevención fuga.</p>
                  <span className="text-[8px] text-amber-600 font-bold bg-amber-500/10 px-2 py-1 rounded">6 Riesgos Moderados detectados.</span>
               </div>
            </div>
         )}
      </div>

    </div>
  )
}
