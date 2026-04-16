/**
 * 🎯 SILEXAR PULSE — SelectorMaterialCuna
 *
 * Componente reutilizable con diseño neumórfico para seleccionar
 * materiales (cuñas de radio + activos digitales) de un anunciante.
 *
 * Conecta con /api/cunas/materiales?anuncianteId=<id>
 * Diseño mobile-first, responsive, neumorphic.
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface MaterialItem {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  tipoLabel: string;
  categoria: 'radio' | 'digital_audio' | 'digital_video' | 'digital_display' | 'digital_social' | 'digital_interactivo';
  estado: string;
  duracionSegundos: number;
  duracionFormateada: string;
  pesoBytes: number;
  urlOriginal?: string;
  urlThumbnail?: string;
  anuncianteId: string;
  anuncianteNombre: string;
  cunaId: string;
  createdAt: string;
}

interface SelectorMaterialCunaProps {
  anuncianteId: string;
  onSeleccionar: (material: MaterialItem) => void;
  seleccionados?: string[]; // IDs ya seleccionados
  maxSeleccion?: number;
  filtroCategoria?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES Y UTILS
// ═══════════════════════════════════════════════════════════════

const CATEGORIA_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  radio: { icon: '🎵', color: '#7C3AED', label: 'Radio FM' },
  digital_audio: { icon: '🎧', color: '#8B5CF6', label: 'Audio Digital' },
  digital_video: { icon: '🎬', color: '#EC4899', label: 'Video' },
  digital_display: { icon: '🖼️', color: '#3B82F6', label: 'Display' },
  digital_social: { icon: '📱', color: '#F59E0B', label: 'Social Ads' },
  digital_interactivo: { icon: '🎮', color: '#10B981', label: 'Interactivo' },
};

function pesoLegible(bytes: number): string {
  const kb = bytes / 1024;
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb.toFixed(0)} KB`;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const SelectorMaterialCuna: React.FC<SelectorMaterialCunaProps> = ({
  anuncianteId,
  onSeleccionar,
  seleccionados = [],
  maxSeleccion,
  filtroCategoria,
  className = '',
}) => {
  const [materiales, setMateriales] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch materiales
  const fetchMateriales = useCallback(async () => {
    if (!anuncianteId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        anuncianteId,
        estado: 'aprobada',
        page: '1',
        limit: '100',
      });
      if (filtroCategoria) params.set('categoria', filtroCategoria);

      const res = await fetch(`/api/cunas/materiales?${params}`);
      const json = await res.json();

      if (json.success) {
        setMateriales(json.data || []);
      } else {
        setError(json.message || 'Error al cargar materiales');
      }
    } catch {
      setError('Error de conexión al cargar materiales');
    } finally {
      setLoading(false);
    }
  }, [anuncianteId, filtroCategoria]);

  useEffect(() => { fetchMateriales(); }, [fetchMateriales]);

  // Filtrado local
  const materialesFiltrados = useMemo(() => {
    return materiales.filter(m => {
      const matchSearch = !search ||
        m.nombre.toLowerCase().includes(search.toLowerCase()) ||
        m.codigo.toLowerCase().includes(search.toLowerCase());
      const matchTipo = !filtroTipo || m.categoria === filtroTipo;
      return matchSearch && matchTipo;
    });
  }, [materiales, search, filtroTipo]);

  // Categorías disponibles
  const categoriasDisponibles = useMemo(() => {
    const cats = new Set(materiales.map(m => m.categoria));
    return Array.from(cats);
  }, [materiales]);

  // Handlers
  const handleSeleccionar = (material: MaterialItem) => {
    if (seleccionados.includes(material.id)) return;
    if (maxSeleccion && seleccionados.length >= maxSeleccion) return;
    onSeleccionar(material);
  };

  const puedeSeleccionar = (id: string) => seleccionados.includes(id);

  return (
    <div className={`w-full ${className}`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ═══ HEADER ═══ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                boxShadow: '4px 4px 12px rgba(124,58,237,0.3), -4px -4px 12px rgba(255,255,255,0.8)',
              }}>
            🎯
            </span>
            Materiales del Anunciante
          </h3>
          {maxSeleccion && (
            <span className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                background: seleccionados.length >= maxSeleccion ? '#FEE2E2' : '#EDE9FE',
                color: seleccionados.length >= maxSeleccion ? '#DC2626' : '#7C3AED',
              }}>
              {seleccionados.length}/{maxSeleccion}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{
              background: '#E8ECF1',
              boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.08), inset -3px -3px 6px rgba(255,255,255,0.8)',
              border: 'none',
            }}
          />
        </div>

        {/* Filtros por categoría */}
        {categoriasDisponibles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroTipo('')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                !filtroTipo ? 'text-white' : 'text-gray-500'
              }`}
              style={filtroTipo
                ? {
                    background: '#E8ECF1',
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.7)',
                  }
                : {
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                    boxShadow: '3px 3px 8px rgba(124,58,237,0.3), -2px -2px 6px rgba(255,255,255,0.6)',
                  }
              }
            >
              Todos ({materiales.length})
            </button>
            {categoriasDisponibles.map(cat => {
              const cfg = CATEGORIA_CONFIG[cat] || { icon: '📦', color: '#6B7280', label: cat };
              const count = materiales.filter(m => m.categoria === cat).length;
              const isActive = filtroTipo === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFiltroTipo(isActive ? '' : cat)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={isActive
                    ? {
                        background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)`,
                        boxShadow: `3px 3px 8px ${cfg.color}44, -2px -2px 6px rgba(255,255,255,0.6)`,
                        color: '#fff',
                      }
                    : {
                        background: '#E8ECF1',
                        boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.7)',
                        color: '#6B7280',
                      }
                  }
                >
                  <span>{cfg.icon}</span>
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ ESTADO: LOADING ═══ */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <p className="text-sm text-gray-400 mt-4">Cargando materiales...</p>
        </div>
      )}

      {/* ═══ ESTADO: ERROR ═══ */}
      {error && !loading && (
        <div className="p-6 rounded-2xl text-center"
          style={{
            background: '#FEE2E2',
            boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.06), inset -3px -3px 6px rgba(255,255,255,0.5)',
          }}>
          <span className="text-3xl">⚠️</span>
          <p className="text-sm font-semibold text-red-600 mt-2">{error}</p>
          <button
            onClick={fetchMateriales}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              boxShadow: '3px 3px 8px rgba(220,38,38,0.3)',
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ═══ ESTADO: VACÍO ═══ */}
      {!loading && !error && materialesFiltrados.length === 0 && (
        <div className="p-8 rounded-2xl text-center"
          style={{
            background: '#E8ECF1',
            boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.8)',
          }}>
          <span className="text-5xl">📭</span>
          <p className="text-base font-semibold text-gray-500 mt-3">
            {materiales.length === 0 ? 'No hay materiales disponibles' : 'Sin resultados'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {materiales.length === 0
              ? 'Este anunciante aún no tiene materiales aprobados'
              : 'Intenta con otro filtro o búsqueda'}
          </p>
        </div>
      )}

      {/* ═══ LISTA DE MATERIALES ═══ */}
      {!loading && !error && materialesFiltrados.length > 0 && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#C4B5FD #E8ECF1',
          }}>
          {materialesFiltrados.map((material) => {
            const cfg = CATEGORIA_CONFIG[material.categoria] || { icon: '📦', color: '#6B7280', label: material.categoria };
            const isSelected = puedeSeleccionar(material.id);
            const isDisabled = !isSelected && maxSeleccion !== undefined && seleccionados.length >= maxSeleccion;

            return (
              <button
                key={material.id}
                onClick={() => !isDisabled && handleSeleccionar(material)}
                disabled={isDisabled}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${
                  isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'
                } ${
                  isSelected
                    ? 'ring-2 ring-green-400'
                    : ''
                }`}
                style={{
                  background: isSelected ? '#F0FDF4' : '#E8ECF1',
                  boxShadow: isSelected
                    ? 'inset 3px 3px 6px rgba(0,0,0,0.06), inset -3px -3px 6px rgba(255,255,255,0.8)'
                    : '5px 5px 12px rgba(0,0,0,0.08), -5px -5px 12px rgba(255,255,255,0.9)',
                  border: isSelected ? '2px solid #86EFAC' : '2px solid transparent',
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icono categoría */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                      boxShadow: `3px 3px 8px ${cfg.color}33`,
                    }}
                  >
                    {cfg.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold" style={{ color: cfg.color }}>
                        {material.codigo}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                        style={{ background: cfg.color }}
                      >
                        {material.tipoLabel}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-700 bg-green-100">
                          ✓ Seleccionado
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate mt-0.5">
                      {material.nombre}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                      <span>⏱ {material.duracionFormateada}</span>
                      {material.pesoBytes > 0 && <span>📦 {pesoLegible(material.pesoBytes)}</span>}
                      <span className="capitalize">{cfg.label}</span>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  {material.urlThumbnail && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                      style={{
                        boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.5)',
                      }}>
                      <img
                        src={material.urlThumbnail}
                        alt={material.nombre}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectorMaterialCuna;
