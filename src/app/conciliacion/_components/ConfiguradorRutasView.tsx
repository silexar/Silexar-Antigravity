"use client";

import React, { useState } from 'react';

export default function ConfiguradorRutasView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'rutas' | 'formato' | 'ia' | 'alertas'>('rutas');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER CONFIGURACIÓN */}
      <div className="flex justify-between items-center bg-[#E8E5E0]/50 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl bg-[#F0EDE8] flex items-center justify-center hover:bg-[#D4D1CC] transition-all border border-[#D4D1CC] text-xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-[#2C2C2A] uppercase tracking-tighter">⚙️ Configuración Maestras</h2>
            <p className="text-xs text-blue-400 font-black tracking-widest uppercase">Parámetros Operativos Dalet Galaxy TIER 0</p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
           <button className="bg-[#F0EDE8] border border-[#D4D1CC] text-[#5F5E5A] px-6 py-2.5 rounded-xl text-xs font-black hover:bg-[#E8E5E0] transition-all">📋 DUPLICAR CONFIG</button>
           <button className="bg-blue-600 text-[#2C2C2A] px-6 py-2.5 rounded-xl text-xs font-black shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">💾 GUARDAR CAMBIOS</button>
        </div>
      </div>

      {/* SELECTOR DE EMISORA & CATEGORÍAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="space-y-4">
            <div className="bg-[#F0EDE8] p-5 rounded-2xl border border-white/5 shadow-xl">
               <label className="text-[10px] font-black text-[#888780] uppercase tracking-widest mb-3 block">Seleccionar Emisora</label>
               <select className="w-full bg-[#E8E5E0] border-none rounded-xl text-sm font-bold text-[#2C2C2A] py-3 px-4 outline-none ring-1 ring-white/5 focus:ring-blue-500">
                  <option>📻 Radio Corazón</option>
                  <option>📻 Play FM</option>
                  <option>📻 Sonar FM</option>
               </select>
            </div>

            <div className="bg-[#F0EDE8] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
               {([
                 { id: 'rutas', label: '📁 Rutas y Sincro', icon: '📂' },
                 { id: 'formato', label: '📊 Formato Dalet', icon: '📄' },
                 { id: 'ia', label: '🤖 Config IA', icon: '✨' },
                 { id: 'alertas', label: '🔔 Alertas', icon: '📢' }
               ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 p-4 text-xs font-black uppercase tracking-tighter transition-all ${
                      activeTab === tab.id ? 'bg-blue-600 text-[#2C2C2A]' : 'text-[#888780] hover:bg-[#E8E5E0] hover:text-[#2C2C2A]'
                    }`}
                  >
                     <span>{tab.icon}</span> {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* PANEL DE CONFIGURACIÓN DINÁMICO */}
         <div className="lg:col-span-3 bg-[#F0EDE8]/50 border border-[#D4D1CC] rounded-3xl p-8 shadow-2xl">
            {activeTab === 'rutas' && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <h3 className="text-sm font-black text-[#2C2C2A] uppercase tracking-widest">Configuración de Rutas y Horarios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase">Ruta Base de Exportación</label>
                           <input type="text" aria-label="Ruta Base de Exportación" defaultValue="\\dalet-server\exports\radio_corazon\" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase">Patrón de Nombre</label>
                           <input type="text" aria-label="Patrón de Nombre de archivo" defaultValue="radio_corazon_YYYYMMDD.csv" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase">Backup Ruta</label>
                           <input type="text" aria-label="Backup Ruta" defaultValue="\\backup\dalet\radio_corazon\" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase">Frecuencia de Sync</label>
                           <select className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]">
                              <option>Cada 15 minutos</option>
                              <option>Cada 30 minutos</option>
                              <option>Cada 1 hora</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#888780] uppercase">Horario Inicio</label>
                              <input type="time" defaultValue="00:00" aria-label="Horario Inicio" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#888780] uppercase">Horario Fin</label>
                              <input type="time" defaultValue="23:59" aria-label="Horario Fin" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase">Tolerancia Delay (min)</label>
                           <input type="number" defaultValue="30" aria-label="Tolerancia Delay en minutos" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                        </div>
                        
                        <div className="bg-[#F5F2EE]/50 p-4 rounded-2xl border border-white/5 space-y-3 mt-2">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block border-b border-white/5 pb-2 mb-2">🎯 Filtros de Procesamiento</label>
                           {[
                              { l: 'Solo procesar Type = "AD"', v: true },
                              { l: 'Ignorar registros sin código SP', v: true },
                              { l: 'Validar duración (10-120s)', v: true },
                              { l: 'Incluir jingles/promos', v: false }
                           ].map((f) => (
                              <label key={f.l} className="flex items-center gap-3 cursor-pointer">
                                 <input type="checkbox" defaultChecked={f.v} className="w-4 h-4 rounded bg-[#E8E5E0] border-none text-blue-500" />
                                 <span className="text-[10px] font-bold text-[#888780]">{f.l}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'formato' && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <h3 className="text-sm font-black text-[#2C2C2A] uppercase tracking-widest">Mapeo de Columnas Dalet Galaxy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#888780] uppercase">Separador</label>
                        <select className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]">
                           <option>; (Punto y coma)</option>
                           <option>, (Coma)</option>
                           <option>Tab (Tabulación)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#888780] uppercase">Encoding</label>
                        <select className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]">
                           <option>UTF-8</option>
                           <option>ISO-8859-1 (Latin1)</option>
                        </select>
                     </div>
                     <div className="flex items-end pb-1 pr-1">
                        <label className="flex items-center gap-3 cursor-pointer bg-[#E8E5E0]/50 p-3 rounded-xl border border-white/5 w-full">
                           <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#D4D1CC] text-blue-500 border-none" />
                           <span className="text-xs font-bold text-[#5F5E5A]">¿Tiene Header?</span>
                        </label>
                     </div>
                  </div>

                  <div className="bg-[#F5F2EE]/50 rounded-2xl overflow-hidden border border-white/5">
                     <table className="w-full text-left text-xs">
                        <thead className="bg-[#E8E5E0]/80 border-b border-white/5">
                           <tr>
                              <th className="p-4 text-[10px] font-black text-[#888780]">POSICIÓN</th>
                              <th className="p-4 text-[10px] font-black text-[#888780]">COLUMNA DALET</th>
                              <th className="p-4 text-[10px] font-black text-[#888780]">DATO SILEXAR</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {[
                             { pos: 1, dalet: 'DateTime', silexar: 'Fecha/Hora emisión' },
                             { pos: 2, dalet: 'Title', silexar: 'Descripción Material' },
                             { pos: 3, dalet: 'Duration', silexar: 'Duración (seg)' },
                             { pos: 5, dalet: 'Code', silexar: 'Código SP' },
                             { pos: 6, dalet: 'Client', silexar: 'Cliente' }
                           ].map((col) => (
                              <tr key={col.pos} className="hover:bg-[#E8E5E0]/30 transition-colors">
                                 <td className="p-4 font-mono text-blue-400 font-bold">{col.pos}</td>
                                 <td className="p-4"><input type="text" defaultValue={col.dalet} aria-label="Columna Dalet" className="bg-transparent border-none text-[#2C2C2A] outline-none w-full" /></td>
                                 <td className="p-4">
                                    <select defaultValue={col.silexar} className="bg-transparent border-none text-[#888780] outline-none w-full">
                                       <option>{col.silexar}</option>
                                       <option>Tipo de Contenido</option>
                                    </select>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'ia' && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <h3 className="text-sm font-black text-[#2C2C2A] uppercase tracking-widest">Inteligencia Cortex IA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        {[
                          { l: 'Recuperación Automática', d: 'Ejecutar acciones sin intervención en casos claros.', active: true },
                          { l: 'Distribución Inteligente', d: 'Optimizar huecos comerciales disponibles.', active: true },
                          { l: 'Conflictos Exclusividad', d: 'Validar competencia directa en el mismo bloque.', active: true },
                          { l: 'Notificaciones IA', d: 'Alertas proactivas a stakeholders.', active: true }
                        ].map((ia) => (
                           <div key={ia.l} className="bg-[#E8E5E0]/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                              <div className="flex-1">
                                 <div className="text-xs font-black text-[#2C2C2A]">{ia.l}</div>
                                 <div className="text-[10px] text-[#888780] uppercase tracking-tighter">{ia.d}</div>
                              </div>
                              <input type="checkbox" defaultChecked={ia.active} className="w-10 h-5 bg-[#D4D1CC] rounded-full appearance-none checked:bg-blue-600 transition-colors cursor-pointer" />
                           </div>
                        ))}
                     </div>
                     <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6">
                        <div className="text-2xl mb-4">🧠</div>
                        <h4 className="text-sm font-black text-blue-400 uppercase mb-2">Umbral de Confianza Cortex</h4>
                        <p className="text-xs text-[#888780] mb-6 font-medium italic">Define el nivel de precisión requerido para que la IA tome acciones automáticas.</p>
                        <input type="range" aria-label="Umbral de Confianza Cortex" className="w-full h-2 bg-[#E8E5E0] rounded-full accent-blue-600" />
                        <div className="flex justify-between mt-2 text-[10px] font-black text-[#888780]">
                           <span>CONSERVADOR (95%)</span>
                           <span>AGRESIVO (80%)</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'alertas' && (
               <div className="space-y-8 animate-in fade-in duration-300">
                  <h3 className="text-sm font-black text-[#2C2C2A] uppercase tracking-widest">Canales de Alerta y Notificación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase flex items-center gap-2"><span>📧</span> Email Principal</label>
                           <input type="text" aria-label="Email Principal" defaultValue="traffic@radiocorazon.cl" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase flex items-center gap-2"><span>📢</span> Slack Channel</label>
                           <input type="text" defaultValue="#radio-corazon-alerts" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#888780] uppercase flex items-center gap-2"><span>📱</span> SMS Crítico</label>
                           <input type="text" defaultValue="+56 9 1234 5678" aria-label="SMS Crítico" className="w-full bg-[#E8E5E0] border border-[#D4D1CC] rounded-xl py-3 px-4 text-xs text-[#2C2C2A]" />
                        </div>
                        <div className="bg-[#E8E5E0]/50 p-6 rounded-2xl border border-white/5 space-y-4">
                           <h4 className="text-[10px] font-black text-[#888780] uppercase italic">Eventos que disparan alerta</h4>
                           <div className="grid grid-cols-2 gap-2">
                              {['Error Sync', 'Falla Dalet', 'No Emitido Crítico', 'Recuperación Fallida'].map(e => (
                                 <label key={e} className="flex items-center gap-2 text-[10px] font-bold text-[#5F5E5A]">
                                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 bg-[#D4D1CC] border-none rounded" /> {e}
                                 </label>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
