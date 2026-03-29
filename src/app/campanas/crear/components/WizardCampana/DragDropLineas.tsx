/**
 * 🔀 SILEXAR PULSE - Sistema Drag & Drop Entre Líneas 2050
 * 
 * @description Componente para arrastrar y soltar cuñas entre
 * diferentes líneas de la campaña con validación en tiempo real.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRightLeft,
  Music,
  GripVertical,
  Ban,
  Plus,
  Minus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CunaArrastrable {
  id: string;
  codigo: string;
  nombre: string;
  anunciante: string;
  duracion: number;
  estado: 'activa' | 'inactiva' | 'vencida';
}

export interface LineaCampana {
  id: string;
  nombre: string;
  emisora: string;
  horario: string;
  duracionMaxima: number; // segundos por spot
  cunas: CunaArrastrable[];
  ocupado: number; // segundos ocupados totales
  capacidad: number; // segundos disponibles por día
}

interface DragDropLineasProps {
  lineas: LineaCampana[];
  onMoverCuna: (cunaId: string, lineaOrigenId: string, lineaDestinoId: string) => void;
  onCopiarCuna: (cunaId: string, lineaOrigenId: string, lineaDestinoId: string) => void;
  onEliminarCuna: (cunaId: string, lineaId: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const LINEAS_MOCK: LineaCampana[] = [
  {
    id: 'lin_001',
    nombre: 'Prime Matinal',
    emisora: 'Radio Pudahuel',
    horario: '06:00 - 09:00',
    duracionMaxima: 30,
    capacidad: 180,
    ocupado: 120,
    cunas: [
      { id: 'cuna_1', codigo: 'BCH-001', nombre: 'BANCO CHILE Verano', anunciante: 'BANCO CHILE', duracion: 30, estado: 'activa' },
      { id: 'cuna_2', codigo: 'ENT-001', nombre: 'ENTEL Promocional', anunciante: 'ENTEL', duracion: 30, estado: 'activa' }
    ]
  },
  {
    id: 'lin_002',
    nombre: 'Mañana',
    emisora: 'Radio Pudahuel',
    horario: '09:00 - 12:00',
    duracionMaxima: 30,
    capacidad: 180,
    ocupado: 60,
    cunas: [
      { id: 'cuna_3', codigo: 'FAL-001', nombre: 'FALABELLA Black Friday', anunciante: 'FALABELLA', duracion: 45, estado: 'activa' }
    ]
  },
  {
    id: 'lin_003',
    nombre: 'Prime Tarde',
    emisora: 'Radio ADN',
    horario: '18:00 - 21:00',
    duracionMaxima: 45,
    capacidad: 200,
    ocupado: 0,
    cunas: []
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const DragDropLineas: React.FC<DragDropLineasProps> = ({
  lineas = LINEAS_MOCK,
  onMoverCuna,
  onCopiarCuna,
  onEliminarCuna
}) => {
  const [dragging, setDragging] = useState<{ cunaId: string; lineaId: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [modoCopiando, setModoCopiando] = useState(false);

  // Validar si una cuña puede ir a una línea
  const puedeIrALinea = useCallback((cuna: CunaArrastrable, linea: LineaCampana): boolean => {
    // Verificar que la duración sea compatible
    if (cuna.duracion > linea.duracionMaxima) return false;
    // Verificar que no esté ya en esa línea
    if (linea.cunas.some(c => c.id === cuna.id)) return false;
    // Verificar que haya espacio
    if (linea.ocupado + cuna.duracion > linea.capacidad) return false;
    return true;
  }, []);

  // Obtener cuña desde dragging
  const getCunaDragging = useCallback((): CunaArrastrable | null => {
    if (!dragging) return null;
    const linea = lineas.find(l => l.id === dragging.lineaId);
    if (!linea) return null;
    return linea.cunas.find(c => c.id === dragging.cunaId) || null;
  }, [dragging, lineas]);

  // Handlers de drag
  const handleDragStart = (e: React.DragEvent, cunaId: string, lineaId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragging({ cunaId, lineaId });
    setModoCopiando(e.ctrlKey);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
    setModoCopiando(false);
  };

  const handleDragOver = (e: React.DragEvent, lineaId: string) => {
    e.preventDefault();
    const cuna = getCunaDragging();
    const linea = lineas.find(l => l.id === lineaId);
    
    if (cuna && linea && puedeIrALinea(cuna, linea)) {
      e.dataTransfer.dropEffect = modoCopiando ? 'copy' : 'move';
      setDragOver(lineaId);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
    
    setModoCopiando(e.ctrlKey);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, lineaDestinoId: string) => {
    e.preventDefault();
    
    if (!dragging) return;
    
    const cuna = getCunaDragging();
    const lineaDestino = lineas.find(l => l.id === lineaDestinoId);
    
    if (!cuna || !lineaDestino || !puedeIrALinea(cuna, lineaDestino)) {
      handleDragEnd();
      return;
    }

    if (e.ctrlKey && onCopiarCuna) {
      onCopiarCuna(dragging.cunaId, dragging.lineaId, lineaDestinoId);
    } else if (onMoverCuna) {
      onMoverCuna(dragging.cunaId, dragging.lineaId, lineaDestinoId);
    }

    handleDragEnd();
  };

  // Calcular estado de drop
  const getDropState = (lineaId: string) => {
    if (!dragging || lineaId === dragging.lineaId) return 'none';
    
    const cuna = getCunaDragging();
    const linea = lineas.find(l => l.id === lineaId);
    
    if (!cuna || !linea) return 'none';
    
    if (!puedeIrALinea(cuna, linea)) return 'invalid';
    if (dragOver === lineaId) return 'active';
    return 'valid';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Drag & Drop Entre Líneas</h3>
        </div>
        <div className="text-xs text-gray-500">
          Arrastre cuñas entre líneas | Ctrl + Arrastrar = Copiar
        </div>
      </div>

      {/* Grid de líneas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lineas.map(linea => {
          const dropState = getDropState(linea.id);
          const ocupacionPct = (linea.ocupado / linea.capacidad) * 100;

          return (
            <Card
              key={linea.id}
              className={`p-3 transition-all ${
                dropState === 'active' ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300' :
                dropState === 'valid' ? 'border-green-300 bg-green-50/50' :
                dropState === 'invalid' ? 'border-red-300 bg-red-50/50' :
                ''
              }`}
              onDragOver={(e) => handleDragOver(e, linea.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, linea.id)}
            >
              {/* Header de línea */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-sm">{linea.nombre}</h4>
                  <p className="text-xs text-gray-500">{linea.emisora} | {linea.horario}</p>
                </div>
                <Badge 
                  className={
                    ocupacionPct >= 100 ? 'bg-red-100 text-red-700' :
                    ocupacionPct >= 80 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }
                >
                  {ocupacionPct.toFixed(0)}%
                </Badge>
              </div>

              {/* Barra de ocupación */}
              <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    ocupacionPct >= 100 ? 'bg-red-500' :
                    ocupacionPct >= 80 ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(ocupacionPct, 100)}%` }}
                />
              </div>

              {/* Drop zone indicator */}
              {dragging && dragging.lineaId !== linea.id && (
                <div className={`p-3 mb-2 rounded border-2 border-dashed text-center text-xs ${
                  dropState === 'active' ? 'border-blue-400 bg-blue-100 text-blue-700' :
                  dropState === 'valid' ? 'border-green-400 text-green-700' :
                  dropState === 'invalid' ? 'border-red-400 text-red-700' :
                  'border-gray-300 text-gray-500'
                }`}>
                  {dropState === 'invalid' ? (
                    <div className="flex items-center justify-center gap-1">
                      <Ban className="w-4 h-4" />
                      {(() => {
                        const cuna = getCunaDragging();
                        if (cuna && cuna.duracion > linea.duracionMaxima) {
                          return 'Duración incompatible';
                        }
                        if (cuna && linea.cunas.some(c => c.id === cuna.id)) {
                          return 'Ya existe en esta línea';
                        }
                        return 'Sin espacio disponible';
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      {modoCopiando ? <Plus className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                      {modoCopiando ? 'Soltar para copiar' : 'Soltar para mover'}
                    </div>
                  )}
                </div>
              )}

              {/* Cuñas */}
              <div className="space-y-2 min-h-[80px]">
                {linea.cunas.map(cuna => (
                  <div
                    key={cuna.id}
                    className={`p-2 bg-white border rounded flex items-center gap-2 cursor-grab active:cursor-grabbing transition-all ${
                      dragging?.cunaId === cuna.id ? 'opacity-50 border-blue-400' : 'hover:border-gray-300'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cuna.id, linea.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{cuna.codigo}</span>
                        <Badge variant="outline" className="text-xs">{cuna.duracion}s</Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{cuna.anunciante}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEliminarCuna?.(cuna.id, linea.id);
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {linea.cunas.length === 0 && !dragging && (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    <Music className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    Sin cuñas asignadas
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-gray-500">
                <span>{linea.cunas.length} cuñas</span>
                <span>Max: {linea.duracionMaxima}s</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4" />
          <span>Arrastrar para mover</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</span>
          <span>+ Arrastrar = Copiar</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 rounded" />
          <span>Compatible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 rounded" />
          <span>Incompatible</span>
        </div>
      </div>
    </Card>
  );
};

export default DragDropLineas;
