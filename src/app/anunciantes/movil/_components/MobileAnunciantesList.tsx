'use client';

import React from 'react';
import { Search, Building2, MapPin, Mail, Phone, MoreVertical, Building } from 'lucide-react';
import { Anunciante } from '../page';

interface ListProps {
  anunciantes: Anunciante[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  filterEstado: string;
  setFilterEstado: (e: string) => void;
  onAnuncianteSelect: (id: string) => void;
  onRefresh: () => void;
}

export const MobileAnunciantesList: React.FC<ListProps> = ({
  anunciantes, loading, searchTerm, setSearchTerm, filterEstado, setFilterEstado, onAnuncianteSelect
}) => {
  // Filtrado local para mobile (asumiendo que en un caso real se filtra desde la API en useEffect, pero lo hacemos aquí para el mockup)
  const filtered = anunciantes.filter(a => {
    const matchesSearch = 
      a.nombreRazonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.rut && a.rut.toLowerCase().includes(searchTerm.toLowerCase()));
      
    if (filterEstado === 'todos') return matchesSearch;
    if (filterEstado === 'activos') return matchesSearch && a.activo;
    if (filterEstado === 'inactivos') return matchesSearch && !a.activo;
    if (filterEstado === 'suspendidos') return matchesSearch && a.estado === 'suspendido';
    return matchesSearch;
  });

  return (
    <div className="space-y-5 pb-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header & Search */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Anunciantes</h2>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-800 placeholder-slate-400 font-medium transition-all"
            placeholder="Buscar por nombre, código o RUT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'activos', label: 'Activos' },
            { id: 'inactivos', label: 'Inactivos' },
            { id: 'suspendidos', label: 'Suspendidos' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterEstado(filter.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                filterEstado === filter.id 
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-md text-slate-600 shadow-sm border border-white/60'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse p-5 rounded-3xl bg-white shadow-sm border border-slate-100">
              <div className="flex justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-5 bg-slate-200 rounded w-1/6 mb-4" />
              </div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-slate-200 rounded w-full mt-4" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Sin resultados</h3>
            <p className="text-slate-500 mt-2">No se encontraron anunciantes con esos filtros.</p>
          </div>
        ) : (
          filtered.map(anunciante => (
            <div 
              key={anunciante.id}
              onClick={() => onAnuncianteSelect(anunciante.id)}
              className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/60 active:scale-95 transition-all cursor-pointer"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                    anunciante.activo ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-600 mb-0.5">{anunciante.codigo}</p>
                    <h3 className="text-lg font-bold text-slate-800 truncate leading-tight">
                      {anunciante.nombreRazonSocial}
                    </h3>
                  </div>
                </div>
                <button aria-label="Más opciones" className="p-2 -mr-2 text-slate-400 active:bg-slate-200 rounded-full" onClick={(e) => { e.stopPropagation(); }}>
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  anunciante.activo 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : anunciante.estado === 'suspendido'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-200 text-slate-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${anunciante.activo ? 'bg-emerald-500' : anunciante.estado === 'suspendido' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  {anunciante.estado}
                </span>
              </div>

              {/* Card Body - Icon Rows */}
              <div className="space-y-2 mt-2">
                {anunciante.rut && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{anunciante.rut}</span>
                  </div>
                )}
                {anunciante.emailContacto && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{anunciante.emailContacto}</span>
                  </div>
                )}
                {anunciante.telefonoContacto && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{anunciante.telefonoContacto}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{anunciante.ciudad || anunciante.pais}</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
      
      {filtered.length > 0 && (
        <div className="pt-6 pb-2 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fin de la lista</span>
        </div>
      )}
    </div>
  );
};
