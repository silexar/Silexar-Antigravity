import React from 'react';
import { 
  Bot, CheckCircle2, ShieldAlert, Sparkles, 
  Settings, X, Play, ServerCog
} from 'lucide-react';

export function CortexClassifierModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-[#F0EDE8]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-indigo-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-[#2C2C2A] rounded-xl shadow-md border border-indigo-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
              <Bot className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                CORTEX-CLASSIFIER
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 bg-indigo-600 px-2 py-0.5 rounded-full shadow-sm">Auto</span>
              </h2>
              <p className="text-sm text-[#888780] font-medium mt-0.5">Clasificación Automática en Tiempo Real</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Settings className="w-4 h-4" /> Configurar Reglas
            </button>
            <button onClick={onClose} className="p-2 text-[#888780] hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780] flex items-center gap-2">
                <ServerCog className="w-3.5 h-3.5" />
                Nueva Entidad Detectada
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Interceptado (Hace 2 seg)
              </span>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex items-start gap-4">
              <div className="p-2 bg-white rounded-md border border-slate-200 shadow-sm mt-0.5">
                <div className="w-8 h-8 rounded bg-rose-100 flex items-center justify-center text-rose-600 font-black font-mono text-xs">CH</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#2C2C2A] bg-[#E8E5E0] px-2 py-0.5 rounded">NUEVA CAMPAÑA</span>
                  <span className="text-xs font-bold text-slate-600">Cliente: Banco de Chile</span>
                </div>
                <p className="text-sm text-slate-800 font-medium">"Campaña promoción tarjeta de crédito navidad"</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            
            <div className="col-span-1 bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-5"><Bot className="w-24 h-24 text-indigo-500"/></div>
               
               <div className="relative z-10 flex items-center justify-between mb-2">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                   <Sparkles className="w-4 h-4" /> Clasificación Sugerida
                 </h3>
                 <span className="text-xs font-black text-indigo-600 bg-white border border-indigo-100 px-2 py-1 rounded-md shadow-sm">Confianza: 94%</span>
               </div>

               <div className="relative z-10 space-y-2">
                 {[
                   { k: 'Tipo Pedido', v: '01 PUBLICIDAD' },
                   { k: 'Industria', v: 'FINANCIERO' },
                   { k: 'Tipo Cliente', v: 'DIRECTO' },
                   { k: 'Estacionalidad', v: 'NAVIDAD/DIC' },
                 ].map(i => (
                   <div key={i.k} className="flex items-center justify-between bg-white border border-slate-100 p-2.5 rounded-lg shadow-sm">
                     <span className="text-xs font-medium text-[#888780]">{i.k}</span>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-slate-800">{i.v}</span>
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780]">📊 Factores de Decisión</h3>
                <ul className="space-y-2.5">
                  <li className="flex gap-2">
                    <span className="text-indigo-500 mt-0.5">🔹</span>
                    <span className="text-xs text-slate-600 font-medium"><strong>Cliente histórico:</strong> 23 campañas similares</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500 mt-0.5">🔹</span>
                    <span className="text-xs text-slate-600 font-medium"><strong>Keywords NLP:</strong> "promoción", "tarjeta", "navidad"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500 mt-0.5">🔹</span>
                    <span className="text-xs text-slate-600 font-medium"><strong>Patrón temporal:</strong> Correlación estacional Q4</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780]">⚖️ Validaciones Automáticas</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sin conflictos cruzados detectados
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Coherencia con historial (98%)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Temporada Alta (Pricing Premium Sugerido)
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <button className="px-5 py-2 text-[#888780] hover:bg-slate-50 font-medium border border-slate-200 rounded-lg text-sm transition-colors">
            Forzar Manual
          </button>
          <div className="flex gap-2">
            <button className="px-5 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg text-sm transition-colors border border-transparent">
              Ajustar Mapeo
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-[#2C2C2A] font-bold rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors">
              <Play className="w-4 h-4 fill-current" /> Aplicar Clasificación (Auto)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
