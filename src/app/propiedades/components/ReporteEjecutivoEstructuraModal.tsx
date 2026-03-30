import React from 'react';
import { 
  BarChart, ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle2, 
  X, Download, Share2, Award, Zap, AlertTriangle, ShieldCheck
} from 'lucide-react';

export function ReporteEjecutivoEstructuraModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-indigo-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md border border-indigo-700 relative overflow-hidden">
              <BarChart className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                REPORTE EJECUTIVO
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Salud Organizacional y Taxonomía - Q3 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="px-3 py-2 text-sm font-bold text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Métricas Clave */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Propiedades</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-slate-800">45</span>
                <span className="text-sm font-medium text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded">Óptimo para org</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Utilización Promedio</div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-indigo-600">76.3%</span>
                <span className="text-sm font-medium text-indigo-600 mb-1 bg-indigo-50 px-2 py-0.5 rounded">Saludable</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Coherencia Global</div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-emerald-600">99.2%</span>
                <span className="text-sm font-medium text-emerald-600 mb-1 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Excelente</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-600 p-4 rounded-xl shadow-md flex flex-col justify-between text-white relative overflow-hidden">
              <div className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2 relative z-10">Satisfacción Usuario</div>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl font-black text-white">8.9</span>
                <span className="text-sm font-medium text-indigo-100 mb-1 bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">Muy Buena</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            
            {/* Tendencias y Logros */}
            <div className="col-span-1 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Tendencias
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm font-medium text-slate-600">Adopción de nuevas propiedades</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs"><ArrowUpRight className="w-3 h-3"/> +34% (trimestre)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm font-medium text-slate-600">Reducción errores de clasificación</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs"><ArrowDownRight className="w-3 h-3"/> -67% (año)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm font-medium text-slate-600">Tiempo promedio clasificación</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs"><ArrowDownRight className="w-3 h-3"/> -23% (vs ant)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Compliance Contable</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs"><CheckCircle2 className="w-3 h-3"/> 100% (último año)</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-50 to-white border border-amber-100 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Award className="w-24 h-24 text-amber-500"/></div>
                <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2 relative z-10">
                  <Award className="w-4 h-4" /> Logros Destacados
                </h3>
                <ul className="space-y-3 relative z-10">
                  <li className="flex gap-2">
                    <span className="text-amber-500 mt-0.5">🏆</span>
                    <span className="text-sm text-slate-700 font-medium"><strong>Zero downtime</strong> en implementaciones estructurales masivas.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 mt-0.5">🏆</span>
                    <span className="text-sm text-slate-700 font-medium"><strong>+95% de precisión</strong> en clasificación automática por IA.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 mt-0.5">🏆</span>
                    <span className="text-sm text-slate-700 font-medium">Reducción del <strong>45% en consultas</strong> a soporte operativo.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 mt-0.5">🏆</span>
                    <span className="text-sm text-slate-700 font-medium">Mejora de <strong>67% en consistencia</strong> de reportes gerenciales.</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Acciones y Recomendaciones */}
            <div className="col-span-1 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500" /> Próximas Acciones
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <input type="checkbox" className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 pointer-events-none" />
                    <span className="text-sm text-slate-700 font-medium">Optimizar 3 propiedades sub-utilizadas notificadas por IA.</span>
                  </li>
                  <li className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <input type="checkbox" className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 pointer-events-none" />
                    <span className="text-sm text-slate-700 font-medium">Implementar 2 nuevas clasificaciones sugeridas (Formato Duración).</span>
                  </li>
                  <li className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <input type="checkbox" className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 pointer-events-none" />
                    <span className="text-sm text-slate-700 font-medium">Lanzamiento de Training UI a usuarios en funciones avanzadas.</span>
                  </li>
                  <li className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <input type="checkbox" className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 pointer-events-none" />
                    <span className="text-sm text-slate-700 font-medium">Migración de 2 propiedades legacy pendientes de V1.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800 text-white rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><AlertTriangle className="w-24 h-24 text-indigo-500"/></div>
                <h3 className="text-sm font-bold flex items-center gap-2 relative z-10 text-indigo-300">
                  <TrendingUp className="w-4 h-4" /> Recomendaciones Estratégicas
                </h3>
                <ul className="space-y-3 relative z-10">
                  <li className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">1</div>
                    <span className="text-sm text-slate-300 font-medium">Expandir uso obligatorio de propiedades al módulo de <strong className="text-white">Facturación</strong>.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">2</div>
                    <span className="text-sm text-slate-300 font-medium">Integrar con <strong className="text-white">Sistema CRM Externo</strong> (Salesforce/Hubspot Sync).</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">3</div>
                    <span className="text-sm text-slate-300 font-medium">Implementar el alcance de clasificación <strong className="text-white">predictiva en todos los módulos</strong> operativos.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">4</div>
                    <span className="text-sm text-slate-300 font-medium">Considerar arquitectura <strong className="text-white">multi-idioma</strong> para futura expansión LatAm.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
