"use client";

import React, { useState } from 'react';

export default function MobileValidadorView({ onBack }: { onBack: () => void }) {
  const [fileSelected, setFileSelected] = useState(false);

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      {/* HEADER MÓVIL */}
      <header className="flex justify-between items-center bg-[#F0EDE8] -mx-4 px-4 py-3 border-b border-white/5 sticky top-[-16px] z-[60]">
         <button onClick={onBack} className="text-[#888780] text-xs font-bold uppercase tracking-widest">← Volver</button>
         <div className="text-center">
            <div className="text-xs font-black text-emerald-400 uppercase">VALIDADOR DALET</div>
            <div className="text-[10px] text-[#888780] font-bold uppercase tracking-widest">Pre-Procesamiento</div>
         </div>
         <div className="w-8"></div>
      </header>

      {/* ÁREA DE CARGA MÓVIL */}
      {!fileSelected ? (
        <div className="bg-[#F0EDE8] border-2 border-dashed border-[#D4D1CC] rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4" onClick={() => setFileSelected(true)}>
           <div className="text-5xl">📎</div>
           <div className="text-xs font-black text-[#2C2C2A] uppercase">Subir Archivo</div>
           <p className="text-[10px] text-[#888780] font-bold">Toca para seleccionar CSV/XML</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
           <div className="bg-[#F0EDE8] border border-white/5 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <div className="text-2xl">📄</div>
                 <div className="flex-1">
                    <div className="text-xs font-bold text-[#2C2C2A] truncate w-40">radio_corazon_20250820.csv</div>
                    <div className="text-[9px] text-[#888780] font-black uppercase">2.4 MB • 2,847 reg.</div>
                 </div>
                 <div className="text-emerald-400 font-black text-xs">PASS ✅</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <div className="text-[8px] font-black text-[#888780] uppercase">Estructura</div>
                    <div className="text-[10px] text-emerald-400 font-bold">100% OK</div>
                 </div>
                 <div className="space-y-2">
                    <div className="text-[8px] font-black text-[#888780] uppercase">Contenido</div>
                    <div className="text-[10px] text-amber-500 font-bold">98.7% (3 ⚠️)</div>
                 </div>
              </div>
           </div>

           <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3">
              <h4 className="text-[9px] font-black text-amber-500 uppercase">Advertencias (3)</h4>
              <div className="space-y-1 text-[9px] font-mono text-[#888780]">
                 <div>L234: Código SP incorrecto</div>
                 <div>L456: Código SP incompleto</div>
                 <div>L789: Código SP muy largo</div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => setFileSelected(false)} className="bg-[#E8E5E0] text-[#5F5E5A] py-4 rounded-2xl text-[10px] font-black border border-white/5">✏️ CORREGIR</button>
              <button className="bg-emerald-600 text-[#2C2C2A] py-4 rounded-2xl text-[10px] font-black shadow-lg">✅ PROCESAR</button>
           </div>
        </div>
      )}

      {/* FOOTER TIPS MÓVIL */}
      <div className="bg-[#F0EDE8]/50 p-4 rounded-2xl border border-white/5">
         <div className="text-[9px] font-black text-[#888780] uppercase mb-2">Tips Pro</div>
         <p className="text-[9px] text-[#888780] italic leading-relaxed">"Asegúrese de que el archivo no contenga líneas vacías al final para evitar errores de parsing."</p>
      </div>
    </div>
  );
}
