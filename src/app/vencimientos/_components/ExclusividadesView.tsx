'use client'

/**
 * COMPONENTE: EXCLUSIVIDADES Y COMPETENCIA POR RUBRO (Mejora 6)
 * TIER 0 ENTERPRISE FASE 2
 */

const EXCLUSIVIDADES_MOCK = [
  { rubro: 'Telecomunicaciones', politica: 'exclusivo', clientes: ['Entel'], maxClientes: 1, programa: 'Buenos Días Radio', estado: 'activa' },
  { rubro: 'Banca', politica: 'limitado', clientes: ['Banco Santander', 'BCI'], maxClientes: 2, programa: 'Noticiero Central', estado: 'activa' },
  { rubro: 'Retail', politica: 'limitado', clientes: ['Falabella'], maxClientes: 3, programa: 'Drive Time PM', estado: 'activa' },
  { rubro: 'Automotriz', politica: 'exclusivo', clientes: [], maxClientes: 1, programa: 'Magazine AM', estado: 'activa' }
]

const MAPA_COMPETENCIA = [
  { programa: 'Buenos Días Radio', rubros: [{ rubro: 'Telecom', clientes: ['Entel'], exclusivo: true }, { rubro: 'Banca', clientes: ['Santander'], exclusivo: false }, { rubro: 'Retail', clientes: ['Falabella', 'Paris'], exclusivo: false }] },
  { programa: 'Noticiero Central', rubros: [{ rubro: 'Banca', clientes: ['Santander', 'BCI'], exclusivo: false }, { rubro: 'Seguros', clientes: ['MetLife'], exclusivo: true }] },
  { programa: 'Drive Time PM', rubros: [{ rubro: 'Retail', clientes: ['Falabella'], exclusivo: false }, { rubro: 'Automotriz', clientes: ['Toyota'], exclusivo: true }] }
]

export default function ExclusividadesView() {
  return (
    <div className="space-y-6">
      {/* Reglas de exclusividad */}
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-6" style={{ backdropFilter: 'blur(10px)' }}>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">🔒 Reglas de Exclusividad por Rubro</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
              <th className="text-left py-3 px-3">Rubro</th>
              <th className="text-center py-3 px-3">Política</th>
              <th className="text-left py-3 px-3">Clientes</th>
              <th className="text-center py-3 px-3">Espacios</th>
              <th className="text-left py-3 px-3">Programa</th>
              <th className="text-center py-3 px-3">Estado</th>
            </tr></thead>
            <tbody>
              {EXCLUSIVIDADES_MOCK.map((ex, i) => (
                <tr key={`${ex}-${i}`} className="border-b border-gray-200/50 hover:bg-white/90 transition-colors">
                  <td className="py-3 px-3 font-semibold text-gray-800">{ex.rubro}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ex.politica === 'exclusivo' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {ex.politica === 'exclusivo' ? '🔒 Exclusivo' : `📊 Limitado (${ex.maxClientes})`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{ex.clientes.length > 0 ? ex.clientes.join(', ') : <span className="text-gray-400">Sin clientes</span>}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-bold ${ex.clientes.length >= ex.maxClientes ? 'text-red-600' : 'text-emerald-600'}`}>
                      {ex.maxClientes - ex.clientes.length}/{ex.maxClientes}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500">{ex.programa}</td>
                  <td className="py-3 px-3 text-center"><span className="text-emerald-600 text-xs">✅ Activa</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mapa de competencia (Mejora 6) */}
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-6" style={{ backdropFilter: 'blur(10px)' }}>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">🗺️ Dashboard de Competencia por Rubro (Mejora 6)</h3>
        <div className="space-y-4">
          {MAPA_COMPETENCIA.map((prog, i) => (
            <div key={`${prog}-${i}`} className="rounded-xl border border-gray-200/50 bg-white/3 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">{prog.programa}</h4>
              <div className="flex flex-wrap gap-2">
                {prog.rubros.map((r, j) => (
                  <div key={j} className={`rounded-lg border px-3 py-2 ${r.exclusivo ? 'border-red-500/30 bg-red-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                    <p className="text-xs text-gray-500">{r.rubro} {r.exclusivo ? '🔒' : ''}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {r.clientes.map((c, k) => (
                        <span key={k} className="px-1.5 py-0.5 rounded bg-white/60 text-gray-800 text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
