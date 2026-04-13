'use client'

export default function EmisoraDetailView() {
  const topPerformers = [
    { 
       titulo: 'SONAR INFORMATIVO', estado: 'lider', horario: 'L - V | 07:00-09:00', cupos: '25/25', ocupacion: 100,
       revenue: '$78M', tarifa: '$3.5M/mes', tipoa: 20, tipob: 5, espera: 8
    },
    { 
       titulo: 'CONVERSATORIO "SONAR DEPORTIVO"', estado: 'oportunidad', horario: 'L - V | 19:00-20:00', cupos: '1/2', ocupacion: 50,
       revenue: '$24M', tarifa: '$2M/mes', tipoa: 1, tipob: 0, alerta: 'Cupo premium disponible'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="rounded-2xl border border-gray-200 p-5 bg-white/70 backdrop-blur-md flex items-center justify-between">
         <div className="flex items-center gap-4">
            <span className="text-4xl">📻</span>
            <div>
               <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest">SONAR FM</h2>
               <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Inventario Activo
               </p>
            </div>
         </div>
         <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ocupación</p>
               <p className="text-emerald-600 font-black text-xl">82% <span className="text-[10px] text-gray-400">(49/60)</span></p>
            </div>
            <div className="text-center">
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Revenue</p>
               <p className="text-amber-600 font-black text-xl">$245M</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Programas</p>
               <p className="text-gray-800 font-black text-xl">15</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Vencen Próx.</p>
               <p className="text-red-600 font-black text-xl">4</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div>
             <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="text-lg">🏆</span> TOP PERFORMERS
             </h3>
             <div className="space-y-4">
                {topPerformers.map((p, i) => (
                   <div key={`${p}-${i}`} className={`rounded-xl border p-5 transition-all w-full relative overflow-hidden group hover:border-gray-200 hover:bg-white/90 ${p.estado === 'lider' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                      {p.estado === 'lider' && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full blur-2xl"></div>}
                      {p.estado === 'oportunidad' && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-2xl"></div>}
                      
                      <div className="flex items-start justify-between mb-3 relative z-10">
                         <div>
                            <h4 className="font-black text-slate-100 uppercase tracking-wider text-sm flex items-center gap-2">
                               {p.estado === 'lider' ? '🔥' : '📺'} {p.titulo}
                            </h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">⏰ {p.horario}</p>
                         </div>
                         <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.ocupacion === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                               Obj: {p.ocupacion}%
                            </span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 relative z-10">
                         <div className="bg-[#ECEFF8]/50 p-2 rounded-lg border border-gray-200/50">
                            <p className="text-[10px] text-gray-500 uppercase font-black uppercase tracking-widest mb-1">Financiero</p>
                            <p className="text-sm font-bold text-amber-600">{p.revenue} <span className="text-[10px] text-gray-500 font-normal">({p.tarifa})</span></p>
                         </div>
                         <div className="bg-[#ECEFF8]/50 p-2 rounded-lg border border-gray-200/50">
                            <p className="text-[10px] text-gray-500 uppercase font-black uppercase tracking-widest mb-1">Inventario</p>
                            <p className="text-sm font-bold text-gray-600">A: {p.tipoa} | B: {p.tipob}</p>
                         </div>
                      </div>

                      {p.espera && (
                         <div className="mb-3 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-1 flex items-center gap-2 rounded-md w-fit">
                            <span>📋</span> Lista de espera: {p.espera} clientes
                         </div>
                      )}
                      {p.alerta && (
                         <div className="mb-3 text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-1 flex items-center gap-2 rounded-md w-fit animate-pulse">
                            <span>🚨</span> OPORTUNIDAD: {p.alerta}
                         </div>
                      )}

                      <div className="flex gap-2 relative z-10 pt-2 border-t border-gray-200/50">
                         {p.estado === 'lider' ? (
                            <>
                               <button className="flex-1 bg-white/70 hover:bg-white/60 text-[10px] uppercase tracking-widest font-bold py-1.5 rounded text-gray-600 transition-colors">👁️ Detalles</button>
                               <button className="flex-1 bg-white/70 hover:bg-white/60 text-[10px] uppercase tracking-widest font-bold py-1.5 rounded text-gray-600 transition-colors">📈 Analytics</button>
                            </>
                         ) : (
                            <>
                               <button className="flex-1 bg-blue-50 hover:bg-blue-500/30 text-blue-600 text-[10px] uppercase tracking-widest font-bold py-1.5 rounded transition-colors border border-blue-500/20">🎯 Reservar</button>
                               <button className="flex-1 bg-white/70 hover:bg-white/60 text-[10px] uppercase tracking-widest font-bold py-1.5 rounded text-gray-600 transition-colors">💰 Tarifas</button>
                            </>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Alertas */}
          <div>
             <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="text-lg">⚠️</span> ALERTAS Y OPORTUNIDADES
             </h3>
             
             <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 relative overflow-hidden group hover:border-red-500/40 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full blur-2xl"></div>
                
                <h4 className="font-black text-slate-100 uppercase tracking-wider text-sm flex items-center gap-2 mb-1 relative z-10">
                   🚨 SONAR CLÁSICOS
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 relative z-10">⏰ L - V | 11:00-15:00</p>
                
                <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-red-500/10 mb-3 relative z-10">
                   <p className="text-xs text-gray-600 mb-1"><span className="text-amber-600 font-bold">Ocupación:</span> 89% (8/9 cupos)</p>
                   <p className="text-xs text-gray-600 mb-1"><span className="text-red-600 font-bold">Vencimiento:</span> TeleTracker (Mañana)</p>
                   <p className="text-xs text-emerald-600 font-bold mt-2">💡 Acción: Preparar renovación o liberar cupo.</p>
                </div>

                <div className="flex gap-2 relative z-10">
                   <button className="flex-1 bg-red-50 border border-red-500/20 hover:bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold py-2 rounded transition-colors">📞 Contactar Cliente</button>
                   <button className="flex-1 bg-amber-50 border border-amber-500/20 hover:bg-amber-500/30 text-amber-600 text-[10px] uppercase tracking-widest font-bold py-2 rounded transition-colors">🔄 Gestionar Renov</button>
                </div>
             </div>

             <div className="mt-8 grid grid-cols-2 gap-3">
                <button className="bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-xs font-bold py-3 rounded-lg uppercase tracking-widest hover:bg-emerald-50 transition-all">➕ Nuevo Progr.</button>
                <button className="bg-white/70 border border-gray-200 text-gray-600 text-xs font-bold py-3 rounded-lg uppercase tracking-widest hover:bg-white/60 transition-all">📊 Ver Todos</button>
             </div>
          </div>
      </div>
    </div>
  )
}
