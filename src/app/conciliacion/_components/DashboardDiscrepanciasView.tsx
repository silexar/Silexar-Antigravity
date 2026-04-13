"use client";

import React, { useState } from 'react';

interface SelectedSpot {
  id: string;
  ejecutivo: string;
}

// Mock Component for Dashboard de Discrepancias
export default function DashboardDiscrepanciasView() {
  const [filter, setFilter] = useState('Todas');
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<SelectedSpot | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleConsultSales = (spot: SelectedSpot) => {
    setSelectedSpot(spot);
    setShowSalesModal(true);
  };


  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-[#2C2C2A]">❌ Análisis de Discrepancias (Control de Tráfico)</h2>
         <div className="flex gap-2">
           {['Todas', 'Críticas', 'En Consulta Ventas', 'Resueltas'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filter === f ? 'bg-indigo-600 text-[#2C2C2A] shadow-lg' : 'bg-[#E8E5E0] text-[#888780] hover:bg-[#D4D1CC]'}`}
             >
               {f}
             </button>
           ))}
         </div>
      </div>

      <div className="neo-card p-0 bg-[#E8E5E0]/80 border border-[#D4D1CC] rounded-2xl shadow-xl overflow-hidden">
         {/* ITEM CRÍTICO - PENDIENTE TRAFICO */}
         <div className="p-5 border-b border-white/5 hover:bg-[#D4D1CC]/30 transition-colors flex gap-4 items-start">
            <input 
              type="checkbox" 
              checked={selectedIds.includes('SP123456')} 
              onChange={() => toggleSelect('SP123456')}
              className="mt-4 w-5 h-5 rounded border-[#CCCAC5] bg-[#F0EDE8] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <div className="flex-1 flex justify-between items-start">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex justify-center items-center text-red-500 text-xl">
                   🚫
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-[#2C2C2A] text-lg">SP123456</span>
                     <span className="px-2 py-0.5 rounded-full bg-[#D4D1CC] text-[#5F5E5A] text-xs">Banco Chile</span>
                     <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium">CRÍTICA</span>
                   </div>
                   <div className="text-sm text-[#888780]">
                     📻 Radio Corazón • Programado: 06:15:30 • Ejecutivo: 👤 Juan Pérez (Ventas)
                   </div>
                   <div className="mt-2 text-sm text-[#5F5E5A] bg-[#F0EDE8]/50 p-2 rounded-lg border border-[#D4D1CC] flex justify-between items-center">
                      <div>
                        <span className="text-red-400 font-medium">Motivo:</span> NO EMITIDO (Falla técnica en bloque)
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                         <span className="text-emerald-500 text-[10px] font-bold">QC PASS</span>
                         <span className="text-[10px] text-[#888780]">Audio OK</span>
                      </div>
                   </div>
                   <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#888780] tracking-wider">Estado Decision:</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold">PENDIENTE TRAFICO</span>
                   </div>
                 </div>
               </div>
               <div className="flex flex-col gap-2 items-end">
                  <div className="text-right">
                    <div className="text-sm text-[#888780]">Valor Comercial</div>
                    <div className="text-lg font-bold text-emerald-400">$85,000</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleConsultSales({id: 'SP123456', ejecutivo: 'Juan Pérez'})}
                      className="px-4 py-2 bg-[#D4D1CC] hover:bg-slate-600 text-[#2C2C2A] rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      📧 Consultar a Ventas
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#2C2C2A] rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-600/20">
                      ⚡ Recuperar Ahora
                    </button>
                  </div>
               </div>
            </div>
         </div>

         {/* ITEM EN CONSULTA - ESPERANDO VENTAS */}
         <div className="p-5 border-b border-white/5 hover:bg-[#D4D1CC]/30 transition-colors bg-indigo-500/5 flex gap-4 items-start">
            <input 
              type="checkbox" 
              checked={selectedIds.includes('SP998877')} 
              onChange={() => toggleSelect('SP998877')}
              className="mt-4 w-5 h-5 rounded border-[#CCCAC5] bg-[#F0EDE8] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <div className="flex-1 flex justify-between items-start">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex justify-center items-center text-indigo-500 text-xl">
                   ⏳
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-[#2C2C2A] text-lg">SP998877</span>
                     <span className="px-2 py-0.5 rounded-full bg-[#D4D1CC] text-[#5F5E5A] text-xs">Entel Verano</span>
                     <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium">ALTA</span>
                   </div>
                   <div className="text-sm text-[#888780]">
                     📻 Play FM • Ejecutivo: 👤 María García (Ventas)
                   </div>
                   <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#888780] tracking-wider">Estado Decision:</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold animate-pulse">ESPERANDO RESPUESTA DE VENTAS</span>
                   </div>
                   <div className="mt-2 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded inline-flex items-center gap-1">
                      <span>⚠️ MATERIAL NO ENCONTRADO</span>
                   </div>
                 </div>
               </div>
               <div className="flex flex-col gap-2 items-end justify-center">
                  <button className="px-4 py-2 bg-[#E8E5E0] text-[#888780] rounded-lg text-sm font-medium border border-white/5 cursor-not-allowed">
                    En Proceso...
                  </button>
               </div>
            </div>
         </div>

         {/* ITEM RECUPERADO AUTOMÁTICO */}
         <div className="p-5 border-b border-white/5 hover:bg-[#D4D1CC]/30 transition-colors opacity-90">
            <div className="flex justify-between items-start">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex justify-center items-center text-emerald-500 text-xl">
                   🔄
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-[#2C2C2A] text-lg">SP789012</span>
                     <span className="px-2 py-0.5 rounded-full bg-[#D4D1CC] text-[#5F5E5A] text-xs">Coca Cola</span>
                     <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium">RECUPERADO</span>
                   </div>
                   <div className="text-sm text-[#888780]">
                     📻 Play FM • Programado Original: 08:22:15
                   </div>
                   <div className="mt-2 text-sm text-[#5F5E5A] bg-emerald-900/10 p-2 rounded-lg border border-emerald-500/20">
                     <span className="text-emerald-400 mr-2">🤖 Acción IA:</span> 
                     Re-programado automáticamente para 19:30:00 (Prime Vespertino)
                   </div>
                 </div>
               </div>
               <div className="flex flex-col justify-end items-end h-full">
                  <button className="px-4 py-2 mt-auto bg-[#D4D1CC] hover:bg-slate-600 text-[#5F5E5A] rounded-lg text-sm font-medium transition-colors border border-white/5">
                    Ver Trazabilidad
                  </button>
               </div>
            </div>
         </div>
         
         {/* ITEM MENOR */}
         <div className="p-5 hover:bg-[#D4D1CC]/30 transition-colors opacity-80">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex justify-center items-center text-amber-500 text-lg">
                   ⏱️
                 </div>
                 <div>
                   <div className="font-medium text-[#2C2C2A]">SP345678 - Entel</div>
                   <div className="text-xs text-[#888780] mt-1">Error de timing leve: Emitido 15s después. No requiere acción.</div>
                 </div>
               </div>
               <span className="text-xs text-[#888780]">Resuelto automáticamente</span>
            </div>
         </div>
      </div>


      {/* MODAL PUENTE TRAFICO-VENTAS */}
      {showSalesModal && selectedSpot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#F5F2EE]/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#F0EDE8] border border-[#D4D1CC] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                   <span className="text-xl">📧</span> Consultar a Ventas
                 </h3>
                 <button onClick={() => setShowSalesModal(false)} className="text-[#888780] hover:text-[#2C2C2A] text-2xl">×</button>
              </div>
              
              <div className="p-6 space-y-4">
                 <div className="bg-[#E8E5E0]/50 p-3 rounded-xl border border-white/5">
                    <div className="text-xs text-[#888780] uppercase font-bold mb-1">Ficha de Discrepancia</div>
                    <div className="text-sm font-medium text-[#2C2C2A]">{selectedSpot.id} - Banco Chile</div>
                    <div className="text-[10px] text-[#888780] mt-1 italic">Este aviso no se emitió por falla técnica.</div>
                 </div>

                 <div>
                    <label className="text-xs text-[#888780] font-bold uppercase mb-2 block">Enviar a Ejecutivo</label>
                    <div className="flex items-center gap-3 p-3 bg-[#E8E5E0] rounded-xl border border-indigo-500/30 shadow-inner">
                       <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">👤</div>
                       <div>
                          <div className="text-sm font-bold text-[#2C2C2A]">{selectedSpot.ejecutivo}</div>
                          <div className="text-[10px] text-[#888780]">Ejecutivo de Ventas Responsable</div>
                       </div>
                    </div>
                 </div>

               <div>
                    <label className="text-xs text-[#888780] font-bold uppercase mb-2 block">Nota para Ejecutivo</label>
                    <textarea 
                      placeholder="Ej: Hola Juan, el aviso de Banco Chile falló. ¿Aún tenemos tiempo de recuperarlo en el bloque de las 19:00 o la campaña ya cerró?"
                      className="w-full bg-[#E8E5E0] border border-white/5 rounded-xl px-4 py-3 text-sm text-[#5F5E5A] focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] resize-none"
                    ></textarea>
                 </div>
              </div>

              <div className="p-6 bg-[#E8E5E0]/30 border-t border-white/5 flex gap-3">
                 <button 
                   onClick={() => setShowSalesModal(false)}
                   className="flex-1 px-4 py-2.5 bg-[#D4D1CC] hover:bg-slate-600 text-[#2C2C2A] rounded-xl text-sm font-medium transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={async () => {
                     try {
                        const response = await fetch('/api/conciliacion', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'x-user-role': 'TRAFFIC'
                            },
                            body: JSON.stringify({
                                action: 'consultar-ventas',
                                spotId: selectedSpot?.id,
                                ejecutivoId: 'exec_id_123',
                                mensaje: 'Consulta enviada desde el dashboard de conciliación.'
                            })
                        });
                        if (response.ok) {
                            setShowSalesModal(false);
                            alert('Información enviada al ejecutivo de ventas. Se ha registrado en la bitácora de tráfico.');
                        }
                     } catch {
                         alert('Error conectando con el servidor');
                     }
                   }}
                   className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[#2C2C2A] rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20"
                 >
                   Enviar Consulta
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* BARRA DE ACCIONES MASIVAS */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-indigo-600 text-[#2C2C2A] px-6 py-4 rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center gap-6 border border-white/20 backdrop-blur-md bg-opacity-90">
             <div className="flex items-center gap-2 border-r border-white/20 pr-6">
                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">
                  {selectedIds.length}
                </span>
                <span className="font-bold text-sm">Seleccionados</span>
             </div>
             
             <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    const res = await fetch('/api/conciliacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-user-role': 'TRAFFIC' },
                        body: JSON.stringify({
                            action: 'accion-masiva',
                            spotIds: selectedIds,
                            tipoAccion: 'CONSULTAR_VENTAS',
                            mensajeComun: 'Consulta masiva generada por Tráfico'
                        })
                    });
                    if (res.ok) {
                        alert(`Consulta enviada para ${selectedIds.length} spots`);
                        setSelectedIds([]);
                    }
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                  📧 Consultar Ventas (Múltiple)
                </button>
                <button 
                   onClick={async () => {
                     const res = await fetch('/api/conciliacion', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'x-user-role': 'TRAFFIC' },
                         body: JSON.stringify({
                             action: 'accion-masiva',
                             spotIds: selectedIds,
                             tipoAccion: 'RECUPERAR_AHORA'
                         })
                     });
                     if (res.ok) {
                         alert(`Recuperación masiva exitosa para ${selectedIds.length} spots`);
                         setSelectedIds([]);
                     }
                   }}
                   className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-xl text-xs font-black transition-all shadow-lg"
                >
                  ⚡ RECUPERAR MASIVO
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-2 text-[#2C2C2A]/70 hover:text-[#2C2C2A] text-xs font-medium"
                >
                  Cancelar
                </button>
             </div>

          </div>
        </div>
      )}
    </div>
  );
}



