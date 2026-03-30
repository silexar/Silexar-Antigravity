/**
 * 📊 SILEXAR PULSE - Vista Ocupación de Bloque 2050
 * 
 * @description Panel para visualizar ocupación de un bloque comercial,
 * con drag & drop para reordenar cuñas y detectar saturación
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  Play,
  Pause,
  Trash2,
  GripVertical,
  Plus,
  AlertTriangle,
  BarChart3,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SpotEnBloque {
  id: string;
  orden: number;
  cunaId: string;
  cunaCodigo: string;
  cunaNombre: string;
  anunciante: string;
  duracion: number;
  estado: 'programado' | 'emitido' | 'confirmado';
  notas?: string;
  esGemela?: boolean;
  gemelaDeId?: string;
}

export interface BloqueComercial {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  duracionMaxima: number; // segundos
  emisoraId: string;
  emisoraNombre: string;
  spots: SpotEnBloque[];
}

interface VistaOcupacionBloqueProps {
  bloque: BloqueComercial;
  onAgregarSpot: (bloqueId: string) => void;
  onEliminarSpot: (spotId: string) => void;
  onReordenar: (spots: SpotEnBloque[]) => void;
  onPlaySpot: (spotId: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const BLOQUE_MOCK: BloqueComercial = {
  id: 'bloque_001',
  nombre: 'Tanda Prime Matinal',
  horaInicio: '07:00',
  horaFin: '07:03',
  duracionMaxima: 180,
  emisoraId: 'em_001',
  emisoraNombre: 'Radio Pudahuel',
  spots: [
    { id: 'spot_1', orden: 1, cunaId: 'cuna_001', cunaCodigo: 'BCH-001', cunaNombre: 'BANCO CHILE Apertura', anunciante: 'BANCO CHILE', duracion: 10, estado: 'programado', esGemela: true, gemelaDeId: 'spot_2' },
    { id: 'spot_2', orden: 2, cunaId: 'cuna_002', cunaCodigo: 'BCH-002', cunaNombre: 'BANCO CHILE Principal', anunciante: 'BANCO CHILE', duracion: 30, estado: 'programado' },
    { id: 'spot_3', orden: 3, cunaId: 'cuna_003', cunaCodigo: 'BCH-003', cunaNombre: 'BANCO CHILE Cierre', anunciante: 'BANCO CHILE', duracion: 10, estado: 'programado', esGemela: true, gemelaDeId: 'spot_2' },
    { id: 'spot_4', orden: 4, cunaId: 'cuna_004', cunaCodigo: 'ENT-001', cunaNombre: 'ENTEL Promocional', anunciante: 'ENTEL', duracion: 30, estado: 'programado' },
    { id: 'spot_5', orden: 5, cunaId: 'cuna_005', cunaCodigo: 'FAL-001', cunaNombre: 'FALABELLA Black Friday', anunciante: 'FALABELLA', duracion: 45, estado: 'programado' },
    { id: 'spot_6', orden: 6, cunaId: 'cuna_006', cunaCodigo: 'CLR-001', cunaNombre: 'CLARO 5G', anunciante: 'CLARO', duracion: 20, estado: 'programado' }
  ]
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const VistaOcupacionBloque: React.FC<VistaOcupacionBloqueProps> = ({
  bloque = BLOQUE_MOCK,
  onAgregarSpot,
  onEliminarSpot,
  onReordenar,
  onPlaySpot
}) => {
  const [reproduciendo, setReproduciendo] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Calcular métricas
  const metricas = useMemo(() => {
    const ocupado = bloque.spots.reduce((acc, s) => acc + s.duracion, 0);
    const disponible = bloque.duracionMaxima - ocupado;
    const porcentaje = (ocupado / bloque.duracionMaxima) * 100;
    const saturado = porcentaje >= 100;
    const casiSaturado = porcentaje >= 85 && porcentaje < 100;
    
    return { ocupado, disponible, porcentaje, saturado, casiSaturado };
  }, [bloque]);

  // Color según saturación
  const getColorSaturacion = () => {
    if (metricas.saturado) return 'text-red-600 bg-red-100';
    if (metricas.casiSaturado) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  // Reproducir
  const handlePlay = (spotId: string) => {
    if (reproduciendo === spotId) {
      setReproduciendo(null);
    } else {
      setReproduciendo(spotId);
      onPlaySpot?.(spotId);
      setTimeout(() => setReproduciendo(null), 3000);
    }
  };

  // Mover spot arriba
  const moverArriba = (index: number) => {
    if (index === 0) return;
    const nuevosSpots = [...bloque.spots];
    [nuevosSpots[index - 1], nuevosSpots[index]] = [nuevosSpots[index], nuevosSpots[index - 1]];
    nuevosSpots.forEach((s, i) => s.orden = i + 1);
    onReordenar?.(nuevosSpots);
  };

  // Mover spot abajo
  const moverAbajo = (index: number) => {
    if (index === bloque.spots.length - 1) return;
    const nuevosSpots = [...bloque.spots];
    [nuevosSpots[index], nuevosSpots[index + 1]] = [nuevosSpots[index + 1], nuevosSpots[index]];
    nuevosSpots.forEach((s, i) => s.orden = i + 1);
    onReordenar?.(nuevosSpots);
  };

  // Formatear duración
  const formatDuracion = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 border-blue-200 bg-gradient-to-br from-blue-50/30 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{bloque.nombre}</h3>
            <p className="text-sm text-gray-500">
              {bloque.horaInicio} - {bloque.horaFin} | {bloque.emisoraNombre}
            </p>
          </div>
        </div>
        
        <Badge className={`text-lg px-3 py-1 ${getColorSaturacion()}`}>
          {metricas.porcentaje.toFixed(0)}%
        </Badge>
      </div>

      {/* Barra de ocupación */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Capacidad: {formatDuracion(bloque.duracionMaxima)}
          </span>
          <span className={`text-sm font-medium ${
            metricas.saturado ? 'text-red-600' : 
            metricas.casiSaturado ? 'text-amber-600' : 
            'text-green-600'
          }`}>
            {metricas.disponible >= 0 
              ? `Disponible: ${formatDuracion(metricas.disponible)}`
              : `Excedido: ${formatDuracion(Math.abs(metricas.disponible))}`
            }
          </span>
        </div>
        
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
          {bloque.spots.map((spot, index) => {
            const prevDuration = bloque.spots
              .slice(0, index)
              .reduce((acc, s) => acc + s.duracion, 0);
            const startPercent = (prevDuration / bloque.duracionMaxima) * 100;
            const widthPercent = (spot.duracion / bloque.duracionMaxima) * 100;
            
            const colors = [
              'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
              'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'
            ];
            
            return (
              <div
                key={spot.id}
                className={`absolute top-0 bottom-0 ${colors[index % colors.length]} opacity-80 first:rounded-l-full`}
                style={{ 
                  left: `${startPercent}%`, 
                  width: `${Math.min(widthPercent, 100 - startPercent)}%` 
                }}
                title={`${spot.anunciante} - ${spot.duracion}s`}
              />
            );
          })}
          
          {/* Línea de 100% */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400" style={{ left: '100%' }} />
        </div>
      </div>

      {/* Alertas */}
      {metricas.saturado && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700 font-medium">
            ¡BLOQUE SATURADO! Excede la capacidad en {formatDuracion(Math.abs(metricas.disponible))}
          </span>
        </div>
      )}

      {metricas.casiSaturado && !metricas.saturado && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-sm text-amber-700">
            Bloque casi lleno. Solo {formatDuracion(metricas.disponible)} disponibles.
          </span>
        </div>
      )}

      {/* Lista de spots */}
      <div className="space-y-2 mb-4">
        {bloque.spots.map((spot, index) => (
          <div
            key={spot.id}
            className={`p-3 bg-white border rounded-lg flex items-center gap-3 transition-all ${
              draggingId === spot.id ? 'opacity-50 border-blue-400' : 'hover:border-gray-300'
            } ${spot.esGemela ? 'border-l-4 border-l-purple-400' : ''}`}
            draggable
            onDragStart={() => setDraggingId(spot.id)}
            onDragEnd={() => setDraggingId(null)}
          >
            {/* Drag handle */}
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
            
            {/* Orden */}
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
              {index + 1}
            </span>

            {/* Play */}
            <button
              onClick={() => handlePlay(spot.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                reproduciendo === spot.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {reproduciendo === spot.id 
                ? <Pause className="w-4 h-4" /> 
                : <Play className="w-4 h-4 ml-0.5" />
              }
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{spot.anunciante}</span>
                {spot.esGemela && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">Gemela</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{spot.cunaCodigo} - {spot.cunaNombre}</p>
            </div>

            {/* Duración */}
            <Badge variant="outline" className="font-mono">
              {spot.duracion}s
            </Badge>

            {/* Acciones */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moverArriba(index)}
                disabled={index === 0}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moverAbajo(index)}
                disabled={index === bloque.spots.length - 1}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-700"
                onClick={() => onEliminarSpot?.(spot.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {bloque.spots.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Music className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay spots en este bloque</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{bloque.spots.length} spots</span>
          <span>{formatDuracion(metricas.ocupado)} ocupados</span>
        </div>
        
        <Button 
          size="sm" 
          className="gap-1"
          disabled={metricas.saturado}
          onClick={() => onAgregarSpot?.(bloque.id)}
        >
          <Plus className="w-4 h-4" />
          Agregar Cuña
        </Button>
      </div>
    </Card>
  );
};

export default VistaOcupacionBloque;
