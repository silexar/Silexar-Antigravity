/**
 * 📡 SILEXAR PULSE - Página de Gestión de Tandas
 * 
 * @description Vista de tandas comerciales con drag-and-drop de spots
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  List, 
  Calendar, 
  Clock, 
  Plus,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Radio,
  Music,
  Eye,
  Send
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface SpotTanda {
  id: string;
  orden: number;
  cunaNombre: string;
  duracion: number;
  estado: string;
}

interface Tanda {
  id: string;
  codigo: string;
  emisoraNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionMaxima: number;
  duracionProgramada: number;
  spotsMaximos: number;
  spotsProgramados: number;
  estado: string;
  spots: SpotTanda[];
}

interface Stats {
  totalTandas: number;
  aprobadas: number;
  enRevision: number;
  exportadas: number;
  spotsTotales: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'secondary', className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[4px_4px_12px_rgba(244,63,94,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]'
  };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType }> = {
    planificada: { bg: 'from-slate-400 to-slate-500', icon: Clock },
    en_revision: { bg: 'from-amber-400 to-amber-500', icon: AlertCircle },
    aprobada: { bg: 'from-emerald-400 to-emerald-500', icon: CheckCircle },
    exportada: { bg: 'from-blue-400 to-blue-500', icon: Download },
    emitida: { bg: 'from-purple-400 to-purple-500', icon: Play },
    verificada: { bg: 'from-teal-400 to-teal-500', icon: CheckCircle }
  };
  const { bg, icon: Icon } = config[estado] || config.planificada;
  const label = estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${bg}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function TandasPage() {
  const router = useRouter();
  const [tandas, setTandas] = useState<Tanda[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTandas: 0, aprobadas: 0, enRevision: 0, exportadas: 0, spotsTotales: 0 });
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTanda, setSelectedTanda] = useState<Tanda | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tandas?fecha=${fecha}`);
      const data = await response.json();
      if (data.success) {
        setTandas(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      /* console.error('Error:', error) */;
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cambiarFecha = (dias: number) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFecha(nuevaFecha.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-rose-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-rose-600 bg-clip-text text-transparent flex items-center gap-3">
              <List className="w-10 h-10 text-rose-500" />
              Revisión de Tandas
            </h1>
            <p className="text-slate-500 mt-2">Programación de spots en bloques comerciales</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-md">
              <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-lg hover:bg-slate-100">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="px-4 py-2 font-medium text-slate-800">
                {new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
              </div>
              <button onClick={() => cambiarFecha(1)} className="p-2 rounded-lg hover:bg-slate-100">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <NeuromorphicButton variant="primary">
              <Plus className="w-5 h-5" /> Nueva Tanda
            </NeuromorphicButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Tandas', value: stats.totalTandas, icon: List, color: 'from-rose-400 to-rose-500' },
            { label: 'Aprobadas', value: stats.aprobadas, icon: CheckCircle, color: 'from-emerald-400 to-emerald-500' },
            { label: 'En Revisión', value: stats.enRevision, icon: AlertCircle, color: 'from-amber-400 to-amber-500' },
            { label: 'Exportadas', value: stats.exportadas, icon: Download, color: 'from-blue-400 to-blue-500' },
            { label: 'Spots', value: stats.spotsTotales, icon: Music, color: 'from-purple-400 to-purple-500' }
          ].map((stat, i) => (
            <NeuromorphicCard key={i} className="p-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </NeuromorphicCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lista de tandas */}
          <NeuromorphicCard>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              Tandas del Día
            </h2>
            
            {loading ? (
              <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-rose-500 mx-auto" /></div>
            ) : tandas.length === 0 ? (
              <div className="text-center py-12"><List className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-600">No hay tandas</p></div>
            ) : (
              <div className="space-y-3">
                {tandas.map((tanda) => (
                  <div 
                    key={tanda.id} 
                    onClick={() => setSelectedTanda(tanda)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedTanda?.id === tanda.id 
                        ? 'border-rose-300 bg-rose-50' 
                        : 'border-slate-100 bg-white hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-rose-600">{tanda.horaInicio}</span>
                        <span className="text-sm text-slate-600">{tanda.emisoraNombre}</span>
                      </div>
                      <EstadoBadge estado={tanda.estado} />
                    </div>
                    
                    {/* Barra de duración */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">{tanda.spotsProgramados} spots</span>
                        <span className="text-slate-500">{tanda.duracionProgramada}s / {tanda.duracionMaxima}s</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                          style={{ width: `${Math.min((tanda.duracionProgramada / tanda.duracionMaxima) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NeuromorphicCard>

          {/* Detalle de tanda */}
          <NeuromorphicCard>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-rose-500" />
              Spots en Tanda
            </h2>
            
            {!selectedTanda ? (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Selecciona una tanda</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{selectedTanda.codigo}</p>
                      <p className="text-sm text-slate-500">{selectedTanda.emisoraNombre}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-white text-emerald-500"><CheckCircle className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-white text-blue-500"><Download className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                {selectedTanda.spots.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Sin spots</p>
                ) : (
                  selectedTanda.spots.map((spot, index) => (
                    <div key={spot.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                        {spot.orden}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{spot.cunaNombre}</p>
                        <p className="text-xs text-slate-400">{spot.duracion}s</p>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-rose-50 text-rose-500">
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </NeuromorphicCard>
        </div>

        <div className="text-center text-slate-400 text-sm">
          <p>📡 Revisión de Tandas - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
