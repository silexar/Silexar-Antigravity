'use client'

import { useState, useRef, useEffect } from 'react';

export default function MobileCentroAlertasProgramadoresView() {
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touchY = e.touches[0].clientY;
      const windowHeight = window.innerHeight;
      const newDragY = Math.max(0, touchY - (windowHeight * 0.15));
      setDragY(newDragY);
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 150) {
      setShowModal(false);
    }
    setDragY(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white/70 p-3 rounded-xl border border-gray-200/50">
         <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span>🚨</span> ALERTAS DE SISTEMA
         </h2>
         <button className="bg-slate-800 text-gray-600 border border-gray-200 px-2 py-1.5 rounded font-bold uppercase text-[9px]">⚙️ Config</button>
      </div>

      {/* ALERTAS CRÍTICAS */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
         ⚡ CRÍTICAS (ACCIÓN REQUERIDA)
      </h3>

      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 relative overflow-hidden backdrop-blur-md">
         <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[100px] blur-xl animate-pulse"></div>
         
         <div className="flex justify-between items-start mb-3 relative z-10">
            <h4 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
               <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
               NUEVO AUSPICIO
            </h4>
            <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-500/20">HOY</span>
         </div>

         <div className="bg-[#ECEFF8]/40 border border-gray-200/50 rounded-lg p-3 relative z-10 mb-4">
            <p className="text-gray-800 font-bold text-sm mb-2">Chevrolet Chile</p>
            <p className="text-[10px] text-gray-500 mb-1">📻 Mesa Central (SONAR FM)</p>
            <p className="text-[10px] text-gray-500 mb-2">💰 Valor: <span className="text-emerald-600 font-black">$4.5M/mes</span></p>
            
            <p className="text-[9px] text-amber-600 font-bold mb-2">Inicia: MAÑANA (01 Febrero)</p>

            <button onClick={() => setShowModal(true)} className="w-full bg-red-600 text-white py-2 rounded-lg font-black uppercase text-[10px] shadow-[0_0_10px_rgba(220,38,38,0.4)]">
               Confirmar & Activar
            </button>
            <button className="w-full mt-2 bg-white/70 text-gray-500 border border-gray-200 py-1.5 rounded-lg font-bold uppercase text-[9px]">
               Ver Detalles / Posponer
            </button>
         </div>
      </div>

      {/* ALERTAS DE VENCIMIENTO */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mt-4">
         🟡 VENCIMIENTOS (7 DÍAS)
      </h3>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 relative overflow-hidden backdrop-blur-md">
         <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
               📅 PREPARAR CAMBIOS
            </h4>
         </div>

         <p className="text-sm font-bold text-gray-800 mb-1">Cencosud</p>
         <p className="text-[10px] text-gray-500 mb-2">Mesa Central Matinal</p>
         <div className="bg-[#ECEFF8]/40 p-2 rounded border border-gray-200/50 flex justify-between items-center mb-3">
            <span className="text-[9px] text-gray-500 uppercase">Finaliza en:</span>
            <span className="text-[10px] text-amber-600 font-black">28 Días (28 Feb)</span>
         </div>

         <div className="flex gap-2">
            <button className="flex-1 bg-slate-800 text-gray-600 border border-gray-200 py-1.5 rounded-lg font-bold uppercase text-[9px]">📝 Tareas</button>
            <button className="flex-1 bg-amber-50 text-amber-600 border border-amber-500/30 py-1.5 rounded-lg font-black uppercase text-[9px]">✅ OK</button>
         </div>
      </div>

      {/* LOG RECIENTE */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mt-4">
         🟢 LOG RECIENTE
      </h3>

      <div className="rounded-xl border border-emerald-500/10 bg-white/70 p-4 relative overflow-hidden backdrop-blur-md mb-6">
         <div className="space-y-2">
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
               <div className="flex justify-between items-center">
                  <p className="text-[10px] text-gray-800 font-bold">Banco de Chile</p>
                  <p className="text-[8px] text-emerald-500/50">Hace 2h</p>
               </div>
               <p className="text-[9px] text-gray-500 mt-0.5">Renovación hasta 31-Marzo.</p>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
               <div className="flex justify-between items-center">
                  <p className="text-[10px] text-gray-800 font-bold">Movistar</p>
                  <p className="text-[8px] text-emerald-500/50">Ayer</p>
               </div>
               <p className="text-[9px] text-gray-500 mt-0.5">Inicio confirmado (15-Ene).</p>
            </div>
         </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMACIÓN MOBILE (Swipeable Bottom Sheet)     */}
      {/* ========================================================= */}
      {showModal && (
         <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden">
            <div 
              className="absolute inset-0 bg-[#ECEFF8]/90 backdrop-blur-md transition-opacity duration-300" 
              onClick={() => setShowModal(false)}
              style={{ opacity: 1 - (dragY / 500) }}
            />
            
            <div 
              className="bg-white/90 backdrop-blur-3xl border-t border-white/50 rounded-t-3xl w-full flex flex-col relative transition-transform duration-0 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
              style={{ 
                height: '85vh', 
                transform: `translateY(${dragY}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
              }}
            >
               {/* Drag Handle Area */}
               <div 
                 className="w-full pt-3 pb-4 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing relative z-10"
                 onTouchStart={handleTouchStart}
                 onTouchMove={handleTouchMove}
                 onTouchEnd={handleTouchEnd}
               >
                 <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
               </div>
               
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500 shrink-0"></div>
               
               {/* Modal Header */}
               <div className="px-5 pb-4 border-b border-gray-100 flex justify-between items-center bg-transparent shrink-0">
                  <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                     <span className="text-emerald-500">✅</span> CONFIRMAR INICIO
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">&times;</button>
               </div>

               {/* Modal Body */}
               <div 
                 className="p-5 overflow-y-auto space-y-4 pb-24 touch-pan-y"
                 onScroll={(e) => e.stopPropagation()}
               >
                  <p className="text-[10px] text-gray-600 font-medium">Se ejecutarán las siguientes automatizaciones:</p>
                  
                  <div className="bg-[#ECEFF8]/40 p-3 rounded-2xl border border-gray-100">
                     <h4 className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-2">✅ BASE DE DATOS:</h4>
                     <ul className="text-[10px] text-gray-600 space-y-1.5 ml-1">
                        <li>• "Pendiente" → "Activo" <span className="text-emerald-500">🟢</span></li>
                        <li>• Actualizar disponibilidad de cupos</li>
                        <li>• Sincronizar con Contratos y Tracking</li>
                     </ul>
                  </div>

                  <div className="bg-[#ECEFF8]/40 p-3 rounded-2xl border border-indigo-500/10">
                     <h4 className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mb-2">📧 NOTIFICACIONES:</h4>
                     <ul className="text-[10px] text-gray-600 space-y-1.5 ml-1">
                        <li>• <span className="font-bold text-gray-800">Ejecutivo:</span> Activación OK</li>
                        <li>• <span className="font-bold text-gray-800">Locutor:</span> Presentaciones vigentes</li>
                        <li>• <span className="font-bold text-gray-800">Finanzas:</span> Iniciar facturación</li>
                     </ul>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                     <h4 className="text-[9px] text-amber-600 font-black uppercase tracking-widest mb-1.5">⚠️ IMPORTANTE:</h4>
                     <p className="text-[10px] text-amber-800">Coordinar con producción sonora el material "Mesa Central con Chevrolet" <strong>antes de MAÑANA 07:00 Hrs.</strong></p>
                  </div>
               </div>

                {/* Modal Footer */}
               <div className="p-4 border-t border-gray-100 bg-white/90 absolute bottom-0 left-0 w-full backdrop-blur-xl pb-8">
                  <div className="flex gap-2">
                     <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl font-bold uppercase text-[10px] text-gray-500 bg-gray-100 active:bg-gray-200 transition-colors">Cancelar</button>
                     <button onClick={() => setShowModal(false)} className="flex-[2] py-3.5 rounded-2xl font-black uppercase text-[10px] text-white bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-200/50 transition-all">
                        Confirmar y Activar
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

