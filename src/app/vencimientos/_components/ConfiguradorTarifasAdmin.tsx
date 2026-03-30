'use client'

import { useState } from 'react'
import { useMatrizTarifas } from '../../../modules/vencimientos/application/store/MatrizTarifasStore'

/**
 * COMPONENT: CONFIGURADOR MATRIZ TARIFAS ADMIN - TIER 0
 * 
 * @description Vista Gerencial para alterar los % reales de cobro por frase
 * basados en el precio madre de 30 segundos. Usa UI Neumórfica intensiva.
 */

export default function ConfiguradorTarifasAdmin() {
  const { factores, actualizarFactor, auditLogs } = useMatrizTarifas()
  const [tramoEditando, setTramoEditando] = useState<number | null>(null)
  const [valorTemp, setValorTemp] = useState<number>(0)

  const iniciarEdicion = (segundos: number, valorActual: number) => {
    setTramoEditando(segundos)
    setValorTemp(Math.round(valorActual * 100))
  }

  const guardarEdicion = (segundos: number) => {
    actualizarFactor(segundos, valorTemp / 100)
    setTramoEditando(null)
  }

  const tramosOrdenados = Object.keys(factores).map(Number).sort((a, b) => a - b)

  return (
    <div className="bg-white/80 rounded-[2rem] p-8 shadow-[20px_20px_60px_#0e121b,_-20px_-20px_60px_#1e263d] m-4 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-200 tracking-tight flex items-center gap-3">
            <span className="p-3 bg-white/80 rounded-2xl shadow-[inset_4px_4px_10px_#0e121b,_inset_-4px_-4px_10px_#1e263d] text-indigo-600">⚙️</span>
            Matriz Comercial Factorizada
          </h2>
          <p className="text-gray-500 font-bold mt-2 ml-16 uppercase tracking-widest text-xs">Ajuste de ponderaciones reales vs 30 segundos</p>
        </div>
        <div className="text-right">
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-[inset_0_2px_10px_rgba(52,211,153,0.1)]">
            Impacto Global Activo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
        {tramosOrdenados.map(segundos => {
          const factor = factores[segundos]
          const isBase = segundos === 30
          const editando = tramoEditando === segundos

          return (
            <div 
              key={segundos}
              className={`p-6 rounded-3xl transition-all duration-300 flex flex-col items-center
                ${isBase 
                  ? 'bg-indigo-600/10 border border-indigo-500/30 shadow-[inset_4px_4px_15px_rgba(0,0,0,0.5),_0_10px_30px_rgba(99,102,241,0.1)]' 
                  : 'bg-white/80 shadow-[10px_10px_20px_#0e121b,_-10px_-10px_20px_#1e263d] hover:shadow-[15px_15px_30px_#0e121b,_-15px_-15px_30px_#1e263d]'
                }`}
            >
              <div className="flex justify-between w-full items-start mb-4">
                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Aviso</span>
                {isBase && <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">BASE MÁSTER</span>}
              </div>
              
              <div className="text-4xl font-black text-slate-200 drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] mb-6">
                {segundos}s
              </div>

              {editando ? (
                <div className="w-full bg-white/80 rounded-xl p-2 shadow-[inset_4px_4px_10px_#0e121b,_inset_-4px_-4px_10px_#1e263d] flex items-center gap-2">
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    step="5"
                    value={valorTemp}
                    onChange={(e) => setValorTemp(Number(e.target.value))}
                    className="w-full bg-transparent text-center font-black text-xl text-emerald-600 outline-none"
                  />
                  <span className="text-gray-500 font-bold">%</span>
                  <button 
                    onClick={() => guardarEdicion(segundos)}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500/40 transition-colors"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => !isBase && iniciarEdicion(segundos, factor)}
                  className={`w-full py-3 rounded-xl text-center font-black text-xl transition-all
                    ${isBase 
                      ? 'text-indigo-600 bg-indigo-500/5 cursor-default' 
                      : 'text-emerald-600 bg-slate-800 shadow-inner cursor-pointer hover:bg-slate-700 active:shadow-[inset_4px_4px_10px_#0e121b,_inset_-4px_-4px_10px_#1e263d]'
                    }`}
                  title={!isBase ? "Clic para editar porcentaje" : "El valor base no es editable"}
                >
                  {Math.round(factor * 100)}%
                </div>
              )}
              
              <p className="text-[10px] text-gray-500 mt-4 text-center font-bold">
                {isBase ? 'Tarifa completa' : (factor < 1 ? `Descuento implicito ${Math.round((1-factor)*100)}%` : `Recargo extra ${Math.round((factor-1)*100)}%`)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Audit Logs TIER 0 */}
      <div className="mt-8 border-t border-slate-800 pt-8 relative z-10">
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>🛡️</span> Historial Forense SOX (Modificaciones)
        </h3>
        
        <div className="bg-[#ECEFF8]/50 rounded-2xl border border-slate-800 p-4 max-h-64 overflow-y-auto space-y-3 shadow-inner">
          {auditLogs && auditLogs.length === 0 ? (
            <p className="text-xs text-gray-500 font-bold text-center py-4">No hay modificaciones recientes en la matriz.</p>
          ) : auditLogs?.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-white/80 border border-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg text-lg">📝</span>
                <div>
                  <p className="text-sm font-bold text-gray-600">
                    Cambio en Cuña de <span className="text-emerald-600 font-black">{log.segundos}s</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Factor modificado de <span className="line-through">{Math.round(log.factorAnterior * 100)}%</span> a <span className="font-black text-gray-800">{Math.round(log.factorNuevo * 100)}%</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-bold text-indigo-600">@{log.usuario}</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">{new Date(log.fechaIso).toLocaleString('es-CL')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
