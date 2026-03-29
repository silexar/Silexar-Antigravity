/**
 * COMPONENT: SMART FILTERS — Functional with State
 * 
 * @description Filtros inteligentes funcionales con estado,
 * handlers onChange, contador de filtros activos, y clear.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  teamType: string;
  performance: string;
  territory: string;
}

interface SmartFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

const INITIAL_FILTERS: FilterState = { teamType: '', performance: '', territory: '' };

export const SmartFilters = ({ onFilterChange }: SmartFiltersProps = {}) => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      onFilterChange?.(next);
      return next;
    });
  }, [onFilterChange]);

  const clearAll = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    onFilterChange?.(INITIAL_FILTERS);
  }, [onFilterChange]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-wrap gap-3 items-center py-2">
      <div className="flex items-center gap-2 text-slate-500 mr-4">
        <SlidersHorizontal size={16} />
        <span className="text-sm font-medium">Filtros:</span>
        {activeCount > 0 && (
          <span className="bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </div>

      {/* Tipo de Equipo */}
      <select
        value={filters.teamType}
        onChange={(e) => updateFilter('teamType', e.target.value)}
        className={`border text-sm rounded-lg block p-2.5 px-4 cursor-pointer transition-all ${
          filters.teamType ? 'border-orange-400 bg-orange-50 text-orange-700 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300'
        }`}
      >
        <option value="">Todos los Equipos</option>
        <option value="inside">🎯 Ventas Internas</option>
        <option value="field">🚀 Ventas de Campo</option>
        <option value="enterprise">🏢 Enterprise</option>
        <option value="bdr">📞 BDR / SDR</option>
      </select>

      {/* Nivel de Rendimiento */}
      <select
        value={filters.performance}
        onChange={(e) => updateFilter('performance', e.target.value)}
        className={`border text-sm rounded-lg block p-2.5 px-4 cursor-pointer transition-all ${
          filters.performance ? 'border-blue-400 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
        }`}
      >
        <option value="">Rendimiento: Todos</option>
        <option value="elite">{'💎 Elite (>150%)'}</option>
        <option value="high">🔥 Alto Rendimiento</option>
        <option value="core">✅ Core Performers</option>
        <option value="developing">⚠️ En Desarrollo</option>
        <option value="pip">🔴 Bajo Rendimiento</option>
      </select>

      {/* Estado Territorio */}
      <select
        value={filters.territory}
        onChange={(e) => updateFilter('territory', e.target.value)}
        className={`border text-sm rounded-lg block p-2.5 px-4 cursor-pointer transition-all ${
          filters.territory ? 'border-emerald-400 bg-emerald-50 text-emerald-700 font-semibold' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
        }`}
      >
        <option value="">Territorio: Todos</option>
        <option value="optimal">🎯 Cobertura Óptima</option>
        <option value="growth">📈 Alto Crecimiento</option>
        <option value="under">⚠️ Recursos Insuficientes</option>
        <option value="rebalance">🔄 Requiere Rebalanceo</option>
      </select>

      {activeCount > 0 && (
        <>
          <div className="border-l border-slate-300 h-6 mx-1"></div>
          <button
            onClick={clearAll}
            className="text-red-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={12} /> Limpiar ({activeCount})
          </button>
        </>
      )}
    </div>
  );
};
