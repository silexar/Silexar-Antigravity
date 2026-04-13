import React from 'react';
import { 
  X, Save, Trash2, CheckCircle2, ShieldAlert,
  Settings, Target, Calculator, FileText, ArrowUpRight
} from 'lucide-react';

export function ConfiguracionAvanzadaValorModal({ valorDesc, onClose }: { valorDesc: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-[#F0EDE8]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                ⚙️ CONFIGURACIÓN: {valorDesc || 'VALOR'}
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button aria-label="Cerrar" onClick={onClose} className="p-2 text-[#888780] hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          
          {/* Informacion Basica */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780] mb-2 flex items-center gap-2"><FileText className="w-3.5 h-3.5"/> Información Básica</h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                  <label className="text-[10px] font-bold text-[#888780] block mb-1">Código</label>
                  <div className="font-mono text-sm text-slate-700 font-bold">01</div>
                </div>
                <div className="col-span-3 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                  <label className="text-[10px] font-bold text-[#888780] block mb-1">Descripción Corta</label>
                  <input type="text" defaultValue={valorDesc} aria-label="Descripción corta" className="w-full font-bold text-sm text-slate-800 outline-none" />
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg px-3 py-2 bg-white">
                <label className="text-[10px] font-bold text-[#888780] block mb-1">Descripción Larga</label>
                <textarea 
                  className="w-full text-sm text-slate-600 outline-none resize-none h-10" 
                  defaultValue="Spots tradicionales de radio para publicidad comercial estándar."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            
            {/* Config Operativa */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780] mb-4 flex items-center gap-2"><Target className="w-3.5 h-3.5"/> Configuración Operativa</h3>
              
               <div className="space-y-2">
                 {[
                   { id: '1', label: 'Obligatorio en campañas radio', checked: true },
                   { id: '2', label: 'Requiere material específico', checked: false },
                   { id: '3', label: 'Permite programación automática', checked: true },
                   { id: '4', label: 'Requiere aprobación especial', checked: false },
                 ].map(opt => (
                   <label key={opt.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${opt.checked ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-100 border-slate-300'}`}>
                       {opt.checked && <CheckCircle2 className="w-3.5 h-3.5 text-[#2C2C2A]" />}
                       {!opt.checked && <X className="w-3.5 h-3.5 text-[#5F5E5A]" />}
                     </div>
                     <span className={`text-xs font-medium ${opt.checked ? 'text-slate-800' : 'text-[#888780]'}`}>{opt.label}</span>
                   </label>
                 ))}
               </div>
            </div>

            {/* Config Contable */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780] mb-2 flex items-center gap-2"><Calculator className="w-3.5 h-3.5"/> Configuración Contable</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                   <div className="text-xs font-medium text-slate-600">Cta. Ingresos:</div>
                   <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded">4110001</span>
                      <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3"/> Validada</span>
                   </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                   <div className="text-xs font-medium text-slate-600">Cta. Costos:</div>
                   <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded">5110001</span>
                      <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3"/> Validada</span>
                   </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                   <div className="text-xs font-medium text-slate-600">Centro Costo:</div>
                   <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Varía por emisora</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                   <div className="text-xs font-medium text-slate-600">Service Name:</div>
                   <input aria-label="Service Name" className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded outline-none w-32 focus:ring-1 focus:ring-indigo-500" defaultValue="SPOT_RADIO" />
                </div>
              </div>
            </div>

            {/* Validaciones Especificas */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780] mb-4 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5"/> Validaciones Específicas</h3>
              
               <div className="space-y-2">
                 {[
                   { id: '1', label: 'Conflicto con otros valores', checked: false },
                   { id: '2', label: 'Validar duración material', checked: true },
                   { id: '3', label: 'Exclusivo por campaña', checked: false },
                   { id: '4', label: 'Permitir múltiples por contrato', checked: true },
                 ].map(opt => (
                   <label key={opt.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${opt.checked ? 'bg-indigo-500 border-indigo-600' : 'bg-slate-100 border-slate-300'}`}>
                       {opt.checked && <CheckCircle2 className="w-3.5 h-3.5 text-[#2C2C2A]" />}
                       {!opt.checked && <X className="w-3.5 h-3.5 text-[#5F5E5A]" />}
                     </div>
                     <span className={`text-xs font-medium ${opt.checked ? 'text-slate-800' : 'text-[#888780]'}`}>{opt.label}</span>
                   </label>
                 ))}
               </div>
            </div>

            {/* Analisis Uso */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#888780] mb-2 flex items-center gap-2"><ArrowUpRight className="w-3.5 h-3.5"/> Análisis de Uso (Live)</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <div className="text-xs text-slate-600 flex-1">Utilización en campañas (Radio)</div>
                  <div className="text-sm font-bold text-slate-800">78%</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="text-xs text-slate-600 flex-1">Revenue asociado (YTD)</div>
                  <div className="text-sm font-bold text-slate-800">$2.8M</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="text-xs text-slate-600 flex-1">Satisfacción operativa</div>
                  <div className="text-sm font-bold text-slate-800">9.1 <span className="text-[10px] text-[#888780] font-normal">/10</span></div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888780]">Tendencia Q3</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3"/> +12% vs Q2
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <button className="px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors">
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2 text-[#888780] hover:bg-slate-100 font-medium rounded-lg text-sm transition-colors">
              Cancelar
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-[#2C2C2A] font-bold rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors">
              <Save className="w-4 h-4" /> Guardar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
