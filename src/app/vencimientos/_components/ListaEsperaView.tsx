'use client'

/**
 * COMPONENTE: LISTA DE ESPERA (Mejora 7)
 * TIER 0 ENTERPRISE FASE 2
 */

const LISTAS_ESPERA_MOCK = [
  {
    programa: 'Buenos Días Radio', tipo: 'Tipo A', cuposOcupados: 4, cuposTotal: 4,
    clientes: [
      { posicion: 1, nombre: 'Samsung', ejecutivo: 'Pedro Soto', rubro: 'Tecnología', fechaSolicitud: '2026-02-20', prioridad: 'alta' },
      { posicion: 2, nombre: 'Movistar', ejecutivo: 'María Ruiz', rubro: 'Telecom', fechaSolicitud: '2026-02-25', prioridad: 'media' }
    ]
  },
  {
    programa: 'Stream Digital HD', tipo: 'Tipo B', cuposOcupados: 3, cuposTotal: 3,
    clientes: [
      { posicion: 1, nombre: 'Nike', ejecutivo: 'Juan Torres', rubro: 'Deportes', fechaSolicitud: '2026-03-01', prioridad: 'alta' }
    ]
  }
]

export default function ListaEsperaView() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-6" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">📋 Listas de Espera (Mejora 7)</h3>
          <p className="text-xs text-gray-400">Colas priorizadas por programa — Notificación automática al liberarse cupo</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 text-xs font-medium">
          {LISTAS_ESPERA_MOCK.reduce((s, l) => s + l.clientes.length, 0)} clientes en espera
        </span>
      </div>

      <div className="space-y-6">
        {LISTAS_ESPERA_MOCK.map((lista, i) => (
          <div key={`${lista}-${i}`} className="rounded-xl border border-gray-200 bg-white/3 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">📻</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{lista.programa}</h4>
                  <p className="text-xs text-gray-400">{lista.tipo} | {lista.cuposOcupados}/{lista.cuposTotal} ocupados (100%)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold">SIN CUPOS</span>
            </div>

            <div className="space-y-2">
              {lista.clientes.map(cl => (
                <div key={cl.posicion} className="flex items-center gap-4 rounded-lg p-3 bg-white/70 hover:bg-white/60 transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${cl.posicion === 1 ? 'bg-amber-50 text-amber-600' : 'bg-white/60 text-gray-500'}`}>
                    #{cl.posicion}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{cl.nombre}</p>
                    <p className="text-xs text-gray-400">{cl.rubro} | Ejecutivo: {cl.ejecutivo} | Solicitado: {cl.fechaSolicitud}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cl.prioridad === 'alta' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {cl.prioridad === 'alta' ? '🔥 Alta' : '⚡ Media'}
                    </span>
                    <button className="px-2 py-1 rounded-lg bg-white/70 text-gray-500 text-xs hover:bg-white/60 transition-all">
                      📧 Notificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
