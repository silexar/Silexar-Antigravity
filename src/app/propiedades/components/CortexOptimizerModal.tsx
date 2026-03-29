import React from 'react';
import { 
  Rocket, RefreshCw, X, Zap, 
  Trash2, Plus, ArrowRight, Activity, Bell
} from 'lucide-react';

export function CortexOptimizerModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-indigo-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md border border-indigo-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
              <Rocket className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                CORTEX-OPTIMIZER
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Optimización Continua de Estructura de Datos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mr-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500"/> Salud Estructural 96%
            </span>
            <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Bell className="w-4 h-4 text-amber-500" /> Notificar a Stakeholders
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
              Análisis Semanal Completado (Hoy, 04:00 AM)
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Próxima Revisión: 7 Días</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            
            {/* Opt 1: Consolidacion */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <RefreshCw className="w-4 h-4" /> 1. Consolidación Recomendada
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mb-4 flex-1">
                <div className="flex items-center justify-center gap-3 font-mono text-xs font-bold text-slate-600 mb-3">
                   <div className="bg-white px-2 py-1 rounded border border-slate-200 shadow-sm flex flex-col gap-1 items-center">
                     <span>DIGITAL</span> <span>AUDIO DIGITAL</span>
                   </div>
                   <ArrowRight className="w-4 h-4 text-indigo-400" />
                   <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded border border-indigo-100 shadow-inner">CONTENIDO DIGITAL</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs flex justify-between"><span className="text-slate-500 font-medium">Beneficio:</span> <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">-15% Confusión, +12% Eficiencia</span></div>
                  <div className="text-xs flex justify-between"><span className="text-slate-500 font-medium">Riesgo IA:</span> <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">Muy Bajo (Migración 1-clic)</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Ejecutar Migración</button>
                <button className="flex-1 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Simular</button>
              </div>
            </div>

            {/* Opt 2: Nueva Propiedad */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <Plus className="w-4 h-4" /> 2. Nueva Propiedad Sugerida
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mb-4 flex-1">
                <div className="text-lg font-black text-slate-800 text-center mb-3">"Duración Spot"</div>
                <div className="space-y-1.5">
                  <div className="text-xs flex justify-between"><span className="text-slate-500 font-medium">Justificación:</span> <span className="text-slate-700 font-bold text-right">67% usuarios filtran por duración <br/> manualmente en comentarios</span></div>
                  <div className="text-xs flex justify-between"><span className="text-slate-500 font-medium">ROI Estimado:</span> <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">+23% Eficiencia Prog.</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">Crear Propiedad</button>
                <button className="flex-1 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Ver Análisis</button>
              </div>
            </div>

            {/* Opt 3: Eliminacion */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-rose-600">
                <Trash2 className="w-4 h-4" /> 3. Eliminación Sugerida
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mb-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-800">"Estado Proyecto"</span>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded">Uso Crítico: 23%</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-600 font-medium">Redundancia total con módulo nativo de Estado Campaña.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 transition-colors">Eliminar</button>
                <button className="flex-1 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Ver Alternativas</button>
              </div>
            </div>

            {/* Opt 4: Performance */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-amber-600">
                <Zap className="w-4 h-4" /> 4. Optimización Performance UX
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mb-4 flex-1">
                <p className="text-sm font-bold text-slate-800 mb-2">Reordenar Valores UI por Frecuencia</p>
                <div className="space-y-1.5">
                  <div className="text-xs flex justify-between"><span className="text-slate-500 font-medium">Beneficio:</span> <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">-8% Tiempo Selección</span></div>
                  <div className="text-xs flex justify-between"><span className="text-slate-500 font-medium">Impacto Dev:</span> <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded">0 Cambios (Visual Only)</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-lg shadow-sm hover:bg-amber-600 transition-colors">Aplicar Reorden</button>
                <button className="flex-1 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Preview UI</button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">Recomendaciones generadas por IA estricta nivel 4</div>
          <div className="flex gap-2">
            <button className="px-5 py-2 text-slate-600 hover:bg-slate-50 font-medium border border-slate-200 rounded-lg text-sm transition-colors">
              <Zap className="w-4 h-4 inline-block -mt-1 mr-1" /> Configurar Auto-Pilot
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors">
              <Rocket className="w-4 h-4" /> Ejecutar Todas las Sugeridas (Seguro)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
