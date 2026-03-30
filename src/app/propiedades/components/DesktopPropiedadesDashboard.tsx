'use client';

import React, { useState } from 'react';
import { 
  Network, Brain, FolderTree, FileText, 
  Briefcase, Plus, Upload, Search,
  CheckCircle2, ArrowUpRight, Check, X,
  Edit2, LineChart, ChevronRight
} from 'lucide-react';
import { TipoPropiedadDto } from '../../../modules/propiedades/infrastructure/actions/propiedadesActions';
import { WizardCrearPropiedad } from './WizardCrearPropiedad';
import { EditorValoresMasivo } from './EditorValoresMasivo';
import { CentroValidacionesModal } from './CentroValidacionesModal';
import { AnalyticsUtilizacionModal } from './AnalyticsUtilizacionModal';
import { CortexClassifierModal } from './CortexClassifierModal';
import { CortexOptimizerModal } from './CortexOptimizerModal';
import { ReporteEjecutivoEstructuraModal } from './ReporteEjecutivoEstructuraModal';

export function DesktopPropiedadesDashboard({ tiposIniciales }: { tiposIniciales: TipoPropiedadDto[] }) {
  const [tipos] = useState(tiposIniciales);
  const [selectedTipoId, setSelectedTipoId] = useState<string | null>(tipos[0]?.id || null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCentroValidacionesOpen, setIsCentroValidacionesOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCortexClassifierOpen, setIsCortexClassifierOpen] = useState(false);
  const [isCortexOptimizerOpen, setIsCortexOptimizerOpen] = useState(false);
  const [isReporteEjecutivoOpen, setIsReporteEjecutivoOpen] = useState(false);

  const selectedTipo = tipos.find(t => t.id === selectedTipoId);

  return (
    <div className="h-full w-full flex flex-col bg-slate-50">
      
      {/* BREADCRUMB Y TITULO (NUEVO) */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Configuración</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-indigo-600">Propiedades</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🏷️</span> Centro de Gestión de Propiedades
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsReporteEjecutivoOpen(true)} className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-colors"><FileText className="w-4 h-4 text-emerald-600"/> Reporte Ejecutivo</button>
          <button onClick={() => setIsCortexClassifierOpen(true)} className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-colors"><Brain className="w-4 h-4 text-indigo-500"/> Simulator Auto-Pilot</button>
          <button onClick={() => setIsAnalyticsOpen(true)} className="px-3 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 shadow-sm flex items-center gap-2 transition-colors"><LineChart className="w-4 h-4"/> Analytics</button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2"><Upload className="w-4 h-4"/> Importar CSV</button>
        </div>
      </div>

      {/* PANEL DE MÉTRICAS (Header Inteligente Optimizado) */}
      <div className="p-4 mx-6 mt-6 mb-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex gap-10 px-2">
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Network className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Estructura Organizacional</p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-800">{tipos.length} <span className="text-sm font-medium text-slate-500">Tipos</span></span>
                <span className="text-2xl font-black text-slate-800">287 <span className="text-sm font-medium text-slate-500">Valores</span></span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">12 Jerarquías • 23 Reglas • 156 Validaciones</p>
            </div>
          </div>

          <div className="w-px h-12 bg-slate-100 self-center"></div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Coherencia Global</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700">99.2%</span>
                <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold cursor-pointer hover:bg-emerald-200 transition-colors" onClick={() => setIsCortexOptimizerOpen(true)}>Óptimo</span>
              </div>
              <button onClick={() => setIsCortexOptimizerOpen(true)} className="text-[11px] text-emerald-700 font-bold mt-1 hover:underline flex items-center gap-1">Última optimización: Hace 2 días</button>
            </div>
          </div>

          <div className="w-px h-12 bg-slate-100 self-center"></div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Brain className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Cortex-AI Monitor</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-800">3 Alertas</span>
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-bold">8 Mejora</span>
              </div>
              <button onClick={() => setIsCentroValidacionesOpen(true)} className="text-[11px] text-indigo-600 font-bold mt-1 hover:underline flex items-center gap-1">Ver insights IA e Inconsistencias <ArrowUpRight className="w-3 h-3"/></button>
            </div>
          </div>

        </div>
      </div>

      <div className="flex-1 flex overflow-hidden mx-6 mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        {/* PANEL IZQUIERDO: ÁRBOL JERÁRQUICO */}
        <div className="w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar propiedad..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Category Node 1 */}
            <div>
              <div className="flex items-center gap-2 px-2 py-1 text-slate-600 font-semibold text-xs uppercase tracking-wider mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Clasificación Campaña
              </div>
              <div className="space-y-0.5 pl-2 border-l border-slate-200 ml-3">
                {tipos.filter(t => t.aplicacion.includes('CAMPANA' as never)).map(tipo => (
                  <button 
                    key={tipo.id}
                    onClick={() => setSelectedTipoId(tipo.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center justify-between transition-colors ${selectedTipoId === tipo.id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <span className="truncate">{tipo.nombre}</span>
                    {tipo.id === '1' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Node 2 */}
            <div>
              <div className="flex items-center gap-2 px-2 py-1 text-slate-600 font-semibold text-xs uppercase tracking-wider mb-1 mt-2">
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                Clasificación Cliente
              </div>
              <div className="space-y-0.5 pl-2 border-l border-slate-200 ml-3">
                {tipos.filter(t => t.aplicacion.includes('CLIENTE' as never)).map(tipo => (
                  <button 
                    key={tipo.id}
                    onClick={() => setSelectedTipoId(tipo.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center justify-between transition-colors ${selectedTipoId === tipo.id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <span className="truncate">{tipo.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-slate-100">
            <button 
              onClick={() => setIsWizardOpen(true)}
              className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Tipo
            </button>
          </div>
        </div>

        {/* PANEL CENTRAL Y DERECHO: CONFIG Y TABLA */}
        {selectedTipo ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* CONFIGURACIÓN DETALLADA (TOP) */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{selectedTipo.codigo}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo</span>
                    {!!(selectedTipo.configuracionValidacion as Record<string, unknown>)?.obligatorio && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Mandatorio</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedTipo.nombre}</h2>
                  <p className="text-slate-500 text-sm mt-1">{selectedTipo.descripcion}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><LineChart className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aplicación</h3>
                  <div className="flex flex-wrap gap-2">
                    {['CAMPANA', 'CONTRATO', 'CLIENTE', 'FACTURA'].map((app) => (
                      <div key={app} className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border ${selectedTipo.aplicacion.includes(app as never) ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {selectedTipo.aplicacion.includes(app as never) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {app}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Config Contable Defecto</h3>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="text-slate-500">Cta. Ingresos</span>
                      <span className="font-mono text-slate-700 font-medium">4110001</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Cta. Costos</span>
                      <span className="font-mono text-slate-700 font-medium">5110001</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Estadísticas de Uso</h3>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-medium">Utilización global</span>
                      <span className="text-sm font-bold text-slate-800">98% <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1 rounded">(Muy Alto)</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-medium">Valor más usado</span>
                      <span className="text-xs font-bold text-slate-700">01 PUBLICIDAD <span className="text-slate-400 font-normal">(45%)</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-medium">Tendencia</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3"/> +12% vs Q3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLA DE VALORES (BOTTOM) */}
            <div className="flex-1 overflow-hidden flex flex-col p-6 bg-slate-50/30">
              <EditorValoresMasivo tipoName={selectedTipo.nombre} />
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50">
            <div className="text-center">
              <div className="p-4 bg-white rounded-full inline-block shadow-sm mb-4 border border-slate-100">
                <FolderTree className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-600 font-medium">Selecciona una Propiedad</h3>
              <p className="text-sm text-slate-400 mt-1">Usa el panel de la izquierda para ver los detalles.</p>
            </div>
          </div>
        )}
      </div>
    {isWizardOpen && (
      <WizardCrearPropiedad 
        onClose={() => setIsWizardOpen(false)} 
        onComplete={(data) => {
          ;
          setIsWizardOpen(false);
          // Refresh logica real iría aquí
        }} 
      />
    )}
    
    {/* MODALS AI GLOBALES */}
    {isCentroValidacionesOpen && <CentroValidacionesModal onClose={() => setIsCentroValidacionesOpen(false)} />}
    {isAnalyticsOpen && <AnalyticsUtilizacionModal onClose={() => setIsAnalyticsOpen(false)} />}
    {isCortexClassifierOpen && <CortexClassifierModal onClose={() => setIsCortexClassifierOpen(false)} />}
    {isCortexOptimizerOpen && <CortexOptimizerModal onClose={() => setIsCortexOptimizerOpen(false)} />}
    {isReporteEjecutivoOpen && <ReporteEjecutivoEstructuraModal onClose={() => setIsReporteEjecutivoOpen(false)} />}
    </div>
  );
}
