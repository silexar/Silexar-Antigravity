'use client';

import { Clock, Play, Pause, Eye, Edit3, Send, Copy, MoreVertical } from 'lucide-react';
import {
  TipoBadge, UrgenciaBadge, EstadoBadge,
  TiempoRestanteBadge, EmisoraChip, ProximaEmisionInfo,
} from './components';
import type { Cuna } from './types';

export interface CunaRowProps {
  cuna: Cuna;
  onPlay: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onActions: (id: string, action: string) => void;
  isPlaying: boolean;
}

export function CunaRow({ cuna, onPlay, onView, onEdit, onActions, isPlaying }: CunaRowProps) {
  return (
    <div className={`
      flex items-center justify-between p-4 rounded-xl border backdrop-blur-xl transition-all duration-200
      ${cuna.esCritica ? 'bg-red-50/60 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-white/60 border-slate-200/60'}
      hover:bg-white/90 hover:shadow-md hover:border-emerald-200 group
    `}>
      {/* Play Button & Info */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => onPlay(cuna.id)}
          aria-label={isPlaying ? 'Pausar cuña' : 'Reproducir cuña'}
          className={`
            p-3 rounded-full transition-all duration-200
            ${isPlaying
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg scale-110'
              : 'bg-gradient-to-br from-slate-200 to-slate-300 hover:from-emerald-400 hover:to-emerald-500'
            }
          `}
        >
          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-slate-600" />}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-emerald-600 font-semibold">{cuna.spxCodigo}</span>
            <TipoBadge tipo={cuna.tipo} />
            <UrgenciaBadge urgencia={cuna.urgencia} />
          </div>
          <h3 className="font-medium text-slate-800 truncate mt-1">{cuna.nombre}</h3>
          <p className="text-sm text-slate-500 truncate">
            {cuna.anuncianteNombre}
            {cuna.producto && <span className="text-slate-300"> • </span>}
            {cuna.producto}
          </p>
        </div>
      </div>

      {/* Duración */}
      <div className="hidden lg:flex flex-col items-center px-4 min-w-[80px]">
        <div className="flex items-center gap-1 text-slate-700">
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">{cuna.duracionFormateada}</span>
        </div>
        <p className="text-xs text-slate-400">{cuna.duracionSegundos}s</p>
      </div>

      {/* Scores */}
      <div className="hidden xl:flex gap-3 px-4">
        <div className="text-center">
          <div className={`text-lg font-bold ${cuna.scoreTecnico >= 80 ? 'text-emerald-600' : cuna.scoreTecnico >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {cuna.scoreTecnico}%
          </div>
          <p className="text-xs text-slate-400">Técnico</p>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${cuna.scoreBrandSafety >= 80 ? 'text-emerald-600' : cuna.scoreBrandSafety >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {cuna.scoreBrandSafety}%
          </div>
          <p className="text-xs text-slate-400">Brand</p>
        </div>
      </div>

      {/* Vigencia */}
      <div className="hidden md:flex flex-col items-center px-4 min-w-[100px]">
        <div className={`text-sm font-medium ${cuna.diasRestantes <= 1 ? 'text-red-600' : cuna.diasRestantes <= 7 ? 'text-amber-600' : 'text-slate-600'}`}>
          {cuna.diasRestantes <= 0 ? 'Vencida' : `${cuna.diasRestantes} días`}
        </div>
        <p className="text-xs text-slate-400">Vigencia</p>
      </div>

      {/* Emisiones */}
      <div className="hidden lg:flex flex-col items-center px-4 min-w-[80px]">
        <p className="text-lg font-bold text-slate-800">{cuna.totalEmisiones}</p>
        <p className="text-xs text-slate-400">emisiones</p>
      </div>

      {/* Emisora y Próxima Emisión */}
      {cuna.programacion && (
        <div className="hidden xl:flex flex-col gap-2 px-4 min-w-[180px]">
          <EmisoraChip nombre={cuna.programacion.emisoraNombre} logo={cuna.programacion.emisoraLogo} />
          <div className="flex items-center gap-2">
            <TiempoRestanteBadge proximaEmision={cuna.programacion.proximaEmision} />
            <span className="text-xs text-slate-500">{cuna.programacion.horarioBloque}</span>
          </div>
        </div>
      )}

      {/* Programación Detallada */}
      {cuna.programacion && (
        <div className="hidden 2xl:block px-3">
          <ProximaEmisionInfo
            horarioBloque={cuna.programacion.horarioBloque}
            frecuencia={cuna.programacion.frecuencia}
            totalEmisoras={cuna.programacion.totalEmisorasHoy}
          />
        </div>
      )}

      {/* Estado */}
      <div className="px-4">
        <EstadoBadge estado={cuna.estado} />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1">
        <button onClick={() => onView(cuna.id)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Ver detalle" aria-label="Ver detalle">
          <Eye className="w-5 h-5" />
        </button>
        <button onClick={() => onEdit(cuna.id)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Editar" aria-label="Editar cuña">
          <Edit3 className="w-5 h-5" />
        </button>
        <button onClick={() => onActions(cuna.id, 'distribute')} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Distribuir" aria-label="Distribuir cuña">
          <Send className="w-5 h-5" />
        </button>
        <button onClick={() => onActions(cuna.id, 'copy')} className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors" title="Copiar" aria-label="Copiar cuña">
          <Copy className="w-5 h-5" />
        </button>
        <button onClick={() => onActions(cuna.id, 'more')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Más acciones" aria-label="Más acciones">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
