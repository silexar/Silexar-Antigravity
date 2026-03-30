/**
 * 📻 SILEXAR PULSE - Página de Gestión de Emisoras
 * 
 * @description Vista principal del módulo de Emisoras con diseño neuromórfico
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Radio, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  MapPin,
  Wifi,
  Music,
  RefreshCw,
  Signal,
  Volume2,
  Settings
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Emisora {
  id: string;
  codigo: string;
  nombre: string;
  nombreComercial: string | null;
  tipoFrecuencia: 'am' | 'fm' | 'online' | 'dab';
  frecuencia: string | null;
  ciudad: string | null;
  streamUrl: string | null;
  formatoExportacion: string;
  estado: string;
  activa: boolean;
  programasCount: number;
  fechaCreacion: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`} onClick={onClick}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'secondary', disabled = false, className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; disabled?: boolean; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-[4px_4px_12px_rgba(168,85,247,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]'
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50' : 'hover:scale-[1.02]'} ${className}`}>
      {children}
    </button>
  );
};

const FrequencyBadge = ({ tipo, frecuencia }: { tipo: string; frecuencia: string | null }) => {
  const colors: Record<string, string> = {
    fm: 'from-purple-400 to-purple-500',
    am: 'from-amber-400 to-amber-500',
    online: 'from-cyan-400 to-cyan-500',
    dab: 'from-emerald-400 to-emerald-500'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colors[tipo] || colors.fm} shadow-md`}>
      <Signal className="w-3.5 h-3.5" />
      {tipo.toUpperCase()} {frecuencia && `${frecuencia}`}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function EmisorasPage() {
  const router = useRouter();
  const [emisoras, setEmisoras] = useState<Emisora[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEmisoras = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...(search && { search }) });
      const response = await fetch(`/api/emisoras?${params}`);
      const data = await response.json();
      if (data.success) setEmisoras(data.data);
    } catch (error) {
      /* console.error('Error:', error) */;
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchEmisoras(); }, [fetchEmisoras]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <Radio className="w-10 h-10 text-purple-500" />
              Gestión de Emisoras
            </h1>
            <p className="text-slate-500 mt-2">Administra estaciones de radio y configuración de emisión</p>
          </div>
          <NeuromorphicButton variant="primary" onClick={() => router.push('/emisoras/nuevo')}>
            <Plus className="w-5 h-5" /> Nueva Emisora
          </NeuromorphicButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Emisoras', value: emisoras.length, icon: Radio, color: 'from-purple-400 to-purple-500' },
            { label: 'FM', value: emisoras.filter(e => e.tipoFrecuencia === 'fm').length, icon: Signal, color: 'from-blue-400 to-blue-500' },
            { label: 'AM', value: emisoras.filter(e => e.tipoFrecuencia === 'am').length, icon: Volume2, color: 'from-amber-400 to-amber-500' },
            { label: 'Online', value: emisoras.filter(e => e.tipoFrecuencia === 'online').length, icon: Wifi, color: 'from-cyan-400 to-cyan-500' }
          ].map((stat, i) => (
            <NeuromorphicCard key={i}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </NeuromorphicCard>
          ))}
        </div>

        {/* Búsqueda */}
        <NeuromorphicCard>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar emisoras..."
                aria-label="Buscar emisoras"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl py-3 pl-12 pr-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] border-none outline-none focus:ring-2 focus:ring-purple-400/50 text-slate-700"
              />
            </div>
            <NeuromorphicButton variant="secondary" onClick={fetchEmisoras}>
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </NeuromorphicButton>
          </div>
        </NeuromorphicCard>

        {/* Grid de emisoras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            </div>
          ) : emisoras.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600">No hay emisoras</h3>
            </div>
          ) : (
            emisoras.map((emisora) => (
              <NeuromorphicCard key={emisora.id} className="hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => router.push(`/emisoras/${emisora.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 shadow-md">
                      <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{emisora.nombre}</h3>
                      <p className="text-sm text-slate-500">{emisora.codigo}</p>
                    </div>
                  </div>
                  <FrequencyBadge tipo={emisora.tipoFrecuencia} frecuencia={emisora.frecuencia} />
                </div>
                
                <div className="space-y-2 mb-4">
                  {emisora.ciudad && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {emisora.ciudad}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Music className="w-4 h-4 text-slate-400" />
                    {emisora.programasCount} programas
                  </div>
                  {emisora.streamUrl && (
                    <div className="flex items-center gap-2 text-sm text-cyan-600">
                      <Wifi className="w-4 h-4" />
                      Streaming disponible
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${emisora.activa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {emisora.activa ? 'Activa' : 'Inactiva'}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-purple-50 text-purple-500" onClick={(e) => { e.stopPropagation(); router.push(`/emisoras/${emisora.id}`); }}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-amber-50 text-amber-500" onClick={(e) => { e.stopPropagation(); router.push(`/emisoras/${emisora.id}/editar`); }}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" onClick={(e) => e.stopPropagation()}>
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </NeuromorphicCard>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>📻 Módulo de Gestión de Emisoras - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
