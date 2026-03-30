'use client'



export default function MobileDisponibilidadInteligente() {
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white/70 p-3 rounded-xl border border-gray-200/50">
         <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span>🎯</span> GESTIÓN MATINAL
         </h2>
         <button className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 px-2 py-1.5 rounded font-bold uppercase text-[9px]">📊 Analytics</button>
      </div>

      {/* BLOQUE TIPO A */}
      <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden backdrop-blur-md">
         <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-[100px] blur-xl"></div>
         
         <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex justify-between items-center">
            <span>🏆 AUSPICIO TIPO A</span>
            <span className="text-[9px] bg-[#ECEFF8] px-1.5 py-0.5 rounded text-gray-600">8 Máximo</span>
         </h3>

         {/* Ocupados */}
         <div className="mb-4">
            <p className="text-[9px] font-black text-gray-800 uppercase mb-2 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OCUPADOS (6/8)
            </p>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 snap-x">
               {[
                  {n: 'Banco de Chile', v: '01-Ene a 31-Mar', p: '$4.5M/mes', e: 'Ana García', s: '🟢 Activo', d: 'En: 59 días'},
                  {n: 'Movistar', v: '15-Ene a 15-Abr', p: '$4.5M/mes', e: 'Ana García', s: '🟢 Activo', d: 'En: 74 días'},
                  {n: 'Chevrolet', v: '01-Feb a 30-Abr', p: '$4.5M/mes', e: 'C. Mendoza', s: '🔴 Pendiente', d: 'En: 10 días'},
                  {n: 'Cencosud', v: '01-Ene a 28-Feb', p: '$4.2M/mes', e: 'C. Mendoza', s: '🟢 Activo', d: 'En: 28 días'}
               ].map((item, i) => (
                  <div key={i} className="min-w-[200px] snap-center bg-[#ECEFF8]/40 border border-gray-200/50 rounded-xl p-3">
                     <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black text-gray-800 truncate pr-2">{item.n}</p>
                        <p className="text-[8px] text-gray-500 shrink-0">{item.s}</p>
                     </div>
                     <p className="text-[9px] text-gray-500 mb-2 truncate">Vigencia: {item.v}</p>
                     <div className="flex justify-between items-center border-t border-gray-200/50 pt-2 mt-auto">
                        <p className="text-[10px] text-emerald-600 font-bold">{item.p}</p>
                        <p className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${item.d.includes('Vence') ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>{item.d}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Disponibles */}
         <div>
            <p className="text-[9px] font-black text-amber-600 uppercase mb-2 flex items-center gap-1">
               <span>💎</span> DISPONIBLES (2/8)
            </p>
            <div className="space-y-2">
               <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-[10px] font-black text-amber-500">🎯 CUPO 7 (INMEDIATO)</p>
                     <span className="bg-red-50 text-red-600 text-[8px] font-black uppercase px-1 py-0.5 rounded animate-pulse">Oportunidad</span>
                  </div>
                  <p className="text-[9px] text-gray-600 mb-2">Precio: <span className="font-bold text-emerald-600">$4.5M/mes</span></p>
                  <div className="flex gap-2">
                     <button className="flex-1 bg-amber-500 text-slate-900 border border-amber-500 py-1.5 rounded-lg font-bold uppercase text-[9px]">Reservar</button>
                     <button className="flex-1 bg-white/70 text-amber-500 border border-amber-500/30 py-1.5 rounded-lg font-bold uppercase text-[9px]">Negociar</button>
                  </div>
               </div>

               <div className="bg-[#ECEFF8]/60 border border-slate-500/30 rounded-xl p-3">
                  <p className="text-[10px] font-black text-gray-800 mb-1">🎯 CUPO 8: DESDE MARZO (post Cencosud)</p>
                  <p className="text-[9px] text-gray-500 italic mb-2">✨ Pre-reserva con 10% dcto.</p>
                  <div className="flex gap-2">
                     <button className="flex-[2] bg-slate-800 text-emerald-600 border border-emerald-500/30 py-1.5 rounded-lg font-bold uppercase text-[9px]">Pre-reservar</button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* BLOQUE TIPO B & MENCIONES */}
      <div className="grid grid-cols-1 gap-4">
         <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 flex justify-between items-center">
               <span>🥈 TIPO B (4 Cupos)</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
               <div className="bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg">
                  <p className="text-[8px] font-black text-emerald-500 uppercase mb-1">🟢 OCUPADOS (2/4)</p>
                  <ul className="text-[9px] text-gray-600 leading-tight">
                     <li>• Falabella <span className="text-gray-500">(Abr)</span></li>
                     <li>• Paris <span className="text-gray-500">(Jun)</span></li>
                  </ul>
               </div>
               <div className="bg-amber-500/5 border border-amber-500/20 p-2 rounded-lg">
                  <p className="text-[8px] font-black text-amber-500 uppercase mb-1">💎 DISPONIBLES (2/4)</p>
                  <ul className="text-[9px] text-gray-600 leading-tight">
                     <li>• Inmediato <span className="text-emerald-600 font-bold">$2.2M</span></li>
                     <li>• D. Abril <span className="text-gray-500">(Post Fal.)</span></li>
                  </ul>
               </div>
            </div>
         </div>

         <div className="rounded-xl border border-gray-200/50 bg-white/80/60 p-4 relative overflow-hidden backdrop-blur-md mb-6">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex justify-between items-center">
               <span>🎙️ MENCIONES</span>
               <span className="text-[9px] bg-[#ECEFF8] px-1.5 py-0.5 rounded text-gray-500">70% Ocupadas</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3 text-[10px] border-b border-gray-200/50 pb-3">
               <div className="bg-[#ECEFF8]/50 p-2 rounded-lg text-center">
                  <p className="text-gray-500 mb-0.5">🟢 Ocupadas</p>
                  <p className="font-black text-sm text-gray-800">14<span className="text-[9px] text-gray-500">/20</span></p>
               </div>
               <div className="bg-[#ECEFF8]/50 p-2 rounded-lg text-center border border-amber-500/20">
                  <p className="text-amber-600 mb-0.5">💎 Libres</p>
                  <p className="font-black text-sm text-gray-800">6<span className="text-[9px] text-gray-500">/20</span></p>
               </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2">
               <p className="text-[8px] text-indigo-600 font-black uppercase mb-1.5">Paquetes Disponibles</p>
               <ul className="text-[9px] text-gray-600 space-y-1">
                  <li className="flex justify-between border-b border-gray-200/50 pb-1"><span>• 5 menciones (-5%)</span> <span className="text-emerald-600">$855,000</span></li>
                  <li className="flex justify-between pt-0.5"><span>• 6 menciones (-10%)</span> <span className="text-emerald-600 font-bold">$972,000</span></li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  )
}
