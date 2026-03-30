/**
 * 🗺️ Mapa de Calor de Saturación TIER0++
 * 
 * Visualización interactiva de la ocupación de bloques:
 * - Grid día x hora con colores de saturación
 * - Tooltip con detalles de cada bloque
 * - Zoom y navegación temporal
 * 
 * @enterprise TIER0 Fortune 10 Enterprise 2050
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Flame, Calendar, Clock,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react';

// ==================== INTERFACES ====================

interface BloqueCalor {
  hora: string;
  dia: string;
  fecha: string;
  capacidadTotal: number;
  capacidadUsada: number;
  porcentaje: number;
  numCunas: number;
  tipoBloque: string;
}

interface MapaCalorProps {
  semanaInicio?: string;
  onBloqueClick?: (bloque: BloqueCalor) => void;
}

// ==================== DATOS MOCK ====================

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

const generarDatosMock = (): BloqueCalor[] => {
  const datos: BloqueCalor[] = [];
  
  DIAS.forEach((dia, diaIdx) => {
    HORAS.forEach((hora) => {
      const horaNum = parseInt(hora.split(':')[0]);
      const esPrime = (horaNum >= 7 && horaNum <= 9) || (horaNum >= 18 && horaNum <= 20);
      const esNoche = horaNum >= 22 || horaNum <= 6;
      const esFinDeSemana = diaIdx >= 5;
      
      // Simular ocupación basada en horario
      let baseOcupacion = 50;
      if (esPrime) baseOcupacion = 85 + Math.random() * 15;
      else if (esNoche) baseOcupacion = 20 + Math.random() * 20;
      else if (esFinDeSemana) baseOcupacion = 40 + Math.random() * 30;
      else baseOcupacion = 60 + Math.random() * 25;
      
      const porcentaje = Math.min(100, Math.max(0, baseOcupacion));
      const capacidadTotal = 300;
      const capacidadUsada = Math.round((porcentaje / 100) * capacidadTotal);
      
      datos.push({
        hora,
        dia,
        fecha: `${16 + diaIdx}/12/2025`,
        capacidadTotal,
        capacidadUsada,
        porcentaje: Math.round(porcentaje),
        numCunas: Math.floor(capacidadUsada / 30),
        tipoBloque: esPrime ? 'PRIME' : esNoche ? 'TRASNOCHE' : 'ROTATIVO',
      });
    });
  });
  
  return datos;
};

// ==================== COMPONENTE PRINCIPAL ====================

export function MapaCalorSaturacion({ onBloqueClick }: MapaCalorProps) {
  const [datos] = useState<BloqueCalor[]>(generarDatosMock());
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [bloqueHover, setBloqueHover] = useState<BloqueCalor | null>(null);
  const [semanaOffset, setSemanaOffset] = useState(0);

  const getColorSaturacion = (porcentaje: number): string => {
    if (porcentaje >= 95) return 'bg-red-600'; // Saturado
    if (porcentaje >= 85) return 'bg-red-400'; // Casi lleno
    if (porcentaje >= 70) return 'bg-amber-400'; // Alto
    if (porcentaje >= 50) return 'bg-yellow-400'; // Medio
    if (porcentaje >= 30) return 'bg-green-400'; // Bajo
    return 'bg-green-300'; // Libre
  };

  const getTextColor = (porcentaje: number): string => {
    if (porcentaje >= 70) return 'text-white';
    return 'text-gray-800';
  };

  const estadisticas = useMemo(() => {
    const saturados = datos.filter(b => b.porcentaje >= 95).length;
    const disponibles = datos.filter(b => b.porcentaje < 50).length;
    const promedioOcupacion = Math.round(datos.reduce((acc, b) => acc + b.porcentaje, 0) / datos.length);
    
    return { saturados, disponibles, promedioOcupacion, total: datos.length };
  }, [datos]);

  const datosFiltrados = useMemo(() => {
    if (filtroTipo === 'todos') return datos;
    return datos.filter(b => b.tipoBloque === filtroTipo);
  }, [datos, filtroTipo]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            🗺️ MAPA DE CALOR - SATURACIÓN POR BLOQUES
          </h3>
          <p className="text-sm text-gray-500">Visualización de ocupación semanal</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSemanaOffset(s => s - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Badge variant="outline" className="gap-1">
            <Calendar className="w-3 h-3" />
            Semana {semanaOffset === 0 ? 'Actual' : semanaOffset > 0 ? `+${semanaOffset}` : semanaOffset}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setSemanaOffset(s => s + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center bg-red-50 border-red-100">
          <p className="text-2xl font-bold text-red-600">{estadisticas.saturados}</p>
          <p className="text-xs text-gray-500">Bloques Saturados (95%+)</p>
        </Card>
        <Card className="p-3 text-center bg-green-50 border-green-100">
          <p className="text-2xl font-bold text-green-600">{estadisticas.disponibles}</p>
          <p className="text-xs text-gray-500">Bloques Disponibles (&lt;50%)</p>
        </Card>
        <Card className="p-3 text-center bg-blue-50 border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{estadisticas.promedioOcupacion}%</p>
          <p className="text-xs text-gray-500">Ocupación Promedio</p>
        </Card>
        <Card className="p-3 text-center bg-purple-50 border-purple-100">
          <p className="text-2xl font-bold text-purple-600">{estadisticas.total}</p>
          <p className="text-xs text-gray-500">Total Bloques</p>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo de bloque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los bloques</SelectItem>
            <SelectItem value="PRIME">Solo PRIME</SelectItem>
            <SelectItem value="ROTATIVO">Solo ROTATIVO</SelectItem>
            <SelectItem value="TRASNOCHE">Solo TRASNOCHE</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-1 text-xs">
          <span className="px-2 py-1 bg-green-300 rounded">0-30%</span>
          <span className="px-2 py-1 bg-yellow-400 rounded">30-70%</span>
          <span className="px-2 py-1 bg-amber-400 rounded">70-85%</span>
          <span className="px-2 py-1 bg-red-400 text-white rounded">85-95%</span>
          <span className="px-2 py-1 bg-red-600 text-white rounded">95%+ 🔥</span>
        </div>
      </div>

      {/* Grid Mapa de Calor */}
      <Card className="p-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs text-gray-500 w-16">
                <Clock className="w-4 h-4" />
              </th>
              {DIAS.map(dia => (
                <th key={dia} className="p-2 text-center text-xs font-medium text-gray-700">
                  {dia.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map(hora => (
              <tr key={hora}>
                <td className="p-1 text-xs text-gray-500 font-mono">{hora}</td>
                {DIAS.map(dia => {
                  const bloque = datosFiltrados.find(b => b.hora === hora && b.dia === dia);
                  if (!bloque && filtroTipo !== 'todos') {
                    return <td key={dia} className="p-1"><div className="w-full h-8 bg-gray-100 rounded" /></td>;
                  }
                  if (!bloque) return <td key={dia} className="p-1" />;
                  
                  return (
                    <td key={dia} className="p-1">
                      <div 
                        className={`
                          w-full h-8 rounded cursor-pointer transition-all transform hover:scale-110 hover:z-10
                          ${getColorSaturacion(bloque.porcentaje)} ${getTextColor(bloque.porcentaje)}
                          flex items-center justify-center text-xs font-bold
                          relative
                        `}
                        onMouseEnter={() => setBloqueHover(bloque)}
                        onMouseLeave={() => setBloqueHover(null)}
                        onClick={() => onBloqueClick && onBloqueClick(bloque)}
                      >
                        {bloque.porcentaje}%
                        {bloque.porcentaje >= 95 && <Flame className="w-3 h-3 ml-1 animate-pulse" />}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Tooltip flotante */}
      {bloqueHover && (
        <Card className="p-4 bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg shadow-gray-200/50 text-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${getColorSaturacion(bloqueHover.porcentaje)}`} />
            <div>
              <p className="font-bold">{bloqueHover.dia} {bloqueHover.hora}</p>
              <p className="text-sm text-slate-300">{bloqueHover.tipoBloque} • {bloqueHover.fecha}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs text-slate-400">Ocupación</p>
              <p className="font-bold text-lg">{bloqueHover.porcentaje}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tiempo Usado</p>
              <p className="font-bold">{bloqueHover.capacidadUsada}s / {bloqueHover.capacidadTotal}s</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Cuñas</p>
              <p className="font-bold">{bloqueHover.numCunas}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default MapaCalorSaturacion;
