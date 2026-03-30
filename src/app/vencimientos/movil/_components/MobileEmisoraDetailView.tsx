'use client'

export default function MobileEmisoraDetailView() {
  const topPerformers = [
    { 
       titulo: 'SONAR INFORMATIVO', estado: 'lider', horario: 'L-V | 07:00', ocupacion: 100,
       revenue: '$78M', tarifa: '$3.5M', tipoa: 20, tipob: 5, espera: 8
    },
    { 
       titulo: 'SONAR DEPORTIVO', estado: 'oportunidad', horario: 'L-V | 19:00', ocupacion: 50,
       revenue: '$24M', tarifa: '$2M', tipoa: 1, tipob: 0, alerta: 'Cupo premium'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4">
         <div className="flex items-center gap-3 mb-4 border-b border-gray-200/50 pb-3">
            <span className="text-2xl">📻</span>
            <div>
               <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">SONAR FM</h2>
               <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Inventario Activo
               </p>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#ECEFF8]/50 p-2 rounded-lg text-center">
               <p className="text-[9px] text-gray-400 uppercase font-bold">Ocupación</p>
               <p className="text-emerald-600 font-black text-sm">82% <span className="text-[9px] text-gray-400">(49/60)</span></p>
            </div>
            <div className="bg-[#ECEFF8]/50 p-2 rounded-lg text-center">
               <p className="text-[9px] text-gray-400 uppercase font-bold">Revenue</p>
               <p className="text-amber-600 font-black text-sm">$245M</p>
            </div>
         </div>
      </div>

      {/* Top Performers */}
      <div>
         <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span className="text-base">🏆</span> TOP PERFORMERS
         </h3>
         <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
            {topPerformers.map((p, i) => (
               <div key={i} className={`flex-shrink-0 w-72 rounded-xl border p-4 snap-center relative overflow-hidden ${p.estado === 'lider' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                  {p.estado === 'lider' && <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full blur-xl"></div>}
                  {p.estado === 'oportunidad' && <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full blur-xl"></div>}
                  
                  <div className="flex items-start justify-between mb-2 relative z-10">
                     <div className="flex-1">
                        <h4 className="font-black text-slate-100 uppercase text-xs leading-tight mb-0.5">
                           {p.estado === 'lider' ? '🔥' : '📺'} {p.titulo}
                        </h4>
                        <p className="text-[9px] text-gray-500 uppercase font-bold">⏰ {p.horario}</p>
                     </div>
                     <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.ocupacion === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {p.ocupacion}%
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2 relative z-10">
                     <div>
                        <p className="text-[8px] text-gray-500 uppercase font-black uppercase mb-0.5">Financiero</p>
                        <p className="text-xs font-bold text-amber-600">{p.revenue}</p>
                     </div>
                     <div>
                        <p className="text-[8px] text-gray-500 uppercase font-black uppercase mb-0.5">Inventario</p>
                        <p className="text-[10px] font-bold text-gray-600">A:{p.tipoa} | B:{p.tipob}</p>
                     </div>
                  </div>

                  <div className="flex gap-2 relative z-10 pt-2 border-t border-gray-200/50 mt-2">
                     {p.estado === 'lider' ? (
                        <>
                           <button className="flex-1 bg-white/70 text-[9px] uppercase font-bold py-1.5 rounded text-gray-600">👁️ Ver</button>
                           <button className="flex-1 bg-white/70 text-[9px] uppercase font-bold py-1.5 rounded text-gray-600">Lista: {p.espera}</button>
                        </>
                     ) : (
                        <>
                           <button className="flex-1 bg-blue-50 text-blue-600 text-[9px] uppercase font-bold py-1.5 rounded border border-blue-500/20">🎯 Reservar</button>
                           <button className="flex-1 bg-white/70 text-[9px] uppercase font-bold py-1.5 rounded text-gray-600">💰 {p.tarifa}</button>
                        </>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Alertas */}
      <div>
         <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span className="text-base">⚠️</span> ALERTAS
         </h3>
         
         <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full blur-xl"></div>
            
            <h4 className="font-black text-slate-100 uppercase text-xs mb-1 relative z-10">🚨 SONAR CLÁSICOS</h4>
            <div className="bg-[#ECEFF8]/50 p-2 rounded-lg border border-red-500/10 mb-2 relative z-10">
               <p className="text-[10px] text-red-600 font-bold">Vencimiento: TeleTracker (Mañana)</p>
               <p className="text-[9px] text-emerald-600 font-bold mt-1">💡 Acción: Liberar cupo o renovar.</p>
            </div>
            <div className="flex gap-2 relative z-10">
               <button className="flex-1 bg-red-50 border border-red-500/20 text-red-600 text-[9px] uppercase font-bold py-2 rounded">📞 Llamar</button>
               <button className="flex-1 bg-amber-50 border border-amber-500/20 text-amber-600 text-[9px] uppercase font-bold py-2 rounded">🔄 Renovar</button>
            </div>
         </div>
      </div>
    </div>
  )
}
