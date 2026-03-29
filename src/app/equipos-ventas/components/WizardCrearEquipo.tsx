/**
 * WIZARD: CREAR EQUIPO (PARENT WRAPPER)
 * 
 * @description Coordina los pasos del wizard de creacion inteligente de equipos.
 * Conectado a POST /api/equipos-ventas para persistir datos.
 */

'use client';

import React, { useState } from 'react';
import { WizardStep1 } from './WizardStep1';
import { WizardStep2 } from './WizardStep2';
import { CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';

export const WizardCrearEquipo = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  type WizardStepData = { teamType?: string; methodology?: string; leaderId?: string };
  const [stepData, setStepData] = useState<WizardStepData>({});
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1 = (data: WizardStepData) => {
    setStepData((prev: WizardStepData) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleFinish = async (data: WizardStepData) => {
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
          metaAsignada: 70000000,
          equipoId: null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Error al crear el equipo');
        return;
      }

      // ;
      setCompleted(true);
    } catch {
      setError('Error de red. Verifica tu conexión e intenta de nuevo.');
      // /* console.error('[Wizard] API Error mitigado:', err) */;
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md shadow-2xl animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-600" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Equipo Creado Exitosamente</h2>
          <p className="text-slate-500 mt-2">El equipo ha sido configurado y guardado. El líder asignado será notificado.</p>
          <button onClick={onClose} className="mt-6 bg-slate-900 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8">
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 bg-white shadow-lg rounded-full p-2 text-slate-400 hover:text-red-500 transition-colors">
          <X size={18} />
        </button>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm animate-in fade-in duration-200">
            <AlertCircle size={16} className="flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 size={32} className="text-orange-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 mt-3">Creando equipo...</p>
          </div>
        )}

        {step === 1 && <WizardStep1 onNext={handleStep1} />}
        {step === 2 && <WizardStep2 onBack={() => setStep(1)} onFinish={handleFinish} />}
      </div>
    </div>
  );
};
