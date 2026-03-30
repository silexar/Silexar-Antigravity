"use client";

import React from 'react';

export default function AuditLogView({ onBack }: { onBack: () => void }) {
  const auditLogs = [
    { id: 'LOG-001', event: 'Recuperación Auto', user: 'SYSTEM (Cortex)', time: '14:23:45', action: 'Redistribuido SP123456 (Toyota)', status: 'BACKUP ✅', risk: 'BAJO' },
    { id: 'LOG-002', event: 'Cambio Manual', user: 'J. Smith (Traffic)', time: '14:20:12', action: 'Ajuste horario Bloque B → C', status: 'BACKUP ✅', risk: 'MEDIO' },
    { id: 'LOG-003', event: 'Sincronización', user: 'Watcher Service', time: '14:15:00', action: 'Parsing radio_corazon.csv completado', status: 'LOGGED ✅', risk: 'BAJO' },
    { id: 'LOG-004', event: 'Eliminación', user: 'Admin User', time: '14:10:55', action: 'Removido material duplicado (L234)', status: 'ROLLBACK ENABLED 🔄', risk: 'ALTO' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER AUDITORÍA */}
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 text-xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">🛡️ Auditoría & Integridad</h2>
            <p className="text-xs text-red-400 font-black tracking-widest uppercase italic font-mono">Blockchain-Certified Inmutable Logs TIER 0</p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
           <button className="bg-red-600/10 border border-red-500/30 text-red-500 px-6 py-2.5 rounded-xl text-xs font-black shadow-xl hover:bg-red-600 hover:text-white transition-all">CERTIFICAR BLOQUE</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* STATUS DE SEGURIDAD */}
         <div className="space-y-4">
            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 shadow-2xl space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protección Operativa</h3>
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-400">Backup Auto</span>
                     <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVO</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-400">Certificación IA</span>
                     <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">BLOCKCHAIN</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-400">Rollback Status</span>
                     <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">READY</span>
                  </div>
               </div>
               <div className="pt-4 border-t border-white/5">
                  <button className="w-full bg-slate-800 border border-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-red-500/50 transition-all">REVISAR BACKUPS (15)</button>
               </div>
            </div>

            <div className="bg-red-600/5 border border-red-500/20 rounded-3xl p-6 shadow-2xl">
               <div className="text-3xl mb-4">🚨</div>
               <h4 className="text-xs font-black text-red-400 uppercase mb-2">Protocolo de Emergencia</h4>
               <p className="text-[10px] text-slate-500 font-medium italic mb-6">Capacidad de reversión completa del grid de programación en caso de error masivo detectado por QC.</p>
               <button className="w-full bg-red-600 text-white py-4 rounded-xl text-xs font-black shadow-xl shadow-red-600/20 active:scale-95 transition-all">
                  REVERTIR ÚLTIMO PROCESO
               </button>
            </div>
         </div>

         {/* LOG INMUTABLE */}
         <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
               <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                  Registro Operativo (Audit Trail)
               </h3>
               <div className="flex gap-2">
                  <input type="text" placeholder="Buscar en logs..." aria-label="Buscar en logs" className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none focus:border-red-500/50" />
               </div>
            </div>

            <div className="space-y-3 relative z-10">
               {auditLogs.map((log, i) => (
                  <div key={i} className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-950 transition-all group">
                     <div className="flex items-center gap-6">
                        <div className="text-center w-12 border-r border-white/5 pr-4">
                           <div className="text-[8px] font-black text-slate-600 uppercase">TIME</div>
                           <div className="text-[10px] font-mono text-slate-400 font-bold">{log.time}</div>
                        </div>
                        <div>
                           <div className="text-xs font-black text-white uppercase tracking-tighter group-hover:text-red-400 transition-colors">{log.event}</div>
                           <div className="text-[10px] text-slate-500 font-medium">{log.action}</div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-8 text-right">
                        <div>
                           <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">USUARIO</div>
                           <div className="text-[10px] font-bold text-slate-300 uppercase">{log.user}</div>
                        </div>
                        <div className="w-24">
                           <div className={`text-[9px] font-black px-2 py-1 rounded-full inline-block ${log.risk === 'ALTO' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {log.status}
                           </div>
                        </div>
                        <button className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           🔍
                        </button>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-8 flex justify-center">
               <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">CARGAR REGISTROS ANTERIORES</button>
            </div>
         </div>
      </div>
    </div>
  );
}
