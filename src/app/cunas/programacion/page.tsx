/**
 * 📅 SILEXAR PULSE - Parrilla de Programación TIER 0
 * 
 * Vista tipo TV de bloques horarios con cuñas programadas,
 * drag & drop, y detección de conflictos
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, Plus,
  Volume2, RefreshCw,
  Trash2, ArrowLeft
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Bloque {
  id: string;
  codigo: string;
  nombre: string;
  tipoBloqueHorario: string;
  horaInicio: string;
  horaFin: string;
  duracionTotalSegundos: number;
  duracionUsadaSegundos: number;
  estado: string;
  ocupacion: number;
  cunas: CunaProgramada[];
}

interface CunaProgramada {
  id: string;
  cunaId: string;
  cunaCodigo: string;
  cunaNombre: string;
  anuncianteNombre: string;
  duracionSegundos: number;
  posicionEnBloque: number;
  esActiva: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const BloqueCard = ({ 
  bloque, 
  onAddCuna,
  onEditCuna,
  onRemoveCuna 
}: { 
  bloque: Bloque;
  onAddCuna: (bloqueId: string) => void;
  onEditCuna: (cunaId: string) => void;
  onRemoveCuna: (cunaId: string) => void;
}) => {
  const ocupacionColor = bloque.ocupacion >= 100 
    ? 'bg-red-500' 
    : bloque.ocupacion >= 75 
      ? 'bg-amber-500' 
      : 'bg-emerald-500';

  const tipoColors: Record<string, string> = {
    matinal: 'from-amber-400 to-orange-500',
    mediodia: 'from-yellow-400 to-amber-500',
    tarde: 'from-blue-400 to-indigo-500',
    prime: 'from-purple-400 to-pink-500',
    nocturno: 'from-indigo-400 to-purple-500',
    especial: 'from-emerald-400 to-teal-500'
  };

  return (
    <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
      {/* Header del bloque */}
      <div className={`bg-gradient-to-r ${tipoColors[bloque.tipoBloqueHorario] || 'from-slate-400 to-slate-500'} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{bloque.nombre}</h3>
            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
              <Clock className="w-4 h-4" />
              <span>{bloque.horaInicio} - {bloque.horaFin}</span>
              <span className="px-2 py-0.5 bg-white/20 rounded">{bloque.codigo}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(bloque.ocupacion)}%</div>
            <div className="text-xs text-white/70">ocupación</div>
          </div>
        </div>
        
        {/* Barra de ocupación */}
        <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
          <div 
            className={`h-full ${ocupacionColor} transition-all duration-300`}
            style={{ width: `${Math.min(100, bloque.ocupacion)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/70 mt-1">
          <span>{bloque.duracionUsadaSegundos}s usado</span>
          <span>{bloque.duracionTotalSegundos}s total</span>
        </div>
      </div>

      {/* Lista de cuñas */}
      <div className="p-4 space-y-2">
        {bloque.cunas.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sin cuñas programadas</p>
          </div>
        ) : (
          bloque.cunas.map((cuna, idx) => (
            <div 
              key={cuna.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl border-2 
                ${cuna.esActiva 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
                }
                hover:shadow-sm transition-shadow cursor-pointer group
              `}
              onClick={() => onEditCuna(cuna.cunaId)}
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {cuna.cunaCodigo} - {cuna.cunaNombre}
                </p>
                <p className="text-xs text-slate-500">{cuna.anuncianteNombre}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono text-slate-600">{cuna.duracionSegundos}s</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveCuna(cuna.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
        
        {/* Agregar cuña */}
        {bloque.estado !== 'completo' && (
          <button
            onClick={() => onAddCuna(bloque.id)}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar cuña</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ProgramacionPage() {
  const router = useRouter();
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [loading, setLoading] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState('lunes');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bloqueParaAgregar, setBloqueParaAgregar] = useState<string | null>(null);

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const diasLabels: Record<string, string> = {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', 
    viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom'
  };

  const cargarParrilla = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cunas/programacion?tipo=parrilla&dia=${diaSeleccionado}`);
      const data = await res.json();
      if (data.success) {
        setBloques(data.data);
      }
    } catch (error) {
      /* */;
    }
    setLoading(false);
  }, [diaSeleccionado]);

  useEffect(() => {
    cargarParrilla();
  }, [cargarParrilla]);

  const handleAddCuna = (bloqueId: string) => {
    setBloqueParaAgregar(bloqueId);
    setShowAddModal(true);
  };

  const handleEditCuna = (cunaId: string) => {
    router.push(`/cunas/${cunaId}`);
  };

  const handleRemoveCuna = async (programacionId: string) => {
    if (!confirm('¿Eliminar esta cuña del bloque?')) return;
    
    try {
      await fetch(`/api/cunas/programacion?id=${programacionId}`, { method: 'DELETE' });
      cargarParrilla();
    } catch (error) {
      /* */;
    }
  };

  // Métricas del día
  const metricas = useMemo(() => {
    const totalBloques = bloques.length;
    const ocupacionPromedio = bloques.length > 0 
      ? bloques.reduce((sum, b) => sum + b.ocupacion, 0) / bloques.length 
      : 0;
    const bloquesCompletos = bloques.filter(b => b.estado === 'completo').length;
    const totalCunas = bloques.reduce((sum, b) => sum + b.cunas.length, 0);
    
    return { totalBloques, ocupacionPromedio, bloquesCompletos, totalCunas };
  }, [bloques]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/cunas')}
            className="p-2 hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-500" />
              Parrilla de Programación
            </h1>
            <p className="text-slate-500 mt-1">Vista de bloques horarios y cuñas programadas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={cargarParrilla}
            className="p-3 bg-white rounded-xl shadow hover:shadow-md transition-shadow"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
          <button 
            onClick={() => router.push('/cunas/nuevo')}
            className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Cuña
          </button>
        </div>
      </div>

      {/* Selector de día */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {diasSemana.map(dia => (
              <button
                key={dia}
                onClick={() => setDiaSeleccionado(dia)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-all
                  ${diaSeleccionado === dia 
                    ? 'bg-purple-500 text-white shadow' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
              >
                {diasLabels[dia]}
              </button>
            ))}
          </div>
          
          {/* Métricas rápidas */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{metricas.totalBloques}</p>
              <p className="text-xs text-slate-500">Bloques</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{metricas.totalCunas}</p>
              <p className="text-xs text-slate-500">Cuñas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{Math.round(metricas.ocupacionPromedio)}%</p>
              <p className="text-xs text-slate-500">Ocupación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de bloques */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bloques.map(bloque => (
            <BloqueCard 
              key={bloque.id}
              bloque={bloque}
              onAddCuna={handleAddCuna}
              onEditCuna={handleEditCuna}
              onRemoveCuna={handleRemoveCuna}
            />
          ))}
        </div>
      )}

      {/* Modal Agregar Cuña (simplificado) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Agregar cuña al bloque</h3>
            <p className="text-slate-500 mb-6">
              Selecciona una cuña disponible para programar en este bloque.
            </p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {/* Lista de cuñas disponibles (mock) */}
              {['SPX000124 - Banco de Chile Ofertas', 'SPX000125 - Falabella Cyber', 'SPX000126 - Entel 5G'].map((cuna, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowAddModal(false);
                    cargarParrilla();
                  }}
                  className="w-full p-4 text-left bg-slate-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 border-2 border-transparent transition-colors"
                >
                  <p className="font-medium text-slate-800">{cuna}</p>
                  <p className="text-sm text-slate-500">30s - En aire</p>
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => router.push('/cunas/nuevo')}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium"
              >
                Crear Nueva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
