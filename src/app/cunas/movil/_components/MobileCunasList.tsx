import React from 'react';
import { 
  Play, Pause, FileAudio,
  Search, Filter, ChevronRight, Activity, Radio
} from 'lucide-react';
import { Cuna } from '../../_lib/types';
import { calcularTiempoRestante } from '../../_lib/components';

interface MobileCunasListProps {
  cunas: Cuna[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onCunaSelect: (id: string) => void;
  onPlay: (id: string) => void;
  playingId: string | null;
}

export function MobileCunasList({ 
  cunas, searchTerm, setSearchTerm, onCunaSelect, onPlay, playingId
}: MobileCunasListProps) {
  
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_aire': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">EN AIRE</span>;
      case 'aprobada': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">APROBADA</span>;
      case 'pendiente_validacion': return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">PENDIENTE</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">{estado.toUpperCase().replace('_', ' ')}</span>;
    }
  };

  return (
    <div className="space-y-4 pb-24 h-full flex flex-col">
      {/* HEADER & BUSCADOR */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 px-1 rounded-b-2xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-3 px-1">Biblioteca de Cuñas</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cuñas, clientes..."
              aria-label="Buscar cuñas, clientes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm
                shadow-[inset_2px_2px_4px_#e6e9ef,inset_-2px_-2px_4px_#ffffff]
                border border-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button aria-label="Filtrar" className="p-2.5 bg-white rounded-xl shadow-[4px_4px_8px_#e6e9ef,-4px_-4px_8px_#ffffff] text-gray-500 active:shadow-inner">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* LISTA DE CUÑAS */}
      <div className="flex-1 space-y-3 px-1 overflow-y-auto pb-6">
        {cunas.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <Search className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
            <p className="text-gray-500 font-medium">Sin resultados</p>
          </div>
        ) : (
          cunas.map((c) => (
            <div 
              key={c.id} 
              className="bg-white p-4 rounded-3xl shadow-[6px_6px_12px_#e6e9ef,-6px_-6px_12px_#ffffff] border border-white/60"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {c.spxCodigo}
                  </span>
                  {getEstadoBadge(c.estado)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400">{c.duracionFormateada}</span>
                  <button
                    onClick={() => onPlay(c.id)}
                    aria-label={playingId === c.id ? 'Pausar' : 'Reproducir'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      playingId === c.id
                        ? 'bg-blue-100 text-blue-600 shadow-inner'
                        : 'bg-white text-gray-600 shadow-[2px_2px_5px_#e6e9ef,-2px_-2px_5px_#ffffff]'
                    }`}
                  >
                    {playingId === c.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
              </div>

              <div onClick={() => onCunaSelect(c.id)} className="cursor-pointer">
                <h3 className="text-base font-bold text-gray-800 leading-tight mb-1">{c.nombre}</h3>
                <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1">
                  {c.anuncianteNombre} • {c.tipo.toUpperCase()}
                </p>

                {c.programacion && (
                  <div className="bg-gray-50 rounded-xl p-2.5 mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">PRÓXIMA EMISIÓN</p>
                      <p className="text-xs font-bold text-gray-800">
                        {c.programacion.emisoraNombre}
                        <span className="text-indigo-600 ml-1">
                          {calcularTiempoRestante(c.programacion.proximaEmision).texto}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-3 text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <FileAudio className="w-3.5 h-3.5 text-blue-500" />
                      Score {c.scoreTecnico}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      {c.totalEmisiones} reps
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
