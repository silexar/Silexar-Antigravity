/**
 * WIZARD: CREAR EQUIPO (PARENT WRAPPER) - TIER 0 COMPLETO
 * 
 * @description Coordina los 4 pasos del wizard de creacion inteligente de equipos.
 * Conectado a POST /api/equipos-ventas para persistir datos.
 * 
 * Pasos:
 * 1. Definicion Estrategica (Tipo equipo + Metodologia)
 * 2. Jerarquia y Liderazgo (Team Leader + estructura)
 * 3. Territorios y Asignaciones (Optimizer IA)
 * 4. Metas y Compensacion (Plan designer)
 */

'use client';

import React, { useState } from 'react';
import { WizardStep1 } from './WizardStep1';
import { WizardStep2 } from './WizardStep2';
import { WizardStep3 } from './WizardStep3';
import { WizardStep4 } from './WizardStep4';
import { CheckCircle, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';

type WizardStepData = {
  // Step 1
  teamType?: string;
  methodology?: string;
  // Step 2
  leaderId?: string;
  // Step 3
  territoryType?: string;
  territories?: string[];
  // Step 4
  planStructure?: string;
  baseSalary?: number;
  targetCommission?: number;
  quota?: number;
  commissionRate?: number;
  acceleratorRate?: number;
};

export const WizardCrearEquipo = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [stepData, setStepData] = useState<WizardStepData>({});
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1 = (data: Partial<WizardStepData>) => {
    setStepData((prev: WizardStepData) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2 = (data: Partial<WizardStepData>) => {
    setStepData((prev: WizardStepData) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleStep3 = (data: Partial<WizardStepData>) => {
    setStepData((prev: WizardStepData) => ({ ...prev, ...data }));
    setStep(4);
  };

  const handleFinish = async (data: Partial<WizardStepData>) => {
    const finalData = { ...stepData, ...data };
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/equipos-ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: finalData.teamType || 'Nuevo Equipo',
          apellido: finalData.methodology || 'Sales',
          email: `equipo-${Date.now()}@silexar.com`,
          tipoComision: 'porcentaje',
          metaAsignada: finalData.quota || 1200000,
          equipoId: null,
          // Extended data for TIER 0
          territoryType: finalData.territoryType,
          territories: finalData.territories,
          planStructure: finalData.planStructure,
          baseSalary: finalData.baseSalary,
          targetCommission: finalData.targetCommission,
          commissionRate: finalData.commissionRate,
          acceleratorRate: finalData.acceleratorRate,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Error al crear el equipo');
        return;
      }

      setCompleted(true);
    } catch {
      setError('Error de red. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-[#EAF0F6] rounded-3xl p-10 text-center max-w-md shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff] animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <CheckCircle className="text-white" size={40} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={20} className="text-amber-500" />
            <h2 className="text-2xl font-black text-slate-700">Equipo Creado Exitosamente</h2>
          </div>
          <p className="text-slate-500 mt-2 mb-8">El equipo ha sido configurado y guardado. El líder asignado será notificado.</p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold transition-all duration-300
              bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg
              hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 bg-[#EAF0F6] shadow-lg rounded-full p-2 text-slate-400 hover:text-red-500 transition-colors
            shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
        >
          <X size={18} />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${s === step
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : s < step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                {s < step ? <CheckCircle size={16} /> : s}
              </div>
              {s < 4 && (
                <div className={`w-8 h-1 mx-1 rounded-full transition-all duration-300 ${s < step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm animate-in fade-in duration-200
            shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
            <AlertCircle size={16} className="flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#EAF0F6]/90 z-20 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
              <Loader2 size={28} className="text-white animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-600 mt-4">Creando equipo...</p>
          </div>
        )}

        {/* Step Components */}
        {step === 1 && <WizardStep1 onNext={handleStep1} />}
        {step === 2 && <WizardStep2 onBack={() => setStep(1)} onFinish={handleStep2} />}
        {step === 3 && <WizardStep3 onBack={() => setStep(2)} onNext={handleStep3} />}
        {step === 4 && <WizardStep4 onBack={() => setStep(3)} onFinish={handleFinish} />}
      </div>
    </div>
  );
};
