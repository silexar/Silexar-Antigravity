/**
 * 📺 Centro de Comando Visual - Interfaz MediaSales TIER0
 * 
 * Panel de 3 columnas para programación visual avanzada:
 * - Columna Izquierda: Lista de bloques horarios con saturación
 * - Columna Central: Slots de programación asignables
 * - Columna Derecha: Materiales disponibles con acciones
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, Radio, Music, GripVertical, AlertTriangle, CheckCircle2,
  Trash2, Link2, Replace, Unlock, Calendar,
  RefreshCw, Settings
} from 'lucide-react';

// ==================== INTERFACES ====================

interface BloqueHorario {
  id: string;
  hora: string;
  tipo: 'PRIME' | 'AUSPICIO' | 'REPARTIDO' | 'MENCIONES';
  capacidadSegundos: number;
  ocupadoSegundos: number;
  slots: SlotProgramacion[];
}

interface SlotProgramacion {
  id: string;
  posicion: number;
  duracion: number;
  materialId?: string;
  materialCodigo?: string;
  materialNombre?: string;
  estado: 'vacio' | 'asignado' | 'conflicto' | 'bloqueado';
  posicionFija?: string;
}

interface MaterialDisponible {
  id: string;
  codigo: string;
  nombre: string;
  duracion: number;
  anunciante: string;
  estado: 'disponible' | 'asignado' | 'pendiente';
}

interface AlertaMovimiento {
  tipo: 'tipo_incompatible' | 'saturacion' | 'conflicto_competencia' | 'posicion_ocupada';
  mensaje: string;
  materialId: string;
  bloqueOrigenId: string;
  bloqueDestinoId: string;
}

// ==================== DATOS MOCK ====================

const MOCK_BLOQUES: BloqueHorario[] = [
  {
    id: 'blq_0629',
    hora: '06:29:00',
    tipo: 'PRIME',
    capacidadSegundos: 300,
    ocupadoSegundos: 285,
    slots: [
      { id: 'slot_1', posicion: 1, duracion: 30, materialId: 'mat_1', materialCodigo: 'SP00262', materialNombre: 'BANCO SCOTI', estado: 'asignado' },
      { id: 'slot_2', posicion: 2, duracion: 30, estado: 'vacio' },
      { id: 'slot_3', posicion: 3, duracion: 30, materialId: 'mat_2', materialCodigo: 'SP00263', materialNombre: 'MEV CAFE', estado: 'asignado' },
    ]
  },
  {
    id: 'blq_0650',
    hora: '06:50:00',
    tipo: 'PRIME',
    capacidadSegundos: 300,
    ocupadoSegundos: 280,
    slots: [
      { id: 'slot_4', posicion: 1, duracion: 30, estado: 'vacio' },
      { id: 'slot_5', posicion: 2, duracion: 30, estado: 'vacio' },
    ]
  },
  {
    id: 'blq_0726',
    hora: '07:26:00',
    tipo: 'PRIME',
    capacidadSegundos: 300,
    ocupadoSegundos: 295,
    slots: [
      { id: 'slot_6', posicion: 1, duracion: 15, estado: 'vacio' },
      { id: 'slot_7', posicion: 2, duracion: 30, materialId: 'mat_3', materialCodigo: 'SP00314', materialNombre: 'BANCO SCOTI', estado: 'conflicto' },
    ]
  },
  {
    id: 'blq_0729',
    hora: '07:29:00',
    tipo: 'AUSPICIO',
    capacidadSegundos: 300,
    ocupadoSegundos: 312,
    slots: [
      { id: 'slot_8', posicion: 1, duracion: 30, estado: 'vacio' },
    ]
  },
  {
    id: 'blq_0826',
    hora: '08:26:00',
    tipo: 'REPARTIDO',
    capacidadSegundos: 300,
    ocupadoSegundos: 267,
    slots: [
      { id: 'slot_9', posicion: 1, duracion: 30, estado: 'vacio' },
      { id: 'slot_10', posicion: 2, duracion: 30, estado: 'vacio' },
      { id: 'slot_11', posicion: 3, duracion: 30, estado: 'vacio' },
    ]
  },
];

const MOCK_MATERIALES: MaterialDisponible[] = [
  { id: 'mat_1', codigo: 'SP00262', nombre: 'BANCO SCOTIABANK', duracion: 32, anunciante: 'BANCO SCOTI', estado: 'asignado' },
  { id: 'mat_2', codigo: 'SP00263', nombre: 'MEV CAFE PREMIUM', duracion: 15, anunciante: 'MEV CAFE', estado: 'asignado' },
  { id: 'mat_3', codigo: 'SP00314', nombre: 'BANCO SCOTIABANK V2', duracion: 29, anunciante: 'BANCO SCOTI', estado: 'disponible' },
  { id: 'mat_4', codigo: 'SP00315', nombre: 'BANCO SCOTIABANK V3', duracion: 30, anunciante: 'BANCO SCOTI', estado: 'disponible' },
  { id: 'mat_5', codigo: 'SP00400', nombre: 'COCA COLA ZERO', duracion: 30, anunciante: 'COCA COLA', estado: 'disponible' },
];

const POSICIONES_FIJAS = [
  { id: 'inicio', label: '🥇 Inicio', value: 1 },
  { id: 'segundo', label: '🥈 Segundo', value: 2 },
  { id: 'tercero', label: '🥉 Tercero', value: 3 },
  { id: 'medio', label: '📍 Al Medio', value: 0 },
  { id: 'final', label: '🔚 Final', value: -1 },
];

// ==================== COMPONENTE PRINCIPAL ====================

export function CentroComandoVisual() {
  const [bloques, setBloques] = useState<BloqueHorario[]>(MOCK_BLOQUES);
  const [materiales] = useState<MaterialDisponible[]>(MOCK_MATERIALES);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<string>(MOCK_BLOQUES[0].id);
  const [slotsSeleccionados, setSlotsSeleccionados] = useState<string[]>([]);
  const [draggedMaterial, setDraggedMaterial] = useState<MaterialDisponible | null>(null);
  const [alertaActiva, setAlertaActiva] = useState<AlertaMovimiento | null>(null);
  const [fechaActual] = useState('11/08/2025');
  const [emisoraActual] = useState('T13 RADIO');

  const getSaturacionColor = (ocupado: number, capacidad: number) => {
    const porcentaje = (ocupado / capacidad) * 100;
    if (porcentaje > 100) return { bg: 'bg-red-500', text: 'text-red-600', label: '🔴 Saturado' };
    if (porcentaje >= 95) return { bg: 'bg-amber-500', text: 'text-amber-600', label: '🟡 Casi lleno' };
    if (porcentaje >= 80) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: '🟡 Alto' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: '🟢 Disponible' };
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'PRIME': return 'bg-red-100 text-red-700 border-red-200';
      case 'AUSPICIO': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REPARTIDO': return 'bg-green-100 text-green-700 border-green-200';
      case 'MENCIONES': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSlotClick = (slotId: string, ctrlKey: boolean) => {
    if (ctrlKey) {
      setSlotsSeleccionados(prev => 
        prev.includes(slotId) ? prev.filter(s => s !== slotId) : [...prev, slotId]
      );
    } else {
      setSlotsSeleccionados([slotId]);
    }
  };

  const handleMaterialDragStart = (material: MaterialDisponible) => {
    setDraggedMaterial(material);
  };

  const handleSlotDrop = (slotId: string, bloqueId: string) => {
    if (!draggedMaterial) return;

    const bloqueDestino = bloques.find(b => b.id === bloqueId);
    if (!bloqueDestino) return;

    // Validar tipo de bloque
    if (bloqueDestino.tipo === 'REPARTIDO' && draggedMaterial.anunciante.includes('BANCO')) {
      setAlertaActiva({
        tipo: 'tipo_incompatible',
        mensaje: `El spot está marcado como PRIME pero lo estás moviendo a una tanda ${bloqueDestino.tipo}`,
        materialId: draggedMaterial.id,
        bloqueOrigenId: '',
        bloqueDestinoId: bloqueId
      });
      return;
    }

    // Asignar material al slot
    setBloques(prev => prev.map(bloque => {
      if (bloque.id !== bloqueId) return bloque;
      return {
        ...bloque,
        slots: bloque.slots.map(slot => {
          if (slot.id !== slotId) return slot;
          return {
            ...slot,
            materialId: draggedMaterial.id,
            materialCodigo: draggedMaterial.codigo,
            materialNombre: draggedMaterial.nombre,
            estado: 'asignado' as const
          };
        })
      };
    }));

    setDraggedMaterial(null);
  };

  const handleEliminarSeleccion = () => {
    setBloques(prev => prev.map(bloque => ({
      ...bloque,
      slots: bloque.slots.map(slot => {
        if (!slotsSeleccionados.includes(slot.id)) return slot;
        return { ...slot, materialId: undefined, materialCodigo: undefined, materialNombre: undefined, estado: 'vacio' as const };
      })
    })));
    setSlotsSeleccionados([]);
  };

  const bloqueActivo = bloques.find(b => b.id === bloqueSeleccionado);
  const totalCapacidad = bloqueActivo?.capacidadSegundos || 300;
  const totalOcupado = bloqueActivo?.ocupadoSegundos || 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">Centro de Comando Programación</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Calendar className="w-3 h-3" />
            {fechaActual}
          </Badge>
          <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200">
            <Radio className="w-3 h-3" />
            {emisoraActual}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Settings className="w-4 h-4" />
            Config
          </Button>
        </div>
      </div>

      {/* 3 Columnas */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMNA IZQUIERDA: Bloques */}
        <div className="w-64 border-r bg-white overflow-y-auto">
          <div className="p-3 border-b bg-slate-50 sticky top-0 z-10">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              📊 BLOQUES
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {bloques.map(bloque => {
              const saturacion = getSaturacionColor(bloque.ocupadoSegundos, bloque.capacidadSegundos);
              const porcentaje = Math.round((bloque.ocupadoSegundos / bloque.capacidadSegundos) * 100);
              const isSelected = bloque.id === bloqueSeleccionado;
              
              return (
                <button
                  key={bloque.id}
                  onClick={() => setBloqueSeleccionado(bloque.id)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all
                    ${isSelected ? 'bg-blue-50 border-2 border-blue-400 shadow-sm' : 'bg-white border border-gray-100 hover:border-blue-200'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-gray-900">⏰ {bloque.hora}</span>
                    <div className={`w-3 h-3 rounded-full ${saturacion.bg}`} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">📊 {bloque.ocupadoSegundos}s/{bloque.capacidadSegundos}s</span>
                    <span className={saturacion.text}>{porcentaje}%</span>
                  </div>
                  <div className="mt-1">
                    <Badge className={`text-[10px] ${getTipoColor(bloque.tipo)}`}>
                      {bloque.tipo}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {saturacion.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMNA CENTRAL: Programación */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 border-b bg-slate-50 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                🎯 PROGRAMACIÓN ASIGNADA
              </h3>
              <div className="flex items-center gap-2">
                {slotsSeleccionados.length > 0 && (
                  <Badge className="bg-blue-600">{slotsSeleccionados.length} seleccionados</Badge>
                )}
              </div>
            </div>
          </div>

          {bloqueActivo && (
            <div className="p-4">
              {/* Header del bloque */}
              <Card className={`p-4 mb-4 border-l-4 ${
                bloqueActivo.tipo === 'PRIME' ? 'border-l-red-500 bg-red-50/30' :
                bloqueActivo.tipo === 'AUSPICIO' ? 'border-l-blue-500 bg-blue-50/30' :
                'border-l-green-500 bg-green-50/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      {bloqueActivo.tipo === 'PRIME' ? '🔴' : bloqueActivo.tipo === 'AUSPICIO' ? '🔵' : '🟢'} {bloqueActivo.tipo} ({bloqueActivo.ocupadoSegundos}s)
                    </h4>
                    <p className="text-sm text-gray-500">Bloque {bloqueActivo.hora}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{totalOcupado}s/{totalCapacidad}s</p>
                    <p className={`text-sm ${getSaturacionColor(totalOcupado, totalCapacidad).text}`}>
                      Disponible: {totalCapacidad - totalOcupado}s
                    </p>
                  </div>
                </div>
              </Card>

              {/* Lista de slots */}
              <div className="space-y-2">
                {bloqueActivo.slots.map((slot, idx) => (
                  <div
                    key={slot.id}
                    onClick={(e) => handleSlotClick(slot.id, e.ctrlKey)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleSlotDrop(slot.id, bloqueActivo.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${slotsSeleccionados.includes(slot.id) ? 'border-blue-500 bg-blue-50 shadow-md' : 
                        slot.estado === 'vacio' ? 'border-dashed border-gray-300 bg-gray-50/50 hover:border-blue-300' :
                        slot.estado === 'conflicto' ? 'border-red-300 bg-red-50' :
                        'border-gray-200 bg-white hover:border-blue-200'
                      }
                    `}
                  >
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                      {idx + 1}.
                    </span>
                    
                    {slot.estado === 'vacio' ? (
                      <div className="flex-1 text-center py-2">
                        <span className="text-gray-400">[VACÍO] - {slot.duracion}s</span>
                        <p className="text-xs text-gray-300">Arrastra un material aquí</p>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {slot.materialCodigo}
                          </Badge>
                          <span className="font-medium text-gray-900">{slot.materialNombre}</span>
                          <span className="text-gray-400">- {slot.duracion}s</span>
                        </div>
                        {slot.posicionFija && (
                          <Badge className="mt-1 text-xs bg-purple-100 text-purple-700">
                            📍 Posición: {slot.posicionFija}
                          </Badge>
                        )}
                      </div>
                    )}

                    {slot.estado === 'conflicto' && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    {slot.estado === 'asignado' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                ))}
              </div>

              {/* Resumen */}
              <div className="mt-4 p-3 bg-slate-100 rounded-lg text-sm text-gray-600">
                📊 <strong>TOTAL BLOQUE:</strong> {totalOcupado}s/{totalCapacidad}s • 
                {totalCapacidad - totalOcupado > 0 ? (
                  <span className="text-emerald-600"> 🟢 Disponible: {totalCapacidad - totalOcupado}s</span>
                ) : (
                  <span className="text-red-600"> 🔴 Saturado</span>
                )}
              </div>

              {/* Tip selección múltiple */}
              <p className="mt-2 text-xs text-gray-400 text-center">
                🎯 Seleccionar múltiple: Ctrl+Click para varios • Shift+Click para rango
              </p>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Materiales y Herramientas */}
        <div className="w-72 border-l bg-white overflow-y-auto">
          <div className="p-3 border-b bg-slate-50 sticky top-0 z-10">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Music className="w-4 h-4" />
              🎵 MATERIALES DISP
            </h3>
          </div>

          {/* Lista de materiales */}
          <div className="p-2 space-y-1 border-b">
            {materiales.map(material => (
              <div
                key={material.id}
                draggable={material.estado === 'disponible'}
                onDragStart={() => handleMaterialDragStart(material)}
                className={`
                  p-2 rounded-lg border transition-all cursor-grab
                  ${material.estado === 'disponible' 
                    ? 'bg-white hover:bg-blue-50 hover:border-blue-300 active:cursor-grabbing' 
                    : 'bg-gray-50 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {material.codigo}
                  </Badge>
                  <span className="text-xs text-gray-500">{material.duracion}s</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate mt-1">
                  {material.anunciante}
                </p>
              </div>
            ))}
          </div>

          {/* Herramientas */}
          <div className="p-3 border-b">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">🔧 HERRAMIENTAS</h4>
            <div className="space-y-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 text-red-600"
                onClick={handleEliminarSeleccion}
                disabled={slotsSeleccionados.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                ❌ Eliminar Selec
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Link2 className="w-4 h-4" />
                🔗 Crear Unidas
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Trash2 className="w-4 h-4" />
                ❌ Cancelar Unidas
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Replace className="w-4 h-4" />
                📎 Sustituir Cuñas
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Unlock className="w-4 h-4" />
                🔓 Liberar Cuñas
              </Button>
            </div>
          </div>

          {/* Posiciones */}
          <div className="p-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">📍 POSICIONES</h4>
            <div className="space-y-1">
              {POSICIONES_FIJAS.map(pos => (
                <Button 
                  key={pos.id}
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  {pos.label}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2 gap-1">
                <Settings className="w-4 h-4" />
                ⚙️ Aplicar Posición
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Alerta de Movimiento */}
      <Dialog open={!!alertaActiva} onOpenChange={() => setAlertaActiva(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              🚨 ALERTA DE MOVIMIENTO
            </DialogTitle>
          </DialogHeader>
          {alertaActiva && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-medium text-amber-800">⚠️ MOVIMIENTO INAPROPIADO DETECTADO</p>
                <p className="text-sm text-amber-700 mt-2">{alertaActiva.mensaje}</p>
              </div>
              
              <p className="text-sm text-gray-600">
                💡 El spot está marcado como PRIME pero lo estás moviendo a una tanda REPARTIDO
              </p>

              <div className="text-sm text-gray-500">❓ ¿Qué deseas hacer?</div>

              <div className="space-y-2">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => setAlertaActiva(null)}
                >
                  🔧 FORZAR INGRESO
                  <span className="text-xs ml-2 opacity-70">Permite movimiento ignorando tipo</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setAlertaActiva(null)}
                >
                  ❌ CANCELAR MOVIMIENTO
                  <span className="text-xs ml-2 opacity-70">Mantiene spot en ubicación original</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-600"
                  onClick={() => setAlertaActiva(null)}
                >
                  🎯 CAMBIAR TIPO SPOT
                  <span className="text-xs ml-2 opacity-70">Modifica tipo a REPARTIDO</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CentroComandoVisual;
