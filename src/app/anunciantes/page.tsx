'use client';

/**
 * /anunciantes — Módulo Gestión de Anunciantes TIER 0
 * Paleta oficial: base #dfeaff | acento #6888ff | texto #69738c
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2, Search, Plus, Eye, Edit3, Trash2,
  ToggleLeft, ToggleRight, Mail, Phone, MapPin,
  RefreshCw, TrendingUp, X, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, XCircle, ArrowLeft,
  AlertTriangle, Maximize2,
} from 'lucide-react';
import { AnuncianteForm } from './_components/AnuncianteForm';
import { AnuncianteDetailWindow } from './_components/AnuncianteDetailWindow';
import { ModuleNavMenu } from '@/components/module-nav-menu';
import { toast } from '@/components/ui/use-toast';

// â”€â”€â”€ Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const N = {
  base: '#dfeaff', dark: '#bec8de', light: '#ffffff',
  accent: '#6888ff', text: '#69738c', textSub: '#9aa3b8',
}

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Anunciante {
  id: string; codigo: string; rut: string | null;
  nombreRazonSocial: string; giroActividad: string | null;
  direccion: string | null; ciudad: string | null; pais: string;
  emailContacto: string | null; telefonoContacto: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  activo: boolean; fechaCreacion: string;
  categoriaCliente?: string; comunaProvincia?: string | null;
  nombreContactoPrincipal?: string | null; cargoContactoPrincipal?: string | null;
  paginaWeb?: string | null; telefonoContacto2?: string | null;
  riesgoFinanciero?: string; notas?: string;
  tieneFacturacionElectronica?: boolean; numeroDeudor?: string;
  tipoDTE?: string; condicionPago?: string; direccionFacturacion?: string;
  ivaPorcentaje?: number;
  creadoPor?: string; modificadoPor?: string; fechaModificacion?: string;
}
interface PaginationInfo {
  total: number; page: number; limit: number;
  totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean;
}

// â”€â”€â”€ Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`, ...style }}>
      {children}
    </div>
  )
}

function NeuButton({ children, onClick, variant = 'secondary', disabled = false, className = '', 'aria-label': al }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean; className?: string; 'aria-label'?: string
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` },
    secondary: { background: N.base, color: N.text, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` },
    danger:    { background: N.base, color: N.textSub, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` },
    ghost:     { background: 'transparent', color: N.textSub },
  }
  return (
    <button onClick={onClick} disabled={disabled} aria-label={al}
      className={`flex items-center gap-2 justify-center rounded-2xl font-bold text-sm transition-all duration-200 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  )
}

function NeuInput({ placeholder, value, onChange, icon: Icon }: {
  placeholder?: string; value: string; onChange: (v: string) => void; icon?: React.ElementType
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />}
      <input
        type="text" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} aria-label={placeholder}
        className="w-full py-3 rounded-2xl text-sm focus:outline-none transition-all"
        style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`, color: N.text, paddingLeft: Icon ? '2.5rem' : '1rem', paddingRight: '1rem' }}
      />
    </div>
  )
}

function NeuSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="py-3 px-4 rounded-2xl text-sm focus:outline-none cursor-pointer"
      style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`, color: N.text }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const config: Record<string, { opacity: number; label: string; icon: React.ElementType }> = {
    activo:    { opacity: 1,    label: 'Activo',    icon: CheckCircle2 },
    inactivo:  { opacity: 0.5,  label: 'Inactivo',  icon: XCircle },
    suspendido:{ opacity: 0.7,  label: 'Suspendido', icon: AlertCircle },
    pendiente: { opacity: 0.85, label: 'Pendiente',  icon: Building2 },
  }
  const c = config[estado] ?? config.pendiente
  const Icon = c.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: `${N.accent}15`, color: N.accent, opacity: c.opacity, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}>
      <Icon className="w-3 h-3" />{c.label}
    </span>
  )
}


// â”€â”€â”€ Edit Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EditModal({ a, onClose, onSuccess }: { a: Anunciante; onClose: () => void; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleUpdate = async (data: any) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    // Injecting modification metadata
    const updatePayload = {
      ...data,
      modificadoPor: 'Usuario Activo', // En produccion usar token de sesion
      fechaModificacion: new Date().toISOString()
    };

    const LS_KEY = 'silexar_anunciantes';
    const all = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
    const updated = all.map((item: any) => item.id === a.id ? { ...item, ...updatePayload } : item);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    toast({ title: 'âœ… Actualizado exitosamente', description: 'Los cambios han sido guardados.' });
    setIsLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#dfeaff]/95 backdrop-blur-md p-4 sm:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 z-50 p-2.5 rounded-2xl bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all" style={{ color: N.textSub }}>
          <X className="w-5 h-5" />
        </button>
        <div className="mt-8">
          <AnuncianteForm mode="edit" initialData={a as any} onSubmit={handleUpdate} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Delete Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DeleteModal({ a, onClose, onConfirm }: { a: Anunciante; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#dfeaff]/80 backdrop-blur-sm p-4">
      <div className="rounded-3xl p-8 max-w-md w-full text-center" style={{ background: N.base, boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}` }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: N.base, color: N.accent, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black mb-2" style={{ color: N.text }}>¿Eliminar Anunciante?</h3>
        <p className="text-sm mb-8" style={{ color: N.textSub }}>
          Estás a punto de eliminar a <strong style={{ color: N.text }}>{a.nombreRazonSocial}</strong>. Esta acción no se puede deshacer y borrará todos sus datos.
        </p>
        <div className="flex gap-4 justify-center">
          <NeuButton variant="secondary" onClick={onClose} className="px-6 py-2.5">Cancelar</NeuButton>
          <NeuButton variant="danger" onClick={onConfirm} className="px-6 py-2.5">Eliminar</NeuButton>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AnunciantesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPopup = searchParams.get('popup') === '1';
  const [anunciantes, setAnunciantes] = useState<Anunciante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false
  });
  const [viewingAnunciante, setViewingAnunciante] = useState<Anunciante | null>(null);
  const [editingAnunciante, setEditingAnunciante] = useState<Anunciante | null>(null);
  const [deletingAnunciante, setDeletingAnunciante] = useState<Anunciante | null>(null);

  const activos   = anunciantes.filter(a => a.activo).length;
  const inactivos = anunciantes.filter(a => !a.activo).length;

  const LS_KEY = 'silexar_anunciantes';

  const fetchAnunciantes = useCallback(async () => {
    setLoading(true);
    try {
      // Leer registros locales (guardados sin backend)
      const localRecords: Anunciante[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');

      // Intentar obtener registros del servidor
      let serverRecords: Anunciante[] = [];
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(), limit: '999',
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filterEstado    && { estado: filterEstado }),
        });
        const res  = await fetch(`/api/anunciantes?${params}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) serverRecords = data.data;
      } catch { /* sin backend, usamos solo localStorage */ }

      // Fusionar: locales primero, luego los del servidor que no estén ya
      const localIds = new Set(localRecords.map(r => r.id));
      const merged = [
        ...localRecords,
        ...serverRecords.filter(r => !localIds.has(r.id)),
      ];

      // Filtros en memoria
      const filtered = merged.filter(a => {
        const matchSearch = !debouncedSearch ||
          a.nombreRazonSocial?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (a.rut ?? '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (a.emailContacto ?? '').toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchEstado = !filterEstado || a.estado === filterEstado;
        return matchSearch && matchEstado;
      });

      setAnunciantes(filtered);
      setPagination(p => ({
        ...p,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / p.limit),
        hasNextPage: p.page < Math.ceil(filtered.length / p.limit),
        hasPreviousPage: p.page > 1,
      }));
    } catch { /* silent */ } finally { setLoading(false); }
  }, [pagination.page, pagination.limit, debouncedSearch, filterEstado]);

  useEffect(() => { fetchAnunciantes(); }, [fetchAnunciantes]);
  useEffect(() => { setPagination(p => ({ ...p, page: 1 })); }, [debouncedSearch]);

  // Escuchar creación de anunciantes desde ventanas popup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('silexar_anunciante_sync');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'ANUNCIANTE_CREATED' || ev.data?.type === 'CLEAR_DRAFT') {
          fetchAnunciantes();
        }
      };
    } catch { /* BroadcastChannel no soportado */ }
    return () => { if (bc) bc.close(); };
  }, [fetchAnunciantes]);

  const LS_KEY_ACTIONS = 'silexar_anunciantes';

  const handleToggle = (id: string) => {
    const all = JSON.parse(localStorage.getItem(LS_KEY_ACTIONS) ?? '[]');
    const updated = all.map((a: Anunciante) =>
      a.id === id ? { ...a, activo: !a.activo, estado: a.activo ? 'inactivo' : 'activo' } : a
    );
    localStorage.setItem(LS_KEY_ACTIONS, JSON.stringify(updated));
    fetchAnunciantes();
  };

  const handleDelete = (a: Anunciante) => {
    setDeletingAnunciante(a);
  };

  const confirmDelete = () => {
    if (!deletingAnunciante) return;
    const all = JSON.parse(localStorage.getItem(LS_KEY_ACTIONS) ?? '[]');
    localStorage.setItem(LS_KEY_ACTIONS, JSON.stringify(all.filter((a: Anunciante) => a.id !== deletingAnunciante.id)));
    setDeletingAnunciante(null);
    fetchAnunciantes();
  };

  const handleView = (a: Anunciante) => {
    setViewingAnunciante(a);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
        ::-webkit-scrollbar-thumb:hover { background: #6888ff; }
        ::-webkit-scrollbar-corner { background: #dfeaff; }
      `}</style>
      <div className="max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-xl transition-all"
              style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <ModuleNavMenu />
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: N.text }}>
                <Building2 className="w-6 h-6" style={{ color: N.accent }} />
                Anunciantes (Clientes)
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isPopup && (
              <button
                onClick={() => {
                  const w = window.screen.availWidth;
                  const h = window.screen.availHeight;
                  window.open(
                    '/anunciantes?popup=1',
                    '_blank',
                    `width=${w},height=${h},left=0,top=0,resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
                  );
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: N.base, color: N.text, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` }}
                title="Abrir en ventana nueva"
              >
                <Maximize2 className="w-4 h-4" />
                Ventana
              </button>
            )}
            <NeuButton variant="primary" onClick={() => router.push('/anunciantes/nuevo')} className="px-5 py-3">
              <Plus className="w-4 h-4" />
              Nuevo Anunciante
            </NeuButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Total Anunciantes', value: pagination.total, color: N.accent,   icon: Building2   },
            { label: 'Activos',           value: activos,           color: N.accent,  icon: TrendingUp  },
            { label: 'Inactivos',         value: inactivos,         color: N.textSub,  icon: AlertCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <NeuCard key={label} className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: N.textSub }}>{label}</p>
                  <p className="text-3xl font-black" style={{ color: N.text }}>{value}</p>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>

        {/* Filters */}
        <NeuCard className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <NeuInput placeholder="Buscar por nombre, RUT, código o email..." value={search} onChange={setSearch} icon={Search} />
            </div>
            <div className="flex gap-3">
              <NeuSelect value={filterEstado} onChange={v => { setFilterEstado(v); setPagination(p => ({ ...p, page: 1 })); }}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activos' },
                  { value: 'inactivo', label: 'Inactivos' },
                  { value: 'suspendido', label: 'Suspendidos' },
                ]}
              />
              <NeuButton variant="secondary" onClick={fetchAnunciantes} aria-label="Actualizar" className="px-4">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </NeuButton>
            </div>
          </div>
        </NeuCard>

        {/* Table */}
        <NeuCard className="overflow-hidden p-0">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-12 rounded-2xl animate-pulse" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }} />
              ))}
            </div>
          ) : anunciantes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                <Building2 className="w-8 h-8" style={{ color: N.textSub }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: N.text }}>No hay anunciantes</h3>
              <p className="text-sm" style={{ color: N.textSub }}>
                {search || filterEstado ? 'Sin resultados para los filtros aplicados' : 'Comienza agregando tu primer anunciante'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${N.dark}40` }}>
                    {['CÓDIGO ID', 'RAZÓN SOCIAL', 'RUT', 'Contacto', 'Ciudad', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left py-4 px-4 text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {anunciantes.map(a => (
                    <tr key={a.id} onClick={() => handleView(a)} className="transition-all group hover:bg-[#6888ff]/5 cursor-pointer" style={{ borderBottom: `1px solid ${N.dark}30` }}>
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <span className="font-mono text-sm font-bold" style={{ color: N.accent }}>{a.codigo}</span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-sm" style={{ color: N.text }}>{a.nombreRazonSocial}</p>
                        {a.giroActividad && <p className="text-xs mt-0.5" style={{ color: N.textSub }}>{a.giroActividad}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm" style={{ color: N.text }}>{a.rut || 'â€”'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {a.emailContacto && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: N.textSub }}>
                              <Mail className="w-3.5 h-3.5" />{a.emailContacto}
                            </div>
                          )}
                          {a.telefonoContacto && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: N.textSub }}>
                              <Phone className="w-3.5 h-3.5" />{a.telefonoContacto}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: N.textSub }}>
                          <MapPin className="w-3.5 h-3.5" />{a.ciudad || a.pais}
                        </div>
                      </td>
                      <td className="py-4 px-4"><StatusBadge estado={a.estado} /></td>
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {
                            [
                              { icon: Eye,    color: N.accent,   action: () => handleView(a),                                                         title: 'Ver detalle' },
                              { icon: Edit3,  color: N.accent,   action: () => setEditingAnunciante(a),                                               title: 'Editar' },
                              { icon: a.activo ? ToggleRight : ToggleLeft, color: N.accent, action: () => handleToggle(a.id), title: a.activo ? 'Desactivar' : 'Activar' },
                              { icon: Trash2, color: N.textSub,  action: () => handleDelete(a),                                                      title: 'Eliminar' },
                            ].map(({ icon: Icon, color, action, title }) => (
                              <button key={title} onClick={action} title={title}
                                className="p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
                                style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`, color }}>
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            ))
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: `1px solid ${N.dark}30` }}>
              <p className="text-xs" style={{ color: N.textSub }}>
                {((pagination.page - 1) * pagination.limit) + 1}â€“{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <NeuButton variant="secondary" aria-label="Anterior" disabled={!pagination.hasPreviousPage}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="p-2.5">
                  <ChevronLeft className="w-4 h-4" />
                </NeuButton>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`, color: N.text }}>
                  {pagination.page} / {pagination.totalPages}
                </span>
                <NeuButton variant="secondary" aria-label="Siguiente" disabled={!pagination.hasNextPage}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="p-2.5">
                  <ChevronRight className="w-4 h-4" />
                </NeuButton>
              </div>
            </div>
          )}
        </NeuCard>

        {/* Footer */}

      </div>

      {viewingAnunciante && <AnuncianteDetailWindow anunciante={viewingAnunciante} isOpen={!!viewingAnunciante} onClose={() => setViewingAnunciante(null)} />}
      {editingAnunciante && <EditModal a={editingAnunciante} onClose={() => setEditingAnunciante(null)} onSuccess={fetchAnunciantes} />}
      {deletingAnunciante && <DeleteModal a={deletingAnunciante} onClose={() => setDeletingAnunciante(null)} onConfirm={confirmDelete} />}
    </div>
  );
}
