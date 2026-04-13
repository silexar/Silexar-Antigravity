'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Briefcase, Calendar, FileVideo, ShieldCheck, Save, Search } from 'lucide-react';

interface CrearProps {
  onBack: () => void;
}

export const MobileNuevaCampana: React.FC<CrearProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Usamos un estado simple para el Wizard móvil (Tier 1 vs el Tier 0 de desktop)
  const [formData, setFormData] = useState({
    nombreCampana: '',
    anuncianteId: '',
    fechaInicio: '',
    fechaTermino: '',
    inversionTotal: '',
    tipoCampana: 'Regular'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mock request. En prod: /api/campanas
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => onBack(), 2000);
      }, 1500);
    } catch (_error) {
      alert('Error de conexión');
    } finally {
      // No seteamos loading false aquí porque ocultaría la pantalla de success
    }
  };

  // UI Components inside the flow
  const StepIndicator = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
      {[
        { id: 1, label: "Origen", icon: Briefcase },
        { id: 2, label: "Fechas", icon: Calendar },
        { id: 3, label: "Material", icon: FileVideo },
        { id: 4, label: "Revisar", icon: ShieldCheck }
      ].map((s) => (
        <div key={s.id} className="flex flex-col items-center flex-1 relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all z-10 mb-1.5 ${
            step === s.id 
              ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg' 
              : step > s.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-400'
          }`}>
            {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
          </div>
          <span className={`text-[9px] font-extrabold uppercase tracking-wide absolute -bottom-3 ${step === s.id ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
        </div>
      ))}
    </div>
  );

  const InputWrapper = ({ label, required = false, children }: { label: string, required?: boolean, children: React.ReactNode }) => (
    <div className="space-y-2 mb-5">
      <label className="block text-sm font-bold text-gray-600 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">¡Campaña Creada!</h2>
        <p className="text-gray-500 mt-2 font-medium">La campaña ha sido registrada y está lista para programación en la grilla Dalet.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 bg-white shadow-sm z-20">
        <button onClick={step === 1 ? onBack : handlePrev} className="p-2 rounded-full active:bg-gray-100 text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">Lanzar Campaña</h1>
      </header>

      <StepIndicator />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5 pb-32">
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 mt-4">
          
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Información Origen</h2>
              <InputWrapper label="Nombre de la Campaña" required>
                <input
                  type="text" name="nombreCampana" value={formData.nombreCampana} onChange={handleChange}
                  aria-label="Nombre de la Campaña"
                  placeholder="Ej: Promo Verano 2026"
                  className="w-full py-3.5 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </InputWrapper>
              
              <InputWrapper label="Anunciante (Cliente)" required>
                <div className="relative">
                  <select
                    name="anuncianteId" value={formData.anuncianteId} onChange={handleChange}
                    className="w-full py-3.5 pl-4 pr-10 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 appearance-none outline-none font-medium text-gray-700"
                  >
                    <option value="" disabled>Seleccionar un anunciante...</option>
                    <option value="1">Coca-Cola Company</option>
                    <option value="2">Samsung Electronics</option>
                    <option value="3">Banco Silexar</option>
                  </select>
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </InputWrapper>

              <InputWrapper label="Tipo de Contratación">
                <select
                  name="tipoCampana" value={formData.tipoCampana} onChange={handleChange}
                  className="w-full py-3.5 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 appearance-none outline-none"
                >
                  <option value="Regular">Regular Comercial</option>
                  <option value="Auspicio">Auspicio Programa</option>
                  <option value="Canje">Canje / Intercambio</option>
                </select>
              </InputWrapper>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Programación y Fechas</h2>
              <div className="grid grid-cols-2 gap-4">
                <InputWrapper label="Fecha de Inicio" required>
                  <input
                    type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange}
                    aria-label="Fecha de Inicio"
                    className="w-full py-3.5 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </InputWrapper>
                <InputWrapper label="Fecha de Término" required>
                  <input
                    type="date" name="fechaTermino" value={formData.fechaTermino} onChange={handleChange}
                    aria-label="Fecha de Término"
                    className="w-full py-3.5 px-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </InputWrapper>
              </div>
              
              <InputWrapper label="Inversión Inicial Estimada (Opcional)">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
                  <input
                    type="number" name="inversionTotal" value={formData.inversionTotal} onChange={handleChange}
                    aria-label="Inversión inicial estimada"
                    placeholder="0"
                    className="w-full py-3.5 pl-8 pr-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </InputWrapper>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileVideo className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Asignación de Materiales</h2>
              <p className="text-gray-500 text-sm px-4">
                La asignación de piezas audiovisuales y spots se debe realizar desde el Centro de Comando (Escritorio) mediante el módulo Dalet.
              </p>
              <div className="mt-8 mx-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-blue-700 font-bold text-sm">Puede crear la orden de compra ahora y adjuntar los videos después.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-500" /> Confirmación
              </h2>
              
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mb-6 space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Campaña</p>
                  <p className="font-semibold text-gray-800 text-lg">{formData.nombreCampana || '---'}</p>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Inicio programado</p>
                    <p className="font-mono text-gray-700 font-semibold">{formData.fechaInicio || '--/--/----'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Término proyectado</p>
                    <p className="font-mono text-gray-700 font-semibold">{formData.fechaTermino || '--/--/----'}</p>
                  </div>
                </div>
              </div>
              
            </div>
          )}

        </div>
      </main>

      {/* Footer Navigation Sticky */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
        {step < 4 ? (
          <button 
            onClick={handleNext}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(37,99,235,0.2)] active:scale-[0.98] transition-transform"
          >
            Siguiente Paso <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:scale-100"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save className="w-5 h-5" /> Confirmar y Enviar a Emisión</>
            )}
          </button>
        )}
      </footer>

    </div>
  );
};
