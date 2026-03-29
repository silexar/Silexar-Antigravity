'use client';

import React, { useState } from 'react';
import { 
  X, Brain, Target, Briefcase, FileText, Settings, ShieldAlert, 
  CheckCircle2, ChevronRight, ChevronLeft, Save, Sparkles,
  FolderTree, Tags, Calculator, Network, Check, ToggleLeft, ToggleRight,
  ListTree, AlertTriangle, Filter, Plus, Eye
} from 'lucide-react';

interface WizardProps {
  onClose: () => void;
  onComplete?: (data: Record<string, unknown>) => void;
}

type Step = 1 | 2 | 3 | 4;

export function WizardCrearPropiedad({ onClose, onComplete }: WizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [formType, setFormType] = useState<'content' | 'commercial' | 'operative' | 'accounting' | 'custom' | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    aplicacion: ['Campañas', 'Contratos', 'Facturas', 'Reportes'],
    estado: 'Activo',
    codigoAuto: 'PROP-2025-046',

    // Validations
    tipoSeleccion: 'unica',
    obligatorio: true,
    valorUnico: false,
    validarCoherencia: true,
    aprobacion: false,
    detectarConflictos: false,
    validarExclusividad: false,
    permitirLibre: true,
    filtroReportes: true,
    agrupacionAuto: true,
    exportExcel: true,
    ordenDefault: false,
    iaSugerencias: true,
    iaInconsistencias: true,
    iaOptimizacion: true,

    // Accounting
    impactoContable: 'especifica',
    cuentaIngresos: '4110000',
    cuentaCostos: '5110000',
    centroCosto: 'Variable',
    validarCuentas: true,
    verificarPlan: true,
    aprobacionCFO: false,
    auditoriaAuto: true,
    estadoResultados: true,
    segmentacionCentro: true,
    analisisRentabilidad: false,

    // Step 4
    valoresSugeridos: [
      { id: '01', desc: 'SPOT RADIO', checked: true },
      { id: '02', desc: 'JINGLE CORPORATIVO', checked: true },
      { id: '03', desc: 'MENCION EN VIVO', checked: true },
      { id: '04', desc: 'CUÑA PROMOCIONAL', checked: true },
      { id: '05', desc: 'IDENTIFICACION PROGRAMA', checked: true },
      { id: '06', desc: 'PODCAST BRANDED', checked: false },
      { id: '07', desc: 'AUDIO STREAMING', checked: false },
      { id: '08', desc: 'MICROESPACIO TEMPORAL', checked: false },
    ],
    nuevoValorCodigo: '09',
    nuevoValorDesc: '',
    todosActivos: true,
    numeracionAuto: true,
    heredarContabilidad: true,
  });

  const toggleValorSug = (id: string) => {
    setFormData(prev => ({
      ...prev,
      valoresSugeridos: prev.valoresSugeridos.map(v => 
        v.id === id ? { ...v, checked: !v.checked } : v
      )
    }));
  };

  const toggleAplicacion = (app: string) => {
    setFormData(prev => ({
      ...prev,
      aplicacion: prev.aplicacion.includes(app)
        ? prev.aplicacion.filter(a => a !== app)
        : [...prev.aplicacion, app]
    }));
  };

  const handleNext = () => setStep(s => Math.min(4, s + 1) as Step);
  const handlePrev = () => setStep(s => Math.max(1, s - 1) as Step);
  
  const finish = () => {
    if (onComplete) onComplete(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* WIZARD HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-xl">🎯</span> Crear Nuevo Tipo de Propiedad
              </h2>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                Asistido por Cortex-AI <Sparkles className="w-3 h-3 text-amber-500" />
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="px-8 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 z-0 transition-all duration-500"
              style={{ width: step === 1 ? '15%' : step === 2 ? '40%' : step === 3 ? '65%' : '90%' }}
            ></div>

            {[
              { num: 1, title: 'Definición', icon: <FileText className="w-4 h-4" /> },
              { num: 2, title: 'Validaciones', icon: <ShieldAlert className="w-4 h-4" /> },
              { num: 3, title: 'Contabilidad', icon: <Calculator className="w-4 h-4" /> },
              { num: 4, title: 'Valores', icon: <Tags className="w-4 h-4" /> },
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step > s.num ? 'bg-indigo-500 border-indigo-500 text-white' :
                  step === s.num ? 'bg-white border-indigo-500 text-indigo-600 shadow-sm' :
                  'bg-white border-slate-200 text-slate-300'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  step >= s.num ? 'text-slate-700' : 'text-slate-400'
                }`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WIZARD CONTENT OVERFLOW SCROLL */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          
          {/* PASO 1: DEFINICIÓN */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-300">
              
              {!formType ? (
                <>
                  <h3 className="text-xl font-bold text-slate-800 text-center mb-6 flex items-center justify-center gap-2">
                    <Brain className="w-6 h-6 text-indigo-500" /> ¿Qué tipo de clasificación necesitas?
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'content', icon: <FileText/>, title: 'Clasificación de Contenido', desc: 'Para categorizar tipos de material. Ejemplo: Spot, Jingle, Mención' },
                      { id: 'commercial', icon: <Target/>, title: 'Segmentación Comercial', desc: 'Para agrupar oportunidades. Ejemplo: Por región, por ejecutivo' },
                      { id: 'operative', icon: <Briefcase/>, title: 'Categoría Operativa', desc: 'Para procesos internos. Ejemplo: Estados, prioridades' },
                      { id: 'accounting', icon: <Calculator/>, title: 'Clasificación Contable', desc: 'Para efectos financieros. Ejemplo: Centros costo, cuentas' },
                      { id: 'custom', icon: <Tags/>, title: 'Atributo Personalizado', desc: 'Para necesidad específica. Ejemplo: Tags, etiquetas libres' },
                      { id: 'manual', icon: <Settings/>, title: 'Manual/Personalizado', desc: 'Definición completamente libre desde cero' },
                    ].map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => setFormType(t.id as 'content' | 'commercial' | 'operative' | 'accounting' | 'custom')}
                        className="text-left p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md hover:ring-2 hover:ring-indigo-50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          {t.icon}
                        </div>
                        <h4 className="font-bold text-slate-700 mb-1">{t.title}</h4>
                        <p className="text-xs text-slate-500">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500"/> Información Fundamental</h3>
                      <p className="text-sm text-slate-500">Defina la identidad básica de esta nueva clasificación.</p>
                    </div>
                    <button onClick={() => setFormType(null)} className="text-xs text-indigo-600 font-medium hover:underline">Cambiar plantilla</button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                    
                    {/* Nombre y IA */}
                    <div className="space-y-2 relative">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider text-[11px]">Nombre del Tipo</label>
                      <input 
                        type="text" 
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Ej. Tipo de Creatividad"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                      />
                      
                      {/* Sugerencias IA Hover */}
                      <div className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                        <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5"/> Sugerencias IA:</p>
                        <div className="flex flex-wrap gap-2">
                          {['Tipo de Creatividad', 'Canal de Distribución', 'Formato Publicitario'].map(sug => (
                            <button 
                              key={sug}
                              onClick={() => setFormData({...formData, nombre: sug})}
                              className="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 text-xs rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                              "{sug}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Descripcion */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider text-[11px]">Descripción (Opcional)</label>
                      <textarea 
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        placeholder="Propósito de esta clasificación..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-20 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      {/* Codigo Auto */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1 block">Código Identificador</label>
                        <div className="font-mono text-sm font-semibold text-slate-800">{formData.codigoAuto}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">Generado Automáticamente</span>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2 block">Estado Inicial</label>
                        <select 
                          value={formData.estado}
                          onChange={(e) => setFormData({...formData, estado: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-indigo-500 text-slate-700"
                        >
                          <option>Activo</option>
                          <option>Borrador</option>
                        </select>
                      </div>
                    </div>

                    {/* Aplicacion */}
                    <div className="pt-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3 block flex items-center gap-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        Aplicación del Tipo (Selección Múltiple)
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {['Campañas', 'Contratos', 'Clientes', 'Facturas', 'Reportes'].map(app => {
                          const isSelected = formData.aplicacion.includes(app);
                          return (
                            <button
                              key={app}
                              onClick={() => toggleAplicacion(app)}
                              className={`py-2 px-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${
                                isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              {app}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: VALIDACIONES */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-300 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-indigo-500"/> Configuración de Validaciones</h3>
                <p className="text-sm text-slate-500">Defina las reglas y restricciones para los valores de esta propiedad.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                
                {/* Tipo Seleccion */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2"><ListTree className="w-3.5 h-3.5"/> Tipo de Selección</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'unica', label: 'Lista única', desc: 'Seleccionar solo 1 valor' },
                      { id: 'multiple', label: 'Lista múltiple', desc: 'Permite seleccionar varios valores' },
                      { id: 'libre', label: 'Valor libre', desc: 'Entrada de texto sin restricciones' }
                    ].map(opt => (
                      <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.tipoSeleccion === opt.id ? 'bg-indigo-50/50 border-indigo-200' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <input type="radio" name="tipo_sel" checked={formData.tipoSeleccion === opt.id} onChange={() => setFormData({...formData, tipoSeleccion: opt.id})} className="mt-1" />
                        <div>
                          <div className={`text-sm font-bold ${formData.tipoSeleccion === opt.id ? 'text-indigo-800' : 'text-slate-700'}`}>{opt.label}</div>
                          <div className="text-xs text-slate-500">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Validaciones Basicas */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/> Validaciones Básicas</h4>
                  
                  <ToggleRow label="Campo obligatorio" checked={formData.obligatorio} onChange={(v) => setFormData({...formData, obligatorio: v})} />
                  <ToggleRow label="Valor único por registro" checked={formData.valorUnico} onChange={(v) => setFormData({...formData, valorUnico: v})} />
                  <ToggleRow label="Validar coherencia automática" checked={formData.validarCoherencia} onChange={(v) => setFormData({...formData, validarCoherencia: v})} />
                  <ToggleRow label="Requiere aprobación supervisión" checked={formData.aprobacion} onChange={(v) => setFormData({...formData, aprobacion: v})} />
                </div>

                {/* Gestion Conflictos */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5"/> Gestión de Conflictos</h4>
                  <ToggleRow label="Detectar valores conflictivos" checked={formData.detectarConflictos} onChange={(v) => setFormData({...formData, detectarConflictos: v})} />
                  <ToggleRow label="Validar exclusividad mutua" checked={formData.validarExclusividad} onChange={(v) => setFormData({...formData, validarExclusividad: v})} />
                  <ToggleRow label="Permitir combinaciones libres" checked={formData.permitirLibre} onChange={(v) => setFormData({...formData, permitirLibre: v})} />
                </div>

                {/* Reportes y AI */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><Filter className="w-3.5 h-3.5"/> Configuración en Reportes</h4>
                    <ToggleRow label="Disponible como filtro" checked={formData.filtroReportes} onChange={(v) => setFormData({...formData, filtroReportes: v})} />
                    <ToggleRow label="Agrupación automática" checked={formData.agrupacionAuto} onChange={(v) => setFormData({...formData, agrupacionAuto: v})} />
                    <ToggleRow label="Incluir en exports Excel" checked={formData.exportExcel} onChange={(v) => setFormData({...formData, exportExcel: v})} />
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 shadow-sm space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-2"><Brain className="w-3.5 h-3.5"/> Asistencia Cortex-IA</h4>
                    <ToggleRow label="Sugerencias automáticas valores" checked={formData.iaSugerencias} onChange={(v) => setFormData({...formData, iaSugerencias: v})} highlight />
                    <ToggleRow label="Detección inconsistencias" checked={formData.iaInconsistencias} onChange={(v) => setFormData({...formData, iaInconsistencias: v})} highlight />
                    <ToggleRow label="Optimización estructura" checked={formData.iaOptimizacion} onChange={(v) => setFormData({...formData, iaOptimizacion: v})} highlight />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PASO 3: CONTABLE */}
          {step === 3 && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-300 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calculator className="w-5 h-5 text-indigo-500"/> Configuración Contable Avanzada</h3>
                <p className="text-sm text-slate-500">Vincule esta propiedad con el impacto financiero y los centros de costos.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                
                <div className="space-y-6">
                  {/* Impacto */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2"><Target className="w-3.5 h-3.5"/> Tipo de Impacto Contable</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'especifica', label: 'Cuenta específica por valor' },
                        { id: 'comun', label: 'Todos comparten cuenta común' },
                        { id: 'ninguno', label: 'Sin impacto contable directo' }
                      ].map(opt => (
                        <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.impactoContable === opt.id ? 'bg-indigo-50/50 border-indigo-200' : 'border-slate-100 hover:bg-slate-50'}`}>
                          <input type="radio" checked={formData.impactoContable === opt.id} onChange={() => setFormData({...formData, impactoContable: opt.id})} className="mt-1" />
                          <div className={`text-sm font-bold ${formData.impactoContable === opt.id ? 'text-indigo-800' : 'text-slate-700'}`}>{opt.label}</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Defecto */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><Settings className="w-3.5 h-3.5"/> Configuración por Defecto</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Cta. Ingresos</label>
                        <select className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-mono text-slate-700">
                          <option>4110000</option>
                          <option>4110046</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Cta. Costos</label>
                        <select className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-mono text-slate-700">
                          <option>5110000</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Centro de Costo</label>
                        <select className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-medium text-slate-700">
                          <option>Variable (Según Sucursal)</option>
                          <option>Fijo Corporativo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Validaciones AI y Finanzas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5"/> Validaciones Financieras</h4>
                    <ToggleRow label="Validar existencia de cuentas" checked={formData.validarCuentas} onChange={(v) => setFormData({...formData, validarCuentas: v})} />
                    <ToggleRow label="Verificar plan de cuentas activo" checked={formData.verificarPlan} onChange={(v) => setFormData({...formData, verificarPlan: v})} />
                    <ToggleRow label="Requiere aprobación CFO" checked={formData.aprobacionCFO} onChange={(v) => setFormData({...formData, aprobacionCFO: v})} />
                    <ToggleRow label="Auditoría automática cambios" checked={formData.auditoriaAuto} onChange={(v) => setFormData({...formData, auditoriaAuto: v})} />
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-5 shadow-sm space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5"/> Sugerencias IA Contables</h4>
                    
                    <div className="flex items-center gap-2 bg-white/60 p-2 rounded border border-amber-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                      <span className="text-xs font-medium text-slate-700">Cuenta 4110046 disponible inmediatamente.</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 p-2 rounded border border-amber-200">
                      <Network className="w-4 h-4 text-indigo-500"/>
                      <span className="text-xs font-medium text-slate-700">Detectado patrón similar a "Tipo Pedido".</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 p-2 rounded border border-amber-200">
                      <ShieldAlert className="w-4 h-4 text-emerald-500"/>
                      <span className="text-xs font-medium text-slate-700">Esta configuración cumple normativa local (NIIF).</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PASO 4: VALORES INICIALES */}
          {step === 4 && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-300 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Tags className="w-5 h-5 text-indigo-500"/> Valores Iniciales de la Propiedad</h3>
                <p className="text-sm text-slate-500">Defina la estructura semilla de datos o utilice la propuesta de la IA.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                
                {/* Visualizador Izquierdo - Sugeridos */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5"/> Valores Sugeridos (IA)</h4>
                    <p className="text-xs text-slate-600 font-medium mb-3">Basados en: "{formData.nombre || 'Tipo de Creatividad'}"</p>
                    
                    <div className="space-y-1.5 bg-white p-2 rounded-lg border border-indigo-50/50">
                      {formData.valoresSugeridos.map(v => (
                        <label key={v.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                          <input type="checkbox" checked={v.checked} onChange={() => toggleValorSug(v.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          <div className="font-mono text-xs text-slate-400 w-5">{v.id}</div>
                          <div className={`text-xs font-bold ${v.checked ? 'text-slate-700' : 'text-slate-400'}`}>{v.desc}</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><Plus className="w-3.5 h-3.5"/> Agregar Valor Manual</h4>
                    <div className="flex items-center gap-2">
                       <input value={formData.nuevoValorCodigo} readOnly aria-label="Código del valor" className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center" />
                       <input placeholder="Descripción del valor..." aria-label="Descripción del valor" className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Visualizador Derecho - Preview */}
                <div className="space-y-4 flex flex-col">
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><Settings className="w-3.5 h-3.5"/> Configuración Rápida</h4>
                    <ToggleRow label="Todos activos por defecto" checked={formData.todosActivos} onChange={(v) => setFormData({...formData, todosActivos: v})} />
                    <ToggleRow label="Numeración automática" checked={formData.numeracionAuto} onChange={(v) => setFormData({...formData, numeracionAuto: v})} />
                    <ToggleRow label="Configuración contable heredada" checked={formData.heredarContabilidad} onChange={(v) => setFormData({...formData, heredarContabilidad: v})} />
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5 shadow-md border border-slate-700 flex-1 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <FolderTree className="w-24 h-24 text-white" />
                    </div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2 z-10"><Eye className="w-3.5 h-3.5"/> Preview Estructura</h4>
                    
                    <div className="font-mono text-[11px] text-slate-300 z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="font-bold text-indigo-300 mb-2 text-xs">{formData.nombre || 'TIPO PROPIEDAD'}</div>
                      <div className="space-y-1.5 border-l border-slate-600 ml-1.5 pl-3">
                        {formData.valoresSugeridos.filter(v => v.checked).map((v, i, arr) => (
                           <div key={v.id} className="flex">
                             <span className="text-slate-600 mr-2">{i === arr.length - 1 ? '└──' : '├──'}</span>
                             <span className="text-emerald-400 mr-2">{v.id}</span>
                             <span>{v.desc}</span>
                           </div>
                        ))}
                        {formData.valoresSugeridos.filter(v => v.checked).length === 0 && (
                          <div className="text-slate-500 italic">Estructura vacía...</div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>

        {/* WIZARD FOOTER CONTROLS */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <div>
            {step > 1 && (
              <button 
                onClick={handlePrev}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors"
                disabled={!formType}
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:bg-slate-100 font-medium rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={!formType}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente: {step === 1 ? 'Configuración' : step === 2 ? 'Contabilidad' : 'Valores'} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={finish}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md shadow-emerald-200 transition-colors"
              >
                <Save className="w-4 h-4" /> Crear Propiedad
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange, highlight = false }: { label: string, checked: boolean, onChange: (v: boolean) => void, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <span className={`text-sm ${highlight ? 'font-medium text-indigo-700' : 'text-slate-600'}`}>{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className="focus:outline-none"
      >
        {checked ? (
          <ToggleRight className={`w-8 h-8 transition-colors ${highlight ? 'text-indigo-500' : 'text-emerald-500'}`} />
        ) : (
          <ToggleLeft className="w-8 h-8 text-slate-300 transition-colors" />
        )}
      </button>
    </div>
  );
}
