'use client'

export default function GlobalMetricsBanner() {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-gradient-to-r from-slate-900/80 to-indigo-950/50 backdrop-blur-xl mb-6 shadow-2xl overflow-hidden relative group">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📊</span> ESTADO INVENTARIO GLOBAL TIEMPO REAL
          </h2>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-semibold text-[10px]">Visión Ejecutiva Multiemisora</p>
        </div>

        {/* Global Metrics Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
           {[
             { title: 'Ocupación Global', val: '78%', sub: '234/300 cupos', col: 'text-emerald-600' },
             { title: 'Revenue Mensual', val: '$890M', sub: 'De $1.2B (74%)', col: 'text-amber-600' },
             { title: 'Vencimientos Hoy', val: '12', sub: 'Auspicios finalizan', col: 'text-orange-600' },
             { title: 'Alertas Críticas', val: '3', sub: 'Sin cupos disp.', col: 'text-red-600' },
             { title: 'Oportunidades', val: '45', sub: 'Cupos premium', col: 'text-blue-600' },
             { title: 'Top Programa', val: 'Mesa Cen.', sub: '$125M mensual', col: 'text-purple-600' }
           ].map((m, i) => (
              <div key={`${m}-${i}`} className="bg-[#ECEFF8]/50 border border-gray-200/50 rounded-xl p-3 flex flex-col justify-center">
                 <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1 truncate">{m.title}</p>
                 <p className={`text-xl font-black ${m.col}`}>{m.val}</p>
                 <p className="text-[10px] text-gray-400 truncate mt-0.5">{m.sub}</p>
              </div>
           ))}
        </div>
      </div>
    </div>
  )
}
