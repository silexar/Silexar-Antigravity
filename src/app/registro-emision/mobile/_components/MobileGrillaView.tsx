/**
 * 📺 MOBILE: Vista de Grilla de Programación
 * 
 * Timeline vertical de bloques con indicadores de estado, barras de ocupación
 * y listas expandibles de items. Replica grilla/page.tsx.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Clock, Radio, Play, Pause, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, RefreshCw, BarChart3
} from 'lucide-react';
import { useGrilla } from '../../_shared/useRegistroEmision';
import type { GridBlock, GridItem } from '../../_shared/types';

// ═══════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  planificada: { label: 'Planificada', color: 'text-slate-500', bg: 'bg-slate-100', icon: Clock },
  en_revision: { label: 'En Revisión', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
  aprobada: { label: 'Aprobada', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 },
  exportada: { label: 'Exportada', color: 'text-purple-600', bg: 'bg-purple-50', icon: Radio },
  emitida: { label: 'Al Aire', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Play },
  verificada: { label: 'Verificada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileGrillaView() {
  const { blocks, loading, error, refresh } = useGrilla();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-400">Cargando grilla...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="font-bold text-slate-600">Error al cargar</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <button onClick={refresh} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl active:scale-95">
          Reintentar
        </button>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Radio className="w-16 h-16 text-slate-200 mb-4" />
        <p className="font-bold text-slate-500">Sin bloques programados</p>
        <p className="text-xs text-slate-400 mt-1">No hay datos de grilla disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER STATS */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" /> Grilla del Día
        </h3>
        <button onClick={refresh} className="p-2 rounded-lg bg-white border border-slate-100 active:scale-95">
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* SUMMARY BAR */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center text-white shadow-xl">
        <div>
          <p className="text-xl font-black">{blocks.length}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Bloques</p>
        </div>
        <div>
          <p className="text-xl font-black text-emerald-400">
            {blocks.filter(b => b.estado === 'emitida' || b.estado === 'verificada').length}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Al Aire</p>
        </div>
        <div>
          <p className="text-xl font-black text-blue-400">
            {blocks.length > 0 ? Math.round(blocks.reduce((s, b) => s + b.ocupacion, 0) / blocks.length) : 0}%
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Ocupación</p>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

        <div className="space-y-3">
          {blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              isExpanded={expandedId === block.id}
              onToggle={() => setExpandedId(expandedId === block.id ? null : block.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: BlockCard
// ═══════════════════════════════════════════════════════════════

interface BlockCardProps {
  block: GridBlock;
  isExpanded: boolean;
  onToggle: () => void;
}

function BlockCard({ block, isExpanded, onToggle }: BlockCardProps) {
  const status = STATUS_CONFIG[block.estado] || STATUS_CONFIG.planificada;
  const StatusIcon = status.icon;

  return (
    <div className="relative pl-12">
      {/* Timeline Dot */}
      <div className={`absolute left-3 top-4 w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
        block.estado === 'emitida' || block.estado === 'verificada' ? 'bg-emerald-500' :
        block.estado === 'en_revision' ? 'bg-amber-500' : 'bg-slate-300'
      }`}>
        {(block.estado === 'emitida') && (
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
      </div>

      <button
        onClick={onToggle}
        className="w-full text-left bg-white rounded-xl border border-slate-100 shadow-sm p-4 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold text-slate-700">{block.hora}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3 h-3" /> {status.label}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>

        <p className="font-bold text-slate-800 text-sm mb-2">{block.nombre}</p>

        {/* Occupancy Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                block.ocupacion >= 90 ? 'bg-red-500' :
                block.ocupacion >= 70 ? 'bg-amber-500' :
                block.ocupacion >= 50 ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${block.ocupacion}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-500">{block.ocupacion}%</span>
        </div>

        {/* Expanded Items */}
        {isExpanded && block.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            {block.items.map(item => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        )}

        {isExpanded && block.items.length === 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Sin items en este bloque</p>
          </div>
        )}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ItemRow
// ═══════════════════════════════════════════════════════════════

function ItemRow({ item }: { item: GridItem }) {
  const typeConfig: Record<string, { bg: string; label: string }> = {
    spot: { bg: 'bg-purple-100 text-purple-600', label: 'Spot' },
    mencion: { bg: 'bg-emerald-100 text-emerald-600', label: 'Mención' },
    bloque: { bg: 'bg-blue-100 text-blue-600', label: 'Bloque' },
  };
  const tc = typeConfig[item.tipo] || typeConfig.spot;

  const statusIcon = item.estado === 'emitido' ? <Play className="w-3 h-3 text-emerald-500" /> :
                     item.estado === 'pausado' ? <Pause className="w-3 h-3 text-amber-500" /> :
                     <Clock className="w-3 h-3 text-slate-400" />;

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        {statusIcon}
        <span className="text-xs font-bold text-slate-700 truncate">{item.titulo}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-400">{item.duracion}s</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tc.bg}`}>{tc.label}</span>
      </div>
    </div>
  );
}
