import React, { useState } from 'react';
import { Bell, AlertTriangle, Clock, X } from 'lucide-react';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return (
     <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-xl hover:scale-105 transition-transform z-50">
        <Bell className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"></span>
     </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full lg:w-96 overflow-hidden">
       {/* Header */}
       <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold">
             <Bell className="w-5 h-5 text-yellow-400" /> Centro de Alertas
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
             <X className="w-4 h-4" />
          </button>
       </div>

       {/* Content */}
       <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Critical Alerts */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Alertas Críticas (3)
            </h4>
            
            <div className="grid gap-3">
               <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-red-700 font-bold text-xs uppercase">Vence Hoy • 12:00 PM</span>
                     <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm mb-1">Presentación Banco XYZ</div>
                  <div className="text-xs text-slate-600 mb-2">Ejecutivo: Ana García</div>
                  
                  <div className="flex gap-2 mt-2">
                     <button className="flex-1 bg-white border border-red-200 text-red-700 text-xs font-bold py-1.5 rounded hover:bg-red-100">
                        🔄 Extender
                     </button>
                     <button className="flex-1 bg-red-600 text-white text-xs font-bold py-1.5 rounded hover:bg-red-700">
                        📞 Llamar
                     </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Upcoming Alerts */}
          <div>
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-amber-400"></span> Próximos Vencimientos
            </h4>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-3">
               <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-amber-500">
                     <Music className="w-4 h-4" />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-slate-700">Audio Farmacia Salud</div>
                     <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Vence Mañana
                     </div>
                     <div className="text-xs text-emerald-600 font-bold mt-1">✓ Renovación probable 85%</div>
                  </div>
               </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100">
             <h4 className="text-xs font-bold text-violet-700 uppercase mb-3 flex items-center gap-2">
                <span className="text-lg">✨</span> Sugerencias IA
             </h4>
             <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-slate-700">
                   <div className="min-w-1 w-1 h-1 bg-violet-400 rounded-full mt-1.5"></div>
                   Contactar Banco XYZ HOY antes de las 11:00
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-700">
                   <div className="min-w-1 w-1 h-1 bg-violet-400 rounded-full mt-1.5"></div>
                   Preparar renovación Farmacia Salud (alta prob.)
                </li>
             </ul>
          </div>

       </div>
    </div>
  );
};

const Music = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
);
