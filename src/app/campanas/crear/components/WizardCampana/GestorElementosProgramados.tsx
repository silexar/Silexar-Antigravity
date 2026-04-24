/**
 * 🎛️ SILEXAR PULSE - Gestor de Elementos Programados 2050
 * 
 * @description Panel maestro para gestionar todos los elementos
 * programados (FM + Digital) con vista unificada, acciones masivas,
 * filtros avanzados y toolbar contextual.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Radio,
  Smartphone,
  Search,
  MoreVertical,
  Edit2,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Music,
  Mic,
  MessageSquare,
  Image as ImageIcon,
  Volume2,
  Video,
  Sparkles,
  Undo2,
  Redo2,
  List,
  Grid3X3,
  Calendar,
  Target,
  Zap,
  Shield,
  X
} from 'lucide-react';
import { useGestorElementosHibrido } from './hooks/useGestorElementosHibrido';
import type {
  ElementoProgramado,
  TipoContenido,
  MedioCampana,
  EstadoElemento
} from './types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface GestorElementosProps {
  campanaId: string;
  elementosIniciales?: ElementoProgramado[];
  onCambio?: (elementos: ElementoProgramado[]) => void;
  modoCompacto?: boolean;
}

type VistaActiva = 'tabla' | 'grid' | 'timeline';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const ICONOS_TIPO: Record<TipoContenido, React.ElementType> = {
  cuna: Music,
  mencion: Mic,
  frase: MessageSquare,
  auspicio: Shield,
  banner: ImageIcon,
  audio_ad: Volume2,
  video_ad: Video,
  rich_media: Sparkles,
  native_ad: Target
};

const COLORES_TIPO: Record<TipoContenido, string> = {
  cuna: 'bg-blue-100 text-blue-700',
  mencion: 'bg-purple-100 text-purple-700',
  frase: 'bg-violet-100 text-violet-700',
  auspicio: 'bg-amber-100 text-amber-700',
  banner: 'bg-green-100 text-green-700',
  audio_ad: 'bg-cyan-100 text-cyan-700',
  video_ad: 'bg-pink-100 text-pink-700',
  rich_media: 'bg-indigo-100 text-indigo-700',
  native_ad: 'bg-orange-100 text-orange-700'
};

const COLORES_ESTADO: Record<EstadoElemento, { bg: string; text: string; icono: React.ElementType }> = {
  borrador: { bg: 'bg-gray-100', text: 'text-gray-600', icono: Edit2 },
  programado: { bg: 'bg-blue-100', text: 'text-blue-700', icono: Clock },
  activo: { bg: 'bg-green-100', text: 'text-green-700', icono: Play },
  pausado: { bg: 'bg-amber-100', text: 'text-amber-700', icono: Pause },
  completado: { bg: 'bg-emerald-100', text: 'text-emerald-700', icono: CheckCircle2 },
  rechazado: { bg: 'bg-red-100', text: 'text-red-700', icono: X },
  bloqueado: { bg: 'bg-red-100', text: 'text-red-700', icono: Lock }
};

const LABELS_MEDIO: Record<MedioCampana, { label: string; icono: React.ElementType }> = {
  fm: { label: 'FM/Radio', icono: Radio },
  digital: { label: 'Digital', icono: Smartphone },
  hibrido: { label: 'Híbrido', icono: Zap }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const GestorElementosProgramados: React.FC<GestorElementosProps> = ({
  campanaId,
  elementosIniciales = [],
  onCambio,
  modoCompacto = false
}) => {
  // Hook de gestión
  const gestor = useGestorElementosHibrido({
    campanaId,
    elementosIniciales,
    onCambio
  });

  // Estado local de UI
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('tabla');
  const [busqueda, setBusqueda] = useState('');
  const [filtroMedio, setFiltroMedio] = useState<MedioCampana | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoElemento | 'todos'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<TipoContenido | 'todos'>('todos');
  const [_mostrarFiltrosAvanzados, _setMostrarFiltrosAvanzados] = useState(false);
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState<{
    abierto: boolean;
    tipo: 'eliminar' | 'eliminar_masivo' | null;
    mensaje: string;
    onConfirmar: () => void;
  }>({ abierto: false, tipo: null, mensaje: '', onConfirmar: () => {} });

  // Aplicar filtros locales
  const elementosFiltradosLocalmente = useMemo(() => {
    let resultado = gestor.elementos;

    // Búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(e => {
        const contenidoStr = JSON.stringify(e.contenido).toLowerCase();
        return contenidoStr.includes(termino) || e.tipo.includes(termino);
      });
    }

    // Filtro por medio
    if (filtroMedio !== 'todos') {
      resultado = resultado.filter(e => e.medio === filtroMedio);
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(e => e.estado === filtroEstado);
    }

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter(e => e.tipo === filtroTipo);
    }

    return resultado;
  }, [gestor.elementos, busqueda, filtroMedio, filtroEstado, filtroTipo]);

  // Handlers
  const handleEliminarSeleccionados = useCallback(() => {
    setDialogoConfirmacion({
      abierto: true,
      tipo: 'eliminar_masivo',
      mensaje: `¿Estás seguro de eliminar ${gestor.seleccionados.size} elementos? Esta acción no se puede deshacer.`,
      onConfirmar: () => {
        gestor.eliminarSeleccionados();
        setDialogoConfirmacion(prev => ({ ...prev, abierto: false }));
      }
    });
  }, [gestor]);

  const handleEliminarElemento = useCallback((id: string) => {
    setDialogoConfirmacion({
      abierto: true,
      tipo: 'eliminar',
      mensaje: '¿Estás seguro de eliminar este elemento?',
      onConfirmar: () => {
        gestor.eliminarElemento(id);
        setDialogoConfirmacion(prev => ({ ...prev, abierto: false }));
      }
    });
  }, [gestor]);

  const handleSelectAll = useCallback(() => {
    if (gestor.seleccionados.size === elementosFiltradosLocalmente.length) {
      gestor.limpiarSeleccion();
    } else {
      elementosFiltradosLocalmente.forEach(e => {
        if (!gestor.seleccionados.has(e.id)) {
          gestor.toggleSeleccion(e.id);
        }
      });
    }
  }, [gestor, elementosFiltradosLocalmente]);

  // Obtener nombre legible del contenido
  const obtenerNombreContenido = (elemento: ElementoProgramado): string => {
    const contenido = elemento.contenido;
    switch (contenido.tipo) {
      case 'cuna':
        return contenido.materialNombre || 'Cuña sin nombre';
      case 'mencion':
        return contenido.texto?.substring(0, 40) + '...' || 'Mención';
      case 'frase':
        return contenido.texto?.substring(0, 40) + '...' || 'Frase';
      case 'auspicio':
        return `Auspicio: ${contenido.programa}`;
      case 'banner':
        return `Banner ${contenido.formato}`;
      case 'audio_ad':
        return `Audio Ad ${contenido.duracionSegundos}s`;
      case 'video_ad':
        return `Video Ad ${contenido.duracionSegundos}s`;
      case 'rich_media':
        return 'Rich Media';
      default:
        return 'Elemento';
    }
  };

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  const haySeleccionados = gestor.seleccionados.size > 0;

  return (
    <Card className={`border-slate-200 ${modoCompacto ? 'p-3' : 'p-4'}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <List className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">🎛️ Gestor de Elementos</h3>
            <p className="text-xs text-gray-500">
              {gestor.estadisticas.total} elementos • {gestor.estadisticas.porMedio.fm} FM • {gestor.estadisticas.porMedio.digital} Digital
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={gestor.deshacer}
                  disabled={!gestor.puedeDeshacer}
                  className="h-8 w-8"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={gestor.rehacer}
                  disabled={!gestor.puedeRehacer}
                  className="h-8 w-8"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rehacer (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Vista */}
          <div className="flex border rounded-lg overflow-hidden">
            {(['tabla', 'grid', 'timeline'] as VistaActiva[]).map(vista => (
              <Button
                key={vista}
                variant={vistaActiva === vista ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-2 rounded-md ${vistaActiva === vista ? 'bg-blue-600 shadow-sm shadow-blue-200/50 text-white' : ''}`}
                onClick={() => setVistaActiva(vista)}
              >
                {vista === 'tabla' && <List className="w-4 h-4" />}
                {vista === 'grid' && <Grid3X3 className="w-4 h-4" />}
                {vista === 'timeline' && <Calendar className="w-4 h-4" />}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* TOOLBAR DE FILTROS */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar elementos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Filtro Medio */}
        <Select value={filtroMedio} onValueChange={(v) => setFiltroMedio(v as MedioCampana | 'todos')}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Medio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="fm">📻 FM/Radio</SelectItem>
            <SelectItem value="digital">📱 Digital</SelectItem>
            <SelectItem value="hibrido">⚡ Híbrido</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro Estado */}
        <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as EstadoElemento | 'todos')}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="borrador">✏️ Borrador</SelectItem>
            <SelectItem value="programado">🕐 Programado</SelectItem>
            <SelectItem value="activo">▶️ Activo</SelectItem>
            <SelectItem value="pausado">⏸️ Pausado</SelectItem>
            <SelectItem value="completado">✅ Completado</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro Tipo */}
        <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as TipoContenido | 'todos')}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="cuna">🎵 Cuña</SelectItem>
            <SelectItem value="mencion">🎤 Mención</SelectItem>
            <SelectItem value="frase">📢 Frase</SelectItem>
            <SelectItem value="banner">🖼️ Banner</SelectItem>
            <SelectItem value="audio_ad">🔊 Audio Ad</SelectItem>
            <SelectItem value="video_ad">🎬 Video Ad</SelectItem>
          </SelectContent>
        </Select>

        {/* Limpiar filtros */}
        {(busqueda || filtroMedio !== 'todos' || filtroEstado !== 'todos' || filtroTipo !== 'todos') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBusqueda('');
              setFiltroMedio('todos');
              setFiltroEstado('todos');
              setFiltroTipo('todos');
            }}
            className="h-9 gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar
          </Button>
        )}
      </div>

      {/* TOOLBAR CONTEXTUAL (aparece con selección) */}
      {haySeleccionados && (
        <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={gestor.seleccionados.size === elementosFiltradosLocalmente.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-blue-700">
              {gestor.seleccionados.size} elemento(s) seleccionado(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => gestor.bloquearSeleccionados()}
              className="h-8 gap-1"
            >
              <Lock className="w-3 h-3" />
              Bloquear
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => gestor.desbloquearSeleccionados()}
              className="h-8 gap-1"
            >
              <Unlock className="w-3 h-3" />
              Desbloquear
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => gestor.duplicarSeleccionados()}
              className="h-8 gap-1"
            >
              <Copy className="w-3 h-3" />
              Duplicar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => gestor.cambiarEstadoSeleccionados('pausado')}
              className="h-8 gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Pause className="w-3 h-3" />
              Pausar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEliminarSeleccionados}
              className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={gestor.limpiarSeleccion}
              className="h-8"
            >
              Deseleccionar
            </Button>
          </div>
        </div>
      )}

      {/* VISTA: TABLA */}
      {vistaActiva === 'tabla' && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={gestor.seleccionados.size === elementosFiltradosLocalmente.length && elementosFiltradosLocalmente.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-20">Medio</TableHead>
                <TableHead className="w-24">Tipo</TableHead>
                <TableHead>Contenido</TableHead>
                <TableHead className="w-28">Horario</TableHead>
                <TableHead className="w-24">Estado</TableHead>
                <TableHead className="w-20 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elementosFiltradosLocalmente.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <List className="w-8 h-8 text-gray-300" />
                      <p>No hay elementos que coincidan con los filtros</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                elementosFiltradosLocalmente.map((elemento) => {
                  const IconoTipo = ICONOS_TIPO[elemento.tipo] || List;
                  const IconoMedio = LABELS_MEDIO[elemento.medio].icono;
                  const configEstado = COLORES_ESTADO[elemento.estado];
                  const IconoEstado = configEstado.icono;

                  return (
                    <TableRow
                      key={elemento.id}
                      className={`
                        hover:bg-slate-50/80 cursor-pointer transition-colors
                        ${gestor.seleccionados.has(elemento.id) ? 'bg-blue-50' : ''}
                        ${elemento.bloqueado ? 'opacity-60' : ''}
                      `}
                      onClick={() => gestor.toggleSeleccion(elemento.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={gestor.seleccionados.has(elemento.id)}
                          onCheckedChange={() => gestor.toggleSeleccion(elemento.id)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IconoMedio className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {elemento.medio.toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`gap-1 ${COLORES_TIPO[elemento.tipo]}`}>
                          <IconoTipo className="w-3 h-3" />
                          {elemento.tipo}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {elemento.bloqueado && (
                            <Lock className="w-3 h-3 text-red-500 shrink-0" />
                          )}
                          <span className="truncate max-w-[200px]">
                            {obtenerNombreContenido(elemento)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-xs text-gray-600 font-mono">
                          {elemento.horario.horaInicio} - {elemento.horario.horaFin}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`gap-1 ${configEstado.bg} ${configEstado.text}`}>
                          <IconoEstado className="w-3 h-3" />
                          {elemento.estado}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Más opciones" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              disabled={elemento.bloqueado}
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => gestor.duplicarElemento(elemento.id)}
                            >
                              <Copy className="w-4 h-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {elemento.bloqueado ? (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => gestor.desbloquearElemento(elemento.id)}
                              >
                                <Unlock className="w-4 h-4" />
                                Desbloquear
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => gestor.bloquearElemento(elemento.id)}
                              >
                                <Lock className="w-4 h-4" />
                                Bloquear
                              </DropdownMenuItem>
                            )}
                            {elemento.estado === 'activo' || elemento.estado === 'programado' ? (
                              <DropdownMenuItem
                                className="gap-2 text-amber-600"
                                onClick={() => gestor.pausarElemento(elemento.id)}
                              >
                                <Pause className="w-4 h-4" />
                                Pausar
                              </DropdownMenuItem>
                            ) : elemento.estado === 'pausado' ? (
                              <DropdownMenuItem
                                className="gap-2 text-green-600"
                                onClick={() => gestor.reactivarElemento(elemento.id)}
                              >
                                <Play className="w-4 h-4" />
                                Reactivar
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-red-600"
                              onClick={() => handleEliminarElemento(elemento.id)}
                              disabled={elemento.bloqueado}
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* VISTA: GRID */}
      {vistaActiva === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {elementosFiltradosLocalmente.map((elemento) => {
            const IconoTipo = ICONOS_TIPO[elemento.tipo] || List;
            const IconoMedio = LABELS_MEDIO[elemento.medio].icono;
            const configEstado = COLORES_ESTADO[elemento.estado];

            return (
              <Card
                key={elemento.id}
                className={`
                  p-3 cursor-pointer transition-all hover:shadow-md
                  ${gestor.seleccionados.has(elemento.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${elemento.bloqueado ? 'opacity-60' : ''}
                `}
                onClick={() => gestor.toggleSeleccion(elemento.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`gap-1 text-xs ${COLORES_TIPO[elemento.tipo]}`}>
                    <IconoTipo className="w-3 h-3" />
                    {elemento.tipo}
                  </Badge>
                  {elemento.bloqueado && <Lock className="w-3 h-3 text-red-500" />}
                </div>
                
                <p className="text-sm font-medium text-gray-800 truncate mb-2">
                  {obtenerNombreContenido(elemento)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <IconoMedio className="w-3 h-3" />
                    {elemento.medio.toUpperCase()}
                  </div>
                  <Badge className={`text-xs ${configEstado.bg} ${configEstado.text}`}>
                    {elemento.estado}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* VISTA: TIMELINE (placeholder) */}
      {vistaActiva === 'timeline' && (
        <div className="p-8 text-center border rounded-lg bg-slate-50">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-medium text-gray-700">Vista Timeline</h4>
          <p className="text-sm text-gray-500">
            Próximamente: Vista cronológica de elementos programados
          </p>
        </div>
      )}

      {/* FOOTER con estadísticas */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-gray-500">
        <div className="flex gap-4">
          <span>
            <b>{elementosFiltradosLocalmente.length}</b> de {gestor.estadisticas.total} elementos
          </span>
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3" /> {gestor.estadisticas.porMedio.fm} FM
          </span>
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> {gestor.estadisticas.porMedio.digital} Digital
          </span>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> {gestor.estadisticas.porEstado.bloqueado} bloqueados
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {gestor.estadisticas.porEstado.programado} programados
          </span>
        </div>
      </div>

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      <Dialog
        open={dialogoConfirmacion.abierto}
        onOpenChange={(abierto) => setDialogoConfirmacion(prev => ({ ...prev, abierto }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              {dialogoConfirmacion.mensaje}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogoConfirmacion(prev => ({ ...prev, abierto: false }))}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={dialogoConfirmacion.onConfirmar}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GestorElementosProgramados;
