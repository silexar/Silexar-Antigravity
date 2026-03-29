/**
 * 🛠️ SILEXAR PULSE - Toolbar de Acciones para Elementos 2050
 * 
 * @description Barra de herramientas contextual que aparece cuando
 * hay elementos seleccionados, con acciones masivas disponibles.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Edit2,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Pause,
  Play,
  ArrowRightLeft,
  CheckCircle2,
  X,
  ChevronDown,
  MoreHorizontal,
  Download,
  Calendar,
  Layers,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { EstadoElemento } from './types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ToolbarAccionesProps {
  cantidadSeleccionados: number;
  cantidadBloqueados: number;
  onBloquear: () => void;
  onDesbloquear: () => void;
  onDuplicar: () => void;
  onEliminar: () => void;
  onPausar: () => void;
  onReactivar: () => void;
  onCambiarEstado: (estado: EstadoElemento) => void;
  onMover?: () => void;
  onExportar?: () => void;
  onDeseleccionar: () => void;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const ToolbarAccionesElementos: React.FC<ToolbarAccionesProps> = ({
  cantidadSeleccionados,
  cantidadBloqueados,
  onBloquear,
  onDesbloquear,
  onDuplicar,
  onEliminar,
  onPausar,
  onReactivar,
  onCambiarEstado,
  onMover,
  onExportar,
  onDeseleccionar,
  className = ''
}) => {
  // Calcular si hay elementos bloqueados
  const hayBloqueados = cantidadBloqueados > 0;
  const todosBloqueados = cantidadBloqueados === cantidadSeleccionados;

  // Estados disponibles para cambio masivo
  const estadosDisponibles: { id: EstadoElemento; label: string; icono: React.ElementType }[] = [
    { id: 'borrador', label: 'Borrador', icono: Edit2 },
    { id: 'programado', label: 'Programado', icono: Calendar },
    { id: 'activo', label: 'Activo', icono: Play },
    { id: 'pausado', label: 'Pausado', icono: Pause },
    { id: 'completado', label: 'Completado', icono: CheckCircle2 }
  ];

  if (cantidadSeleccionados === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 animate-in slide-in-from-top-2 duration-200 ${className}`}>
      {/* Información de selección */}
      <div className="flex items-center gap-3">
        <Badge className="bg-blue-600 text-white gap-1 px-3 py-1">
          <Layers className="w-3 h-3" />
          {cantidadSeleccionados} seleccionado{cantidadSeleccionados > 1 ? 's' : ''}
        </Badge>
        
        {hayBloqueados && (
          <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
            <Lock className="w-3 h-3" />
            {cantidadBloqueados} bloqueado{cantidadBloqueados > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1">
        {/* Bloquear/Desbloquear */}
        <TooltipProvider>
          {!todosBloqueados && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBloquear}
                  className="h-8 gap-1 text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Bloquear</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bloquear seleccionados (Ctrl+L)</TooltipContent>
            </Tooltip>
          )}

          {hayBloqueados && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDesbloquear}
                  className="h-8 gap-1 text-gray-600 hover:text-green-600 hover:bg-green-50"
                >
                  <Unlock className="w-4 h-4" />
                  <span className="hidden sm:inline">Desbloquear</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Desbloquear seleccionados</TooltipContent>
            </Tooltip>
          )}

          {/* Duplicar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicar}
                className="h-8 gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Duplicar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicar seleccionados (Ctrl+D)</TooltipContent>
          </Tooltip>

          {/* Pausar/Reactivar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPausar}
                className="h-8 gap-1 text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                disabled={todosBloqueados}
              >
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Pausar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pausar seleccionados (Ctrl+P)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReactivar}
                className="h-8 gap-1 text-gray-600 hover:text-green-600 hover:bg-green-50"
                disabled={todosBloqueados}
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Reactivar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reactivar seleccionados</TooltipContent>
          </Tooltip>

          {/* Mover (si disponible) */}
          {onMover && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMover}
                  className="h-8 gap-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                  disabled={todosBloqueados}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Mover</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mover a otro bloque (Ctrl+M)</TooltipContent>
            </Tooltip>
          )}

          {/* Más acciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-gray-600"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Más</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Cambiar Estado */}
              <DropdownMenuItem 
                className="font-medium text-gray-500 text-xs"
                disabled
              >
                Cambiar estado a:
              </DropdownMenuItem>
              {estadosDisponibles.map(estado => (
                <DropdownMenuItem
                  key={estado.id}
                  onClick={() => onCambiarEstado(estado.id)}
                  className="gap-2"
                  disabled={todosBloqueados}
                >
                  <estado.icono className="w-4 h-4" />
                  {estado.label}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* Exportar */}
              {onExportar && (
                <DropdownMenuItem onClick={onExportar} className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar selección
                </DropdownMenuItem>
              )}
              
              {/* Aplicar plantilla */}
              <DropdownMenuItem className="gap-2" disabled>
                <Sparkles className="w-4 h-4" />
                Aplicar plantilla
              </DropdownMenuItem>
              
              {/* Sincronizar */}
              <DropdownMenuItem className="gap-2" disabled>
                <RefreshCw className="w-4 h-4" />
                Sincronizar con FM
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Eliminar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEliminar}
                className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={todosBloqueados}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar seleccionados (Delete)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Deseleccionar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeseleccionar}
                className="h-8 gap-1 text-gray-500"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Deseleccionar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Limpiar selección (Esc)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ToolbarAccionesElementos;
