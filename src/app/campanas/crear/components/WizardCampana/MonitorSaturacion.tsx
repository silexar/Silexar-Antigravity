/**
 * 📊 SILEXAR PULSE - Monitor de Saturación Multi-Emisora 2050
 * 
 * @description Vista consolidada de saturación de todas las emisoras
 * con alertas, heatmap y métricas en tiempo real.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Radio,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SaturacionEmisora {
  id: string;
  nombre: string;
  ocupacionTotal: number; // porcentaje
  bloques: BloqueHora[];
  tendencia: 'subiendo' | 'bajando' | 'estable';
  alertas: number;
}

export interface BloqueHora {
  hora: string;
  ocupacion: number; // porcentaje
  disponible: number; // segundos
  capacidad: number; // segundos
}

interface MonitorSaturacionProps {
  emisoras: SaturacionEmisora[];
  fechaSeleccionada: Date;
  onCambiarFecha: (fecha: Date) => void;
  onVerDetalle: (emisoraId: string, hora: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const generarBloques = (): BloqueHora[] => {
  const horas = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  return horas.map(hora => {
    const baseOcupacion = hora >= '06:00' && hora <= '09:00' ? 85 : 
                          hora >= '12:00' && hora <= '14:00' ? 75 :
                          hora >= '18:00' && hora <= '21:00' ? 90 : 
                          hora >= '00:00' && hora <= '05:00' ? 20 : 50;
    const ocupacion = Math.min(100, Math.max(0, baseOcupacion + (Math.random() * 20 - 10)));
    const capacidad = 180;
    return {
      hora,
      ocupacion,
      disponible: capacidad * (1 - ocupacion/100),
      capacidad
    };
  });
};

const EMISORAS_MOCK: SaturacionEmisora[] = [
  { id: 'em_001', nombre: 'Radio Pudahuel', ocupacionTotal: 78, bloques: generarBloques(), tendencia: 'subiendo', alertas: 2 },
  { id: 'em_002', nombre: 'Radio ADN', ocupacionTotal: 65, bloques: generarBloques(), tendencia: 'estable', alertas: 0 },
  { id: 'em_003', nombre: 'Radio Futuro', ocupacionTotal: 82, bloques: generarBloques(), tendencia: 'subiendo', alertas: 3 },
  { id: 'em_004', nombre: 'Oasis FM', ocupacionTotal: 45, bloques: generarBloques(), tendencia: 'bajando', alertas: 0 },
  { id: 'em_005', nombre: 'Radio Carolina', ocupacionTotal: 92, bloques: generarBloques(), tendencia: 'subiendo', alertas: 5 }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const MonitorSaturacion: React.FC<MonitorSaturacionProps> = ({
  emisoras = EMISORAS_MOCK,
  fechaSeleccionada = new Date(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCambiarFecha: _onCambiarFecha,
  onVerDetalle
}) => {
  const [vistaActiva, setVistaActiva] = useState<'heatmap' | 'barras'>('heatmap');
  const [filtroAlerta, setFiltroAlerta] = useState<'todos' | 'alertas'>('todos');

  // Filtrar emisoras
  const emisorasFiltradas = useMemo(() => {
    if (filtroAlerta === 'alertas') {
      return emisoras.filter(e => e.alertas > 0);
    }
    return emisoras;
  }, [emisoras, filtroAlerta]);

  // Estadísticas globales
  const estadisticas = useMemo(() => {
    const promedioOcupacion = emisoras.reduce((acc, e) => acc + e.ocupacionTotal, 0) / emisoras.length;
    const totalAlertas = emisoras.reduce((acc, e) => acc + e.alertas, 0);
    const emisorasCriticas = emisoras.filter(e => e.ocupacionTotal >= 90).length;
    return { promedioOcupacion, totalAlertas, emisorasCriticas };
  }, [emisoras]);

  // Color según ocupación
  const getColorOcupacion = (ocupacion: number): string => {
    if (ocupacion >= 95) return 'bg-red-600';
    if (ocupacion >= 85) return 'bg-red-500';
    if (ocupacion >= 75) return 'bg-amber-500';
    if (ocupacion >= 60) return 'bg-yellow-500';
    if (ocupacion >= 40) return 'bg-green-400';
    return 'bg-green-300';
  };

  // Texto de tendencia
  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'bajando': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <span className="w-4 h-4 text-gray-400">—</span>;
    }
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">📊 Monitor de Saturación</h3>
            <p className="text-sm text-gray-500">
              {fechaSeleccionada.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filtroAlerta} onValueChange={(v) => setFiltroAlerta(v as typeof filtroAlerta)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="alertas">Solo alertas</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={vistaActiva === 'heatmap' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVistaActiva('heatmap')}
            >
              Heatmap
            </Button>
            <Button
              variant={vistaActiva === 'barras' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVistaActiva('barras')}
            >
              Barras
            </Button>
          </div>

          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Estadísticas globales */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-600">Ocupación promedio</p>
          <p className="text-2xl font-bold text-blue-700">{estadisticas.promedioOcupacion.toFixed(0)}%</p>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm text-red-600">Emisoras críticas</p>
          <p className="text-2xl font-bold text-red-700">{estadisticas.emisorasCriticas}</p>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-amber-50 to-amber-100">
          <p className="text-sm text-amber-600">Alertas activas</p>
          <p className="text-2xl font-bold text-amber-700">{estadisticas.totalAlertas}</p>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-600">Emisoras monitoreadas</p>
          <p className="text-2xl font-bold text-green-700">{emisoras.length}</p>
        </Card>
      </div>

      {/* Vista Heatmap */}
      {vistaActiva === 'heatmap' && (
        <div className="overflow-x-auto">
          {/* Header de horas */}
          <div className="flex mb-2">
            <div className="w-36 shrink-0" />
            {Array.from({ length: 24 }, (_, i) => (
              <div key={`hour-${i}`} className="w-8 text-center text-xs text-gray-400 shrink-0">
                {i.toString().padStart(2, '0')}
              </div>
            ))}
            <div className="w-24 shrink-0 pl-2 text-xs text-gray-500">Total</div>
          </div>

          {/* Filas de emisoras */}
          {emisorasFiltradas.map(emisora => (
            <div key={emisora.id} className="flex items-center mb-1 group">
              {/* Nombre emisora */}
              <div className="w-36 shrink-0 flex items-center gap-2">
                <Radio className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium truncate">{emisora.nombre}</span>
                {emisora.alertas > 0 && (
                  <Badge className="bg-red-100 text-red-700 text-xs">{emisora.alertas}</Badge>
                )}
              </div>

              {/* Heatmap */}
              {emisora.bloques.map((bloque, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-6 shrink-0 cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 ${getColorOcupacion(bloque.ocupacion)}`}
                  title={`${bloque.hora}: ${bloque.ocupacion.toFixed(0)}% ocupado`}
                  onClick={() => onVerDetalle?.(emisora.id, bloque.hora)}
                />
              ))}

              {/* Total */}
              <div className="w-24 shrink-0 pl-2 flex items-center gap-2">
                <Badge 
                  className={
                    emisora.ocupacionTotal >= 90 ? 'bg-red-100 text-red-700' :
                    emisora.ocupacionTotal >= 75 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }
                >
                  {emisora.ocupacionTotal.toFixed(0)}%
                </Badge>
                {getTendenciaIcon(emisora.tendencia)}
              </div>
            </div>
          ))}

          {/* Leyenda */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
            <span>Ocupación:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-300 rounded" />
              <span>0-40%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>40-75%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span>75-85%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>85-95%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600 rounded" />
              <span>95%+</span>
            </div>
          </div>
        </div>
      )}

      {/* Vista Barras */}
      {vistaActiva === 'barras' && (
        <div className="space-y-3">
          {emisorasFiltradas.map(emisora => (
            <Card key={emisora.id} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{emisora.nombre}</span>
                  {emisora.alertas > 0 && (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {emisora.alertas} alerta(s)
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getTendenciaIcon(emisora.tendencia)}
                  <Badge 
                    className={
                      emisora.ocupacionTotal >= 90 ? 'bg-red-100 text-red-700' :
                      emisora.ocupacionTotal >= 75 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }
                  >
                    {emisora.ocupacionTotal.toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={emisora.ocupacionTotal} 
                className={`h-4 ${
                  emisora.ocupacionTotal >= 90 ? '[&>div]:bg-red-500' :
                  emisora.ocupacionTotal >= 75 ? '[&>div]:bg-amber-500' :
                  '[&>div]:bg-green-500'
                }`}
              />
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MonitorSaturacion;
