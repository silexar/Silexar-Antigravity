'use client';

import React from 'react';
import { Search, Landmark, MapPin, Mail, MoreVertical, Percent } from 'lucide-react';
import { AgenciaMedios } from '../page';

interface ListProps {
  agencias: AgenciaMedios[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  filterTipo: string;
  setFilterTipo: (t: string) => void;
  onAgenciaSelect: (id: string) => void;
}

export const MobileMediosList: React.FC<ListProps> = ({
  agencias, loading, searchTerm, setSearchTerm, filterTipo, setFilterTipo, onAgenciaSelect
}) => {
  const filtered = agencias.filter(a => {
    const matchesSearch = 
      a.nombreRazonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filterTipo === 'todos') return matchesSearch;
    return matchesSearch && a.tipoAgencia.toLowerCase() === filterTipo.toLowerCase();
  });

  return (
    <div className="space-y-5 pb-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Directorio de Agencias</h2>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            aria-label="Buscar por nombre o código"
            className="block w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-slate-800 placeholder-slate-400 font-medium transition-all"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'Independiente', label: 'Independiente' },
            { id: 'Holding', label: 'Holding' },
            { id: 'Internacional', label: 'Internacional' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterTipo(filter.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                filterTipo === filter.id 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-slate-600 shadow-[2px_2px_6px_rgba(0,0,0,0.05)] border border-slate-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {loading ? (
          <p className="text-center text-slate-500">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Sin resultados</h3>
          </div>
        ) : (
          filtered.map(agencia => (
            <div 
              key={agencia.id}
              onClick={() => onAgenciaSelect(agencia.id)}
              className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm shadow-slate-200/50 active:scale-95 transition-all cursor-pointer border border-white/60"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                    agencia.activa ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-600 mb-0.5">{agencia.codigo}</p>
                    <h3 className="text-lg font-bold text-slate-800 truncate leading-tight">
                      {agencia.nombreRazonSocial}
                    </h3>
                  </div>
                </div>
                <button aria-label="Más opciones" className="p-2 -mr-2 text-slate-400 active:bg-slate-200 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                  {agencia.tipoAgencia}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  agencia.activa ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${agencia.activa ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {agencia.estado}
                </span>
              </div>

              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                  <Percent className="w-4 h-4 text-indigo-500" />
                  <span className="text-slate-800">Comisión Base: <span className="font-bold">{agencia.comisionPorcentaje}%</span></span>
                </div>
                {agencia.emailContacto && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 pl-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{agencia.emailContacto}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm text-slate-600 pl-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{agencia.ciudad || 'No especificada'}</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
      
    </div>
  );
};
