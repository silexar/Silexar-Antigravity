/**
 * 🎯 SILEXAR PULSE - Panel de Acciones Bulk Masivas 2050
 * 
 * @description Panel para ejecutar operaciones masivas sobre
 * múltiples cuñas, spots o líneas seleccionadas.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  XCircle,
  RefreshCw,
  Copy,
  Trash2,
  ArrowRightLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Music
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ElementoSeleccionable {
  id: string;
  tipo: 'cuna' | 'spot' | 'linea';
  codigo: string;
  nombre: string;
  anunciante?: string;
  duracion?: number;
  estado?: string;
  seleccionado: boolean;
}

export type AccionBulk = 
  | 'cancelar' 
  | 'reemplazar' 
  | 'duplicar' 
  | 'mover' 
  | 'cambiar_estado'
  | 'extender_vigencia'
  | 'eliminar';

interface AccionBulkConfig {
  id: AccionBulk;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  confirmacion: boolean;
  parametros?: string[];
}

interface PanelBulkOperacionesProps {
  elementos: ElementoSeleccionable[];
  onSeleccionarTodo: () => void;
  onDeseleccionarTodo: () => void;
  onToggleSeleccion: (id: string) => void;
  onEjecutarAccion: (accion: AccionBulk, elementosIds: string[], parametros: Record<string, unknown>) => Promise<void>;
  cunasReemplazo?: { id: string; codigo: string; nombre: string }[];
  lineasDestino?: { id: string; nombre: string }[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const ACCIONES_BULK: AccionBulkConfig[] = [
  { id: 'cancelar', label: 'Cancelar', icon: XCircle, color: 'bg-red-600', confirmacion: true },
  { id: 'reemplazar', label: 'Reemplazar', icon: RefreshCw, color: 'bg-blue-600', confirmacion: true, parametros: ['cunaReemplazo'] },
  { id: 'duplicar', label: 'Duplicar', icon: Copy, color: 'bg-purple-600', confirmacion: false, parametros: ['lineasDestino'] },
  { id: 'mover', label: 'Mover', icon: ArrowRightLeft, color: 'bg-amber-600', confirmacion: true, parametros: ['lineaDestino'] },
  { id: 'extender_vigencia', label: 'Extender Vigencia', icon: Calendar, color: 'bg-green-600', confirmacion: false, parametros: ['nuevaFecha'] },
  { id: 'eliminar', label: 'Eliminar', icon: Trash2, color: 'bg-red-700', confirmacion: true }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const PanelBulkOperaciones: React.FC<PanelBulkOperacionesProps> = ({
  elementos,
  onSeleccionarTodo,
  onDeseleccionarTodo,
  onToggleSeleccion,
  onEjecutarAccion,
  cunasReemplazo = [],
  lineasDestino = []
}) => {
  const [accionActiva, setAccionActiva] = useState<AccionBulk | null>(null);
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState(false);
  const [ejecutando, setEjecutando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState<{ exito: number; error: number } | null>(null);
  
  // Parámetros de acción
  const [cunaReemplazo, setCunaReemplazo] = useState('');
  const [lineaDestino, setLineaDestino] = useState('');
  const [lineasSeleccionadas, setLineasSeleccionadas] = useState<string[]>([]);
  const [nuevaFecha, setNuevaFecha] = useState('');

  // Elementos seleccionados
  const seleccionados = useMemo(() => 
    elementos.filter(e => e.seleccionado),
    [elementos]
  );

  const todosSeleccionados = seleccionados.length === elementos.length;
  const algunoSeleccionado = seleccionados.length > 0;

  // Obtener config de acción
  const getAccionConfig = (id: AccionBulk) => 
    ACCIONES_BULK.find(a => a.id === id);

  // Iniciar acción
  const iniciarAccion = (accion: AccionBulk) => {
    setAccionActiva(accion);
    setResultado(null);
    
    const config = getAccionConfig(accion);
    if (config?.confirmacion) {
      setDialogoConfirmacion(true);
    } else {
      setDialogoConfirmacion(true); // Para parametrizar
    }
  };

  // Ejecutar acción
  const ejecutarAccion = async () => {
    if (!accionActiva || seleccionados.length === 0) return;

    setEjecutando(true);
    setProgreso(0);

    const parametros: Record<string, unknown> = {};
    
    switch (accionActiva) {
      case 'reemplazar':
        parametros.cunaReemplazo = cunaReemplazo;
        break;
      case 'mover':
        parametros.lineaDestino = lineaDestino;
        break;
      case 'duplicar':
        parametros.lineasDestino = lineasSeleccionadas;
        break;
      case 'extender_vigencia':
        parametros.nuevaFecha = nuevaFecha;
        break;
    }

    try {
      // Simular progreso
      const total = seleccionados.length;
      for (let i = 0; i < total; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgreso(((i + 1) / total) * 100);
      }

      await onEjecutarAccion(
        accionActiva,
        seleccionados.map(e => e.id),
        parametros
      );

      setResultado({ exito: seleccionados.length, error: 0 });
    } catch {
      setResultado({ exito: 0, error: seleccionados.length });
    } finally {
      setEjecutando(false);
    }
  };

  // Cerrar y resetear
  const cerrarDialogo = () => {
    setDialogoConfirmacion(false);
    setAccionActiva(null);
    setProgreso(0);
    setResultado(null);
    setCunaReemplazo('');
    setLineaDestino('');
    setLineasSeleccionadas([]);
    setNuevaFecha('');
  };

  // Toggle línea destino
  const toggleLineaDestino = (lineaId: string) => {
    setLineasSeleccionadas(prev => 
      prev.includes(lineaId)
        ? prev.filter(id => id !== lineaId)
        : [...prev, lineaId]
    );
  };

  return (
    <div>
      {/* Barra de selección */}
      <Card className="p-3 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={todosSeleccionados}
              onCheckedChange={() => todosSeleccionados ? onDeseleccionarTodo() : onSeleccionarTodo()}
            />
            <span className="font-medium text-gray-700">
              {seleccionados.length > 0 
                ? `${seleccionados.length} de ${elementos.length} seleccionados`
                : 'Seleccionar elementos'
              }
            </span>
            {algunoSeleccionado && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeseleccionarTodo}
                className="text-xs"
              >
                Limpiar selección
              </Button>
            )}
          </div>

          {/* Acciones rápidas */}
          {algunoSeleccionado && (
            <div className="flex items-center gap-2">
              {ACCIONES_BULK.slice(0, 4).map(accion => {
                const Icono = accion.icon;
                return (
                  <Button
                    key={accion.id}
                    variant="outline"
                    size="sm"
                    onClick={() => iniciarAccion(accion.id)}
                    className="gap-1"
                  >
                    <Icono className="w-3 h-3" />
                    {accion.label}
                  </Button>
                );
              })}
              <Select onValueChange={(v) => iniciarAccion(v as AccionBulk)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Más..." />
                </SelectTrigger>
                <SelectContent>
                  {ACCIONES_BULK.slice(4).map(accion => {
                    const Icono = accion.icon;
                    return (
                      <SelectItem key={accion.id} value={accion.id}>
                        <div className="flex items-center gap-2">
                          <Icono className="w-4 h-4" />
                          {accion.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de elementos */}
      <div className="space-y-2">
        {elementos.map(elemento => (
          <Card 
            key={elemento.id}
            className={`p-3 cursor-pointer transition-all ${
              elemento.seleccionado 
                ? 'border-blue-400 bg-blue-50/50' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => onToggleSeleccion(elemento.id)}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={elemento.seleccionado}
                onCheckedChange={() => onToggleSeleccion(elemento.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Music className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{elemento.codigo}</span>
                  <span className="text-gray-500 text-sm truncate">{elemento.nombre}</span>
                </div>
                {elemento.anunciante && (
                  <span className="text-xs text-gray-400">{elemento.anunciante}</span>
                )}
              </div>
              {elemento.duracion && (
                <Badge variant="outline">{elemento.duracion}s</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Diálogo de confirmación/parámetros */}
      <Dialog open={dialogoConfirmacion} onOpenChange={cerrarDialogo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {accionActiva && (() => {
                const config = getAccionConfig(accionActiva);
                if (!config) return null;
                const Icono = config.icon;
                return (
                  <>
                    <Icono className="w-5 h-5" />
                    {config.label} - {seleccionados.length} elemento(s)
                  </>
                );
              })()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Ejecutando */}
            {ejecutando && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Procesando operación...</span>
                </div>
                <Progress value={progreso} />
                <p className="text-xs text-gray-500 text-center">
                  {Math.round(progreso)}% completado
                </p>
              </div>
            )}

            {/* Resultado */}
            {resultado && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                resultado.error === 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {resultado.error === 0 ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700">Operación completada</p>
                      <p className="text-sm text-green-600">
                        {resultado.exito} elemento(s) procesados exitosamente
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-700">Error en operación</p>
                      <p className="text-sm text-red-600">
                        {resultado.error} elemento(s) no pudieron ser procesados
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Parámetros según acción */}
            {!ejecutando && !resultado && (
              <>
                {/* Reemplazar */}
                {accionActiva === 'reemplazar' && (
                  <div className="space-y-2">
                    <Label>Reemplazar por:</Label>
                    <Select value={cunaReemplazo} onValueChange={setCunaReemplazo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuña de reemplazo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cunasReemplazo.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.codigo} - {c.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Mover */}
                {accionActiva === 'mover' && (
                  <div className="space-y-2">
                    <Label>Mover a línea:</Label>
                    <Select value={lineaDestino} onValueChange={setLineaDestino}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar línea destino..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lineasDestino.map(l => (
                          <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Duplicar */}
                {accionActiva === 'duplicar' && (
                  <div className="space-y-2">
                    <Label>Duplicar a líneas:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {lineasDestino.map(l => (
                        <div
                          key={l.id}
                          className={`p-2 border rounded cursor-pointer ${
                            lineasSeleccionadas.includes(l.id) 
                              ? 'border-blue-400 bg-blue-50' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => toggleLineaDestino(l.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox checked={lineasSeleccionadas.includes(l.id)} />
                            <span className="text-sm">{l.nombre}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extender vigencia */}
                {accionActiva === 'extender_vigencia' && (
                  <div className="space-y-2">
                    <Label>Nueva fecha de vigencia:</Label>
                    <Input
                      type="date"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                    />
                  </div>
                )}

                {/* Cancelar / Eliminar - solo confirmación */}
                {(accionActiva === 'cancelar' || accionActiva === 'eliminar') && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700">Confirmar acción</span>
                    </div>
                    <p className="text-sm text-red-600">
                      Esta acción afectará a {seleccionados.length} elemento(s). 
                      ¿Está seguro que desea continuar?
                    </p>
                  </div>
                )}

                {/* Lista de elementos afectados */}
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  <p className="text-xs text-gray-500 mb-2">Elementos seleccionados:</p>
                  {seleccionados.map(e => (
                    <div key={e.id} className="text-sm py-1 border-b last:border-0">
                      {e.codigo} - {e.nombre}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cerrarDialogo}>
              {resultado ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!resultado && (
              <Button
                onClick={ejecutarAccion}
                disabled={ejecutando}
                className={getAccionConfig(accionActiva!)?.color}
              >
                {ejecutando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Ejecutar ${getAccionConfig(accionActiva!)?.label}`
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PanelBulkOperaciones;
