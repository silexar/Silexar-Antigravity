'use client'
import { useState } from 'react'

export default function SecurityComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'RBAC' | 'CORTEX'>('AUDIT');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* HEADER DE SEGURIDAD ESTILO CYBERPUNK/TIER0 */}
      <div className="bg-[#ECEFF8]/80 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="flex justify-between items-end relative z-10">
            <div>
               <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                  <span className="text-emerald-500 animate-pulse">🛡️</span> SECURITY & COMPLIANCE TIER 0
               </h1>
               <p className="text-emerald-600/70 text-sm font-bold mt-1 tracking-widest uppercase">Zero-Trust Enterprise Environment</p>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-emerald-950/40 border border-emerald-500/20 px-4 py-2 rounded-lg text-right">
                  <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Status Node</p>
                  <p className="text-sm font-black text-gray-800 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> SECURE
                  </p>
               </div>
               <div className="bg-white/80 border border-gray-200/50 px-4 py-2 rounded-lg text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Última Auditoría</p>
                  <p className="text-sm font-black text-gray-800">Hace 2 mins</p>
               </div>
            </div>
         </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN Z-TRUST */}
      <div className="flex gap-2 bg-white/70 p-1.5 rounded-xl border border-gray-200/50 w-max">
         <button 
           onClick={() => setActiveTab('AUDIT')}
           className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${activeTab === 'AUDIT' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-800 hover:bg-white/90'}`}
         >
           Auditoría Inmutable
         </button>
         <button 
           onClick={() => setActiveTab('RBAC')}
           className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${activeTab === 'RBAC' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-gray-500 hover:text-gray-800 hover:bg-white/90'}`}
         >
           Access Control (RBAC)
         </button>
         <button 
           onClick={() => setActiveTab('CORTEX')}
           className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${activeTab === 'CORTEX' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,214,0.4)]' : 'text-gray-500 hover:text-gray-800 hover:bg-white/90'}`}
         >
           Motores IA Cortex
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

         {/* PANEL CENTRAL DINÁMICO DEVUELTO POR LA PESTAÑA */}
         <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'AUDIT' && (
               <div className="bg-white/80/60 rounded-xl border border-gray-200/50 p-6 h-[500px] flex flex-col">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="text-emerald-500">⛓️</span> Blockchain Transaction Log
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs custom-scrollbar pr-2">
                     {[
                        { time: "10:45:22", action: "OVERRIDE_PRICING", user: "G. Comercial (ID: 882)", desc: "Forzó tarifa -15% en Mesa Central", hash: "0x8f2a...91b" },
                        { time: "10:32:11", action: "RESERVA_TEMP", user: "Ejecutivo Senior (ID: 104)", desc: "Reservó cupo 24h Tarde Deportiva", hash: "0x1a9c...44f" },
                        { time: "10:15:00", action: "CORTEX_AUTOAJUSTE", user: "SYSTEM_AI", desc: "Yield Management: +10% Pricing en Sonar FM", hash: "0xcc21...8fa" },
                        { time: "09:55:33", action: "LOGIN_FAILED", user: "Unknown_IP", desc: "Intento fallido desde IP 192.168.1.X", hash: "0x00fa...11c", alert: true }
                     ].map((log, i) => (
                        <div key={`${log}-${i}`} className={`p-3 rounded-lg border flex gap-4 ${log.alert ? 'bg-red-950/20 border-red-500/30' : 'bg-[#ECEFF8]/50 border-gray-200/50 hover:border-emerald-500/30 transition-colors'}`}>
                           <div className="text-gray-500 w-16 shrink-0">{log.time}</div>
                           <div className="flex-1">
                              <span className={`${log.alert ? 'text-red-600' : 'text-emerald-600'} font-bold`}>[{log.action}]</span>
                              <span className="text-gray-600 ml-2">{log.desc}</span>
                           </div>
                           <div className="text-gray-500 w-32 shrink-0 truncate">User: {log.user}</div>
                           <div className="text-emerald-700 w-24 shrink-0 text-right">{log.hash}</div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab === 'RBAC' && (
               <div className="bg-white/80/60 rounded-xl border border-indigo-500/20 p-6">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="text-indigo-600">🔑</span> Matriz de Permisos Zero-Trust
                  </h3>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-xs">
                        <thead className="text-[10px] text-gray-500 uppercase bg-[#ECEFF8]/50">
                           <tr>
                              <th className="p-3 rounded-tl-lg">Permiso / Rol</th>
                              <th className="p-3 text-center">Ejecutivo Jr</th>
                              <th className="p-3 text-center">Ejecutivo Sr</th>
                              <th className="p-3 text-center">Gerente Com.</th>
                              <th className="p-3 text-center rounded-tr-lg">Admin TIER0</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           <tr>
                              <td className="p-3 font-bold text-gray-600">Consultar Disponibilidad</td>
                              <td className="p-3 text-center text-emerald-500">✅</td><td className="p-3 text-center text-emerald-500">✅</td><td className="p-3 text-center text-emerald-500">✅</td><td className="p-3 text-center text-emerald-500">✅</td>
                           </tr>
                           <tr>
                              <td className="p-3 font-bold text-gray-600">Reserva Temporal (24h)</td>
                              <td className="p-3 text-center text-red-500 opacity-50">❌</td><td className="p-3 text-center text-emerald-500">✅</td><td className="p-3 text-center text-emerald-500">✅</td><td className="p-3 text-center text-emerald-500">✅</td>
                           </tr>
                           <tr>
                              <td className="p-3 font-bold text-gray-600">Modificar Tarifas Bases</td>
                              <td className="p-3 text-center text-red-500 opacity-50">❌</td><td className="p-3 text-center text-red-500 opacity-50">❌</td><td className="p-3 text-center text-emerald-500">✅</td><td className="p-3 text-center text-emerald-500">✅</td>
                           </tr>
                           <tr>
                              <td className="p-3 font-bold text-gray-600">Override Reglas IA</td>
                              <td className="p-3 text-center text-red-500 opacity-50">❌</td><td className="p-3 text-center text-red-500 opacity-50">❌</td><td className="p-3 text-center text-red-500 opacity-50">❌</td><td className="p-3 text-center text-emerald-500 font-black">✅ DUAL</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'CORTEX' && (
               <div className="bg-white/80/60 rounded-xl border border-cyan-500/20 p-6 space-y-4">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="text-cyan-600">🧠</span> Centro de Mando Cortex
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#ECEFF8]/50 p-4 rounded-xl border border-gray-200/50 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xs font-bold text-cyan-600 uppercase">Yield Management</h4>
                              <div className="w-8 h-4 bg-cyan-500 rounded-full relative"><div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                           </div>
                           <p className="text-[10px] text-gray-500">Permite que Cortex ajuste el tarifario dinámicamente según ocupación de tandas interactivas.</p>
                        </div>
                        <p className="text-[9px] text-emerald-600 font-bold mt-4 bg-emerald-50 p-2 rounded">Activo. +12% Delta Revenue YTD.</p>
                     </div>

                     <div className="bg-[#ECEFF8]/50 p-4 rounded-xl border border-gray-200/50 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xs font-bold text-indigo-600 uppercase">Conflict Engine</h4>
                              <div className="w-8 h-4 bg-indigo-500 rounded-full relative"><div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                           </div>
                           <p className="text-[10px] text-gray-500">Motor 'Anti-Choque' de Brand Safety. Previene que competidores compartan mismo bloque.</p>
                        </div>
                        <p className="text-[9px] text-emerald-600 font-bold mt-4 bg-emerald-50 p-2 rounded">0 Infracciones detectadas hoy.</p>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* SIDEBAR DERECHO - COMPLIANCE STATUS */}
         <div className="space-y-6">
            <div className="bg-white/80/60 rounded-xl border border-gray-200/50 p-5">
               <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-widest mb-4 border-b border-gray-200/50 pb-2">⚖️ Check de Compliance</h3>
               
               <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50">
                     <div className="flex items-center gap-2">
                        <span className="text-emerald-500 text-lg">✓</span>
                        <div className="text-[10px]">
                           <p className="text-gray-800 font-bold">SOX Compliance</p>
                           <p className="text-gray-500">Trazabilidad Financiera</p>
                        </div>
                     </div>
                     <span className="text-[9px] text-emerald-500 font-black">100% Ok</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50">
                     <div className="flex items-center gap-2">
                        <span className="text-emerald-500 text-lg">✓</span>
                        <div className="text-[10px]">
                           <p className="text-gray-800 font-bold">GDPR / Data Privacy</p>
                           <p className="text-gray-500">Anonimización PII</p>
                        </div>
                     </div>
                     <span className="text-[9px] text-emerald-500 font-black">100% Ok</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
                     <div className="flex items-center gap-2">
                        <span className="text-indigo-600 text-lg animate-pulse">↻</span>
                        <div className="text-[10px]">
                           <p className="text-gray-800 font-bold">Validación Dual Mkt</p>
                           <p className="text-gray-500">Reglas IA Custom</p>
                        </div>
                     </div>
                     <span className="text-[9px] text-indigo-600 font-black">En Progreso</span>
                  </div>
               </div>
            </div>

            <div className="bg-red-950/20 rounded-xl border border-red-500/20 p-5 text-center">
               <span className="text-3xl mb-2 block">🚨</span>
               <h3 className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-2">Protocolo Lockdown</h3>
               <p className="text-[10px] text-gray-500 mb-4">Congela todo el inventario y cierra accesos no-admin en caso de brecha.</p>
               <button className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-500 font-black text-xs uppercase tracking-widest py-2.5 rounded-lg border border-red-500/50 transition-colors">
                  Activar Lockdown
               </button>
            </div>
         </div>

      </div>
    </div>
  )
}
