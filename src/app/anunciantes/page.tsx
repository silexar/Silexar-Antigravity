/**
 * 🏢 SILEXAR PULSE - Página de Gestión de Anunciantes
 * 
 * @description Vista principal del módulo de Anunciantes con diseño neuromórfico
 * Fortune 10 level - Gestión completa de clientes publicitarios
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Anunciante {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  giroActividad: string | null;
  direccion: string | null;
  ciudad: string | null;
  pais: string;
  emailContacto: string | null;
  telefonoContacto: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  activo: boolean;
  fechaCreacion: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const GlassCard = ({ 
  children, 
  className = '',
  variant = 'raised',
  onClick
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'raised' | 'inset' | 'flat';
  onClick?: () => void;
}) => {
  const variants = {
    raised: 'bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50',
    inset: 'bg-white/40 backdrop-blur-sm border border-slate-200 shadow-inner',
    flat: 'bg-white/50 backdrop-blur-md border border-white/40'
  };

  return (
    <div 
      className={`rounded-2xl p-6 transition-all duration-300 ${variants[variant]} ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const GlassButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200/50 border border-transparent hover:-translate-y-0.5',
    secondary: 'bg-white/80 backdrop-blur-sm border border-white/60 text-slate-700 shadow-sm shadow-slate-200/50 hover:bg-white',
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/50 border border-transparent hover:-translate-y-0.5',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-200/50 border border-transparent hover:-translate-y-0.5',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100/50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        rounded-xl font-medium transition-all duration-200
        flex items-center gap-2 justify-center
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const GlassInput = ({
  placeholder,
  value,
  onChange,
  icon: Icon,
  className = ''
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full rounded-xl py-3 bg-white/60 backdrop-blur-sm
          shadow-sm border border-white/60 outline-none focus:ring-2 focus:ring-blue-400/50
          text-slate-700 placeholder-slate-400
          transition-all duration-200
          ${Icon ? 'pl-12 pr-4' : 'px-4'}
        `}
      />
    </div>
  );
};

const GlassSelect = ({
  value,
  onChange,
  options,
  className = ''
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        rounded-xl py-3 px-4 bg-white/60 backdrop-blur-sm
        shadow-sm border border-white/60 outline-none focus:ring-2 focus:ring-blue-400/50
        text-slate-700 cursor-pointer
        transition-all duration-200
        ${className}
      `}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StatusBadge = ({ estado, activo: _activo }: { estado: string; activo: boolean }) => {
  const config = {
    activo: { bg: 'from-emerald-400 to-emerald-500', text: 'text-white', icon: CheckCircle2 },
    inactivo: { bg: 'from-slate-400 to-slate-500', text: 'text-white', icon: XCircle },
    suspendido: { bg: 'from-amber-400 to-amber-500', text: 'text-white', icon: AlertCircle },
    pendiente: { bg: 'from-blue-400 to-blue-500', text: 'text-white', icon: Building }
  };

  const { bg, text, icon: Icon } = config[estado as keyof typeof config] || config.pendiente;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
      bg-gradient-to-r ${bg} ${text}
      shadow-[2px_2px_6px_rgba(0,0,0,0.15)]
    `}>
      <Icon className="w-3.5 h-3.5" />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AnunciantesPage() {
  const router = useRouter();
  const [anunciantes, setAnunciantes] = useState<Anunciante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false
  });

  // Stats calculados
  const stats = {
    total: pagination.total,
    activos: anunciantes.filter(a => a.activo).length,
    inactivos: anunciantes.filter(a => !a.activo).length
  };

  // Fetch anunciantes
  const fetchAnunciantes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(filterEstado && { estado: filterEstado })
      });

      const response = await fetch(`/api/anunciantes?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnunciantes(data.data);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      /* console.error('Error fetching anunciantes:', error) */;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterEstado]);

  useEffect(() => {
    fetchAnunciantes();
  }, [fetchAnunciantes]);

  // Handler de búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Toggle estado
  const handleToggleActivo = async (id: string) => {
    try {
      await fetch(`/api/anunciantes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_activo' })
      });
      fetchAnunciantes();
    } catch (error) {
      /* console.error('Error toggling anunciante:', error) */;
    }
  };

  // Eliminar
  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar el anunciante "${nombre}"?`)) return;
    
    try {
      await fetch(`/api/anunciantes/${id}`, { method: 'DELETE' });
      fetchAnunciantes();
    } catch (error) {
      /* console.error('Error deleting anunciante:', error) */;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Building2 className="w-10 h-10 text-blue-500" />
              Gestión de Anunciantes
            </h1>
            <p className="text-slate-500 mt-2">
              Administra tus clientes publicitarios con control total
            </p>
          </div>
          
          <GlassButton 
            variant="primary" 
            size="lg"
            onClick={() => router.push('/anunciantes/nuevo')}
          >
            <Plus className="w-5 h-5" />
            Nuevo Anunciante
          </GlassButton>
        </div>

        {/* ═══ STATS CARDS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-200/50">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Anunciantes</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-200/50">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Activos</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.activos}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-200/50">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Inactivos</p>
                <p className="text-3xl font-bold text-slate-600">{stats.inactivos}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ═══ FILTROS Y BÚSQUEDA ═══ */}
        <GlassCard>
          <div className="flex flex-col lg:flex-row gap-4">
            <GlassInput
              placeholder="Buscar por nombre, RUT, código o email..."
              value={search}
              onChange={setSearch}
              icon={Search}
              className="flex-1"
            />

            <div className="flex gap-4">
              <GlassSelect
                value={filterEstado}
                onChange={(value) => {
                  setFilterEstado(value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activos' },
                  { value: 'inactivo', label: 'Inactivos' },
                  { value: 'suspendido', label: 'Suspendidos' }
                ]}
                className="w-48"
              />

              <GlassButton aria-label="Actualizar" variant="secondary" onClick={fetchAnunciantes}>
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* ═══ TABLA DE ANUNCIANTES ═══ */}
        <GlassCard className="overflow-hidden p-0 sm:p-0 border-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-slate-500">Cargando anunciantes...</span>
            </div>
          ) : anunciantes.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600">No hay anunciantes</h3>
              <p className="text-slate-400 mt-2">
                {search || filterEstado 
                  ? 'No se encontraron resultados con los filtros aplicados'
                  : 'Comienza agregando tu primer anunciante'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Código</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Razón Social</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">RUT</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Contacto</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Ciudad</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Estado</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {anunciantes.map((anunciante) => (
                    <tr 
                      key={anunciante.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-blue-600 font-medium">
                          {anunciante.codigo}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{anunciante.nombreRazonSocial}</p>
                          {anunciante.giroActividad && (
                            <p className="text-xs text-slate-400 mt-0.5">{anunciante.giroActividad}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-slate-600">
                          {anunciante.rut || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {anunciante.emailContacto && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {anunciante.emailContacto}
                            </div>
                          )}
                          {anunciante.telefonoContacto && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {anunciante.telefonoContacto}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {anunciante.ciudad || anunciante.pais}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge estado={anunciante.estado} activo={anunciante.activo} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/anunciantes/${anunciante.id}`)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/anunciantes/${anunciante.id}/editar`)}
                            className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActivo(anunciante.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              anunciante.activo 
                                ? 'hover:bg-slate-100 text-slate-500' 
                                : 'hover:bg-emerald-50 text-emerald-500'
                            }`}
                            title={anunciante.activo ? 'Desactivar' : 'Activar'}
                          >
                            {anunciante.activo 
                              ? <ToggleRight className="w-4 h-4" /> 
                              : <ToggleLeft className="w-4 h-4" />
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(anunciante.id, anunciante.nombreRazonSocial)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ PAGINACIÓN ═══ */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <GlassButton
                  aria-label="Anterior"
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </GlassButton>
                <span className="px-4 py-2 text-sm text-slate-600 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-white/60">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <GlassButton
                  aria-label="Siguiente"
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>

        {/* ═══ FOOTER ═══ */}
        <div className="text-center text-slate-400 text-sm">
          <p>🏢 Módulo de Gestión de Anunciantes - SILEXAR PULSE TIER 0</p>
          <p className="mt-1">Fortune 10 Enterprise Software</p>
        </div>
      </div>
    </div>
  );
}
