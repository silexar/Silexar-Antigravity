'use client'



export default function DashboardDisponibilidadInteligente() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
            <span className="text-2xl">🎯</span> MESA CENTRAL MATINAL - GESTIÓN DE CUPOS
         </h2>
         <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">🔄 Actualizar</button>
            <button className="bg-indigo-500/10 hover:bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">📊 Analytics</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* COLUMNA IZQUIERDA: Tipo A */}
         <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 relative overflow-hidden backdrop-blur-md">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] blur-2xl"></div>
               <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex justify-between items-center">
                  <span>🏆 AUSPICIO TIPO A</span>
                  <span className="text-[10px] bg-[#ECEFF8]/50 px-2 py-1 rounded border border-gray-200/50 text-gray-600">8 Cupos Máx</span>
               </h3>

               {/* Ocupados */}
               <div className="mb-6">
                  <p className="text-[10px] font-black text-gray-800 uppercase mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                     OCUPADOS (6/8)
                  </p>
                  <div className="space-y-2">
                     {[
                        {n: '1. Banco de Chile', v: '01-Ene a 31-Mar', p: '$4.5M/mes', e: 'Ana García', s: '🟢 Activo', d: 'Vence en: 59 días'},
                        {n: '2. Movistar', v: '15-Ene a 15-Abr', p: '$4.5M/mes', e: 'Ana García', s: '🟢 Activo', d: 'Vence en: 74 días'},
                        {n: '3. Chevrolet', v: '01-Feb a 30-Abr', p: '$4.5M/mes', e: 'Carlos Mendoza', s: '🔴 Pendiente', d: 'Inicia en: 10 días'},
                        {n: '4. Cencosud', v: '01-Ene a 28-Feb', p: '$4.2M/mes', e: 'Carlos Mendoza', s: '🟢 Activo', d: 'Vence en: 28 días'},
                        {n: '5. Clínica Alemana', v: '01-Ene a 31-Dic', p: '$51M/año', e: 'Ana García', s: '🟢 Activo', d: 'Vence en: 334 días'},
                        {n: '6. Entel', v: '15-Ene a 15-Jul', p: '$27M/6meses', e: 'Ana García', s: '🟢 Activo', d: 'Vence en: 165 días'}
                     ].map((item, i) => (
                        <div key={i} className="bg-[#ECEFF8]/40 border border-gray-200/50 rounded-xl p-3 hover:border-gray-200 transition-colors">
                           <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-black text-gray-800">{item.n}</p>
                              <p className="text-[10px] text-gray-500">{item.s}</p>
                           </div>
                           <p className="text-[10px] text-gray-500 mb-2">Vigencia: {item.v}</p>
                           <div className="flex justify-between items-end border-t border-gray-200/50 pt-2">
                              <div>
                                 <p className="text-[10px] text-emerald-600 font-bold">{item.p}</p>
                                 <p className="text-[9px] text-gray-500">👤 {item.e}</p>
                              </div>
                              <p className={`text-[9px] font-black uppercase px-2 py-1 rounded ${item.d.includes('Vence') ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>{item.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Disponibles */}
               <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase mb-3 flex items-center gap-2">
                     <span>💎</span> DISPONIBLES (2/8)
                  </p>
                  <div className="space-y-3">
                     <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <p className="text-xs font-black text-amber-500">🎯 CUPO 7: INMEDIATO</p>
                              <p className="text-[10px] text-gray-500">Disponible desde: <span className="text-gray-800 font-bold">HOY</span></p>
                           </div>
                           <span className="bg-red-50 text-red-600 text-[8px] font-black uppercase px-2 py-1 rounded animate-pulse">🚨 Oportunidad</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mb-3">Precio: <span className="font-bold text-emerald-600">$4,500,000/mes</span> (Mín: 3 meses)</p>
                        <div className="flex gap-2">
                           <button className="flex-1 bg-amber-500 text-slate-900 border border-amber-500 py-1.5 rounded-lg font-bold uppercase text-[9px]">🎯 Reservar</button>
                           <button className="flex-1 bg-white/70 text-amber-500 border border-amber-500/30 py-1.5 rounded-lg font-bold uppercase text-[9px]">💰 Negociar</button>
                        </div>
                     </div>

                     <div className="bg-[#ECEFF8]/60 border border-slate-500/30 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <p className="text-xs font-black text-gray-800">🎯 CUPO 8: DESDE MARZO</p>
                              <p className="text-[10px] text-gray-500">Desde: <span className="text-gray-800 font-bold">01 Marzo</span> (post Cencosud)</p>
                           </div>
                        </div>
                        <p className="text-[10px] text-gray-500 italic mb-3">✨ Pre-reserva disponible con 10% descuento.</p>
                        <div className="flex gap-2">
                           <button className="flex-1 bg-slate-800 text-emerald-600 border border-emerald-500/30 py-1.5 rounded-lg font-bold uppercase text-[9px]">📅 Pre-reservar</button>
                           <button className="flex-1 bg-white/70 text-indigo-600 border border-indigo-500/30 py-1.5 rounded-lg font-bold uppercase text-[9px]">💡 Alertar</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* COLUMNA DERECHA: Tipo B y Menciones */}
         <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 relative overflow-hidden backdrop-blur-md">
               <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-4 flex justify-between items-center">
                  <span>🥈 AUSPICIO TIPO B</span>
                  <span className="text-[10px] bg-[#ECEFF8]/50 px-2 py-1 rounded border border-gray-200/50 text-gray-500">4 Cupos</span>
               </h3>
               
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                     <p className="text-[9px] font-black text-emerald-500 uppercase mb-2">🟢 OCUPADOS (2/4)</p>
                     <ul className="text-[10px] space-y-2 text-gray-600">
                        <li>• Falabella <span className="text-gray-500 block">(vence 15-Abr)</span></li>
                        <li>• Paris <span className="text-gray-500 block">(vence 30-Jun)</span></li>
                     </ul>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                     <p className="text-[9px] font-black text-amber-500 uppercase mb-2">💎 DISPONIBLES (2/4)</p>
                     <ul className="text-[10px] space-y-2 text-gray-600">
                        <li>• Inmediato <span className="text-emerald-600 font-bold block">$2.2M</span></li>
                        <li>• Desde Abril <span className="text-gray-500 block">(post Falabella)</span></li>
                     </ul>
                  </div>
               </div>
            </div>

            <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 relative overflow-hidden backdrop-blur-md">
               <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex justify-between items-center">
                  <span>🎙️ MENCIONES</span>
                  <span className="text-[10px] bg-[#ECEFF8]/50 px-2 py-1 rounded border border-gray-200/50 text-gray-500">20 Disp.</span>
               </h3>

               <div className="bg-[#ECEFF8]/40 border border-gray-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="flex-1 h-3 bg-white/80 rounded-full overflow-hidden border border-gray-200/50">
                        <div className="h-full bg-indigo-500 w-[70%]"></div>
                     </div>
                     <span className="text-[10px] font-black text-gray-800">70% Ocup.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-200/50 pt-4 mb-4 text-[10px]">
                     <div>
                        <p className="text-gray-500 mb-1">🟢 Ocupadas</p>
                        <p className="font-black text-lg text-gray-800">14<span className="text-[10px] text-gray-500 font-normal">/20</span></p>
                     </div>
                     <div>
                        <p className="text-amber-600 mb-1">💎 Libres</p>
                        <p className="font-black text-lg text-gray-800">6<span className="text-[10px] text-gray-500 font-normal">/20</span></p>
                     </div>
                  </div>

                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                     <p className="text-[9px] text-indigo-600 font-black uppercase mb-2">📦 Paquetes Disponibles</p>
                     <ul className="text-[10px] text-gray-600 space-y-1">
                        <li className="flex justify-between"><span>• 1 mención suelta</span> <span className="text-gray-800">$180,000</span></li>
                        <li className="flex justify-between"><span>• 5 menciones (-5%)</span> <span className="text-emerald-600">$855,000</span></li>
                        <li className="flex justify-between"><span>• 6 menciones (-10%)</span> <span className="text-emerald-600 font-bold">$972,000</span></li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
