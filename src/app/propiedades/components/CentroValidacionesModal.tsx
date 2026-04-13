import React from 'react';
import { 
  ShieldAlert, AlertTriangle, AlertCircle, Copy,
  X, RefreshCw, Zap, Target, ArrowRight
} from 'lucide-react';

export function CentroValidacionesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-[#F0EDE8]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Centro de Validaciones y Coherencia</h2>
              <p className="text-sm text-[#888780] font-medium flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Análisis Activo • Última validación hace 15 min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
              Re-evaluar Sistema
            </button>
            <button onClick={onClose} className="p-2 text-[#888780] hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2">Coherencia Global</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-emerald-500">99.2%</span>
                <span className="text-sm font-medium text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded">Excelente</span>
              </div>
            </div>
            <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10"><AlertTriangle className="w-16 h-16 text-rose-500"/></div>
              <div className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 relative z-10">Inconsistencias</div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-rose-600">3</span>
                <span className="text-sm font-medium text-rose-600 mb-1 bg-rose-50 px-2 py-0.5 rounded">Menores</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-600 p-4 rounded-xl shadow-md flex flex-col justify-between text-[#2C2C2A] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20"><Zap className="w-16 h-16 text-[#2C2C2A]"/></div>
              <div className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2 relative z-10">Optimizaciones IA</div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-[#2C2C2A]">8</span>
                <span className="text-sm font-medium text-indigo-100 mb-1 bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">Disponibles <ArrowRight className="w-3 h-3"/></span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2">Salud Base Datos</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-slate-800">100%</span>
                <span className="text-sm font-medium text-[#888780] mb-1">Índices OK</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            
            {/* Lista de Inconsistencias (2/3 ancho) */}
            <div className="col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Alertas Activas (Requieren Atención)
              </h3>

              <div className="space-y-4">
                
                {/* Alerta 1 */}
                <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Conflicto Detectado: "Tipo Pedido Campaña"</h4>
                      <p className="text-xs text-[#888780] font-medium">Valor "17 POLITICA" marcado como conflictivo cruzado.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="text-sm flex items-center gap-2"><span className="text-[#888780] font-medium w-20">Impacto:</span> <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">3 contratos afectados</span></div>
                      <div className="text-sm flex items-center gap-2"><span className="text-[#888780] font-medium w-20">Sugerencia:</span> <span className="text-slate-700">Revisar reglas de validación exclusivas.</span></div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-[#2C2C2A] rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1">Resolver</button>
                      <button className="px-4 py-1.5 text-xs font-bold text-[#888780] hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">Ignorar</button>
                    </div>
                  </div>
                </div>

                {/* Alerta 2 */}
                <div className="bg-white border border-rose-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Cuenta Contable Inválida: "Centro de Costo"</h4>
                      <p className="text-xs text-[#888780] font-medium">Cuenta <span className="font-mono bg-white px-1">6110045</span> no existe en el plan actual activo.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="text-sm flex items-center gap-2"><span className="text-[#888780] font-medium w-20">Afectados:</span> <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">12 valores de propiedad</span></div>
                      <div className="text-sm flex items-center gap-2"><span className="text-[#888780] font-medium w-20">Sugerencia:</span> <span className="text-slate-700">Actualizar masivamente a cuenta <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1 rounded">6110046</span></span></div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button className="px-4 py-1.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-[#2C2C2A] rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1">Corregir Auto</button>
                      <button className="px-4 py-1.5 text-xs font-bold text-[#888780] hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">Edición Manual</button>
                    </div>
                  </div>
                </div>

                {/* Alerta 3 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <Copy className="w-5 h-5 text-[#888780]" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Posible Duplicación Semántica</h4>
                      <p className="text-xs text-[#888780] font-medium">Valores "DIGITAL" y "AUDIO DIGITAL" son estructuralmente similares.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white flex items-center justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="text-sm flex items-center gap-2"><span className="text-[#888780] font-medium w-20">Confusión:</span> <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">5 usuarios reportaron duda</span></div>
                      <div className="text-sm flex items-center gap-2"><span className="text-[#888780] font-medium w-20">Sugerencia:</span> <span className="text-slate-700">Consolidar bajo un mismo valor o renombrar para claridad.</span></div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button className="px-4 py-1.5 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-[#2C2C2A] rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1">Consolidar</button>
                      <button className="px-4 py-1.5 text-xs font-bold text-[#888780] hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">Mantener</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Panel de Optimizaciones IA (1/3 ancho) */}
            <div className="col-span-1 space-y-4">
              <h3 className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Sugerencias IA
              </h3>

              <div className="space-y-4">
                
                <div className="bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform"><Target className="w-12 h-12 text-indigo-500"/></div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 relative z-10">Nueva Propiedad Recomendada</h4>
                  <div className="space-y-2 relative z-10">
                    <div><span className="text-xs font-bold text-slate-800">Nombre: </span><span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">Formato Duración</span></div>
                    <div className="text-xs text-slate-600 bg-white/60 p-2 rounded"><span className="font-bold">Justificación:</span> 45% de campañas nuevas están especificando duraciones manualmente en comentarios.</div>
                    <div className="text-xs text-emerald-600 font-medium bg-emerald-50 p-2 rounded"><span className="font-bold">Beneficio:</span> Aumenta en 20% precisión de reportes de ocupación.</div>
                  </div>
                  <div className="mt-4 flex gap-2 relative z-10">
                    <button className="flex-1 py-1.5 text-xs font-bold bg-indigo-600 text-[#2C2C2A] rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Crear</button>
                    <button className="flex-1 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Rechazar</button>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform"><RefreshCw className="w-12 h-12 text-slate-800"/></div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 relative z-10">Reestructuración Jerarquía</h4>
                  <div className="space-y-2 relative z-10">
                    <div className="text-xs text-slate-600 bg-white p-2 rounded"><span className="font-bold">Sugerencia:</span> Agrupar todos los valores "PODCAST" bajo una sola categoría madre virtual.</div>
                    <div className="text-xs text-emerald-600 font-medium bg-emerald-50 p-2 rounded"><span className="font-bold">Beneficio IA:</span> Simplifica navegación un 23%. Operación sin riesgo (Metadata visual).</div>
                  </div>
                  <div className="mt-4 flex gap-2 relative z-10">
                    <button className="flex-1 py-1.5 text-xs font-bold bg-[#E8E5E0] text-[#2C2C2A] rounded-lg shadow-sm hover:bg-[#D4D1CC] transition-colors">Preview & Aplicar</button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
