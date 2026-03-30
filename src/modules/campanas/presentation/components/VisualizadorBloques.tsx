/**
 * 📊 Visualizador de Bloques
 * 
 * Componente visual que muestra la distribución de spots en los bloques horarios.
 * Utiliza indicadores de saturación y colores para representar el estado.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface VisualizadorProps {
  lines: unknown[];
}

export const VisualizadorBloques: React.FC<VisualizadorProps> = ({ lines }) => {
  const bloques = [
    { id: 'MAT', nombre: 'PRIME MATINAL', hora: '07:00 - 09:00', capacidad: 100, ocupacion: 85 },
    { id: 'DIA', nombre: 'MAÑANA', hora: '09:00 - 13:00', capacidad: 100, ocupacion: 45 },
    { id: 'TAR', nombre: 'PRIME TARDE', hora: '18:00 - 20:50', capacidad: 100, ocupacion: 92 },
    { id: 'NOC', nombre: 'TRASNOCHE', hora: '00:00 - 06:00', capacidad: 100, ocupacion: 15 },
  ];

  const getSaturacionColor = (ocupacion: number) => {
    if (ocupacion > 90) return 'bg-red-500';
    if (ocupacion > 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Mapa de Calor de Programación
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {bloques.map((bloque) => (
          <Card key={bloque.id} className="p-4 border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <Badge variant="outline" className="font-bold border-slate-300 text-slate-700">
                  {bloque.nombre}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Clock className="w-3 h-3" />
                  {bloque.hora}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${getSaturacionColor(bloque.ocupacion)} ring-4 ring-opacity-20 ${getSaturacionColor(bloque.ocupacion).replace('bg-', 'ring-')}`} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ocupación</span>
                <span className="font-bold text-slate-700">{bloque.ocupacion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getSaturacionColor(bloque.ocupacion)}`} 
                  style={{ width: `${bloque.ocupacion}%` }}
                />
              </div>
            </div>

            {bloque.ocupacion > 90 ? (
              <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Alta saturación
              </div>
            ) : (
              <div className="mt-3 text-xs text-emerald-600 bg-emerald-50 p-2 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Espacio disponible
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
