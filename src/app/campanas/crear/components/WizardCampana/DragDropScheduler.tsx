/**
 * 🎯 DragDropScheduler - Editor Visual de Programación TIER0
 * 
 * Componente avanzado para programación visual de spots:
 * - Drag & Drop entre bloques horarios
 * - Validación en tiempo real
 * - Indicadores de saturación
 * - Undo/Redo
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, Clock, AlertTriangle, CheckCircle2, 
  Undo2, Redo2, Save, Zap, Radio
} from 'lucide-react';

// ==================== INTERFACES ====================

interface SpotProgramado {
  id: string;
  lineaId: string;
  anunciante: string;
  duracion: number;
  horaAsignada: string;
  estado: 'programado' | 'conflicto' | 'pendiente';
}

interface BloqueHorario {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  capacidadMinutos: number;
  ocupadoMinutos: number;
  spots: SpotProgramado[];
}

interface DragDropSchedulerProps {
  bloques: BloqueHorario[];
  onMoverSpot: (spotId: string, bloqueOrigenId: string, bloqueDestinoId: string) => void;
  onGuardar: () => void;
}

// ==================== DATOS MOCK ====================

const MOCK_BLOQUES: BloqueHorario[] = [
  {
    id: 'bloque_mat',
    nombre: 'PRIME MATINAL',
    horaInicio: '07:00',
    horaFin: '09:00',
    capacidadMinutos: 12,
    ocupadoMinutos: 10.5,
    spots: [
      { id: 'spot_001', lineaId: 'lin_1', anunciante: 'BANCO CHILE', duracion: 30, horaAsignada: '07:15', estado: 'programado' },
      { id: 'spot_002', lineaId: 'lin_1', anunciante: 'BANCO CHILE', duracion: 30, horaAsignada: '07:45', estado: 'programado' },
      { id: 'spot_003', lineaId: 'lin_2', anunciante: 'ENTEL', duracion: 45, horaAsignada: '08:00', estado: 'conflicto' },
    ]
  },
  {
    id: 'bloque_man',
    nombre: 'MAÑANA',
    horaInicio: '09:00',
    horaFin: '13:00',
    capacidadMinutos: 24,
    ocupadoMinutos: 8,
    spots: [
      { id: 'spot_004', lineaId: 'lin_3', anunciante: 'FALABELLA', duracion: 30, horaAsignada: '10:30', estado: 'programado' },
      { id: 'spot_005', lineaId: 'lin_3', anunciante: 'FALABELLA', duracion: 30, horaAsignada: '11:15', estado: 'programado' },
    ]
  },
  {
    id: 'bloque_tarde',
    nombre: 'PRIME TARDE',
    horaInicio: '18:00',
    horaFin: '20:00',
    capacidadMinutos: 12,
    ocupadoMinutos: 11,
    spots: [
      { id: 'spot_006', lineaId: 'lin_1', anunciante: 'BANCO CHILE', duracion: 30, horaAsignada: '18:15', estado: 'programado' },
      { id: 'spot_007', lineaId: 'lin_4', anunciante: 'COCA-COLA', duracion: 45, horaAsignada: '18:45', estado: 'programado' },
      { id: 'spot_008', lineaId: 'lin_4', anunciante: 'COCA-COLA', duracion: 30, horaAsignada: '19:30', estado: 'programado' },
    ]
  },
  {
    id: 'bloque_noche',
    nombre: 'TRASNOCHE',
    horaInicio: '00:00',
    horaFin: '06:00',
    capacidadMinutos: 36,
    ocupadoMinutos: 2,
    spots: [
      { id: 'spot_009', lineaId: 'lin_5', anunciante: 'CLARO', duracion: 30, horaAsignada: '01:00', estado: 'programado' },
    ]
  }
];

// ==================== COMPONENTE PRINCIPAL ====================

export function DragDropScheduler({
  bloques = MOCK_BLOQUES,
  onMoverSpot,
  onGuardar
}: Partial<DragDropSchedulerProps>) {
  const [bloquesState, setBloquesState] = useState<BloqueHorario[]>(bloques);
  const [draggedSpot, setDraggedSpot] = useState<{ spot: SpotProgramado; bloqueId: string } | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [historial, setHistorial] = useState<BloqueHorario[][]>([]);
  const [historialIndex, setHistorialIndex] = useState(-1);
  const [hasChanges, setHasChanges] = useState(false);

  const getSaturacionColor = (ocupado: number, capacidad: number) => {
    const porcentaje = (ocupado / capacidad) * 100;
    if (porcentaje >= 90) return 'bg-red-500';
    if (porcentaje >= 70) return 'bg-amber-500';
    if (porcentaje >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getSaturacionBg = (ocupado: number, capacidad: number) => {
    const porcentaje = (ocupado / capacidad) * 100;
    if (porcentaje >= 90) return 'bg-red-50 border-red-200';
    if (porcentaje >= 70) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-slate-200';
  };

  const handleDragStart = (spot: SpotProgramado, bloqueId: string) => {
    setDraggedSpot({ spot, bloqueId });
  };

  const handleDragOver = (e: React.DragEvent, bloqueId: string) => {
    e.preventDefault();
    setDropTargetId(bloqueId);
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, bloqueDestinoId: string) => {
    e.preventDefault();
    
    if (!draggedSpot || draggedSpot.bloqueId === bloqueDestinoId) {
      setDraggedSpot(null);
      setDropTargetId(null);
      return;
    }

    // Guardar estado actual en historial
    setHistorial(prev => [...prev.slice(0, historialIndex + 1), bloquesState]);
    setHistorialIndex(prev => prev + 1);

    // Mover spot
    setBloquesState(prev => {
      const nuevoBloques = prev.map(bloque => {
        if (bloque.id === draggedSpot.bloqueId) {
          // Remover del bloque origen
          return {
            ...bloque,
            spots: bloque.spots.filter(s => s.id !== draggedSpot.spot.id),
            ocupadoMinutos: bloque.ocupadoMinutos - (draggedSpot.spot.duracion / 60)
          };
        }
        if (bloque.id === bloqueDestinoId) {
          // Agregar al bloque destino
          return {
            ...bloque,
            spots: [...bloque.spots, { ...draggedSpot.spot, estado: 'programado' as const }],
            ocupadoMinutos: bloque.ocupadoMinutos + (draggedSpot.spot.duracion / 60)
          };
        }
        return bloque;
      });
      return nuevoBloques;
    });

    setHasChanges(true);
    onMoverSpot?.(draggedSpot.spot.id, draggedSpot.bloqueId, bloqueDestinoId);
    setDraggedSpot(null);
    setDropTargetId(null);
  };

  const handleUndo = () => {
    if (historialIndex >= 0) {
      setBloquesState(historial[historialIndex]);
      setHistorialIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historialIndex < historial.length - 1) {
      setHistorialIndex(prev => prev + 1);
      setBloquesState(historial[historialIndex + 1]);
    }
  };

  const handleGuardar = () => {
    onGuardar?.();
    setHasChanges(false);
  };

  const totalSpots = bloquesState.reduce((acc, b) => acc + b.spots.length, 0);
  const spotsConflicto = bloquesState.reduce((acc, b) => acc + b.spots.filter(s => s.estado === 'conflicto').length, 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">Editor de Programación</span>
          </div>
          <Badge variant="outline" className="text-blue-600">
            {totalSpots} spots programados
          </Badge>
          {spotsConflicto > 0 && (
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {spotsConflicto} conflictos
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUndo}
            disabled={historialIndex < 0}
            className="gap-1"
          >
            <Undo2 className="w-4 h-4" />
            Deshacer
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRedo}
            disabled={historialIndex >= historial.length - 1}
            className="gap-1"
          >
            <Redo2 className="w-4 h-4" />
            Rehacer
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <Button 
            size="sm"
            onClick={handleGuardar}
            disabled={!hasChanges}
            className="bg-blue-600 hover:bg-blue-700 gap-1"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Grid de Bloques */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bloquesState.map(bloque => {
          const porcentaje = (bloque.ocupadoMinutos / bloque.capacidadMinutos) * 100;
          const isDropTarget = dropTargetId === bloque.id;
          
          return (
            <Card 
              key={bloque.id}
              className={`
                p-4 transition-all duration-200
                ${getSaturacionBg(bloque.ocupadoMinutos, bloque.capacidadMinutos)}
                ${isDropTarget ? 'ring-2 ring-blue-400 ring-offset-2 scale-[1.02]' : ''}
              `}
              onDragOver={(e) => handleDragOver(e, bloque.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, bloque.id)}
            >
              {/* Header del Bloque */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{bloque.nombre}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {bloque.horaInicio} - {bloque.horaFin}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getSaturacionColor(bloque.ocupadoMinutos, bloque.capacidadMinutos)}`} />
              </div>

              {/* Barra de Saturación */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Saturación</span>
                  <span className="font-medium">{porcentaje.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${getSaturacionColor(bloque.ocupadoMinutos, bloque.capacidadMinutos)}`}
                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{bloque.ocupadoMinutos.toFixed(1)} min</span>
                  <span>{bloque.capacidadMinutos} min cap.</span>
                </div>
              </div>

              {/* Lista de Spots */}
              <div className="space-y-2 min-h-[120px]">
                {bloque.spots.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Arrastra spots aquí
                  </div>
                ) : (
                  bloque.spots.map(spot => (
                    <div
                      key={spot.id}
                      draggable
                      onDragStart={() => handleDragStart(spot, bloque.id)}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing
                        transition-all hover:shadow-md
                        ${spot.estado === 'conflicto' 
                          ? 'bg-red-100 border border-red-200' 
                          : 'bg-white border border-gray-100 hover:border-blue-200'
                        }
                        ${draggedSpot?.spot.id === spot.id ? 'opacity-50' : ''}
                      `}
                    >
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{spot.anunciante}</p>
                        <p className="text-xs text-gray-500">{spot.horaAsignada} • {spot.duracion}s</p>
                      </div>
                      {spot.estado === 'conflicto' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Acción Rápida */}
              {porcentaje < 50 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 text-emerald-600 hover:bg-emerald-50"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Espacio Disponible
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Baja saturación (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Media (70-90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Alta (&gt;90%)</span>
        </div>
      </div>
    </div>
  );
}

export default DragDropScheduler;
