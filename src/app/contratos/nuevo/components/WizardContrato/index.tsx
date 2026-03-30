/**
 * 🎯 SILEXAR PULSE - Wizard de Creación de Contratos TIER 0
 * 
 * @description Componente principal del wizard con diseño neuromórfico
 * ultra-moderno, animaciones fluidas y UX de nivel enterprise 2050+.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @futureProof 2050+
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  BarChart3, 
  CheckCircle2, 
  FileSignature,
  ChevronLeft,
  ChevronRight,
  Save,
  Sparkles,
  Shield,
  Zap,
  Lock
} from 'lucide-react';
import { useWizardContrato } from './hooks/useWizardContrato';
import { WIZARD_STEPS, WizardStep } from './types/wizard.types';
import StepInfoFundamental from './steps/StepInfoFundamental';
import StepTerminosComerciales from './steps/StepTerminosComerciales';
import StepEspecificaciones from './steps/StepEspecificaciones';
import StepAprobaciones from './steps/StepAprobaciones';
import StepDocumentacion from './steps/StepDocumentacion';
import AutorizacionPanel from './enterprise/AutorizacionPanel';

// ═══════════════════════════════════════════════════════════════
// ICONOS DE PASOS
// ═══════════════════════════════════════════════════════════════

const stepIcons = {
  1: FileText,
  2: DollarSign,
  3: BarChart3,
  4: CheckCircle2,
  5: FileSignature,
  6: Lock
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE HEADER DEL WIZARD
// ═══════════════════════════════════════════════════════════════

interface WizardHeaderProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  progreso: number;
  onStepClick: (step: WizardStep) => void;
}

const WizardHeader: React.FC<WizardHeaderProps> = ({ 
  currentStep, 
  completedSteps, 
  progreso,
  onStepClick 
}) => {
  return (
    <div className="relative mb-8">
      {/* Barra de progreso de fondo */}
      <div className="absolute top-12 left-0 right-0 h-1 bg-slate-200 rounded-full mx-16 z-0">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      {/* Pasos */}
      <div className="flex justify-between items-center relative z-10">
        {WIZARD_STEPS.map((step) => {
          const Icon = stepIcons[step.id as keyof typeof stepIcons];
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isAccessible = isCompleted || step.id <= Math.max(...completedSteps, 0) + 1;
          
          return (
            <button
              key={step.id}
              onClick={() => isAccessible && onStepClick(step.id)}
              disabled={!isAccessible}
              className={`
                flex flex-col items-center group transition-all duration-300
                ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              `}
            >
              {/* Círculo del paso */}
              <motion.div
                className={`
                  relative w-16 h-16 rounded-2xl flex items-center justify-center
                  transition-all duration-300 mb-3
                  ${isCurrent 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_8px_32px_rgba(99,102,241,0.4)]' 
                    : isCompleted
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-100 shadow-[4px_4px_12px_rgba(0,0,0,0.1),-4px_-4px_12px_rgba(255,255,255,0.9)]'
                  }
                `}
                whileHover={isAccessible ? { scale: 1.05, y: -2 } : {}}
                whileTap={isAccessible ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-7 h-7 text-white" />
                ) : (
                  <Icon className={`w-7 h-7 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                )}
                
                {/* Efecto de brillo para paso actual */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-white/20"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {/* Título del paso */}
              <span className={`
                text-sm font-medium transition-colors duration-200
                ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}
              `}>
                {step.titulo}
              </span>
              
              {/* Descripción (solo visible en hover) */}
              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center max-w-24">
                {step.descripcion}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE NAVEGACIÓN DEL WIZARD
// ═══════════════════════════════════════════════════════════════

interface WizardNavigationProps {
  currentStep: WizardStep;
  canProceed: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onPrev: () => void;
  onNext: () => boolean;
  onSave: () => void;
}

const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  canProceed,
  isLoading,
  isSaving,
  onPrev,
  onNext,
  onSave
}) => {
  const isLastStep = currentStep === 6;
  
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
      {/* Botón Anterior */}
      <motion.button
        onClick={onPrev}
        disabled={currentStep === 1 || isLoading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-xl font-medium
          transition-all duration-200
          ${currentStep === 1
            ? 'opacity-0 pointer-events-none'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]'
          }
        `}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft className="w-5 h-5" />
        Anterior
      </motion.button>
      
      {/* Indicador de paso actual */}
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-sm font-medium">Paso {currentStep} de 6</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${step === currentStep 
                  ? 'bg-indigo-500 scale-125' 
                  : step < currentStep 
                    ? 'bg-emerald-400' 
                    : 'bg-slate-300'
                }
              `}
            />
          ))}
        </div>
      </div>
      
      {/* Botón Siguiente / Guardar */}
      {isLastStep ? (
        <motion.button
          onClick={onSave}
          disabled={isSaving || isLoading}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
            bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
            shadow-[0_8px_32px_rgba(16,185,129,0.4)]
            hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          `}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSaving ? (
            <>
              <motion.div 
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Crear Contrato
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
            transition-all duration-200
            ${canProceed
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_32px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
          whileHover={canProceed ? { scale: 1.02, y: -2 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL WIZARD
// ═══════════════════════════════════════════════════════════════

interface WizardContratoProps {
  onComplete?: (contratoId: string) => void;
  onCancel?: () => void;
  tipoContrato?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contexto?: Record<string, any>;
}

export const WizardContrato: React.FC<WizardContratoProps> = (props) => {
  const { onComplete } = props;
  const {
    state,
    currentStep,
    isLoading,
    isSaving,
    progreso,
    canProceed,
    goToStep,
    nextStep,
    prevStep,
    dispatch,
    setAnunciante,
    validarInventario,
    calcularFlujoAprobacion,
    guardarContrato
  } = useWizardContrato({
    onSaveSuccess: (id) => {
      onComplete?.(id);
    },
    onSaveError: (error) => {
      /* console.error('Error guardando contrato:', error) */;
    }
  });
  
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const handleSave = async () => {
    const result = await guardarContrato();
    if (result.success) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        onComplete?.(result.id!);
      }, 2000);
    }
  };
  
  // Animaciones de página
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-6 lg:p-8">
      {/* Animación de éxito */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-white rounded-3xl p-12 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Contrato Creado!</h2>
              <p className="text-slate-500">Redirigiendo...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-6xl mx-auto">
        {/* Header principal */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_8px_32px_rgba(99,102,241,0.3)]"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Nuevo Contrato
              </h1>
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">TIER 0 Enterprise Security</span>
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Cortex-AI Optimizado</span>
              </p>
            </div>
          </div>
          
          {/* Número de contrato */}
          <div className="px-6 py-3 rounded-xl bg-slate-100 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)]">
            <span className="text-xs text-slate-400 block">ID Contrato</span>
            <span className="font-mono text-lg font-bold text-indigo-600">{state.numeroContrato}</span>
          </div>
        </div>
        
        {/* Header del wizard con pasos */}
        <WizardHeader
          currentStep={currentStep}
          completedSteps={state.completedSteps}
          progreso={progreso}
          onStepClick={goToStep}
        />
        
        {/* Contenido del paso actual */}
        <motion.div
          className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <StepInfoFundamental
                  state={state}
                  dispatch={dispatch}
                  setAnunciante={setAnunciante}
                />
              )}
              {currentStep === 2 && (
                <StepTerminosComerciales
                  state={state}
                  dispatch={dispatch}
                />
              )}
              {currentStep === 3 && (
                <StepEspecificaciones
                  state={state}
                  dispatch={dispatch}
                  validarInventario={validarInventario}
                />
              )}
              {currentStep === 4 && (
                <StepAprobaciones
                  state={state}
                  dispatch={dispatch}
                  calcularFlujoAprobacion={calcularFlujoAprobacion}
                />
              )}
              {currentStep === 5 && (
                <StepDocumentacion
                  state={state}
                  dispatch={dispatch}
                />
              )}
              {currentStep === 6 && (
                <AutorizacionPanel
                  descuentoPorcentaje={state.descuentoPorcentaje}
                  configuracion={state.configuracionAntiFraude}
                  onConfigChange={(config) => dispatch({ 
                    type: 'SET_CONFIGURACION_ANTI_FRAUDE', 
                    payload: config 
                  })}
                  usuarioActual={{
                    id: 'usr_current',
                    nombre: 'Usuario Actual',
                    email: 'usuario@empresa.com',
                    rol: 'ejecutivo'
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Navegación */}
          <WizardNavigation
            currentStep={currentStep}
            canProceed={canProceed}
            isLoading={isLoading}
            isSaving={isSaving}
            onPrev={prevStep}
            onNext={() => nextStep() ?? false}
            onSave={handleSave}
          />
        </motion.div>
        
        {/* Footer informativo */}
        <div className="mt-6 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Todos los datos están encriptados y protegidos con seguridad militar</span>
        </div>
      </div>
    </div>
  );
};

export default WizardContrato;
