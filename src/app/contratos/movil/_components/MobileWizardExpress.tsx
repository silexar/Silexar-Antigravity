/**
 * ? MOBILE WIZARD EXPRESS � Orquestador 3 Pasos
 * 
 * Wizard express de 3 pantallas para crear contratos en mobile:
 *   1. Resumen IA (borrador editable)
 *   2. L�neas de Pauta (agregar/editar emisoras)
 *   3. Confirmar y Enviar (crear contrato)
 * 
 * Reemplaza el flujo anterior de ContractDraftReview
 * con un flujo completo que incluye l�neas de emisora.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useCallback } from 'react';
import {
  ArrowLeft, Sparkles,
} from 'lucide-react';
import type { ResultadoCaptura, ContratoSugerido } from '../../_shared/useSmartCapture';
import { useSmartCapture } from '../../_shared/useSmartCapture';
import { WizardStepResumenIA } from './WizardStepResumenIA';
import { WizardStepLineasPauta } from './WizardStepLineasPauta';
import { WizardStepConfirmar } from './WizardStepConfirmar';

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

type WizardStep = 'resumen' | 'lineas' | 'confirmar';

interface MobileWizardExpressProps {
  resultado: ResultadoCaptura;
  onBack: () => void;
  onClose: () => void;
}

// ---------------------------------------------------------------
// COMPONENTE
// ---------------------------------------------------------------

export function MobileWizardExpress({ resultado, onBack, onClose }: MobileWizardExpressProps) {
  const [step, setStep] = useState<WizardStep>('resumen');
  const {
    confirming, confirmacion, error,
    confirmarBorrador, actualizarLinea, agregarLinea, eliminarLinea,
    resultado: resultadoActual,
  } = useSmartCapture();

  // Usar el resultado actualizado si existe, sino el original
  const contratoActual: ContratoSugerido = resultadoActual?.contratoSugerido || resultado.contratoSugerido;
  const datosActuales = resultadoActual?.datosExtraidos || resultado.datosExtraidos;

  // Stepper progress
  const stepIndex = step === 'resumen' ? 0 : step === 'lineas' ? 1 : 2;
  const steps: { key: WizardStep; label: string }[] = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'lineas', label: 'L�neas' },
    { key: 'confirmar', label: 'Enviar' },
  ];

  // -- Handlers --

  const handleEditField = useCallback((campo: string, valor: string | number) => {
    // In a production system this would update via API
    // For now we handle it client-side through the hook
    ;
  }, []);

  const handleConfirmar = useCallback(async () => {
    await confirmarBorrador(resultado.borradorId, contratoActual);
  }, [confirmarBorrador, resultado.borradorId, contratoActual]);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={step === 'resumen' ? onBack : () => setStep(step === 'confirmar' ? 'lineas' : 'resumen')}
          className="p-2 rounded-xl bg-[#dfeaff] border border-[#bec8de30] active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-[#69738c]" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-[#69738c] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6888ff]" /> Wizard Express
          </h2>
          <p className="text-xs text-[#9aa3b8]">
            {step === 'resumen' && 'Revisa el borrador generado por IA'}
            {step === 'lineas' && 'Configura las l�neas de pauta'}
            {step === 'confirmar' && 'Confirma y crea el contrato'}
          </p>
        </div>
      </div>

      {/* STEPPER */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.key} className="flex-1 flex items-center gap-1">
            <div className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-[#6888ff]' : 'bg-[#dfeaff]'
              }`} />
              <p className={`text-[10px] mt-1 text-center font-bold ${
                i === stepIndex ? 'text-[#6888ff]' : i < stepIndex ? 'text-[#6888ff]' : 'text-[#9aa3b8]'
              }`}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CONTENIDO POR PASO */}
      {step === 'resumen' && (
        <WizardStepResumenIA
          datosExtraidos={datosActuales}
          contrato={contratoActual}
          onNext={() => setStep('lineas')}
          onEditField={handleEditField}
        />
      )}

      {step === 'lineas' && (
        <WizardStepLineasPauta
          lineas={contratoActual.lineasPauta}
          descuentoGlobal={contratoActual.descuento}
          fechaInicio={contratoActual.fechaInicio}
          fechaFin={contratoActual.fechaFin}
          onActualizarLinea={actualizarLinea}
          onAgregarLinea={agregarLinea}
          onEliminarLinea={eliminarLinea}
          onNext={() => setStep('confirmar')}
          onBack={() => setStep('resumen')}
        />
      )}

      {step === 'confirmar' && (
        <WizardStepConfirmar
          contrato={contratoActual}
          confirming={confirming}
          confirmacion={confirmacion}
          error={error}
          onConfirmar={handleConfirmar}
          onBack={() => setStep('lineas')}
          onClose={onClose}
        />
      )}
    </div>
  );
}
