'use client'

import { useState, useRef, useEffect } from 'react';

export default function CentroAlertasProgramadoresView() {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 - 336 : 300, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (showModal) {
      setPos({ x: window.innerWidth / 2 - 336, y: window.innerHeight / 2 - 250 });
    }
  }, [showModal]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
            <span className="text-2xl">🚨</span> CENTRO DE ALERTAS AUTOMÁTICAS - PROGRAMADORES
         </h2>
         <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">🔄 Actualizar</button>
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">⚙️ Configurar</button>
            <button className="bg-indigo-500/10 hover:bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">📊 Historial</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* COLUMNA 1 & 2: Alertas Activas */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
               ⚡ ALERTAS DE INICIO (Confirmación Requerida)
            </h3>

            {/* ALERTA CRÍTICA */}
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.1)]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] blur-2xl animate-pulse"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <h4 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                     <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                     ALERTA CRÍTICA - ACCIÓN INMEDIATA
                  </h4>
                  <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-500/20">CONFIRMAR HOY</span>
               </div>

               <div className="bg-[#ECEFF8]/40 border border-gray-200/50 rounded-xl p-5 relative z-10 mb-5">
                  <p className="text-gray-800 font-black text-lg mb-4">📅 INICIO DE AUSPICIO DETECTADO</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                     <div>
                        <p className="text-gray-500 text-xs mb-1">Empresa Cliente</p>
                        <p className="text-gray-800 font-bold">Chevrolet Chile</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-xs mb-1">Programa Destino</p>
                        <p className="text-gray-800 font-bold">Mesa Central Matinal (SONAR FM)</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-xs mb-1">Fecha Inicio</p>
                        <p className="text-amber-600 font-black">MAÑANA (01 Febrero 2025)</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-xs mb-1">Valor Comercial</p>
                        <p className="text-emerald-600 font-black">$4,500,000/mes <span className="text-[10px] text-gray-500 font-normal">(Tipo A)</span></p>
                     </div>
                  </div>

                  <div className="border-t border-gray-200/50 pt-4">
                     <p className="text-xs text-indigo-600 font-black uppercase mb-2">🎯 Derechos Mínimos a Activar:</p>
                     <ul className="text-xs text-gray-600 space-y-1.5 grid grid-cols-2">
                        <li>• Presentación apertura de programa</li>
                        <li>• Mención intermedia (1 por bloque)</li>
                        <li>• Cierre de programa locutado</li>
                        <li>• Comercial de 30" en tanda regular</li>
                     </ul>
                  </div>
               </div>

               <div className="relative z-10">
                  <p className="text-gray-800 font-black mb-3 text-center">⚠️ ¿CONFIRMA INICIO DE AUSPICIO PARA MAÑANA?</p>
                  <div className="flex gap-3">
                     <button onClick={() => setShowModal(true)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-black uppercase text-xs transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                        ✅ CONFIRMAR INICIO
                     </button>
                     <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 py-3 rounded-xl font-bold uppercase text-xs transition-colors">
                        ❌ RECHAZAR
                     </button>
                     <button className="flex-1 bg-white/70 hover:bg-white/60 text-gray-600 border border-gray-200 py-3 rounded-xl font-bold uppercase text-xs transition-colors">
                        ⏰ POSPONER 24H
                     </button>
                  </div>
                  <input type="text" placeholder="Comentarios adicionales (Opcional - Razón del rechazo/posposición)..." aria-label="Comentarios adicionales" className="w-full mt-3 bg-[#ECEFF8]/50 border border-gray-200 rounded-lg px-4 py-2 text-xs text-gray-800 outline-none focus:border-red-500/50" />
               </div>
            </div>

            {/* ALERTA DE VENCIMIENTOS */}
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mt-8">
               🟡 ALERTAS DE VENCIMIENTOS (Próximos 7 días)
            </h3>
            
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 relative overflow-hidden backdrop-blur-md">
               <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                     📅 VENCIMIENTOS PRÓXIMO - PREPARAR CAMBIOS
                  </h4>
               </div>

               <div className="flex flex-col md:flex-row justify-between gap-4 text-sm">
                  <div className="flex-1 space-y-2">
                     <p><span className="text-gray-500">Cliente:</span> <span className="text-gray-800 font-bold">Cencosud</span></p>
                     <p><span className="text-gray-500">Programa:</span> <span className="text-gray-800">Mesa Central Matinal</span></p>
                     <p><span className="text-gray-500">Finaliza:</span> <span className="text-amber-600 font-bold">28 Febrero 2025 (28 días)</span></p>
                  </div>
                  
                  <div className="flex-1 bg-[#ECEFF8]/40 p-3 rounded-lg border border-gray-200/50">
                     <p className="text-[10px] text-amber-600 font-black uppercase mb-1.5">🎭 Acciones Requeridas en cabina:</p>
                     <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Modificar cuñas de presentación (quitar Cencosud)</li>
                        <li>• Actualizar locuciones de cierre</li>
                        <li>• Preparar banco de material genérico de reemplazo</li>
                     </ul>
                  </div>
               </div>

               <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-amber-500/10">
                  <button className="bg-slate-800 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase text-[10px]">📝 Crear Tareas</button>
                  <button className="bg-slate-800 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase text-[10px]">📞 Contactar Ejecutivo</button>
                  <button className="bg-amber-50 text-amber-600 border border-amber-500/30 px-4 py-2 rounded-lg font-black uppercase text-[10px]">✅ Entendido (Ocultar)</button>
               </div>
            </div>

         </div>

         {/* COLUMNA 3: Confirmaciones y Log */}
         <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
               🟢 LOG DE MOVIMIENTOS
            </h3>
            
            <div className="rounded-2xl border border-emerald-500/10 bg-white/70 p-5 relative overflow-hidden backdrop-blur-md">
               <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">CONFIRMACIONES RECIENTES</h4>
               
               <div className="space-y-3">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                     <p className="text-xs text-gray-800 font-bold">Banco de Chile</p>
                     <p className="text-[10px] text-gray-500 mt-1">✓ Renovación confirmada en sistema hasta 31-Marzo.</p>
                     <p className="text-[9px] text-emerald-500/50 mt-1 text-right">Hace 2 horas</p>
                  </div>
                  
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                     <p className="text-xs text-gray-800 font-bold">Movistar</p>
                     <p className="text-[10px] text-gray-500 mt-1">✓ Inicio exitoso confirmado para el 15-Enero.</p>
                     <p className="text-[9px] text-emerald-500/50 mt-1 text-right">Hace 1 día</p>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                     <p className="text-xs text-gray-800 font-bold">Clínica Alemana</p>
                     <p className="text-[10px] text-gray-500 mt-1">✓ Material anual cargado y activo (Vigencia 2025).</p>
                     <p className="text-[9px] text-emerald-500/50 mt-1 text-right">Hace 3 días</p>
                  </div>
               </div>
               
               <button className="w-full mt-4 text-[10px] text-gray-500 uppercase font-bold hover:text-gray-800 transition-colors">Ver historial completo ➡️</button>
            </div>
         </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMACIÓN DE INICIO                           */}
      {/* ========================================================= */}
      {showModal && (
         <div 
           className="fixed inset-0 z-50 overflow-hidden"
           onMouseMove={(e) => {
             if (isDragging) setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
           }}
           onMouseUp={() => setIsDragging(false)}
           onMouseLeave={() => setIsDragging(false)}
         >
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div 
               ref={modalRef}
               className="absolute bg-white/85 backdrop-blur-2xl border border-white/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
               style={{ left: pos.x, top: pos.y }}
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500"></div>
               
               <div 
                 className="p-6 border-b border-gray-100 flex justify-between items-center cursor-grab active:cursor-grabbing"
                 onMouseDown={(e) => {
                   if (!modalRef.current) return
                   setIsDragging(true)
                   const rect = modalRef.current.getBoundingClientRect()
                   setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                 }}
               >
                  <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 pointer-events-none">
                     <span className="text-emerald-500 pointer-events-none">✅</span> CONFIRMACIÓN DE INICIO DE AUSPICIO
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
               </div>

               <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <p className="text-sm text-gray-600 font-medium">🎯 Al confirmar, el sistema ejecutará automáticamente la siguiente cadena (Pipeline TIER 0):</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Columna Izquierda Modal */}
                     <div className="bg-[#ECEFF8]/40 p-4 rounded-xl border border-gray-200/50">
                        <h4 className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-3">✅ ACTUALIZACIONES DB:</h4>
                        <ul className="text-xs text-gray-600 space-y-2">
                           <li>• Cambiará estado de "Pendiente" a "Activo" <span className="text-emerald-500">(rojo → verde)</span></li>
                           <li>• Actualizará árbol de disponibilidad de cupos en tiempo real</li>
                           <li>• Sincronizará con módulo central de contratos</li>
                           <li>• Activará tracking de cumplimiento automático de marcas</li>
                        </ul>
                     </div>

                     {/* Columna Derecha Modal */}
                     <div className="bg-[#ECEFF8]/40 p-4 rounded-xl border border-indigo-500/20">
                        <h4 className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-3">📧 NOTIFICACIONES DISPARADAS:</h4>
                        <ul className="text-xs text-gray-600 space-y-2">
                           <li>• <span className="font-bold text-gray-800">A Ejecutivo:</span> "Auspicio Chevrolet activado éxito"</li>
                           <li>• <span className="font-bold text-gray-800">A Gerente:</span> "Nueva activación en Mesa Central"</li>
                           <li>• <span className="font-bold text-gray-800">A Locutor:</span> "Presentaciones Chevrolet activas"</li>
                           <li>• <span className="font-bold text-gray-800">A Finanzas:</span> "Iniciar facturación automática"</li>
                        </ul>
                     </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                     <h4 className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-2">⚠️ RECORDATORIO TÁCTICO PARA PROGRAMADOR:</h4>
                     <p className="text-xs text-amber-700 font-medium">Debe coordinar expresamente con el equipo de producción sonora las presentaciones y cierres específicos en consola <strong>antes del inicio mañana a las 07:00 Hrs</strong>. El material base es "Mesa Central Matinal con Chevrolet".</p>
                  </div>
               </div>

               <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                  <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-full font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button className="px-6 py-2 rounded-full font-bold uppercase text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">📞 Llamar Ejecutivo</button>
                  <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-full font-black uppercase text-xs text-white bg-emerald-500 hover:scale-[1.02] active:scale-95 shadow-md shadow-emerald-200/50 transition-all">
                     ✅ CONFIRMAR Y ACTIVAR
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  )
}
