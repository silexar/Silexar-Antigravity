/**
 * 🏢 SILEXAR PULSE - Formulario Nuevo Anunciante
 * 
 * @description Formulario de creación de anunciante con diseño neuromórfico
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ArrowLeft, 
  Save, 
  X,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Briefcase,
  CreditCard,
  Building,
  CheckCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`
    rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 
    shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]
    ${className}
  `}>
    {children}
  </div>
);

const NeuromorphicButton = ({ 
  children, onClick, type = 'button', variant = 'secondary', disabled = false, className = ''
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[4px_4px_12px_rgba(59,130,246,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-3 rounded-xl font-medium transition-all duration-200 
        flex items-center gap-2 justify-center
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const NeuromorphicInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  icon: Icon,
  error
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: React.ElementType;
  error?: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
        required={required}
        className={`
          w-full rounded-xl py-3 bg-slate-50
          shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
          border-2 ${error ? 'border-red-400' : 'border-transparent'}
          outline-none focus:ring-2 focus:ring-blue-400/50
          text-slate-700 placeholder-slate-400
          transition-all duration-200
          ${Icon ? 'pl-12 pr-4' : 'px-4'}
        `}
      />
    </div>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const NeuromorphicTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-600">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full rounded-xl py-3 px-4 bg-slate-50
        shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
        border-none outline-none focus:ring-2 focus:ring-blue-400/50
        text-slate-700 placeholder-slate-400
        transition-all duration-200 resize-none
      "
    />
  </div>
);

const NeuromorphicToggle = ({
  label,
  checked,
  onChange,
  description
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
    <div>
      <p className="font-medium text-slate-700">{label}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-14 h-8 rounded-full transition-all duration-200 relative
        ${checked 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
          : 'bg-slate-300'
        }
      `}
    >
      <span className={`
        absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
        transition-all duration-200
        ${checked ? 'left-7' : 'left-1'}
      `} />
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface FormData {
  nombreRazonSocial: string;
  rut: string;
  giroActividad: string;
  direccion: string;
  ciudad: string;
  comunaProvincia: string;
  pais: string;
  emailContacto: string;
  telefonoContacto: string;
  paginaWeb: string;
  nombreContactoPrincipal: string;
  cargoContactoPrincipal: string;
  tieneFacturacionElectronica: boolean;
  direccionFacturacion: string;
  emailFacturacion: string;
  notas: string;
}

export default function NuevoAnunciantePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  const [formData, setFormData] = useState<FormData>({
    nombreRazonSocial: '',
    rut: '',
    giroActividad: '',
    direccion: '',
    ciudad: '',
    comunaProvincia: '',
    pais: 'Chile',
    emailContacto: '',
    telefonoContacto: '',
    paginaWeb: '',
    nombreContactoPrincipal: '',
    cargoContactoPrincipal: '',
    tieneFacturacionElectronica: false,
    direccionFacturacion: '',
    emailFacturacion: '',
    notas: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.nombreRazonSocial.trim()) {
      newErrors.nombreRazonSocial = 'La razón social es requerida';
    }
    
    if (formData.emailContacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailContacto)) {
      newErrors.emailContacto = 'El email no es válido';
    }
    
    if (formData.emailFacturacion && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailFacturacion)) {
      newErrors.emailFacturacion = 'El email de facturación no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
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
        setTimeout(() => {
          router.push('/anunciantes');
        }, 1500);
      } else {
        setErrors({ nombreRazonSocial: data.error || 'Error al crear anunciante' });
      }
    } catch (error) {
      /* console.error('Error creating anunciante:', error) */;
      setErrors({ nombreRazonSocial: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center">
        <NeuromorphicCard className="text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">¡Anunciante Creado!</h2>
          <p className="text-slate-500 mt-2">Redirigiendo a la lista...</p>
        </NeuromorphicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center gap-4 mb-8">
          <NeuromorphicButton variant="ghost" onClick={() => router.push('/anunciantes')}>
            <ArrowLeft className="w-5 h-5" />
          </NeuromorphicButton>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-500" />
              Nuevo Anunciante
            </h1>
            <p className="text-slate-500 mt-1">Complete el formulario para registrar un nuevo cliente publicitario</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ═══ INFORMACIÓN BÁSICA ═══ */}
          <NeuromorphicCard>
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Building className="w-5 h-5 text-blue-500" /> Información de la Empresa
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <NeuromorphicInput
                label="Razón Social"
                name="nombreRazonSocial"
                value={formData.nombreRazonSocial}
                onChange={handleChange}
                placeholder="Ej: Empresa ABC S.A."
                required
                icon={Building}
                error={errors.nombreRazonSocial}
              />
              <NeuromorphicInput
                label="RUT"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="Ej: 76.123.456-7"
                icon={FileText}
                error={errors.rut}
              />
              <NeuromorphicInput
                label="Giro o Actividad Comercial"
                name="giroActividad"
                value={formData.giroActividad}
                onChange={handleChange}
                placeholder="Ej: Comercio al por menor"
                icon={Briefcase}
              />
              <NeuromorphicInput
                label="Página Web"
                name="paginaWeb"
                value={formData.paginaWeb}
                onChange={handleChange}
                placeholder="Ej: https://www.empresa.cl"
                icon={Globe}
              />
            </div>
          </NeuromorphicCard>

          {/* ═══ DIRECCIÓN ═══ */}
          <NeuromorphicCard>
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
              <MapPin className="w-5 h-5 text-blue-500" /> Dirección
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <NeuromorphicInput
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Av. Providencia 1234, Piso 5"
                  icon={MapPin}
                />
              </div>
              <NeuromorphicInput
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Ej: Santiago"
              />
              <NeuromorphicInput
                label="Comuna/Provincia"
                name="comunaProvincia"
                value={formData.comunaProvincia}
                onChange={handleChange}
                placeholder="Ej: Providencia"
              />
              <NeuromorphicInput
                label="País"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                placeholder="Chile"
              />
            </div>
          </NeuromorphicCard>

          {/* ═══ CONTACTO ═══ */}
          <NeuromorphicCard>
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
              <User className="w-5 h-5 text-blue-500" /> Contacto Principal
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <NeuromorphicInput
                label="Nombre Completo"
                name="nombreContactoPrincipal"
                value={formData.nombreContactoPrincipal}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                icon={User}
              />
              <NeuromorphicInput
                label="Cargo"
                name="cargoContactoPrincipal"
                value={formData.cargoContactoPrincipal}
                onChange={handleChange}
                placeholder="Ej: Gerente de Marketing"
              />
              <NeuromorphicInput
                label="Email de Contacto"
                name="emailContacto"
                type="email"
                value={formData.emailContacto}
                onChange={handleChange}
                placeholder="Ej: contacto@empresa.cl"
                icon={Mail}
                error={errors.emailContacto}
              />
              <NeuromorphicInput
                label="Teléfono"
                name="telefonoContacto"
                value={formData.telefonoContacto}
                onChange={handleChange}
                placeholder="Ej: +56 9 1234 5678"
                icon={Phone}
              />
            </div>
          </NeuromorphicCard>

          {/* ═══ FACTURACIÓN ═══ */}
          <NeuromorphicCard>
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
              <CreditCard className="w-5 h-5 text-blue-500" /> Facturación
            </h3>
            <div className="space-y-6">
              <NeuromorphicToggle
                label="Facturación Electrónica"
                description="Habilitar si el cliente recibe facturas electrónicas (DTE)"
                checked={formData.tieneFacturacionElectronica}
                onChange={(checked) => setFormData(prev => ({ ...prev, tieneFacturacionElectronica: checked }))}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <NeuromorphicInput
                  label="Dirección de Facturación"
                  name="direccionFacturacion"
                  value={formData.direccionFacturacion}
                  onChange={handleChange}
                  placeholder="Si es diferente a la dirección principal"
                  icon={MapPin}
                />
                <NeuromorphicInput
                  label="Email de Facturación"
                  name="emailFacturacion"
                  type="email"
                  value={formData.emailFacturacion}
                  onChange={handleChange}
                  placeholder="Ej: facturas@empresa.cl"
                  icon={Mail}
                  error={errors.emailFacturacion}
                />
              </div>
            </div>
          </NeuromorphicCard>

          {/* ═══ NOTAS ═══ */}
          <NeuromorphicCard>
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
              <FileText className="w-5 h-5 text-blue-500" /> Notas Adicionales
            </h3>
            <NeuromorphicTextarea
              label="Notas u observaciones"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Ingrese cualquier información adicional relevante sobre este anunciante..."
              rows={4}
            />
          </NeuromorphicCard>

          {/* ═══ ACCIONES ═══ */}
          <div className="flex justify-end gap-4">
            <NeuromorphicButton variant="secondary" onClick={() => router.push('/anunciantes')}>
              <X className="w-4 h-4" /> Cancelar
            </NeuromorphicButton>
            <NeuromorphicButton 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="min-w-[180px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Anunciante
                </>
              )}
            </NeuromorphicButton>
          </div>
        </form>
      </div>
    </div>
  );
}
