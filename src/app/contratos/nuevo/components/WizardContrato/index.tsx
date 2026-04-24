/**
 * 🎯 SILEXAR PULSE - Wizard de Creación de Contratos TIER 0
 *
 * @description Wizard estilo Anunciante: pasos limpios, card contenedor,
 * inputs amigables, botones Cancelar/Siguiente. Sincronización cross-window.
 *
 * @version 2025.5.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileSignature,
  FileText,
  Lock,
  Save,
  X,
  Building2,
} from "lucide-react";
import { useWizardContrato } from "./hooks/useWizardContrato";
import { WIZARD_STEPS, WizardStep } from "./types/wizard.types";
import StepInfoFundamental from "./steps/StepInfoFundamental";
import StepTerminosComerciales from "./steps/StepTerminosComerciales";
import StepEspecificaciones from "./steps/StepEspecificaciones";
import StepAprobaciones from "./steps/StepAprobaciones";
import StepDocumentacion from "./steps/StepDocumentacion";
import AutorizacionPanel from "./enterprise/AutorizacionPanel";

const N = { base: "#dfeaff", dark: "#bec8de", light: "#ffffff", accent: "#6888ff", text: "#69738c", sub: "#9aa3b8" };

const stepIcons: Record<number, React.ElementType> = {
  1: FileText,
  2: DollarSign,
  3: BarChart3,
  4: CheckCircle2,
  5: FileSignature,
  6: Lock,
};

interface WizardContratoProps {
  onComplete?: (contratoId: string) => void;
  onCancel?: () => void;
  tipoContrato?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contexto?: Record<string, any>;
}

export const WizardContrato: React.FC<WizardContratoProps> = (props) => {
  const { onComplete, onCancel } = props;
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
    guardarContrato,
  } = useWizardContrato({
    onSaveSuccess: (id) => onComplete?.(id),
    onSaveError: () => {},
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    const result = await guardarContrato();
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onComplete?.(result.id!);
      }, 1500);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else window.location.href = "/contratos";
  };

  const isLast = currentStep === 6;

  return (
    <div className="min-h-screen" style={{ background: N.base }}>
      {/* Overlay éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: `${N.base}cc` }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="rounded-2xl p-8 text-center"
              style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark}, -8px -8px 16px ${N.light}` }}
            >
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: N.accent }}>
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-base font-bold" style={{ color: N.text }}>¡Contrato Creado!</h2>
              <p className="text-xs mt-1" style={{ color: N.sub }}>Redirigiendo...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }}>
              <FileText className="w-4 h-4" style={{ color: N.accent }} />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold" style={{ color: N.text }}>Nuevo Contrato</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md" style={{ background: N.base, color: N.accent, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                {state.numeroContrato}
              </span>
            </div>
          </div>
          <button
            onClick={() => window.open('/contratos/nuevo', '_blank', 'width=1400,height=900,resizable=yes,scrollbars=yes')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={{ background: N.base, color: N.text, boxShadow: `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}` }}
            title="Abrir en ventana nueva"
          >
            ⧉ Ventana
          </button>
        </div>

        {/* Stepper tipo Anunciante */}
        <div className="flex items-center justify-center gap-1 mb-5">
          {WIZARD_STEPS.map((step, idx) => {
            const Icon = stepIcons[step.id];
            const isCurrent = currentStep === step.id;
            const isCompleted = state.completedSteps.includes(step.id);
            const isAccessible = isCompleted || step.id <= Math.max(...state.completedSteps, 0) + 1;
            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div className="w-6 h-px mx-1" style={{ background: isCompleted ? N.accent : `${N.dark}50` }} />
                )}
                <button
                  onClick={() => isAccessible && goToStep(step.id)}
                  disabled={!isAccessible}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={
                    isCurrent
                      ? { background: N.accent, color: "#fff", boxShadow: `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}` }
                      : isCompleted
                      ? { background: `${N.accent}20`, color: N.accent }
                      : { background: N.base, color: N.sub, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }
                  }
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{step.titulo}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Card contenedor tipo Anunciante */}
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark}, -8px -8px 16px ${N.light}` }}
        >
          {/* Título del paso omitido — el contexto del módulo es suficiente */}

          {/* Contenido del paso */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <StepInfoFundamental state={state} dispatch={dispatch} setAnunciante={setAnunciante} />
              )}
              {currentStep === 2 && <StepTerminosComerciales state={state} dispatch={dispatch} />}
              {currentStep === 3 && (
                <StepEspecificaciones state={state} dispatch={dispatch} />
              )}
              {currentStep === 4 && (
                <StepAprobaciones
                  state={state}
                  dispatch={dispatch}
                  calcularFlujoAprobacion={calcularFlujoAprobacion}
                />
              )}
              {currentStep === 5 && <StepDocumentacion state={state} dispatch={dispatch} />}
              {currentStep === 6 && (
                <AutorizacionPanel
                  descuentoPorcentaje={state.descuentoPorcentaje}
                  configuracion={state.configuracionAntiFraude}
                  onConfigChange={(config) =>
                    dispatch({ type: "SET_CONFIGURACION_ANTI_FRAUDE", payload: config })
                  }
                  usuarioActual={{
                    id: "usr_current",
                    nombre: "Usuario Actual",
                    email: "usuario@empresa.com",
                    rol: "ejecutivo",
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Barra de progreso */}
          <div className="mt-4 mb-4">
            <div className="h-1 rounded-full" style={{ background: `${N.dark}30` }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: N.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-[10px] text-right mt-1" style={{ color: N.sub }}>
              Paso {currentStep} de 6 — {Math.round(progreso)}%
            </p>
          </div>

          {/* Botones tipo Anunciante */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${N.dark}25` }}>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: N.base, color: N.text, boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }}
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                  style={{ background: N.base, color: N.text, boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
              )}

              {isLast ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLoading || !canProceed}
                  className="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                  style={{ background: N.accent, color: "#fff", boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }}
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Crear Contrato
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => nextStep()}
                  disabled={!canProceed || isLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                  style={
                    canProceed
                      ? { background: N.accent, color: "#fff", boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }
                      : { background: N.base, color: N.sub, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }
                  }
                >
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WizardContrato;
