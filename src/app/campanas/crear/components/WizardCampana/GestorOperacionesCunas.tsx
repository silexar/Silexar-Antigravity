/**
 * 🔧 SILEXAR PULSE - Gestor de Operaciones de Cuñas 2050
 * 
 * @description Panel unificado para TODAS las operaciones sobre cuñas:
 * Cancelar, Reemplazar, Liberar espacio, Duplicar, Mover, Deshacer
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  XCircle,
  RefreshCw,
  Unlock,
  Copy,
  ArrowRightLeft,
  Undo2,
  Redo2,
  Music,
  AlertTriangle,
  Clock,
  History
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CunaEnProgramacion {
  id: string;
  cunaId: string;
  cunaCodigo: string;
  cunaNombre: string;
  lineaId: string;
  lineaNombre: string;
  spotsProgramados: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface AccionHistorial {
  id: string;
  tipo: 'asignar' | 'cancelar' | 'reemplazar' | 'mover' | 'duplicar';
  descripcion: string;
  timestamp: Date;
  usuario: string;
  revertible: boolean;
  datos: Record<string, unknown>;
}

interface GestorOperacionesCunasProps {
  cunaActual?: CunaEnProgramacion;
  cunasDisponibles: { id: string; codigo: string; nombre: string; duracion: number }[];
  lineasDisponibles: { id: string; nombre: string }[];
  historial: AccionHistorial[];
  onCancelar: (config: CancelarConfig) => void;
  onReemplazar: (config: ReemplazarConfig) => void;
  onLiberar: (config: LiberarConfig) => void;
  onDuplicar: (config: DuplicarConfig) => void;
  onMover: (config: MoverConfig) => void;
  onDeshacer: (accionId: string) => void;
}

interface CancelarConfig {
  cunaId: string;
  modo: 'todos' | 'rango' | 'futuros' | 'seleccion';
  fechaInicio?: string;
  fechaFin?: string;
  spotIds?: string[];
  motivo: string;
  liberarEspacio: boolean;
}

interface ReemplazarConfig {
  cunaOrigenId: string;
  cunaDestinoId: string;
  modo: 'todos' | 'futuros' | 'rango';
  fechaInicio?: string;
  fechaFin?: string;
}

interface LiberarConfig {
  cunaId: string;
  accion: 'liberar' | 'bloquear' | 'reasignar';
  cunaReasignarId?: string;
}

interface DuplicarConfig {
  cunaId: string;
  lineaOrigenId: string;
  lineasDestinoIds: string[];
  copiarCunas: boolean;
  copiarHorarios: boolean;
  copiarSpots: boolean;
}

interface MoverConfig {
  cunaId: string;
  lineaOrigenId: string;
  lineaDestinoId: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const GestorOperacionesCunas: React.FC<GestorOperacionesCunasProps> = ({
  cunaActual,
  cunasDisponibles,
  lineasDisponibles,
  historial = [],
  onCancelar,
  onReemplazar,
  onLiberar,
  onDuplicar,
  onMover,
  onDeshacer
}) => {
  const [tabActiva, setTabActiva] = useState('cancelar');
  
  // Estado para Cancelar
  const [modoCancelar, setModoCancelar] = useState<'todos' | 'rango' | 'futuros'>('futuros');
  const [motivoCancelar, setMotivoCancelar] = useState('');
  const [liberarEspacioCancelar, setLiberarEspacioCancelar] = useState(true);
  const [fechaInicioCancelar, setFechaInicioCancelar] = useState('');
  const [fechaFinCancelar, setFechaFinCancelar] = useState('');

  // Estado para Reemplazar
  const [cunaReemplazo, setCunaReemplazo] = useState('');
  const [modoReemplazar, setModoReemplazar] = useState<'todos' | 'futuros' | 'rango'>('futuros');

  // Estado para Liberar
  const [accionLiberar, setAccionLiberar] = useState<'liberar' | 'bloquear' | 'reasignar'>('liberar');
  const [cunaReasignar, setCunaReasignar] = useState('');

  // Estado para Duplicar
  const [lineasDestino, setLineasDestino] = useState<string[]>([]);
  const [opcionesDuplicar, setOpcionesDuplicar] = useState({
    cunas: true,
    horarios: true,
    spots: true
  });

  // Estado para Mover
  const [lineaDestino, setLineaDestino] = useState('');

  // Handlers
  const handleCancelar = () => {
    if (!cunaActual) return;
    onCancelar({
      cunaId: cunaActual.cunaId,
      modo: modoCancelar,
      fechaInicio: modoCancelar === 'rango' ? fechaInicioCancelar : undefined,
      fechaFin: modoCancelar === 'rango' ? fechaFinCancelar : undefined,
      motivo: motivoCancelar,
      liberarEspacio: liberarEspacioCancelar
    });
  };

  const handleReemplazar = () => {
    if (!cunaActual || !cunaReemplazo) return;
    onReemplazar({
      cunaOrigenId: cunaActual.cunaId,
      cunaDestinoId: cunaReemplazo,
      modo: modoReemplazar
    });
  };

  const handleLiberar = () => {
    if (!cunaActual) return;
    onLiberar({
      cunaId: cunaActual.cunaId,
      accion: accionLiberar,
      cunaReasignarId: accionLiberar === 'reasignar' ? cunaReasignar : undefined
    });
  };

  const handleDuplicar = () => {
    if (!cunaActual || lineasDestino.length === 0) return;
    onDuplicar({
      cunaId: cunaActual.cunaId,
      lineaOrigenId: cunaActual.lineaId,
      lineasDestinoIds: lineasDestino,
      copiarCunas: opcionesDuplicar.cunas,
      copiarHorarios: opcionesDuplicar.horarios,
      copiarSpots: opcionesDuplicar.spots
    });
  };

  const handleMover = () => {
    if (!cunaActual || !lineaDestino) return;
    onMover({
      cunaId: cunaActual.cunaId,
      lineaOrigenId: cunaActual.lineaId,
      lineaDestinoId: lineaDestino
    });
  };

  const toggleLineaDestino = (lineaId: string) => {
    setLineasDestino(prev => 
      prev.includes(lineaId) 
        ? prev.filter(id => id !== lineaId)
        : [...prev, lineaId]
    );
  };

  return (
    <Card className="p-4 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">🔧 Operaciones de Cuña</h3>
          {cunaActual && (
            <p className="text-sm text-gray-500">{cunaActual.cunaCodigo} - {cunaActual.cunaNombre}</p>
          )}
        </div>
      </div>

      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="cancelar" className="gap-1 text-xs">
            <XCircle className="w-3 h-3" />
            Cancelar
          </TabsTrigger>
          <TabsTrigger value="reemplazar" className="gap-1 text-xs">
            <RefreshCw className="w-3 h-3" />
            Reemplazar
          </TabsTrigger>
          <TabsTrigger value="liberar" className="gap-1 text-xs">
            <Unlock className="w-3 h-3" />
            Liberar
          </TabsTrigger>
          <TabsTrigger value="duplicar" className="gap-1 text-xs">
            <Copy className="w-3 h-3" />
            Duplicar
          </TabsTrigger>
          <TabsTrigger value="mover" className="gap-1 text-xs">
            <ArrowRightLeft className="w-3 h-3" />
            Mover
          </TabsTrigger>
          <TabsTrigger value="historial" className="gap-1 text-xs">
            <History className="w-3 h-3" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* CANCELAR */}
        <TabsContent value="cancelar" className="space-y-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-700">Cancelar Cuña de Programación</h4>
            </div>
            <p className="text-sm text-red-600">
              Spots programados: <strong>{cunaActual?.spotsProgramados || 0}</strong>
            </p>
          </div>

          <RadioGroup value={modoCancelar} onValueChange={(v) => setModoCancelar(v as typeof modoCancelar)}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="todos" id="todos" />
                <Label htmlFor="todos">Cancelar TODOS los spots de esta cuña</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="futuros" id="futuros" />
                <Label htmlFor="futuros">Cancelar spots desde hoy en adelante</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="rango" id="rango" />
                <Label htmlFor="rango">Cancelar spots en rango de fechas</Label>
              </div>
            </div>
          </RadioGroup>

          {modoCancelar === 'rango' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Desde</Label>
                <Input 
                  type="date" 
                  value={fechaInicioCancelar}
                  onChange={(e) => setFechaInicioCancelar(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hasta</Label>
                <Input 
                  type="date"
                  value={fechaFinCancelar}
                  onChange={(e) => setFechaFinCancelar(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Motivo de cancelación</Label>
            <Textarea
              placeholder="Ingrese el motivo..."
              value={motivoCancelar}
              onChange={(e) => setMotivoCancelar(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label>Liberar espacio para reasignar</Label>
            <Switch 
              checked={liberarEspacioCancelar}
              onCheckedChange={setLiberarEspacioCancelar}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">Esta acción quedará registrada en el historial</span>
          </div>

          <Button onClick={handleCancelar} className="w-full gap-2 bg-red-600 hover:bg-red-700">
            <XCircle className="w-4 h-4" />
            Cancelar Cuña
          </Button>
        </TabsContent>

        {/* REEMPLAZAR */}
        <TabsContent value="reemplazar" className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-700">Reemplazar Cuña</h4>
            </div>
            <p className="text-sm text-blue-600">
              Cuña actual: <strong>{cunaActual?.cunaCodigo}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Reemplazar por:</Label>
            <Select value={cunaReemplazo} onValueChange={setCunaReemplazo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuña de reemplazo..." />
              </SelectTrigger>
              <SelectContent>
                {cunasDisponibles
                  .filter(c => c.id !== cunaActual?.cunaId)
                  .map(cuna => (
                    <SelectItem key={cuna.id} value={cuna.id}>
                      {cuna.codigo} - {cuna.nombre} ({cuna.duracion}s)
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <RadioGroup value={modoReemplazar} onValueChange={(v) => setModoReemplazar(v as typeof modoReemplazar)}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todos" id="remp_todos" />
                <Label htmlFor="remp_todos">Todos los spots programados</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="futuros" id="remp_futuros" />
                <Label htmlFor="remp_futuros">Solo spots futuros (desde hoy)</Label>
              </div>
            </div>
          </RadioGroup>

          <Button onClick={handleReemplazar} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4" />
            Aplicar Reemplazo
          </Button>
        </TabsContent>

        {/* LIBERAR */}
        <TabsContent value="liberar" className="space-y-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-700">Liberar Espacio en Parrilla</h4>
            </div>
          </div>

          <RadioGroup value={accionLiberar} onValueChange={(v) => setAccionLiberar(v as typeof accionLiberar)}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value="liberar" id="lib_liberar" />
                <div>
                  <Label htmlFor="lib_liberar" className="font-medium">Liberar para venta</Label>
                  <p className="text-xs text-gray-500">El espacio quedará disponible</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value="bloquear" id="lib_bloquear" />
                <div>
                  <Label htmlFor="lib_bloquear" className="font-medium">Mantener bloqueado</Label>
                  <p className="text-xs text-gray-500">El espacio permanece reservado</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value="reasignar" id="lib_reasignar" />
                <div>
                  <Label htmlFor="lib_reasignar" className="font-medium">Asignar a otra cuña</Label>
                  <p className="text-xs text-gray-500">Reemplazar inmediatamente</p>
                </div>
              </div>
            </div>
          </RadioGroup>

          {accionLiberar === 'reasignar' && (
            <Select value={cunaReasignar} onValueChange={setCunaReasignar}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuña..." />
              </SelectTrigger>
              <SelectContent>
                {cunasDisponibles.map(cuna => (
                  <SelectItem key={cuna.id} value={cuna.id}>
                    {cuna.codigo} - {cuna.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button onClick={handleLiberar} className="w-full gap-2 bg-green-600 hover:bg-green-700">
            <Unlock className="w-4 h-4" />
            Liberar Espacio
          </Button>
        </TabsContent>

        {/* DUPLICAR */}
        <TabsContent value="duplicar" className="space-y-4">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-700">Duplicar Línea a Otras Emisoras</h4>
            </div>
            <p className="text-sm text-purple-600">
              Origen: <strong>{cunaActual?.lineaNombre}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Copiar a:</Label>
            <div className="grid grid-cols-2 gap-2">
              {lineasDisponibles
                .filter(l => l.id !== cunaActual?.lineaId)
                .map(linea => (
                  <div
                    key={linea.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      lineasDestino.includes(linea.id) 
                        ? 'border-purple-400 bg-purple-50' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => toggleLineaDestino(linea.id)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lineasDestino.includes(linea.id)}
                        readOnly
                        className="rounded"
                      />
                      <span className="text-sm">{linea.nombre}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">¿Qué copiar?</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cuñas asignadas</span>
                <Switch 
                  checked={opcionesDuplicar.cunas}
                  onCheckedChange={(v) => setOpcionesDuplicar(prev => ({ ...prev, cunas: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Horarios</span>
                <Switch 
                  checked={opcionesDuplicar.horarios}
                  onCheckedChange={(v) => setOpcionesDuplicar(prev => ({ ...prev, horarios: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cantidad de spots</span>
                <Switch 
                  checked={opcionesDuplicar.spots}
                  onCheckedChange={(v) => setOpcionesDuplicar(prev => ({ ...prev, spots: v }))}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleDuplicar} 
            disabled={lineasDestino.length === 0}
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Copy className="w-4 h-4" />
            Duplicar a {lineasDestino.length} línea(s)
          </Button>
        </TabsContent>

        {/* MOVER */}
        <TabsContent value="mover" className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              <h4 className="font-medium text-amber-700">Mover Cuña a Otra Línea</h4>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mover a línea:</Label>
            <Select value={lineaDestino} onValueChange={setLineaDestino}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar línea destino..." />
              </SelectTrigger>
              <SelectContent>
                {lineasDisponibles
                  .filter(l => l.id !== cunaActual?.lineaId)
                  .map(linea => (
                    <SelectItem key={linea.id} value={linea.id}>
                      {linea.nombre}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleMover}
            disabled={!lineaDestino}
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Mover Cuña
          </Button>
        </TabsContent>

        {/* HISTORIAL */}
        <TabsContent value="historial" className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">Historial de Acciones</h4>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="gap-1">
                <Undo2 className="w-3 h-3" />
                Deshacer
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Redo2 className="w-3 h-3" />
                Rehacer
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {historial.map(accion => (
              <div key={accion.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{accion.descripcion}</p>
                    <p className="text-xs text-gray-500">
                      {accion.timestamp.toLocaleTimeString()} - {accion.usuario}
                    </p>
                  </div>
                </div>
                {accion.revertible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Deshacer"
                    onClick={() => onDeshacer(accion.id)}
                    className="text-blue-600"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {historial.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <History className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay acciones recientes</p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Use Ctrl+Z para deshacer la última acción
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default GestorOperacionesCunas;
