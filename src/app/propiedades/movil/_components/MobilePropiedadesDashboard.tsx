import React, { useState } from 'react';
import { logger } from '@/lib/observability';
import { 
  Home, BarChart2, Settings, CheckCircle2,
  Search, ShieldAlert, Zap, ChevronRight, 
  RefreshCw, Building, Tag, FileText, Plus
} from 'lucide-react';
import { TipoPropiedadDto } from '../../../../modules/propiedades/infrastructure/actions/propiedadesActions';
import { WizardCrearPropiedad } from '../../components/WizardCrearPropiedad';
import { CentroValidacionesModal } from '../../components/CentroValidacionesModal';
import { AnalyticsUtilizacionModal } from '../../components/AnalyticsUtilizacionModal';
import { CortexClassifierModal } from '../../components/CortexClassifierModal';
import { CortexOptimizerModal } from '../../components/CortexOptimizerModal';
import { ReporteEjecutivoEstructuraModal } from '../../components/ReporteEjecutivoEstructuraModal';
import { EditorValoresMasivo } from '../../components/EditorValoresMasivo';

export function MobilePropiedadesDashboard({ tiposIniciales }: { tiposIniciales: TipoPropiedadDto[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTipoId, setSelectedTipoId] = useState<string | null>(null);
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCentroValidacionesOpen, setIsCentroValidacionesOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCortexClassifierOpen, setIsCortexClassifierOpen] = useState(false);
  const [isCortexOptimizerOpen, setIsCortexOptimizerOpen] = useState(false);
  const [isReporteEjecutivoOpen, setIsReporteEjecutivoOpen] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      
      {/* Header Fijo */}
      <div className="bg-slate-800 text-white px-4 py-3 pb-8 rounded-b-[2rem] shadow-md relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">SP</div>
            <span className="font-bold text-lg tracking-tight">Propiedades <span>TIER 0</span></span>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setIsCentroValidacionesOpen(true)} className="relative active:scale-95 transition-transform">
               <ShieldAlert className="w-5 h-5 text-amber-400" />
               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-800"></div>
             </button>
          </div>
        </div>

        {/* Global Key Metrics Mini */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest mb-1">Activas</span>
            <span className="text-xl font-bold">{tiposIniciales.length > 0 ? tiposIniciales.length : 45}</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-700">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest mb-1">Validación</span>
            <span className="text-xl font-bold text-emerald-400 flex items-center gap-1">99.2%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest mb-1">Sync</span>
            <span className="text-xs font-bold mt-1 text-slate-400 flex items-center gap-1"><RefreshCw className="w-3 h-3"/> 5m</span>
          </div>
        </div>
      </div>

      {/* Contenido Principal Scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 -mt-4 relative z-20 pb-24">
        
        {/* Alertas Inteligentes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 mb-4 border-l-4 border-l-rose-500">
           <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4" /> Alertas Activas (IA)
           </h3>
           <div className="space-y-2">
             <button onClick={() => setIsCentroValidacionesOpen(true)} className="w-full flex justify-between items-center text-sm active:bg-rose-50 rounded p-1 transition-colors">
               <span className="text-slate-700 font-medium">Inconsistencias Detectadas</span>
               <span className="font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-xs">2</span>
             </button>
             <button onClick={() => setIsCortexOptimizerOpen(true)} className="w-full flex justify-between items-center text-sm border-t border-slate-50 pt-2 active:bg-indigo-50 rounded p-1 transition-colors">
               <span className="text-slate-700 font-medium">Sugerencias Estructurales</span>
               <span className="font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">+1 Nueva</span>
             </button>
           </div>
        </div>

        {/* Consultas Rápidas */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1 mt-6">Consultas Rápidas</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setIsCortexClassifierOpen(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><Search className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-slate-700 text-center leading-tight">Clasificador Automático</span>
          </button>
          <button onClick={() => setIsAnalyticsOpen(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><BarChart2 className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-slate-700">Analytics de Uso</span>
          </button>
          <button onClick={() => setIsCentroValidacionesOpen(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-slate-700">Validaciones Auto</span>
          </button>
          <button onClick={() => setIsReporteEjecutivoOpen(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><FileText className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-slate-700">Reporte Ejecutivo</span>
          </button>
        </div>

        {/* Acceso Rápido Categorías */}
        <div className="flex items-center justify-between mb-3 px-1 mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Todas las Propiedades</h3>
          <button onClick={() => setIsWizardOpen(true)} className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 active:scale-95 transition-transform"><Plus className="w-3 h-3"/> Nueva</button>
        </div>
        
        <div className="space-y-3">
          {tiposIniciales.map(tipo => (
            <button key={tipo.id} onClick={() => setSelectedTipoId(tipo.id)} className="w-full text-left bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                   {tipo.id === '1' ? <Tag className="w-5 h-5"/> : <Building className="w-5 h-5"/>}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm text-slate-800 truncate">{tipo.nombre}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate">{tipo.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>

      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-slate-200 fixed bottom-0 w-full z-50 pt-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-2 pb-2">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Inicio</span>
          </button>
          <button onClick={() => setActiveTab('properties')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'properties' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Tag className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Props</span>
          </button>
          
          <div className="relative -top-5">
            <button onClick={() => setIsCortexOptimizerOpen(true)} className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-transform">
              <Zap className="w-6 h-6 fill-current" />
            </button>
          </div>

          <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <BarChart2 className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Métricas</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        </div>
      </div>

      {/* VISTA DETALLE PROPIEDAD Y EDITOR MASIVO MÓVIL */}
      {selectedTipoId && (
        <div className="fixed inset-0 z-40 bg-slate-50 flex flex-col animate-in slide-in-from-right-full pb-20">
          <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 shadow-sm pt-safe z-50">
            <button onClick={() => setSelectedTipoId(null)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full active:scale-95 transition-transform">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <h2 className="font-bold text-lg text-slate-800 truncate flex-1">{tiposIniciales.find(t => t.id === selectedTipoId)?.nombre}</h2>
          </div>
          <div className="flex-1 overflow-auto w-full overflow-x-hidden bg-slate-50/30 p-2">
            <EditorValoresMasivo tipoName={tiposIniciales.find(t => t.id === selectedTipoId)?.nombre || ''} />
          </div>
        </div>
      )}

      {/* MODALS */}
      {isWizardOpen && (
        <WizardCrearPropiedad 
          onClose={() => setIsWizardOpen(false)} 
          onComplete={(data) => {
            logger.info("Valores guardados del wizard:", data);
            setIsWizardOpen(false);
          }} 
        />
      )}
      {isCentroValidacionesOpen && <CentroValidacionesModal onClose={() => setIsCentroValidacionesOpen(false)} />}
      {isAnalyticsOpen && <AnalyticsUtilizacionModal onClose={() => setIsAnalyticsOpen(false)} />}
      {isCortexClassifierOpen && <CortexClassifierModal onClose={() => setIsCortexClassifierOpen(false)} />}
      {isCortexOptimizerOpen && <CortexOptimizerModal onClose={() => setIsCortexOptimizerOpen(false)} />}
      {isReporteEjecutivoOpen && <ReporteEjecutivoEstructuraModal onClose={() => setIsReporteEjecutivoOpen(false)} />}
    </div>
  );
}
