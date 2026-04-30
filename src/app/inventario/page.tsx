/**
 * 📅 SILEXAR PULSE - Página Torpedo Digital (Inventario)
 * 
 * @description Vista de disponibilidad de espacios publicitarios
 * Estilo "Torpedo Digital" con grid de horarios y emisoras
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  Radio,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Lock
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Cupo {
  id: string;
  codigo: string;
  nombre: string;
  emisoraNombre: string;
  horaInicio: string;
  duracionSegundos: number;
  tipoInventario: string;
  tarifaBase: number;
  disponibles: number;
  vendidos: number;
}

interface Vencimientos {
  id: string;
  cupoId: string;
  fecha: string;
  estado: string;
  anuncianteNombre: string | null;
  precio: number;
}

interface Stats {
  totalCupos: number;
  totalDisponibles: number;
  totalVendidos: number;
  ocupacion: number;
  ingresosPotenciales: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
    disponible: { bg: 'bg-emerald-500', icon: CheckCircle, label: 'Disponible' },
    reservado: { bg: 'bg-amber-500', icon: AlertCircle, label: 'Reservado' },
    vendido: { bg: 'bg-blue-500', icon: DollarSign, label: 'Vendido' },
    bloqueado: { bg: 'bg-slate-500', icon: Lock, label: 'Bloqueado' },
    cortesia: { bg: 'bg-purple-500', icon: CheckCircle, label: 'Cortesía' }
  };
  const { bg, icon: Icon, label } = config[estado] || config.disponible;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white ${bg}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function InventarioPage() {
  const [cupos, setCupos] = useState<Cupo[]>([]);
  const [vencimientos, setVencimientos] = useState<Vencimientos[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCupos: 0, totalDisponibles: 0, totalVendidos: 0, ocupacion: 0, ingresosPotenciales: 0 });
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventario?fecha=${fecha}`);
      const data = await response.json();
      if (data.success) {
        setCupos(data.data);
        setVencimientos(data.vencimientos);
        setStats(data.stats);
      }
    } catch (error) {
      /* */;
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

  const cuposPorEmisora = cupos.reduce((acc, cupo) => {
    if (!acc[cupo.emisoraNombre]) acc[cupo.emisoraNombre] = [];
    acc[cupo.emisoraNombre].push(cupo);
    return acc;
  }, {} as Record<string, Cupo[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-amber-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
              <Calendar className="w-10 h-10 text-amber-500" />
              Torpedo Digital
            </h1>
            <p className="text-slate-500 mt-2">Inventario de espacios publicitarios</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-md">
            <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-lg hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="px-4 py-2 font-medium text-slate-800">
              {new Date(fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <button onClick={() => cambiarFecha(1)} className="p-2 rounded-lg hover:bg-slate-100">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={fetchData} className="p-2 rounded-lg hover:bg-amber-50 text-amber-500">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Cupos', value: stats.totalCupos, icon: Calendar, color: 'from-amber-400 to-amber-500' },
            { label: 'Disponibles', value: stats.totalDisponibles, icon: CheckCircle, color: 'from-emerald-400 to-emerald-500' },
            { label: 'Vendidos', value: stats.totalVendidos, icon: DollarSign, color: 'from-blue-400 to-blue-500' },
            { label: 'Ocupación', value: `${stats.ocupacion}%`, icon: Clock, color: 'from-purple-400 to-purple-500' },
            { label: 'Potencial', value: formatCurrency(stats.ingresosPotenciales), icon: DollarSign, color: 'from-cyan-400 to-cyan-500' }
          ].map((stat, i) => (
            <NeuromorphicCard key={`${stat}-${i}`} className="p-4">
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

        <NeuromorphicCard>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500" />
            Disponibilidad por Emisora
          </h2>
          
          {loading ? (
            <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" /></div>
          ) : Object.keys(cuposPorEmisora).length === 0 ? (
            <div className="text-center py-12"><Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-600">No hay cupos</p></div>
          ) : (
            <div className="space-y-6">
              {Object.entries(cuposPorEmisora).map(([emisora, cuposEmisora]) => (
                <div key={emisora}>
                  <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-500" />
                    {emisora}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cuposEmisora.map((cupo) => {
                      const venc = vencimientos.find(v => v.cupoId === cupo.id);
                      return (
                        <div key={cupo.id} className="p-4 bg-white rounded-xl border border-slate-100 hover:border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-amber-600 font-bold">{cupo.horaInicio}</span>
                            <EstadoBadge estado={venc?.estado || 'disponible'} />
                          </div>
                          <p className="font-medium text-slate-800 text-sm">{cupo.nombre}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                            <span>{cupo.duracionSegundos}s</span>
                            <span className="font-bold text-slate-700">{formatCurrency(cupo.tarifaBase)}</span>
                          </div>
                          {venc?.anuncianteNombre && <p className="mt-2 text-xs text-blue-600 font-medium">{venc.anuncianteNombre}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeuromorphicCard>

        <div className="text-center text-slate-400 text-sm">
          <p>📅 Torpedo Digital - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}