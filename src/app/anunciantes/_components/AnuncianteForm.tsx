'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Save,
  ArrowLeft,
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  FileText,
  CreditCard
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AnuncianteFormData {
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
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
}

interface AnuncianteFormProps {
  initialData?: Partial<AnuncianteFormData>;
  mode: 'create' | 'edit';
  onSubmit: (data: AnuncianteFormData) => Promise<void>;
  isLoading?: boolean;
}

const defaultData: AnuncianteFormData = {
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
  notas: '',
  estado: 'activo',
};

export function AnuncianteForm({ initialData, mode, onSubmit, isLoading = false }: AnuncianteFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AnuncianteFormData>({ ...defaultData, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const updateField = <K extends keyof AnuncianteFormData>(field: K, value: AnuncianteFormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!form.nombreRazonSocial.trim()) {
      nextErrors.nombreRazonSocial = 'La razón social es requerida';
    }
    if (form.emailContacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailContacto)) {
      nextErrors.emailContacto = 'Email inválido';
    }
    if (form.emailFacturacion && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailFacturacion)) {
      nextErrors.emailFacturacion = 'Email de facturación inválido';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const inputClass = `
    w-full rounded-xl py-3 px-4 bg-white/60 backdrop-blur-sm
    shadow-sm border border-white/60 outline-none focus:ring-2 focus:ring-blue-400/50
    text-slate-700 placeholder-slate-400 transition-all duration-200
  `;

  const labelClass = 'block text-sm font-medium text-slate-600 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Building2 className="w-9 h-9 text-blue-500" />
            {mode === 'create' ? 'Nuevo Anunciante' : 'Editar Anunciante'}
          </h1>
          <p className="text-slate-500 mt-1">
            {mode === 'create'
              ? 'Completa los datos para registrar un nuevo cliente publicitario'
              : 'Actualiza la información del anunciante'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/anunciantes')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 text-slate-700 shadow-sm hover:bg-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Información Legal */}
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          Información Legal y Fiscal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Razón Social *</label>
            <input
              type="text"
              value={form.nombreRazonSocial}
              onChange={e => updateField('nombreRazonSocial', e.target.value)}
              className={`${inputClass} ${errors.nombreRazonSocial ? 'ring-2 ring-red-400/50' : ''}`}
              placeholder="Ej: SuperMax SpA"
            />
            {errors.nombreRazonSocial && <p className="text-sm text-red-500 mt-1">{errors.nombreRazonSocial}</p>}
          </div>

          <div>
            <label className={labelClass}>RUT</label>
            <input
              type="text"
              value={form.rut}
              onChange={e => updateField('rut', e.target.value)}
              className={inputClass}
              placeholder="Ej: 76.123.456-7"
            />
          </div>

          <div>
            <label className={labelClass}>Giro / Actividad Comercial</label>
            <input
              type="text"
              value={form.giroActividad}
              onChange={e => updateField('giroActividad', e.target.value)}
              className={inputClass}
              placeholder="Ej: Comercio al por menor"
            />
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          Dirección
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={e => updateField('direccion', e.target.value)}
              className={inputClass}
              placeholder="Calle y número"
            />
          </div>
          <div>
            <label className={labelClass}>Ciudad</label>
            <input
              type="text"
              value={form.ciudad}
              onChange={e => updateField('ciudad', e.target.value)}
              className={inputClass}
              placeholder="Ej: Santiago"
            />
          </div>
          <div>
            <label className={labelClass}>Comuna / Provincia</label>
            <input
              type="text"
              value={form.comunaProvincia}
              onChange={e => updateField('comunaProvincia', e.target.value)}
              className={inputClass}
              placeholder="Ej: Providencia"
            />
          </div>
          <div>
            <label className={labelClass}>País</label>
            <input
              type="text"
              value={form.pais}
              onChange={e => updateField('pais', e.target.value)}
              className={inputClass}
              placeholder="Ej: Chile"
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-500" />
          Información de Contacto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Email de Contacto</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={form.emailContacto}
                onChange={e => updateField('emailContacto', e.target.value)}
                className={`${inputClass} pl-10 ${errors.emailContacto ? 'ring-2 ring-red-400/50' : ''}`}
                placeholder="contacto@empresa.cl"
              />
            </div>
            {errors.emailContacto && <p className="text-sm text-red-500 mt-1">{errors.emailContacto}</p>}
          </div>
          <div>
            <label className={labelClass}>Teléfono de Contacto</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.telefonoContacto}
                onChange={e => updateField('telefonoContacto', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="+56 2 2345 6789"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Página Web</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.paginaWeb}
                onChange={e => updateField('paginaWeb', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="https://www.empresa.cl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacto Principal */}
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          Contacto Principal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              type="text"
              value={form.nombreContactoPrincipal}
              onChange={e => updateField('nombreContactoPrincipal', e.target.value)}
              className={inputClass}
              placeholder="Nombre del contacto"
            />
          </div>
          <div>
            <label className={labelClass}>Cargo</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.cargoContactoPrincipal}
                onChange={e => updateField('cargoContactoPrincipal', e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="Ej: Gerente de Marketing"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Facturación */}
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-500" />
          Configuración de Facturación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 flex items-center gap-3">
            <Switch
              id="fact-electronica"
              checked={form.tieneFacturacionElectronica}
              onCheckedChange={v => updateField('tieneFacturacionElectronica', v)}
            />
            <Label htmlFor="fact-electronica" className="text-slate-700 cursor-pointer">
              Tiene facturación electrónica
            </Label>
          </div>
          <div>
            <label className={labelClass}>Dirección de Facturación</label>
            <input
              type="text"
              value={form.direccionFacturacion}
              onChange={e => updateField('direccionFacturacion', e.target.value)}
              className={inputClass}
              placeholder="Dirección para envío de facturas"
            />
          </div>
          <div>
            <label className={labelClass}>Email de Facturación</label>
            <input
              type="email"
              value={form.emailFacturacion}
              onChange={e => updateField('emailFacturacion', e.target.value)}
              className={`${inputClass} ${errors.emailFacturacion ? 'ring-2 ring-red-400/50' : ''}`}
              placeholder="facturas@empresa.cl"
            />
            {errors.emailFacturacion && <p className="text-sm text-red-500 mt-1">{errors.emailFacturacion}</p>}
          </div>
        </div>
      </div>

      {/* Estado (solo edición) */}
      {mode === 'edit' && (
        <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Estado del Anunciante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Estado</label>
              <select
                value={form.estado}
                onChange={e => updateField('estado', e.target.value as AnuncianteFormData['estado'])}
                className={inputClass}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notas */}
      <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          Notas y Observaciones
        </h2>
        <textarea
          value={form.notas}
          onChange={e => updateField('notas', e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Información adicional relevante..."
        />
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/anunciantes')}
          className="px-5 py-2.5 rounded-xl bg-white/80 border border-white/60 text-slate-700 shadow-sm hover:bg-white transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? 'Guardando...' : 'Guardar Anunciante'}
        </button>
      </div>
    </form>
  );
}
