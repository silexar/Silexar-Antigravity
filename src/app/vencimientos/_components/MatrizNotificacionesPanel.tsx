'use client'

/**
 * COMPONENT: MATRIZ NOTIFICACIONES PANEL - TIER 0 FASE 5
 *
 * @description Panel para que Gerencia/Tráfico marquen quién recibe
 * qué notificaciones. Configura la Regla R1 y la matriz de alertas.
 */

import { useState } from 'react'

export default function MatrizNotificacionesPanel() {
  const [r1Config, setR1Config] = useState({ tipo: 'estricta', horas: 48 })

  const [matriz, setMatriz] = useState([
    { id: 'cierre', accion: 'Cierre Definitivo (Nuevo Cliente)', roles: { gerente: true, trafico: true, ejecutivo: true } },
    { id: 'modificacion', accion: 'Modificación de Fechas', roles: { gerente: false, trafico: true, ejecutivo: true } },
    { id: 'eliminacion', accion: 'Eliminación R1 (No-Inicio)', roles: { gerente: true, trafico: true, ejecutivo: true } },
    { id: 'riesgo', accion: 'Alerta de Riesgo R1 (Faltan 24h)', roles: { gerente: false, trafico: false, ejecutivo: true } }
  ])

  const toggleRol = (id: string, rol: 'gerente' | 'trafico' | 'ejecutivo') => {
    setMatriz(prev => prev.map(m => 
      m.id === id ? { ...m, roles: { ...m.roles, [rol]: !m.roles[rol] } } : m
    ))
  }

  return (
    <div className="bg-white/80 border border-slate-800 rounded-xl max-w-4xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-[#ECEFF8] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            ⚙️ Configuración del Módulo
          </h2>
          <p className="text-sm text-gray-500 mt-1">Administra las reglas de negocio y los flujos de comunicación.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-indigo-600/20 transition-all">
          Guardar Cambios
        </button>
      </div>

      <div className="p-6 space-y-10">
        
        {/* Regla R1 */}
        <section>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-red-500">■</span> Regla de Fricción "No-Inicio" (R1)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(['estricta', 'flexible', 'manual'] as const).map(t => (
              <div 
                key={t}
                onClick={() => setR1Config(prev => ({ ...prev, tipo: t }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${r1Config.tipo === t ? 'border-red-500 bg-red-50' : 'border-slate-800 bg-[#ECEFF8] hover:border-slate-700'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${r1Config.tipo === t ? 'border-red-500' : 'border-slate-600'}`}>
                    {r1Config.tipo === t && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                  </div>
                  <span className="font-bold text-gray-800 capitalize">{t}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {t === 'estricta' && 'Auto-elimina cupo sin preguntar al cumplirse el plazo.'}
                  {t === 'flexible' && 'Permite pedir extensión de tiempo con 1 clic (24h extra).'}
                  {t === 'manual' && 'Solo notifica, no elimina. Requiere que Tráfico limpie el cupo manually.'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4 bg-[#ECEFF8] p-4 rounded-lg border border-slate-800">
            <span className="text-sm font-semibold text-gray-600">Horas de gracia por defecto:</span>
            <input
              type="number"
              value={r1Config.horas}
              onChange={e => setR1Config(prev => ({ ...prev, horas: Number(e.target.value) }))}
              aria-label="Horas de gracia por defecto"
              className="bg-white/80 border border-slate-700 rounded text-center w-20 py-1 text-gray-800 outline-none focus:border-red-500"
            />
            <span className="text-sm text-gray-500">horas (recomendado: 48h)</span>
          </div>
        </section>

        {/* Matriz de Notificaciones */}
        <section>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>📧</span> Matriz de Alertas y Emails
          </h3>
          
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-[#ECEFF8] text-xs uppercase font-bold text-gray-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Trigger / Evento</th>
                  <th className="px-6 py-4 text-center">Gerencia Cial.</th>
                  <th className="px-6 py-4 text-center">Op. Tráfico</th>
                  <th className="px-6 py-4 text-center">Ejecutivo Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {matriz.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-semibold text-gray-800">{row.accion}</td>
                    {(['gerente', 'trafico', 'ejecutivo'] as const).map(rol => (
                      <td key={rol} className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleRol(row.id, rol)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors mx-auto ${row.roles[rol] ? 'bg-indigo-500 text-white' : 'bg-slate-800 border-2 border-slate-700 text-transparent'}`}>
                          {row.roles[rol] && '✓'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  )
}
