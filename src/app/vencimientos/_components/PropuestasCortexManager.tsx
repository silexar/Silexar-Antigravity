'use client'

import React from 'react'
import { useBusinessRules, AiBusinessRule } from '../../../modules/vencimientos/application/store/BusinessRulesStore'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * COMPONENT: PROPUESTAS CORTEX MANAGER - TIER 0
 * 
 * @description Interfaz de Gerencia para revisar y aprobar las reglas AI dinámicas
 * generadas por el sistema (Yield Management).
 */

export default function PropuestasCortexManager() {
  const { reglas, aprobarRegla, rechazarRegla, auditLogs } = useBusinessRules()

  const IconoRegla = ({ tipo }: { tipo: AiBusinessRule['tipo'] }) => {
    switch (tipo) {
      case 'surge_pricing': return <span className="text-amber-600">⚡</span>
      case 'anti_hoarding': return <span className="text-rose-400">🛑</span>
      case 'discount_lock': return <span className="text-indigo-600">🔒</span>
      default: return <span>🤖</span>
    }
  }

  return (
    <div className="bg-white/80 border-none rounded-[2rem] p-8 shadow-[20px_20px_60px_#0e121b,_-20px_-20px_60px_#1e263d] m-4 relative overflow-hidden h-[850px] flex flex-col">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-200 tracking-tight flex items-center gap-3">
            <span className="p-3 bg-white/80 rounded-2xl shadow-[inset_4px_4px_10px_#0e121b,_inset_-4px_-4px_10px_#1e263d] text-indigo-600">🧠</span>
            Cortex IA : Propuestas de Negocio
          </h2>
          <p className="text-gray-500 font-bold mt-2 ml-16 transform uppercase tracking-widest text-xs">
            Optimización Algorítmica y Prevención de Fraude
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden pr-2 flex gap-6 relative z-10">
        <div className="w-2/3 overflow-y-auto space-y-6 pr-4">
          <AnimatePresence>
            {reglas.map(regla => (
              <motion.div 
                key={regla.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl transition-all border relative overflow-hidden
                  ${regla.estado === 'activa' 
                    ? 'bg-indigo-900/10 border-indigo-500/30 shadow-[inset_4px_4px_15px_rgba(0,0,0,0.5),_0_10px_30px_rgba(99,102,241,0.1)]' 
                    : 'bg-white/80 border-slate-800 shadow-[10px_10px_20px_#0e121b,_-10px_-10px_20px_#1e263d]'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#ECEFF8] rounded-xl shadow-inner border border-slate-800/50 text-2xl">
                      <IconoRegla tipo={regla.tipo} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-200">{regla.titulo}</h3>
                      <p className="text-xs font-mono font-bold text-gray-500 mt-1">ID: {regla.id.toUpperCase()}</p>
                    </div>
                  </div>
                  
                  {/* Badge Estado */}
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border
                    ${regla.estado === 'activa' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/30' : 
                      regla.estado === 'rechazada' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 
                      'bg-amber-500/10 text-amber-600 border-amber-500/30'}`}>
                    {regla.estado}
                  </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-6 ml-[60px] max-w-xl">
                  {regla.descripcion}
                </p>

                <div className="ml-[60px] flex items-center gap-4">
                  {regla.estado === 'propuesta' && (
                    <>
                      <button 
                        onClick={() => aprobarRegla(regla.id)}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                        ✓ Aprobar e Inyectar
                      </button>
                      <button 
                        onClick={() => rechazarRegla(regla.id)}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-600 font-bold text-sm rounded-xl shadow-inner transition-all border border-slate-700 active:scale-95">
                        ✕ Descartar
                      </button>
                    </>
                  )}
                  {regla.estado === 'activa' && (
                    <span className="text-indigo-600 text-sm font-bold flex items-center gap-2">
                      <span className="animate-pulse">🟢</span> Operando en Tiempo Real
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Panel Trazabilidad SOX */}
        <div className="w-1/3 bg-[#ECEFF8]/50 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-inner">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span>🛡️</span> Audit Trail SOX
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {auditLogs && auditLogs.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <span className="text-3xl mb-3 block">📜</span>
                <p className="text-xs text-gray-500 font-bold">Sin auditorías recientes.</p>
              </div>
            ) : auditLogs?.map(log => (
              <div key={log.id} className="bg-white/80 p-4 rounded-xl border border-slate-800 shadow-[2px_2px_5px_#0e121b,_-2px_-2px_5px_#1e263d]">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded ${log.accion === 'APROBADA' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-500/20 text-rose-400'}`}>
                    {log.accion}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono font-bold">
                    {new Date(log.fechaIso).toLocaleTimeString('es-CL')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-snug">
                  Regla <strong className="text-slate-200">{log.tituloAnterior}</strong> fue {log.accion.toLowerCase()} por <span className="text-indigo-600 font-mono">@{log.usuario}</span>.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
