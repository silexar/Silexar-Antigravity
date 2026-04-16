'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import {
  Receipt,
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  DollarSign,
  Building2,
  User,
  FileText
} from 'lucide-react';

interface AnuncianteOption {
  id: string;
  codigo: string;
  nombreRazonSocial: string;
  rut: string | null;
  giroActividad: string | null;
  direccion: string | null;
  ciudad: string | null;
  comunaProvincia: string | null;
  emailContacto: string | null;
  telefonoContacto: string | null;
}

export default function NuevaFacturaPage() {
  const router = useRouter();
  const [anunciantes, setAnunciantes] = useState<AnuncianteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAnunciantes, setIsFetchingAnunciantes] = useState(true);

  const [anuncianteId, setAnuncianteId] = useState('');
  const [receptorRut, setReceptorRut] = useState('');
  const [receptorRazonSocial, setReceptorRazonSocial] = useState('');
  const [receptorGiro, setReceptorGiro] = useState('');
  const [receptorDireccion, setReceptorDireccion] = useState('');
  const [receptorCiudad, setReceptorCiudad] = useState('');
  const [receptorComuna, setReceptorComuna] = useState('');
  const [fechaEmision, setFechaEmision] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [montoNeto, setMontoNeto] = useState('');
  const [tasaIva, setTasaIva] = useState(19);
  const [formaPago, setFormaPago] = useState<'contado' | 'credito_30' | 'credito_45' | 'credito_60' | 'credito_90'>('credito_30');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    fetch('/api/anunciantes?limit=100&activo=true')
      .then(r => r.json())
      .then(json => {
        if (json.success) setAnunciantes(json.data || []);
      })
      .finally(() => setIsFetchingAnunciantes(false));
  }, []);

  const handleSelectAnunciante = (id: string) => {
    setAnuncianteId(id);
    const a = anunciantes.find(x => x.id === id);
    if (a) {
      setReceptorRut(a.rut || '');
      setReceptorRazonSocial(a.nombreRazonSocial || '');
      setReceptorGiro(a.giroActividad || '');
      setReceptorDireccion(a.direccion || '');
      setReceptorCiudad(a.ciudad || '');
      setReceptorComuna(a.comunaProvincia || '');
    } else {
      setReceptorRut('');
      setReceptorRazonSocial('');
      setReceptorGiro('');
      setReceptorDireccion('');
      setReceptorCiudad('');
      setReceptorComuna('');
    }
  };

  const montoNetoNum = parseFloat(montoNeto.replace(/[^0-9.]/g, '')) || 0;
  const montoIva = Math.round(montoNetoNum * (tasaIva / 100));
  const montoTotal = montoNetoNum + montoIva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receptorRazonSocial.trim() || !receptorRut.trim()) {
      toast({ title: 'Faltan datos del receptor', variant: 'destructive' });
      return;
    }
    if (montoNetoNum <= 0) {
      toast({ title: 'El monto neto debe ser mayor a 0', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/facturacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncianteId: anuncianteId || undefined,
          receptorRut,
          receptorRazonSocial,
          receptorGiro,
          receptorDireccion,
          receptorCiudad,
          receptorComuna,
          fechaEmision,
          fechaVencimiento,
          montoNeto: montoNetoNum,
          tasaIva,
          formaPago,
          observaciones,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast({ title: json.error || 'Error al crear factura', variant: 'destructive' });
        return;
      }
      toast({ title: 'Factura creada exitosamente' });
      router.push('/facturacion');
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `
    w-full rounded-xl py-3 px-4 bg-white/60 backdrop-blur-sm
    shadow-sm border border-white/60 outline-none focus:ring-2 focus:ring-emerald-400/50
    text-slate-700 placeholder-slate-400 transition-all duration-200
  `;
  const labelClass = 'block text-sm font-medium text-slate-600 mb-1.5';
  const cardClass = 'rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
              <Receipt className="w-9 h-9 text-emerald-500" />
              Nueva Factura
            </h1>
            <p className="text-slate-500 mt-1">Crea un nuevo documento tributario</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/facturacion')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 text-slate-700 shadow-sm hover:bg-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Cliente / Receptor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>Seleccionar Anunciante</label>
                <select
                  value={anuncianteId}
                  onChange={e => handleSelectAnunciante(e.target.value)}
                  disabled={isFetchingAnunciantes}
                  className={inputClass}
                >
                  <option value="">-- Seleccionar anunciante --</option>
                  {anunciantes.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombreRazonSocial} {a.rut ? `(${a.rut})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>RUT Receptor *</label>
                <input
                  type="text"
                  value={receptorRut}
                  onChange={e => setReceptorRut(e.target.value)}
                  className={inputClass}
                  placeholder="76.123.456-7"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Razón Social *</label>
                <input
                  type="text"
                  value={receptorRazonSocial}
                  onChange={e => setReceptorRazonSocial(e.target.value)}
                  className={inputClass}
                  placeholder="Razón social del receptor"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Giro</label>
                <input
                  type="text"
                  value={receptorGiro}
                  onChange={e => setReceptorGiro(e.target.value)}
                  className={inputClass}
                  placeholder="Giro comercial"
                />
              </div>
              <div>
                <label className={labelClass}>Dirección</label>
                <input
                  type="text"
                  value={receptorDireccion}
                  onChange={e => setReceptorDireccion(e.target.value)}
                  className={inputClass}
                  placeholder="Dirección fiscal"
                />
              </div>
              <div>
                <label className={labelClass}>Ciudad</label>
                <input
                  type="text"
                  value={receptorCiudad}
                  onChange={e => setReceptorCiudad(e.target.value)}
                  className={inputClass}
                  placeholder="Ciudad"
                />
              </div>
              <div>
                <label className={labelClass}>Comuna</label>
                <input
                  type="text"
                  value={receptorComuna}
                  onChange={e => setReceptorComuna(e.target.value)}
                  className={inputClass}
                  placeholder="Comuna"
                />
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Documento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Fecha Emisión *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={fechaEmision}
                    onChange={e => setFechaEmision(e.target.value)}
                    className={`${inputClass} pl-10`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Fecha Vencimiento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={e => setFechaVencimiento(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Forma de Pago</label>
                <select
                  value={formaPago}
                  onChange={e => setFormaPago(e.target.value as typeof formaPago)}
                  className={inputClass}
                >
                  <option value="contado">Contado</option>
                  <option value="credito_30">Crédito 30 días</option>
                  <option value="credito_45">Crédito 45 días</option>
                  <option value="credito_60">Crédito 60 días</option>
                  <option value="credito_90">Crédito 90 días</option>
                </select>
              </div>
            </div>
          </div>

          {/* Montos */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Montos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
              <div>
                <label className={labelClass}>Monto Neto (CLP) *</label>
                <input
                  type="number"
                  min={0}
                  value={montoNeto}
                  onChange={e => setMontoNeto(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>% IVA</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={tasaIva}
                  onChange={e => setTasaIva(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <p className={labelClass}>IVA</p>
                <p className="text-lg font-semibold text-slate-700">${montoIva.toLocaleString('es-CL')}</p>
              </div>
              <div>
                <p className={labelClass}>Total</p>
                <p className="text-2xl font-bold text-emerald-600">${montoTotal.toLocaleString('es-CL')}</p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-500" />
              Observaciones
            </h2>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/facturacion')}
              className="px-5 py-2.5 rounded-xl bg-white/80 border border-white/60 text-slate-700 shadow-sm hover:bg-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isLoading ? 'Creando...' : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
