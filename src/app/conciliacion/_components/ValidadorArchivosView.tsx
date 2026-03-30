"use client";

import React, { useState } from 'react';

export default function ValidadorArchivosView({ onBack }: { onBack: () => void }) {
  const [fileSelected, setFileSelected] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER VALIDADOR */}
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mb-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 text-xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">🔍 Validador de Archivos Dalet</h2>
            <p className="text-xs text-emerald-400 font-black tracking-widest uppercase">Pre-chequeo Estructural y Contenido TIER 0</p>
          </div>
        </div>
        <div className="relative z-10">
           <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              MOTOR DE VALIDACIÓN ACTIVO ✅
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* SECTOR CARGA / SELECCIÓN */}
         <div className="space-y-6">
            <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500/50 transition-all cursor-pointer group" onClick={() => setFileSelected(true)}>
               <div className="text-6xl group-hover:scale-110 transition-transform">📁</div>
               <div>
                  <div className="text-sm font-black text-slate-200 uppercase mb-1">Subir Archivo Dalet</div>
                  <p className="text-[10px] text-slate-500 font-bold">CSV, XML o TXT soportados</p>
               </div>
               <button className="bg-slate-800 border border-slate-700 text-xs text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest">Seleccionar Archivo</button>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">RECOMENDACIONES DE VALIDACIÓN</h3>
               <ul className="space-y-3">
                  <li className="text-[11px] text-slate-400 flex items-start gap-3">
                     <span className="text-emerald-500">●</span> Use codificación UTF-8 para evitar errores en caracteres especiales.
                  </li>
                  <li className="text-[11px] text-slate-400 flex items-start gap-3">
                     <span className="text-emerald-500">●</span> Verifique que el separador coincida con la configuración de la emisora.
                  </li>
                  <li className="text-[11px] text-slate-400 flex items-start gap-3">
                     <span className="text-emerald-500">●</span> Los códigos SP deben tener exactamente 8 caracteres alfanuméricos.
                  </li>
               </ul>
            </div>
         </div>

         {/* RESULTADOS DE VALIDACIÓN */}
         <div className={`lg:col-span-2 space-y-6 transition-all ${fileSelected ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center text-xl">📄</div>
                     <div>
                        <div className="text-lg font-black text-white">radio_corazon_20250820.csv</div>
                        <div className="text-xs text-slate-500 uppercase font-black">2.4 MB • 2,847 Registros Totales</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-2xl font-black text-emerald-400">PASSED</div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase">PROCESABLE CON ADVERTENCIAS</div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                        ESTRUCTURA ARCHIVO
                     </h4>
                     <div className="space-y-3">
                        {['Codificación: UTF-8', 'Separadores: Consistentes', 'Columnas esperadas: 7/7', 'Integridad Registros'].map((v, i) => (
                           <div key={i} className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">{v}</span>
                              <span className="text-emerald-400 font-black">✅ OK</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                        CONTENIDO VALIDADO
                     </h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs"><span className="text-slate-500">Fechas válidas</span> <span className="text-emerald-400 font-black">2,847/2,847</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-slate-500">Códigos SP válidos</span> <span className="text-amber-400 font-black">234/237 ⚠️</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-slate-500">Duraciones coherentes</span> <span className="text-emerald-400 font-black">237/237</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-slate-500">Tipos reconocidos</span> <span className="text-emerald-400 font-black">2,847/2,847</span></div>
                     </div>
                  </div>
               </div>

               <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                     <span>⚠️</span> ADVERTENCIAS DETECTADAS
                  </h4>
                  <div className="space-y-2 font-mono text-[11px]">
                     <div className="flex gap-4"><span className="text-slate-500">L234:</span> <span className="text-slate-300">"SP1234X6"</span> <span className="text-amber-500/70">Código SP con formato incorrecto (X inválida)</span></div>
                     <div className="flex gap-4"><span className="text-slate-500">L456:</span> <span className="text-slate-300">"SP"</span> <span className="text-amber-500/70">Código SP incompleto</span></div>
                     <div className="flex gap-4"><span className="text-slate-500">L789:</span> <span className="text-slate-300">"SP123456789"</span> <span className="text-amber-500/70">Código SP excede longitud máxima (8)</span></div>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-xl text-xs font-black uppercase transition-all">✏️ CORREGIR ERRORES</button>
                  <button className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-xs font-black shadow-xl shadow-emerald-500/20 transition-all uppercase">✅ PROCESAR CON ADVERTENCIAS</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
