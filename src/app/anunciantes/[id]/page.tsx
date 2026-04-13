/**
 * 🏢 SILEXAR PULSE - Detalle de Anunciante
 * 
 * @description Vista de detalle del anunciante con pestañas y diseño neuromórfico
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  FileText,
  Briefcase,
  CreditCard,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Clock,
  History,
  Paperclip
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AnuncianteDetalle {
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
  estado: string;
  activo: boolean;
  notas: string | null;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

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
  children, onClick, variant = 'secondary', disabled = false,
  'aria-label': ariaLabel
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  'aria-label'?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[4px_4px_12px_rgba(59,130,246,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[4px_4px_12px_rgba(239,68,68,0.4)]',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        px-4 py-2 rounded-xl font-medium transition-all duration-200
        flex items-center gap-2 justify-center
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
      `}
    >
      {children}
    </button>
  );
};

const Tab = ({ 
  active, label, icon: Icon, onClick 
}: { 
  active: boolean; 
  label: string; 
  icon: React.ElementType;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
      ${active 
        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[4px_4px_12px_rgba(59,130,246,0.3)]' 
        : 'text-slate-600 hover:bg-slate-100'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | null; icon?: React.ElementType }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    {Icon && <Icon className="w-5 h-5 text-slate-400 mt-0.5" />}
    <div className="flex-1">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-slate-700 font-medium">{value || '—'}</p>
    </div>
  </div>
);

const StatusBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType }> = {
    activo: { bg: 'from-emerald-400 to-emerald-500', icon: CheckCircle2 },
    inactivo: { bg: 'from-slate-400 to-slate-500', icon: XCircle },
    suspendido: { bg: 'from-amber-400 to-amber-500', icon: AlertCircle }
  };
  const { bg, icon: Icon } = config[estado] || config.activo;

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${bg} text-white shadow-md`}>
      <Icon className="w-4 h-4" />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AnuncianteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [anunciante, setAnunciante] = useState<AnuncianteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchAnunciante = async () => {
      try {
        const response = await fetch(`/api/anunciantes/${resolvedParams.id}`);
        const data = await response.json();
        if (data.success) {
          setAnunciante(data.data);
        }
      } catch (error) {
        /* */;
      } finally {
        setLoading(false);
      }
    };
    fetchAnunciante();
  }, [resolvedParams.id]);

  const handleToggleActivo = async () => {
    if (!anunciante) return;
    try {
      const response = await fetch(`/api/anunciantes/${anunciante.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_activo' })
      });
      const data = await response.json();
      if (data.success) {
        setAnunciante(data.data);
      }
    } catch (error) {
      /* */;
    }
  };

  const handleDelete = async () => {
    if (!anunciante || !confirm(`¿Está seguro de eliminar el anunciante "${anunciante.nombreRazonSocial}"?`)) return;
    
    try {
      await fetch(`/api/anunciantes/${anunciante.id}`, { method: 'DELETE' });
      router.push('/anunciantes');
    } catch (error) {
      /* */;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!anunciante) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center">
        <NeuromorphicCard className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Anunciante no encontrado</h2>
          <p className="text-slate-500 mt-2 mb-6">El anunciante solicitado no existe o fue eliminado.</p>
          <NeuromorphicButton variant="primary" onClick={() => router.push('/anunciantes')}>
            <ArrowLeft className="w-4 h-4" /> Volver a la lista
          </NeuromorphicButton>
        </NeuromorphicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeuromorphicButton aria-label="Volver" variant="ghost" onClick={() => router.push('/anunciantes')}>
              <ArrowLeft className="w-5 h-5" />
            </NeuromorphicButton>
            <div>
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-slate-800">{anunciante.nombreRazonSocial}</h1>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">{anunciante.codigo}</span>
                {anunciante.rut && (
                  <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">{anunciante.rut}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusBadge estado={anunciante.estado} />
            <NeuromorphicButton variant="secondary" onClick={() => router.push(`/anunciantes/${anunciante.id}/editar`)}>
              <Edit3 className="w-4 h-4" /> Editar
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" onClick={handleToggleActivo}>
              {anunciante.activo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {anunciante.activo ? 'Desactivar' : 'Activar'}
            </NeuromorphicButton>
            <NeuromorphicButton variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" /> Eliminar
            </NeuromorphicButton>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <NeuromorphicCard className="flex flex-wrap gap-2">
          <Tab active={activeTab === 'info'} label="Información General" icon={Building2} onClick={() => setActiveTab('info')} />
          <Tab active={activeTab === 'facturacion'} label="Facturación" icon={CreditCard} onClick={() => setActiveTab('facturacion')} />
          <Tab active={activeTab === 'contratos'} label="Contratos" icon={FileText} onClick={() => setActiveTab('contratos')} />
          <Tab active={activeTab === 'campanas'} label="Campañas" icon={Briefcase} onClick={() => setActiveTab('campanas')} />
          <Tab active={activeTab === 'archivos'} label="Archivos" icon={Paperclip} onClick={() => setActiveTab('archivos')} />
          <Tab active={activeTab === 'historial'} label="Historial" icon={History} onClick={() => setActiveTab('historial')} />
        </NeuromorphicCard>

        {/* ═══ CONTENIDO TAB ═══ */}
        {activeTab === 'info' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <NeuromorphicCard>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" /> Datos de la Empresa
              </h3>
              <InfoRow label="Razón Social" value={anunciante.nombreRazonSocial} />
              <InfoRow label="RUT" value={anunciante.rut} icon={FileText} />
              <InfoRow label="Giro o Actividad" value={anunciante.giroActividad} icon={Briefcase} />
              <InfoRow label="Página Web" value={anunciante.paginaWeb} icon={Globe} />
            </NeuromorphicCard>

            <NeuromorphicCard>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> Dirección
              </h3>
              <InfoRow label="Dirección" value={anunciante.direccion} />
              <InfoRow label="Ciudad" value={anunciante.ciudad} />
              <InfoRow label="Comuna/Provincia" value={anunciante.comunaProvincia} />
              <InfoRow label="País" value={anunciante.pais} />
            </NeuromorphicCard>

            <NeuromorphicCard>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> Contacto Principal
              </h3>
              <InfoRow label="Nombre" value={anunciante.nombreContactoPrincipal} icon={User} />
              <InfoRow label="Cargo" value={anunciante.cargoContactoPrincipal} />
              <InfoRow label="Email" value={anunciante.emailContacto} icon={Mail} />
              <InfoRow label="Teléfono" value={anunciante.telefonoContacto} icon={Phone} />
            </NeuromorphicCard>

            <NeuromorphicCard>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Auditoría
              </h3>
              <InfoRow 
                label="Fecha de Creación" 
                value={anunciante.fechaCreacion ? new Date(anunciante.fechaCreacion).toLocaleString('es-CL') : null}
                icon={Calendar}
              />
              <InfoRow 
                label="Última Modificación" 
                value={anunciante.fechaModificacion ? new Date(anunciante.fechaModificacion).toLocaleString('es-CL') : null}
                icon={Calendar}
              />
              {anunciante.notas && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-600 font-medium">Notas:</p>
                  <p className="text-slate-700 mt-1 whitespace-pre-wrap">{anunciante.notas}</p>
                </div>
              )}
            </NeuromorphicCard>
          </div>
        )}

        {activeTab === 'facturacion' && (
          <NeuromorphicCard>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" /> Información de Facturación
            </h3>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <InfoRow 
                  label="Facturación Electrónica" 
                  value={anunciante.tieneFacturacionElectronica ? '✅ Sí' : '❌ No'} 
                />
                <InfoRow label="Dirección de Facturación" value={anunciante.direccionFacturacion} icon={MapPin} />
                <InfoRow label="Email de Facturación" value={anunciante.emailFacturacion} icon={Mail} />
              </div>
            </div>
          </NeuromorphicCard>
        )}

        {activeTab === 'contratos' && (
          <NeuromorphicCard className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600">Contratos Asociados</h3>
            <p className="text-slate-400 mt-2">Los contratos de este anunciante aparecerán aquí cuando se implementen.</p>
          </NeuromorphicCard>
        )}

        {activeTab === 'campanas' && (
          <NeuromorphicCard className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600">Campañas Asociadas</h3>
            <p className="text-slate-400 mt-2">Las campañas de este anunciante aparecerán aquí cuando se implementen.</p>
          </NeuromorphicCard>
        )}

        {activeTab === 'archivos' && (
          <NeuromorphicCard className="text-center py-12">
            <Paperclip className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600">Archivos Adjuntos</h3>
            <p className="text-slate-400 mt-2">Arrastra y suelta archivos aquí o haz clic para subir.</p>
            <NeuromorphicButton variant="primary">
              Subir Archivo
            </NeuromorphicButton>
          </NeuromorphicCard>
        )}

        {activeTab === 'historial' && (
          <NeuromorphicCard className="text-center py-12">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600">Historial de Cambios</h3>
            <p className="text-slate-400 mt-2">El historial de modificaciones aparecerá aquí.</p>
          </NeuromorphicCard>
        )}
      </div>
    </div>
  );
}
