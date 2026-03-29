import React from 'react';
import { 
  Briefcase, Activity, Calendar, AlertTriangle, 
  Search, Filter, CheckCircle2, ChevronRight, Clock
} from 'lucide-react';
import { CampanaListado } from '../../_lib/types';

interface MobileCampanasListProps {
  campanas: CampanaListado[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onCampanaSelect: (id: string) => void;
}

export function MobileCampanasList({ 
  campanas, searchTerm, setSearchTerm, onCampanaSelect 
}: MobileCampanasListProps) {
  
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ejecutando':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700"><Activity className="w-3 h-3"/> AL AIRE</span>;
      case 'planificando':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700"><Clock className="w-3 h-3"/> PLAN</span>;
      case 'completada':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700"><CheckCircle2 className="w-3 h-3"/> COMPLETA</span>;
      case 'conflictos':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700"><AlertTriangle className="w-3 h-3"/> CONFLICTO</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{estado.toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-4 pb-24 h-full flex flex-col">
      {/* HEADER & BUSCADOR */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 px-1 rounded-b-2xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-3 px-1">Campañas</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, contrato, cliente..."
              aria-label="Buscar campañas"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm
                shadow-[inset_2px_2px_4px_#e6e9ef,inset_-2px_-2px_4px_#ffffff]
                border border-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button className="p-2.5 bg-white rounded-xl shadow-[4px_4px_8px_#e6e9ef,-4px_-4px_8px_#ffffff] text-gray-500 active:shadow-inner">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* LISTA DE CAMPAÑAS */}
      <div className="flex-1 space-y-3 px-1 overflow-y-auto pb-6">
        {campanas.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center opacity-50">
            <Search className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 font-medium">No hay campañas que coincidan</p>
          </div>
        ) : (
          campanas.map((c) => (
            <div 
              key={c.id} 
              onClick={() => onCampanaSelect(c.id)}
              className="
                bg-white p-4 rounded-3xl 
                shadow-[6px_6px_12px_#e6e9ef,-6px_-6px_12px_#ffffff]
                active:shadow-[inset_4px_4px_8px_#e6e9ef,inset_-4px_-4px_8px_#ffffff]
                transition-all cursor-pointer border border-white/60
              "
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {c.numeroCampana}
                  </span>
                  {getEstadoBadge(c.estado)}
                </div>
                {c.alertas > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> {c.alertas}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-gray-800 leading-tight mb-1">{c.nombreCampana}</h3>
              <p className="text-xs font-semibold text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {c.anunciante} • {c.nombreProducto}
              </p>

              <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {c.fechaInicio.slice(0, 5)} - {c.fechaTermino.slice(0, 5)}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-1.5 rounded">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    {c.cumplimiento}%
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
