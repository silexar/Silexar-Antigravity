'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Building2, MapPin, User, Mail, Phone, Globe, Briefcase,
  FileText, Calendar, CheckCircle2, AlertCircle, XCircle,
  ArrowLeft
} from 'lucide-react';
import { ModuleNavMenu } from '@/components/module-nav-menu';

const N = {
  base: '#dfeaff', dark: '#bec8de', light: '#ffffff',
  accent: '#6888ff', text: '#69738c', textSub: '#9aa3b8',
};

interface Anunciante {
  id: string; codigo: string; rut: string | null;
  nombreRazonSocial: string; giroActividad: string | null;
  direccion: string | null; ciudad: string | null; pais: string;
  emailContacto: string | null; telefonoContacto: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  categoriaCliente?: string; comunaProvincia?: string | null;
  nombreContactoPrincipal?: string | null; cargoContactoPrincipal?: string | null;
  paginaWeb?: string | null;
  riesgoFinanciero?: string; notas?: string;
  tieneFacturacionElectronica?: boolean; numeroDeudor?: string;
  tipoDTE?: string; condicionPago?: string; direccionFacturacion?: string;
  ivaPorcentaje?: number;
  creadoPor?: string; fechaCreacion?: string; fechaModificacion?: string;
}

const CATEGORIA_MAP: Record<string, string> = {
  normal: 'Cliente General',
  politica: 'Contenido Político',
  juego_azar: 'Juego de Azar',
};

function StatusBadge({ estado }: { estado: string }) {
  const config: Record<string, { opacity: number; label: string; icon: React.ElementType }> = {
    activo:    { opacity: 1,    label: 'Activo',    icon: CheckCircle2 },
    inactivo:  { opacity: 0.5,  label: 'Inactivo',  icon: XCircle },
    suspendido:{ opacity: 0.7,  label: 'Suspendido', icon: AlertCircle },
    pendiente: { opacity: 0.85, label: 'Pendiente',  icon: Building2 },
  };
  const c = config[estado] ?? config.pendiente;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: `${N.accent}15`, color: N.accent, opacity: c.opacity, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}>
      <Icon className="w-3 h-3" />{c.label}
    </span>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-3 sm:mb-4" style={{ color: N.accent }}>{icon}{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, mono, icon }: { label: string; value?: string | null; mono?: boolean; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: N.textSub }}>{label}</p>
      <p className={`text-sm font-semibold flex items-center gap-1 break-words ${mono ? 'font-mono' : ''}`} style={{ color: N.text }}>{icon}{value}</p>
    </div>
  );
}

export default function VerAnunciantePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [anunciante, setAnunciante] = useState<Anunciante | null>(null);

  useEffect(() => {
    if (!id) return;
    try {
      const all = JSON.parse(localStorage.getItem('silexar_anunciantes') ?? '[]');
      const found = all.find((a: Anunciante) => a.id === id);
      setAnunciante(found || null);
    } catch {
      setAnunciante(null);
    }
  }, [id]);

  if (!anunciante) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: N.base }}>
        <style>{`
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
          ::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
          ::-webkit-scrollbar-thumb:hover { background: #6888ff; }
        `}</style>
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: N.textSub }} />
          <p className="text-sm font-bold" style={{ color: N.text }}>Anunciante no encontrado</p>
          <p className="text-xs mt-1" style={{ color: N.textSub }}>El registro solicitado no existe o fue eliminado</p>
        </div>
      </div>
    );
  }

  const a = anunciante;

  // Grid fluido: crea tantas columnas de mínimo 260px como quepan en el ancho disponible
  const fluidGrid = "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 sm:gap-5";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 xl:p-10" style={{ background: N.base }}>
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
        ::-webkit-scrollbar-thumb:hover { background: #6888ff; }
        ::-webkit-scrollbar-corner { background: #dfeaff; }
      `}</style>

      <div className="w-full space-y-4 sm:space-y-5">
        {/* Header navegación */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/anunciantes')}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <ModuleNavMenu />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
              <Building2 className="w-5 h-5" style={{ color: N.accent }} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black" style={{ color: N.text }}>{a.nombreRazonSocial}</h1>
              <p className="text-[11px] font-mono" style={{ color: N.accent }}>{a.codigo}</p>
            </div>
          </div>
          <StatusBadge estado={a.estado} />
        </div>

        {/* Secciones con grid fluido */}
        <Section icon={<Building2 className="w-4 h-4" />} title="Información Legal y Fiscal">
          <div className={fluidGrid}>
            <Field label="RUT" value={a.rut} mono />
            <Field label="Giro / Actividad" value={a.giroActividad} />
            <Field label="Categoría" value={CATEGORIA_MAP[a.categoriaCliente ?? ''] ?? a.categoriaCliente} />
            <Field label="País" value={a.pais} />
          </div>
        </Section>

        <Section icon={<MapPin className="w-4 h-4" />} title="Ubicación Geográfica">
          <div className={fluidGrid}>
            <Field label="Dirección" value={a.direccion} />
            <Field label="Ciudad" value={a.ciudad} />
            <Field label="Comuna / Provincia" value={a.comunaProvincia} />
          </div>
        </Section>

        <Section icon={<User className="w-4 h-4" />} title="Contacto">
          <div className={fluidGrid}>
            <Field label="Email" value={a.emailContacto} icon={<Mail className="w-3 h-3" />} />
            <Field label="Teléfono" value={a.telefonoContacto} icon={<Phone className="w-3 h-3" />} />
            <Field label="Sitio Web" value={a.paginaWeb} icon={<Globe className="w-3 h-3" />} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: N.textSub }}>Representante Principal</p>
              <p className="text-sm font-bold" style={{ color: N.text }}>{a.nombreContactoPrincipal || '—'}</p>
              <p className="text-xs" style={{ color: N.textSub }}>{a.cargoContactoPrincipal || '—'}</p>
            </div>
          </div>
        </Section>

        <Section icon={<Briefcase className="w-4 h-4" />} title="Facturación y Riesgo">
          <div className={fluidGrid}>
            <Field label="Perfil de Riesgo" value={a.riesgoFinanciero} />
            <Field label="Facturación DTE" value={a.tieneFacturacionElectronica ? 'Habilitada' : 'No habilitada'} />
            {a.tieneFacturacionElectronica && <>
              <Field label="N° Deudor (ERP)" value={a.numeroDeudor} mono />
              <Field label="Tipo DTE" value={a.tipoDTE} />
              <Field label="Condición de Pago" value={a.condicionPago} />
              <Field label="Dirección Fiscal" value={a.direccionFacturacion} />
              {a.tipoDTE && !a.tipoDTE.includes('(34)') && (
                <Field label="IVA Aplicado" value={`${a.ivaPorcentaje ?? 19}%`} />
              )}
            </>}
          </div>
        </Section>

        {a.notas && (
          <Section icon={<FileText className="w-4 h-4" />} title="Notas y Documentos">
            <p className="text-sm whitespace-pre-wrap" style={{ color: N.text }}>{a.notas}</p>
          </Section>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold pt-2 border-t" style={{ color: N.textSub, borderColor: `${N.dark}40` }}>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Creado: {a.fechaCreacion ? new Date(a.fechaCreacion).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Por: {a.creadoPor || 'Administrador del Sistema'}
          </div>
        </div>
      </div>
    </div>
  );
}
