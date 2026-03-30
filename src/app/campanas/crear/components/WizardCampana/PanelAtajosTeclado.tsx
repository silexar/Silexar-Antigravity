/**
 * ⚡ SILEXAR PULSE - Panel de Atajos de Teclado 2050
 * 
 * @description Panel visual que muestra todos los atajos de teclado
 * disponibles para operadores. Incluye tooltips y ayuda rápida.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
// Card removed - not used
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Keyboard,
  Save,
  Undo2,
  Redo2,
  Search,
  Copy,
  Trash2,
  Play,
  Plus,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATOS DE ATAJOS
// ═══════════════════════════════════════════════════════════════

interface AtajoInfo {
  tecla: string;
  modificadores: ('Ctrl' | 'Shift' | 'Alt')[];
  descripcion: string;
  categoria: string;
  icono: React.ComponentType<{ className?: string }>;
}

const ATAJOS_COMPLETOS: AtajoInfo[] = [
  // Edición
  { tecla: 'Z', modificadores: ['Ctrl'], descripcion: 'Deshacer última acción', categoria: 'Edición', icono: Undo2 },
  { tecla: 'Y', modificadores: ['Ctrl'], descripcion: 'Rehacer acción', categoria: 'Edición', icono: Redo2 },
  { tecla: 'Z', modificadores: ['Ctrl', 'Shift'], descripcion: 'Rehacer acción (alternativo)', categoria: 'Edición', icono: Redo2 },
  { tecla: 'S', modificadores: ['Ctrl'], descripcion: 'Guardar cambios', categoria: 'Edición', icono: Save },
  { tecla: 'D', modificadores: ['Ctrl'], descripcion: 'Duplicar selección', categoria: 'Edición', icono: Copy },
  
  // Selección
  { tecla: 'A', modificadores: ['Ctrl'], descripcion: 'Seleccionar todo', categoria: 'Selección', icono: Check },
  { tecla: 'Delete', modificadores: [], descripcion: 'Eliminar selección', categoria: 'Selección', icono: Trash2 },
  { tecla: 'Backspace', modificadores: [], descripcion: 'Eliminar selección', categoria: 'Selección', icono: Trash2 },
  
  // Navegación
  { tecla: 'F', modificadores: ['Ctrl'], descripcion: 'Abrir búsqueda', categoria: 'Navegación', icono: Search },
  { tecla: 'N', modificadores: ['Ctrl'], descripcion: 'Nuevo elemento', categoria: 'Navegación', icono: Plus },
  { tecla: 'Escape', modificadores: [], descripcion: 'Cerrar diálogo/panel', categoria: 'Navegación', icono: X },
  { tecla: '↑', modificadores: [], descripcion: 'Mover arriba', categoria: 'Navegación', icono: ArrowUp },
  { tecla: '↓', modificadores: [], descripcion: 'Mover abajo', categoria: 'Navegación', icono: ArrowDown },
  
  // Reproducción
  { tecla: 'Espacio', modificadores: [], descripcion: 'Reproducir/Pausar cuña', categoria: 'Reproducción', icono: Play },
  { tecla: 'Enter', modificadores: [], descripcion: 'Confirmar acción', categoria: 'Reproducción', icono: Check },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const TeclaVisual: React.FC<{ tecla: string; modificadores?: string[] }> = ({ 
  tecla, 
  modificadores = [] 
}) => {
  return (
    <div className="flex items-center gap-1">
      {modificadores.map(mod => (
        <kbd 
          key={mod}
          className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono font-medium shadow-sm"
        >
          {mod}
        </kbd>
      ))}
      {modificadores.length > 0 && (
        <span className="text-gray-400">+</span>
      )}
      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono font-medium shadow-sm min-w-[28px] text-center">
        {tecla}
      </kbd>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const PanelAtajosTeclado: React.FC = () => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  // Agrupar por categoría
  const categorias = ATAJOS_COMPLETOS.reduce((acc, atajo) => {
    if (!acc[atajo.categoria]) {
      acc[atajo.categoria] = [];
    }
    acc[atajo.categoria].push(atajo);
    return acc;
  }, {} as Record<string, AtajoInfo[]>);

  return (
    <>
      {/* Botón para abrir */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 fixed bottom-4 right-4 z-50 shadow-lg">
            <Keyboard className="w-4 h-4" />
            Atajos
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-purple-600" />
              Atajos de Teclado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(categorias).map(([categoria, atajos]) => (
              <div key={categoria}>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-700">{categoria}</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {atajos.map((atajo, index) => {
                    const Icono = atajo.icono;
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Icono className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{atajo.descripcion}</span>
                        </div>
                        <TeclaVisual tecla={atajo.tecla} modificadores={atajo.modificadores} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Tips */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700">Tips para operadores</h4>
                  <ul className="text-sm text-blue-600 mt-2 space-y-1">
                    <li>• Usa <TeclaVisual tecla="Z" modificadores={['Ctrl']} /> para deshacer errores rápidamente</li>
                    <li>• <TeclaVisual tecla="Espacio" /> reproduce la cuña seleccionada</li>
                    <li>• Mantén <TeclaVisual tecla="Ctrl" /> mientras arrastras para copiar en vez de mover</li>
                    <li>• <TeclaVisual tecla="Escape" /> cierra cualquier diálogo abierto</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mini indicador de atajos */}
      <div className="fixed bottom-4 left-4 z-50 text-xs text-gray-400 flex items-center gap-2">
        <span>Presiona</span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-[10px] font-mono">?</kbd>
        <span>para ver atajos</span>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE TOOLTIP DE ATAJO
// ═══════════════════════════════════════════════════════════════

interface TooltipAtajoProps {
  children: React.ReactNode;
  tecla: string;
  modificadores?: string[];
}

export const TooltipAtajo: React.FC<TooltipAtajoProps> = ({
  children,
  tecla,
  modificadores = []
}) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap flex items-center gap-1">
          <span>Atajo:</span>
          {modificadores.map(mod => (
            <kbd key={mod} className="px-1 bg-gray-700 rounded text-[10px]">{mod}</kbd>
          ))}
          {modificadores.length > 0 && <span>+</span>}
          <kbd className="px-1 bg-gray-700 rounded text-[10px]">{tecla}</kbd>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};

export default PanelAtajosTeclado;
