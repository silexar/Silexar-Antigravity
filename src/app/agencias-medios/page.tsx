/**
 * 🏛️ SILEXAR PULSE - Página de Gestión de Agencias de Medios
 * 
 * @description Vista principal del módulo de Agencias con diseño neuromórfico
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Percent,
  MapPin,
  Mail,
  RefreshCw,
  CheckCircle,
  Building
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Agencia {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  nombreComercial: string | null;
  tipoAgencia: string;
  ciudad: string | null;
  emailContacto: string | null;
  telefonoContacto: string | null;
  comisionPorcentaje: number;
  estado: string;
  activa: boolean;
  fechaCreacion: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const GlassCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''} ${className}`}>
    {children}
  </div>
);

const GlassButton = ({ children, onClick, variant = 'secondary', className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-200/50 border border-transparent',
    secondary: 'bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 shadow-sm shadow-slate-200/50 border border-white/40'
  };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const colors: Record<string, string> = {
    medios: 'from-cyan-400 to-cyan-500',
    creativa: 'from-pink-400 to-pink-500',
    digital: 'from-purple-400 to-purple-500',
    integral: 'from-emerald-400 to-emerald-500',
    btl: 'from-amber-400 to-amber-500'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colors[tipo] || colors.medios} shadow-md`}>
      <Briefcase className="w-3.5 h-3.5" />
      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AgenciasMediosPage() {
  const router = useRouter();
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAgencias = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...(search && { search }) });
      const response = await fetch(`/api/agencias-medios?${params}`);
      const data = await response.json();
      if (data.success) setAgencias(data.data);
    } catch {
      // /* console.error('Error:', error) */;
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchAgencias(); }, [fetchAgencias]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-cyan-500" />
              Gestión de Agencias de Medios
            </h1>
            <p className="text-slate-500 mt-2">Administra agencias de medios, creativas y digitales</p>
          </div>
          <GlassButton variant="primary" onClick={() => router.push('/agencias-medios/nuevo')}>
            <Plus className="w-5 h-5" /> Nueva Agencia
          </GlassButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Agencias', value: agencias.length, icon: Briefcase, color: 'from-cyan-400 to-cyan-500' },
            { label: 'Activas', value: agencias.filter(a => a.activa).length, icon: CheckCircle, color: 'from-emerald-400 to-emerald-500' },
            { label: 'Comisión Promedio', value: `${(agencias.reduce((sum, a) => sum + a.comisionPorcentaje, 0) / (agencias.length || 1)).toFixed(1)}%`, icon: Percent, color: 'from-blue-400 to-blue-500' },
            { label: 'Por Tipo', value: [...new Set(agencias.map(a => a.tipoAgencia))].length, icon: Building, color: 'from-purple-400 to-purple-500' }
          ].map((stat, i) => (
            <GlassCard key={i}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-slate-200/50`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Búsqueda */}
        <GlassCard>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar agencias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl py-3 pl-12 pr-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] border-none outline-none focus:ring-2 focus:ring-cyan-400/50 text-slate-700"
              />
            </div>
            <GlassButton variant="secondary" onClick={fetchAgencias}>
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </GlassButton>
          </div>
        </GlassCard>

        {/* Grid de agencias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
            </div>
          ) : agencias.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600">No hay agencias</h3>
            </div>
          ) : (
            agencias.map((agencia) => (
              <GlassCard key={agencia.id} onClick={() => router.push(`/agencias-medios/${agencia.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-md shadow-cyan-200/50">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{agencia.nombreComercial || agencia.nombreRazonSocial}</h3>
                      <p className="text-sm text-slate-500">{agencia.codigo}</p>
                    </div>
                  </div>
                  <TipoBadge tipo={agencia.tipoAgencia} />
                </div>
                
                <div className="space-y-2 mb-4">
                  {agencia.ciudad && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {agencia.ciudad}
                    </div>
                  )}
                  {agencia.emailContacto && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {agencia.emailContacto}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-600">
                    <Percent className="w-4 h-4" />
                    Comisión: {agencia.comisionPorcentaje}%
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${agencia.activa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {agencia.activa ? 'Activa' : 'Inactiva'}
                  </span>
                  <div className="flex gap-2">
                    <button aria-label="Ver detalle" className="p-2 rounded-lg hover:bg-cyan-50 text-cyan-500" onClick={(e) => { e.stopPropagation(); router.push(`/agencias-medios/${agencia.id}`); }}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button aria-label="Editar" className="p-2 rounded-lg hover:bg-amber-50 text-amber-500" onClick={(e) => { e.stopPropagation(); router.push(`/agencias-medios/${agencia.id}/editar`); }}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>🏛️ Módulo de Gestión de Agencias - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
