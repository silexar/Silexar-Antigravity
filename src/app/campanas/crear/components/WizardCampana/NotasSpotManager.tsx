/**
 * 📝 SILEXAR PULSE - Sistema de Notas por Spot 2050
 * 
 * @description Componente para agregar notas e instrucciones
 * especiales a cada spot individual de la programación.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  AlertTriangle,
  Info,
  Star,
  Flag,
  Save,
  Plus,
  Trash2,
  Pin,
  Eye,
  Edit2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoNota = 'instruccion' | 'alerta' | 'info' | 'prioridad' | 'ubicacion';

export interface NotaSpot {
  id: string;
  spotId: string;
  tipo: TipoNota;
  titulo: string;
  contenido: string;
  prioridad: 'alta' | 'media' | 'baja';
  visibleEnLog: boolean;
  fijada: boolean;
  creadoPor: string;
  fechaCreacion: Date;
  modificadoPor?: string;
  fechaModificacion?: Date;
}

export interface SpotConNotas {
  id: string;
  cunaCodigo: string;
  cunaNombre: string;
  anunciante: string;
  horaEmision: string;
  notas: NotaSpot[];
}

interface NotasSpotManagerProps {
  spot: SpotConNotas;
  onAgregarNota: (nota: Omit<NotaSpot, 'id' | 'fechaCreacion' | 'creadoPor'>) => void;
  onEditarNota: (nota: NotaSpot) => void;
  onEliminarNota: (notaId: string) => void;
  usuarioActual: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const TIPOS_NOTA = [
  { id: 'instruccion', label: 'Instrucción', icon: MessageSquare, color: 'bg-blue-100 text-blue-700' },
  { id: 'alerta', label: 'Alerta', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  { id: 'info', label: 'Información', icon: Info, color: 'bg-gray-100 text-gray-700' },
  { id: 'prioridad', label: 'Prioridad', icon: Star, color: 'bg-amber-100 text-amber-700' },
  { id: 'ubicacion', label: 'Ubicación', icon: Flag, color: 'bg-green-100 text-green-700' }
];

const INSTRUCCIONES_RAPIDAS = [
  'Emitir AL INICIO del bloque',
  'Emitir AL FINAL del bloque',
  'NO emitir junto a competencia',
  'Requiere separación de 15 min',
  'Confirmar con cliente antes de emitir',
  'Cuña sensible - revisar antes',
  'Programa en vivo - coordinar con locutor',
  'Horario especial - verificar disponibilidad'
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const NotasSpotManager: React.FC<NotasSpotManagerProps> = ({
  spot,
  onAgregarNota,
  onEditarNota,
  onEliminarNota,
  usuarioActual
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [editandoNota, setEditandoNota] = useState<NotaSpot | null>(null);
  
  // Form state
  const [tipo, setTipo] = useState<TipoNota>('instruccion');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [prioridad, setPrioridad] = useState<'alta' | 'media' | 'baja'>('media');
  const [visibleEnLog, setVisibleEnLog] = useState(true);
  const [fijada, setFijada] = useState(false);

  // Obtener config de tipo
  const getTipoConfig = (tipoId: TipoNota) => {
    return TIPOS_NOTA.find(t => t.id === tipoId) || TIPOS_NOTA[0];
  };

  // Abrir para nueva nota
  const abrirNuevaNota = () => {
    setEditandoNota(null);
    setTipo('instruccion');
    setTitulo('');
    setContenido('');
    setPrioridad('media');
    setVisibleEnLog(true);
    setFijada(false);
    setDialogoAbierto(true);
  };

  // Abrir para editar
  const abrirEditarNota = (nota: NotaSpot) => {
    setEditandoNota(nota);
    setTipo(nota.tipo);
    setTitulo(nota.titulo);
    setContenido(nota.contenido);
    setPrioridad(nota.prioridad);
    setVisibleEnLog(nota.visibleEnLog);
    setFijada(nota.fijada);
    setDialogoAbierto(true);
  };

  // Guardar nota
  const handleGuardar = () => {
    if (!titulo.trim()) return;

    if (editandoNota) {
      onEditarNota({
        ...editandoNota,
        tipo,
        titulo,
        contenido,
        prioridad,
        visibleEnLog,
        fijada,
        modificadoPor: usuarioActual,
        fechaModificacion: new Date()
      });
    } else {
      onAgregarNota({
        spotId: spot.id,
        tipo,
        titulo,
        contenido,
        prioridad,
        visibleEnLog,
        fijada
      });
    }

    setDialogoAbierto(false);
  };

  // Aplicar instrucción rápida
  const aplicarRapida = (instruccion: string) => {
    setTitulo(instruccion);
    setContenido('');
    setTipo('instruccion');
  };

  // Ordenar notas (fijadas primero, luego por prioridad)
  const notasOrdenadas = [...spot.notas].sort((a, b) => {
    if (a.fijada !== b.fijada) return a.fijada ? -1 : 1;
    const prioridadOrder = { alta: 0, media: 1, baja: 2 };
    return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
  });

  return (
    <div>
      {/* Header con indicador de notas */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Notas del Spot
          </span>
          {spot.notas.length > 0 && (
            <Badge className="bg-blue-100 text-blue-700">{spot.notas.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={abrirNuevaNota} className="gap-1">
          <Plus className="w-3 h-3" />
          Agregar Nota
        </Button>
      </div>

      {/* Lista de notas */}
      <div className="space-y-2">
        {notasOrdenadas.map(nota => {
          const tipoConfig = getTipoConfig(nota.tipo);
          const IconoTipo = tipoConfig.icon;

          return (
            <Card key={nota.id} className={`p-3 ${nota.fijada ? 'border-l-4 border-l-amber-400' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <div className={`p-1.5 rounded ${tipoConfig.color}`}>
                    <IconoTipo className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{nota.titulo}</span>
                      {nota.fijada && <Pin className="w-3 h-3 text-amber-500" />}
                      {nota.prioridad === 'alta' && (
                        <Badge className="bg-red-100 text-red-700 text-xs">Alta</Badge>
                      )}
                    </div>
                    {nota.contenido && (
                      <p className="text-xs text-gray-500 mt-1">{nota.contenido}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{nota.creadoPor}</span>
                      <span>•</span>
                      <span>{nota.fechaCreacion.toLocaleString()}</span>
                      {nota.visibleEnLog && (
                        <>
                          <span>•</span>
                          <Eye className="w-3 h-3" />
                          <span>Visible en log</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => abrirEditarNota(nota)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500"
                    onClick={() => onEliminarNota(nota.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {spot.notas.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay notas para este spot</p>
          </div>
        )}
      </div>

      {/* Diálogo de edición */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {editandoNota ? 'Editar Nota' : 'Nueva Nota'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Spot info */}
            <div className="p-2 bg-gray-50 rounded text-sm">
              <span className="font-medium">{spot.cunaCodigo}</span>
              <span className="text-gray-500"> - {spot.cunaNombre}</span>
            </div>

            {/* Tipo de nota */}
            <div className="space-y-2">
              <Label>Tipo de nota</Label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_NOTA.map(t => {
                  const Icono = t.icon;
                  return (
                    <Button
                      key={t.id}
                      variant={tipo === t.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipo(t.id as TipoNota)}
                      className="gap-1"
                    >
                      <Icono className="w-3 h-3" />
                      {t.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Instrucciones rápidas */}
            {!editandoNota && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Instrucciones rápidas</Label>
                <div className="flex flex-wrap gap-1">
                  {INSTRUCCIONES_RAPIDAS.map(inst => (
                    <Badge
                      key={inst}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 text-xs"
                      onClick={() => aplicarRapida(inst)}
                    >
                      {inst}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Título */}
            <div className="space-y-2">
              <Label>Título / Instrucción</Label>
              <Input
                placeholder="Ej: Emitir al inicio del bloque"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <Label>Detalle (opcional)</Label>
              <Textarea
                placeholder="Información adicional..."
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                rows={2}
              />
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={(v) => setPrioridad(v as 'alta' | 'media' | 'baja')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                  <SelectItem value="media">🟡 Media</SelectItem>
                  <SelectItem value="baja">🟢 Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opciones */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visible en log de emisión</Label>
                <Switch checked={visibleEnLog} onCheckedChange={setVisibleEnLog} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Fijar nota (siempre arriba)</Label>
                <Switch checked={fijada} onCheckedChange={setFijada} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={!titulo.trim()} className="gap-1">
              <Save className="w-4 h-4" />
              {editandoNota ? 'Guardar Cambios' : 'Crear Nota'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotasSpotManager;
