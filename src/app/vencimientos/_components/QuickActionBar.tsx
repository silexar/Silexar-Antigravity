'use client'

export default function QuickActionBar() {
  const actions = [
    { key: 'nuevo', label: 'Nuevo Programa', icon: '📅', cl: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600' },
    { key: 'analytics', label: 'Analytics Ocupación', icon: '📊', cl: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600' },
    { key: 'cupos', label: 'Consultar Cupos', icon: '🎯', cl: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-600' },
    { key: 'vencimientos', label: 'Gestión Vencimientos', icon: '⚠️', cl: 'from-red-500/20 to-orange-500/10 border-red-500/30 text-red-600' },
    { key: 'tarifas', label: 'Actualizar Tarifas', icon: '💰', cl: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600' },
    { key: 'contratos', label: 'Sincronizar CRM', icon: '🔄', cl: 'from-slate-500/20 to-slate-400/10 border-slate-500/30 text-gray-600' },
    { key: 'reportes', label: 'Reportes Exec', icon: '📋', cl: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-600' },
    { key: 'movil', label: 'Vista Móvil', icon: '📱', cl: 'from-slate-800/80 to-slate-900 border-gray-200 text-gray-800' }
  ]

  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-white/70 backdrop-blur-md">
       <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2 mb-4">
         <span className="text-amber-500">⚡</span> ACCIONES RÁPIDAS COMERCIALES
       </h3>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map(a => (
             <button 
                key={a.key}
                className={`bg-gradient-to-br ${a.cl} border p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95`}
             >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                   {a.label}
                </span>
             </button>
          ))}
       </div>
    </div>
  )
}
