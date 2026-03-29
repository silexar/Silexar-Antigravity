/**
 * 🏢 SILEXAR PULSE - Selector de Anunciante Inteligente
 * 
 * Componente de búsqueda de anunciantes con datos enriquecidos
 * Muestra contratos activos, última actividad, nivel de riesgo
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Building2, ChevronDown, Check, X, Plus, 
  FileText, Radio, Clock, Loader2, AlertCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AnuncianteEnriquecido {
  id: string;
  nombre: string;
  razonSocial: string;
  rut: string;
  logo?: string;
  industria: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  contratosActivos: number;
  cunasActivas: number;
  ultimaActividad: string;
  ultimaActividadRelativa: string;
  riskLevel: 'bajo' | 'medio' | 'alto';
  riskScore: number;
  creditScore: number;
  productosRecientes: string[];
  badges?: string[];
  contactoPrincipal?: {
    nombre: string;
    email: string;
    telefono: string;
  };
}

interface AdvertiserSearchSelectProps {
  value?: string;
  valueName?: string;
  onChange: (anunciante: { id: string; nombre: string } | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  onCreateNew?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function AdvertiserSearchSelect({
  value,
  valueName,
  onChange,
  placeholder = 'Buscar anunciante...',
  disabled = false,
  error,
  required = false,
  className = '',
  onCreateNew
}: AdvertiserSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AnuncianteEnriquecido[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnunciante, setSelectedAnunciante] = useState<AnuncianteEnriquecido | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar anunciante inicial si hay valor
  useEffect(() => {
    if (value && valueName && !selectedAnunciante) {
      setSelectedAnunciante({
        id: value,
        nombre: valueName,
        razonSocial: valueName,
        rut: '',
        industria: '',
        estado: 'activo',
        contratosActivos: 0,
        cunasActivas: 0,
        ultimaActividad: '',
        ultimaActividadRelativa: '',
        riskLevel: 'bajo',
        riskScore: 0,
        creditScore: 0,
        productosRecientes: []
      });
    }
  }, [value, valueName, selectedAnunciante]);

  // Buscar anunciantes
  const searchAdvertisers = useCallback(async (query: string) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        q: query,
        orderBy: 'recent_activity',
        limit: '8'
      });
      
      const response = await fetch(`/api/anunciantes/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      /* console.error('Error buscando anunciantes:', err) */;
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (isOpen) {
      debounceRef.current = setTimeout(() => {
        searchAdvertisers(searchQuery);
      }, 300);
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, isOpen, searchAdvertisers]);

  // Cargar anunciantes al abrir
  useEffect(() => {
    if (isOpen && results.length === 0) {
      searchAdvertisers('');
    }
  }, [isOpen, results.length, searchAdvertisers]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Seleccionar anunciante
  const handleSelect = useCallback((anunciante: AnuncianteEnriquecido) => {
    setSelectedAnunciante(anunciante);
    onChange({ id: anunciante.id, nombre: anunciante.nombre });
    setIsOpen(false);
    setSearchQuery('');
  }, [onChange]);

  // Limpiar selección
  const handleClear = useCallback(() => {
    setSelectedAnunciante(null);
    onChange(null);
    setSearchQuery('');
    inputRef.current?.focus();
  }, [onChange]);

  // Abrir dropdown
  const handleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [disabled]);

  // Renderizar badge de riesgo
  const renderRiskBadge = (level: string) => {
    switch (level) {
      case 'bajo':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">💚 Riesgo bajo</span>;
      case 'medio':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">🟡 Riesgo medio</span>;
      case 'alto':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">🔴 Riesgo alto</span>;
      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        <Building2 className="w-4 h-4 inline mr-1" />
        Anunciante
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Select Button / Display */}
      <div
        onClick={handleOpen}
        className={`
          relative w-full px-4 py-3 rounded-xl border cursor-pointer transition-all
          ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white hover:border-slate-300'}
          ${error ? 'border-red-300 bg-red-50' : 'border-slate-200'}
          ${isOpen ? 'ring-2 ring-emerald-200 border-emerald-400' : ''}
        `}
      >
        {selectedAnunciante ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo placeholder */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{selectedAnunciante.nombre}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {selectedAnunciante.contratosActivos > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {selectedAnunciante.contratosActivos} contratos
                    </span>
                  )}
                  {selectedAnunciante.cunasActivas > 0 && (
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      {selectedAnunciante.cunasActivas} cuñas
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              aria-label="Limpiar selección"
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-slate-400">
            <span>{placeholder}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, RUT o industria..."
                aria-label="Buscar anunciante por nombre, RUT o industria"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 && !loading ? (
              <div className="p-4 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No se encontraron anunciantes</p>
              </div>
            ) : (
              results.map((anunciante) => (
                <div
                  key={anunciante.id}
                  onClick={() => handleSelect(anunciante)}
                  className={`
                    p-3 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0
                    ${anunciante.id === value ? 'bg-emerald-50' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-slate-500" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 truncate">{anunciante.nombre}</p>
                        {anunciante.id === value && (
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Estado y contratos */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">{anunciante.industria}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {anunciante.contratosActivos} contratos
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <Radio className="w-3 h-3" />
                          {anunciante.cunasActivas} cuñas
                        </span>
                      </div>
                      
                      {/* Última actividad y riesgo */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {anunciante.ultimaActividadRelativa}
                        </span>
                        {renderRiskBadge(anunciante.riskLevel)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create New Button */}
          {onCreateNew && (
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => { onCreateNew(); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                ¿Cliente nuevo? Crear anunciante
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
