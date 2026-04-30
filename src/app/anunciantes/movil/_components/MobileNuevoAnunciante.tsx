'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Building, MapPin, User, CreditCard, Save } from 'lucide-react';

interface CrearProps {
  onBack: () => void;
}

export const MobileNuevoAnunciante: React.FC<CrearProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nombreRazonSocial: '',
    rut: '',
    giroActividad: '',
    paginaWeb: '',
    direccion: '',
    ciudad: '',
    comunaProvincia: '',
    pais: 'Chile',
    nombreContactoPrincipal: '',
    cargoContactoPrincipal: '',
    emailContacto: '',
    telefonoContacto: '',
    tieneFacturacionElectronica: false,
    direccionFacturacion: '',
    emailFacturacion: '',
    notas: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.nombreRazonSocial.trim()) {
      alert('La Razón Social es obligatoria');
      return setStep(1);
    }

    setLoading(true);
    try {
      const response = await fetch('/api/anunciantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onBack(), 2000);
      } else {
        alert(data.error || 'Error al crear anunciante');
      }
    } catch (error) {
      /* */;
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // UI Components inside the flow
  const StepIndicator = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10 border-b border-[#bec8de] shadow-sm">
      {[
        { id: 1, label: "Empresa", icon: Building },
        { id: 2, label: "Dirección", icon: MapPin },
        { id: 3, label: "Contacto", icon: User },
        { id: 4, label: "Ajustes", icon: CreditCard }
      ].map((s) => (
        <div key={s.id} className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all mb-1.5 ${
            step === s.id 
              ? 'bg-[#6888ff] text-white ring-4 ring-blue-100 shadow-lg' 
              : step > s.id
                ? 'bg-[#6888ff]/50 text-white'
                : 'bg-[#dfeaff] text-[#9aa3b8]'
          }`}>
            {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
          </div>
          <span className={`text-[9px] font-extrabold uppercase tracking-wide ${step === s.id ? 'text-[#6888ff]' : 'text-[#9aa3b8]'}`}>{s.label}</span>
        </div>
      ))}
    </div>
  );

  const InputWrapper = ({ label, required = false, children }: { label: string, required?: boolean, children: React.ReactNode }) => (
    <div className="space-y-2 mb-5">
      <label className="block text-sm font-bold text-[#69738c] ml-1">
        {label} {required && <span className="text-[#9aa3b8]">*</span>}
      </label>
      {children}
    </div>
  );

  const renderInput = (name: keyof typeof formData, placeholder: string, type = 'text') => (
    <input
      type={type}
      name={name}
      value={formData[name] as string}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full text-base py-3.5 px-4 bg-white border border-[#bec8de] rounded-2xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-[#9aa3b8] text-[#9aa3b8] font-medium"
    />
  );

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-[#dfeaff] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-gradient-to-br from-[#6888ff] to-[#5572ee] rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#9aa3b8]">¡Anunciante Creado!</h2>
        <p className="text-[#69738c] mt-2 font-medium">El cliente se ha registrado exitosamente en Silexar Pulse.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#dfeaff] flex flex-col animate-in slide-in-from-bottom-full duration-300">
      
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 bg-white shadow-sm z-20">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="p-2 rounded-full active:bg-[#dfeaff] text-[#69738c]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-[#9aa3b8] flex-1">Nuevo Anunciante</h1>
      </header>

      <StepIndicator />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5 pb-32">
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#9aa3b8] mb-6">Datos de la Empresa</h2>
              <InputWrapper label="Razón Social" required>
                {renderInput('nombreRazonSocial', 'Ej: Empresa ABC S.A.')}
              </InputWrapper>
              <InputWrapper label="RUT">
                {renderInput('rut', 'Ej: 76.123.456-7')}
              </InputWrapper>
              <InputWrapper label="Giro Comercial">
                {renderInput('giroActividad', 'Ej: Venta al por menor')}
              </InputWrapper>
              <InputWrapper label="Sitio Web">
                {renderInput('paginaWeb', 'Ej: https://www.empresa.cl', 'url')}
              </InputWrapper>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#9aa3b8] mb-6">Ubicación</h2>
              <InputWrapper label="Dirección Física">
                {renderInput('direccion', 'Calle y número, oficina')}
              </InputWrapper>
              <InputWrapper label="Ciudad">
                {renderInput('ciudad', 'Ej: Santiago')}
              </InputWrapper>
              <div className="grid grid-cols-2 gap-4">
                <InputWrapper label="Comuna">
                  {renderInput('comunaProvincia', 'Ej: Providencia')}
                </InputWrapper>
                <InputWrapper label="País">
                  {renderInput('pais', 'Chile')}
                </InputWrapper>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#9aa3b8] mb-6">Contacto Principal</h2>
              <InputWrapper label="Nombre Completo">
                {renderInput('nombreContactoPrincipal', 'Ej: Juan Pérez')}
              </InputWrapper>
              <InputWrapper label="Cargo">
                {renderInput('cargoContactoPrincipal', 'Ej: Gerente de Marketing')}
              </InputWrapper>
              <InputWrapper label="Correo Electrónico">
                {renderInput('emailContacto', 'contacto@empresa.com', 'email')}
              </InputWrapper>
              <InputWrapper label="Teléfono Directo">
                {renderInput('telefonoContacto', '+56 9 1234 5678', 'tel')}
              </InputWrapper>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-[#9aa3b8] mb-6">Ajustes Finales</h2>
              
              <div className="bg-white p-5 rounded-3xl border border-[#bec8de] shadow-sm mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#69738c]">Factura Electrónica (DTE)</span>
                  <button 
                    onClick={() => setFormData(p => ({ ...p, tieneFacturacionElectronica: !p.tieneFacturacionElectronica }))}
                    className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${formData.tieneFacturacionElectronica ? 'bg-[#6888ff]' : 'bg-[#dfeaff]'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${formData.tieneFacturacionElectronica ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-xs text-[#69738c] font-medium leading-relaxed">Active si el anunciante está habilitado en SII para recepción de DTE.</p>
              </div>

              <InputWrapper label="Email de Facturación (Opcional)">
                {renderInput('emailFacturacion', 'dte@empresa.com', 'email')}
              </InputWrapper>

              <InputWrapper label="Notas Internas">
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones de riesgo, tipo de crédito..."
                  className="w-full text-base py-3 px-4 bg-white border border-[#bec8de] rounded-2xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-[#9aa3b8] text-[#9aa3b8] font-medium resize-none"
                />
              </InputWrapper>
            </div>
          )}

        </div>
      </main>

      {/* Footer Navigation Sticky */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 border-t border-[#bec8de] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
        {step < 4 ? (
          <button 
            onClick={() => setStep(step + 1)}
            className="w-full h-14 bg-gradient-to-r from-[#6888ff] to-[#5572ee] text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(37,99,235,0.2)] active:scale-[0.98] transition-transform"
          >
            Siguiente Paso <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#6888ff] to-[#5572ee] text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:scale-100"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save className="w-5 h-5" /> Crear Anunciante</>
            )}
          </button>
        )}
      </footer>

    </div>
  );
};
