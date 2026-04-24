/**
 * 🏛️ SILEXAR PULSE - Página de Gestión de Agencias de Medios
 * 
 * @description Vista principal del módulo de Agencias con diseño neuromórfico oficial
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
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
import {
  NeuromorphicCard,
  NeuromorphicButton,
  NeuromorphicInput
} from '@/components/ui/neuromorphic';

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
// COMPONENTES NEUROMÓRFICOS AUXILIARES
// ═══════════════════════════════════════════════════════════════

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const getColor = (t: string) => {
    switch (t) {
      case 'medios': return 'text-blue-600';
      case 'creativa': return 'text-pink-600';
      case 'digital': return 'text-purple-600';
      case 'integral': return 'text-emerald-600';
      case 'btl': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getColor(tipo)} bg-[#EAF0F6] shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]`}>
      <Briefcase className="w-3.5 h-3.5" />
      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    </span>
  );
};

const StatusBadge = ({ activa }: { activa: boolean }) => (
  <span className={`px-2 py-1 rounded text-xs font-medium ${activa ? 'text-emerald-600 bg-emerald-100 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]' : 'text-slate-500 bg-slate-100 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]'}`}>
    {activa ? 'Activa' : 'Inactiva'}
  </span>
);

const StatCard = ({ label, value, icon: Icon, colorClass }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}) => (
  <NeuromorphicCard variant="embossed" className="p-5">
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass} shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-3xl font-bold text-slate-700">{value}</p>
      </div>
    </div>
  </NeuromorphicCard>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AgenciasMediosPage() {
  const router = useRouter();
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const fetchAgencias = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...(debouncedSearch && { search: debouncedSearch }) });
      const response = await fetch(`/api/agencias-medios?${params}`);
      const data = await response.json();
      if (data.success) setAgencias(data.data);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchAgencias(); }, [fetchAgencias]);

  return (
    <div className="min-h-screen bg-[#EAF0F6] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-700 flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-indigo-500" />
              Gestión de Agencias de Medios
            </h1>
            <p className="text-slate-500 mt-2">Administra agencias de medios, creativas y digitales</p>
          </div>
          <NeuromorphicButton variant="primary" size="lg" onClick={() => router.push('/agencias-medios/nuevo')}>
            <Plus className="w-5 h-5" /> Nueva Agencia
          </NeuromorphicButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Agencias"
            value={agencias.length}
            icon={Briefcase}
            colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <StatCard
            label="Activas"
            value={agencias.filter(a => a.activa).length}
            icon={CheckCircle}
            colorClass="bg-gradient-to-br from-emerald-500 to-green-600"
          />
          <StatCard
            label="Comisión Promedio"
            value={`${(agencias.reduce((sum, a) => sum + a.comisionPorcentaje, 0) / (agencias.length || 1)).toFixed(1)}%`}
            icon={Percent}
            colorClass="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <StatCard
            label="Por Tipo"
            value={[...new Set(agencias.map(a => a.tipoAgencia))].length}
            icon={Building}
            colorClass="bg-gradient-to-br from-purple-500 to-pink-600"
          />
        </div>

        {/* Búsqueda */}
        <NeuromorphicCard variant="debossed" className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <NeuromorphicInput
                type="text"
                placeholder="Buscar agencias..."
                aria-label="Buscar agencias"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-5 h-5 text-indigo-400" />}
              />
            </div>
            <NeuromorphicButton variant="secondary" size="md" onClick={fetchAgencias}>
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </NeuromorphicButton>
          </div>
        </NeuromorphicCard>

        {/* Grid de agencias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
            </div>
          ) : agencias.length === 0 ? (
            <NeuromorphicCard variant="embossed" className="col-span-full text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-500">No hay agencias</h3>
              <p className="text-slate-400 mt-2">Comienza agregando tu primera agencia</p>
            </NeuromorphicCard>
          ) : (
            agencias.map((agencia) => (
              <NeuromorphicCard
                key={agencia.id}
                variant="embossed"
                onClick={() => router.push(`/agencias-medios/${agencia.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700">{agencia.nombreComercial || agencia.nombreRazonSocial}</h3>
                      <p className="text-sm text-slate-500">{agencia.codigo}</p>
                    </div>
                  </div>
                  <TipoBadge tipo={agencia.tipoAgencia} />
                </div>

                <div className="space-y-2 mb-4">
                  {agencia.ciudad && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {agencia.ciudad}
                    </div>
                  )}
                  {agencia.emailContacto && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      {agencia.emailContacto}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                    <Percent className="w-4 h-4" />
                    Comisión: {agencia.comisionPorcentaje}%
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/30">
                  <StatusBadge activa={agencia.activa} />
                  <div className="flex gap-2">
                    <NeuromorphicButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); router.push(`/agencias-medios/${agencia.id}`); }}
                      aria-label="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </NeuromorphicButton>
                    <NeuromorphicButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); router.push(`/agencias-medios/${agencia.id}/editar`); }}
                      aria-label="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </NeuromorphicButton>
                  </div>
                </div>
              </NeuromorphicCard>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>🧠 Neuromorphic Design System - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
