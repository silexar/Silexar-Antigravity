'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import {
  Building2,
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Briefcase,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';

interface AnuncianteData {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  giroActividad: string | null;
  direccion: string | null;
  ciudad: string | null;
  comunaProvincia: string | null;
  pais: string;
  emailContacto: string | null;
  telefonoContacto: string | null;
  paginaWeb: string | null;
  nombreContactoPrincipal: string | null;
  cargoContactoPrincipal: string | null;
  tieneFacturacionElectronica: boolean;
  direccionFacturacion: string | null;
  emailFacturacion: string | null;
  notas: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export default function DetalleAnunciantePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<AnuncianteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/anunciantes/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setData(json.data);
        } else {
          toast({ title: 'No se encontró el anunciante', variant: 'destructive' });
          router.push('/anunciantes');
        }
      })
      .catch(() => {
        toast({ title: 'Error de red', variant: 'destructive' });
        router.push('/anunciantes');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const handleDelete = async () => {
    if (!data) return;
    if (!confirm(`¿Estás seguro de eliminar a "${data.nombreRazonSocial}"?`)) return;
    try {
      const res = await fetch(`/api/anunciantes/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast({ title: 'Error al eliminar', description: json.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Anunciante eliminado' });
      router.push('/anunciantes');
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' });
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#bec8de] via-slate-50 to-[#5572ee]">
        <Loader2 className="w-10 h-10 text-[#6888ff] animate-spin" />
      </div>
    );
  }

  const StatusBadge = () => {
    const configs = {
      activo: { bg: 'from-[#6888ff] to-[#5572ee]', icon: CheckCircle2 },
      inactivo: { bg: 'from-[#bec8de] to-[#9aa3b8]', icon: XCircle },
      suspendido: { bg: 'from-[#6888ff] to-[#5572ee]', icon: AlertCircle },
      pendiente: { bg: 'from-[#6888ff] to-[#5572ee]', icon: AlertCircle },
    };
    const cfg = configs[data.estado] || configs.pendiente;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${cfg.bg} text-white shadow`}>
        <Icon className="w-3.5 h-3.5" />
        {data.estado.charAt(0).toUpperCase() + data.estado.slice(1)}
      </span>
    );
  };

  const cardClass = 'rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50';
  const labelClass = 'text-sm text-[#9aa3b8]';
  const valueClass = 'text-[#9aa3b8] font-medium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bec8de] via-slate-50 to-[#5572ee] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#bec8de] to-[#5572ee] bg-clip-text text-transparent flex items-center gap-3">
                <Building2 className="w-9 h-9 text-[#6888ff]" />
                {data.nombreRazonSocial}
              </h1>
              <StatusBadge />
            </div>
            <p className="text-[#9aa3b8]">Código: <span className="font-mono text-sm text-[#6888ff]">{data.codigo}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/anunciantes')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-white/60 text-[#9aa3b8] shadow-sm hover:bg-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button
              onClick={() => router.push(`/anunciantes/${id}/editar`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#6888ff] to-[#5572ee] text-white shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#6888ff] to-[#5572ee] text-white shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>

        {/* Info Legal */}
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#9aa3b8] mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#6888ff]" />
            Información Legal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className={labelClass}>Razón Social</p>
              <p className={valueClass}>{data.nombreRazonSocial}</p>
            </div>
            <div>
              <p className={labelClass}>RUT</p>
              <p className={`${valueClass} font-mono`}>{data.rut || '—'}</p>
            </div>
            <div>
              <p className={labelClass}>Giro / Actividad</p>
              <p className={valueClass}>{data.giroActividad || '—'}</p>
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#9aa3b8] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#6888ff]" />
            Dirección
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2 lg:col-span-2">
              <p className={labelClass}>Dirección</p>
              <p className={valueClass}>{data.direccion || '—'}</p>
            </div>
            <div>
              <p className={labelClass}>Ciudad</p>
              <p className={valueClass}>{data.ciudad || '—'}</p>
            </div>
            <div>
              <p className={labelClass}>Comuna / Provincia</p>
              <p className={valueClass}>{data.comunaProvincia || '—'}</p>
            </div>
            <div>
              <p className={labelClass}>País</p>
              <p className={valueClass}>{data.pais}</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#9aa3b8] mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#6888ff]" />
            Información de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className={labelClass}>Email</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#9aa3b8]" />
                <p className={valueClass}>{data.emailContacto || '—'}</p>
              </div>
            </div>
            <div>
              <p className={labelClass}>Teléfono</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#9aa3b8]" />
                <p className={valueClass}>{data.telefonoContacto || '—'}</p>
              </div>
            </div>
            <div>
              <p className={labelClass}>Página Web</p>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#9aa3b8]" />
                {data.paginaWeb ? (
                  <a href={data.paginaWeb} target="_blank" rel="noreferrer" className="text-[#6888ff] hover:underline">
                    {data.paginaWeb}
                  </a>
                ) : (
                  <p className={valueClass}>—</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contacto Principal */}
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#9aa3b8] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#6888ff]" />
            Contacto Principal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className={labelClass}>Nombre</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#9aa3b8]" />
                <p className={valueClass}>{data.nombreContactoPrincipal || '—'}</p>
              </div>
            </div>
            <div>
              <p className={labelClass}>Cargo</p>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#9aa3b8]" />
                <p className={valueClass}>{data.cargoContactoPrincipal || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Facturación */}
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#9aa3b8] mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#6888ff]" />
            Facturación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className={labelClass}>Facturación Electrónica</p>
              <p className={valueClass}>{data.tieneFacturacionElectronica ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <p className={labelClass}>Dirección de Facturación</p>
              <p className={valueClass}>{data.direccionFacturacion || '—'}</p>
            </div>
            <div>
              <p className={labelClass}>Email de Facturación</p>
              <p className={valueClass}>{data.emailFacturacion || '—'}</p>
            </div>
          </div>
        </div>

        {/* Notas */}
        {data.notas && (
          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-[#9aa3b8] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#9aa3b8]" />
              Notas
            </h2>
            <p className="text-[#9aa3b8] whitespace-pre-line">{data.notas}</p>
          </div>
        )}

        {/* Auditoría */}
        <div className="text-center text-[#9aa3b8] text-sm">
          <p>Creado: {new Date(data.fechaCreacion).toLocaleString('es-CL')}</p>
          {data.fechaModificacion && (
            <p className="mt-1">Última modificación: {new Date(data.fechaModificacion).toLocaleString('es-CL')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
