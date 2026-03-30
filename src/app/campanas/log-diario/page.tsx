/**
 * 📅 SILEXAR PULSE - Vista Log/Parrilla Diaria 2050
 * 
 * @description Vista cronológica tipo timeline para ver TODA la programación
 * del día con drag & drop, indicadores de saturación y alertas en tiempo real.
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
  Calendar,
  Clock,
  Radio,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface SpotLog {
  id: string;
  campanaId: string;
  campanaNombre: string;
  anunciante: string;
  cunaId: string;
  cunaNombre: string;
  duracion: number; // segundos
  horaPrograma: string;
  estado: 'programado' | 'emitido' | 'confirmado' | 'no_emitido' | 'en_aire';
  bloqueId: string;
  orden: number;
}

interface BloqueLog {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  duracionMaxima: number; // segundos
  duracionOcupada: number;
  spots: SpotLog[];
  estado: 'pendiente' | 'en_aire' | 'completado';
}

interface EmisoraLog {
  id: string;
  nombre: string;
  bloques: BloqueLog[];
  spotsTotal: number;
  spotsEmitidos: number;
  spotsConfirmados: number;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const generarBloquesMock = (): BloqueLog[] => {
  const bloques: BloqueLog[] = [];
  const horas = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  
  const anunciantes = ['COCA-COLA', 'BANCO CHILE', 'FALABELLA', 'ENTEL', 'PARIS', 'CLARO', 'RIPLEY'];
  
  horas.forEach((hora, idx) => {
    const numSpots = Math.floor(Math.random() * 6) + 2;
    const spots: SpotLog[] = [];
    
    for (let i = 0; i < numSpots; i++) {
      const anunciante = anunciantes[Math.floor(Math.random() * anunciantes.length)];
      spots.push({
        id: `spot_${hora}_${i}`,
        campanaId: `camp_${Math.floor(Math.random() * 10)}`,
        campanaNombre: `Campaña ${anunciante} ${Math.floor(Math.random() * 100)}`,
        anunciante,
        cunaId: `cuna_${i}`,
        cunaNombre: `Cuña ${anunciante} 30s`,
        duracion: [20, 30, 45][Math.floor(Math.random() * 3)],
        horaPrograma: hora,
        estado: idx < 10 ? 'confirmado' : idx === 10 ? 'en_aire' : 'programado',
        bloqueId: `bloque_${hora}`,
        orden: i + 1
      });
    }
    
    const duracionOcupada = spots.reduce((acc, s) => acc + s.duracion, 0);
    
    bloques.push({
      id: `bloque_${hora}`,
      nombre: `Tanda ${hora}`,
      horaInicio: hora,
      horaFin: `${String(parseInt(hora.split(':')[0]) + 1).padStart(2, '0')}:00`,
      duracionMaxima: 180,
      duracionOcupada,
      spots,
      estado: idx < 10 ? 'completado' : idx === 10 ? 'en_aire' : 'pendiente'
    });
  });
  
  return bloques;
};

const EMISORAS_MOCK: EmisoraLog[] = [
  {
    id: 'em_001',
    nombre: 'Radio Pudahuel',
    bloques: generarBloquesMock(),
    spotsTotal: 85,
    spotsEmitidos: 52,
    spotsConfirmados: 48
  },
  {
    id: 'em_002',
    nombre: 'ADN Radio',
    bloques: generarBloquesMock(),
    spotsTotal: 72,
    spotsEmitidos: 45,
    spotsConfirmados: 42
  },
  {
    id: 'em_003',
    nombre: 'Radio Futuro',
    bloques: generarBloquesMock(),
    spotsTotal: 64,
    spotsEmitidos: 38,
    spotsConfirmados: 36
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ParrillaLogDiario() {
  const [fecha, setFecha] = useState(new Date());
  const [emisoraSeleccionada, setEmisoraSeleccionada] = useState<string>('em_001');
  const [vistaHoras, setVistaHoras] = useState<'todas' | 'prime' | 'manana' | 'tarde'>('todas');
  const [cargando, setCargando] = useState(false);
  const [bloqueExpandido, setBloqueExpandido] = useState<string | null>(null);

  // Obtener emisora actual
  const emisoraActual = useMemo(() => {
    return EMISORAS_MOCK.find(e => e.id === emisoraSeleccionada) || EMISORAS_MOCK[0];
  }, [emisoraSeleccionada]);

  // Filtrar bloques según vista
  const bloquesFiltrados = useMemo(() => {
    let bloques = emisoraActual.bloques;
    
    switch (vistaHoras) {
      case 'prime':
        bloques = bloques.filter(b => {
          const hora = parseInt(b.horaInicio.split(':')[0]);
          return (hora >= 6 && hora <= 9) || (hora >= 18 && hora <= 21);
        });
        break;
      case 'manana':
        bloques = bloques.filter(b => {
          const hora = parseInt(b.horaInicio.split(':')[0]);
          return hora >= 6 && hora <= 12;
        });
        break;
      case 'tarde':
        bloques = bloques.filter(b => {
          const hora = parseInt(b.horaInicio.split(':')[0]);
          return hora >= 12 && hora <= 21;
        });
        break;
    }
    
    return bloques;
  }, [emisoraActual, vistaHoras]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = emisoraActual.spotsTotal;
    const emitidos = emisoraActual.spotsEmitidos;
    const confirmados = emisoraActual.spotsConfirmados;
    const pendientes = total - emitidos;
    const cumplimiento = total > 0 ? (confirmados / total) * 100 : 0;
    
    return { total, emitidos, confirmados, pendientes, cumplimiento };
  }, [emisoraActual]);

  // Cambiar día
  const cambiarDia = (delta: number) => {
    const newDate = new Date(fecha);
    newDate.setDate(newDate.getDate() + delta);
    setFecha(newDate);
  };

  // Obtener color de saturación
  const getColorSaturacion = (ocupada: number, maxima: number) => {
    const porcentaje = (ocupada / maxima) * 100;
    if (porcentaje >= 100) return 'bg-red-500';
    if (porcentaje >= 85) return 'bg-amber-500';
    if (porcentaje >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Obtener color de estado del bloque
  const getEstadoBloque = (estado: string) => {
    switch (estado) {
      case 'completado': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
      case 'en_aire': return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
    }
  };

  // Obtener badge de estado del spot
  const getEstadoSpotBadge = (estado: string) => {
    switch (estado) {
      case 'confirmado': return <Badge className="bg-green-100 text-green-700">✓ Confirmado</Badge>;
      case 'emitido': return <Badge className="bg-blue-100 text-blue-700">Emitido</Badge>;
      case 'en_aire': return <Badge className="bg-purple-100 text-purple-700 animate-pulse">🔴 EN AIRE</Badge>;
      case 'no_emitido': return <Badge className="bg-red-100 text-red-700">✗ No emitido</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">Programado</Badge>;
    }
  };

  // Refrescar
  const handleRefrescar = async () => {
    setCargando(true);
    await new Promise(r => setTimeout(r, 1000));
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">📅 Parrilla Log Diario</h1>
            <p className="text-sm text-gray-500">Vista cronológica completa</p>
          </div>
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => cambiarDia(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-white rounded-lg border font-medium">
            {fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <Button variant="outline" size="icon" onClick={() => cambiarDia(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFecha(new Date())}>
            Hoy
          </Button>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefrescar} disabled={cargando}>
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* FILTROS Y STATS */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* Selector de emisora */}
        <Card className="p-3">
          <Label className="text-xs text-gray-500 mb-1 block">Emisora</Label>
          <Select value={emisoraSeleccionada} onValueChange={setEmisoraSeleccionada}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMISORAS_MOCK.map(em => (
                <SelectItem key={em.id} value={em.id}>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    {em.nombre}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Filtro de horario */}
        <Card className="p-3">
          <Label className="text-xs text-gray-500 mb-1 block">Horario</Label>
          <Select value={vistaHoras} onValueChange={(v) => setVistaHoras(v as typeof vistaHoras)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las horas</SelectItem>
              <SelectItem value="prime">Solo Prime</SelectItem>
              <SelectItem value="manana">Mañana (06-12)</SelectItem>
              <SelectItem value="tarde">Tarde (12-21)</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Stats rápidos */}
        <Card className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600">Spots Hoy</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Emitidos</p>
              <p className="text-lg font-bold text-blue-700">{stats.emitidos}</p>
            </div>
          </div>
        </Card>

        {/* Cumplimiento */}
        <Card className="p-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-green-600">Cumplimiento</p>
            <p className="text-lg font-bold text-green-700">{stats.cumplimiento.toFixed(1)}%</p>
          </div>
          <Progress value={stats.cumplimiento} className="h-2" />
        </Card>
      </div>

      {/* TIMELINE DE BLOQUES */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold">{emisoraActual.nombre} - {fecha.toLocaleDateString('es-CL')}</h2>
          <Badge variant="outline" className="ml-auto">
            {bloquesFiltrados.length} bloques
          </Badge>
        </div>

        {/* Grid de bloques */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {bloquesFiltrados.map(bloque => {
            const estiloEstado = getEstadoBloque(bloque.estado);
            const saturacion = (bloque.duracionOcupada / bloque.duracionMaxima) * 100;
            const expandido = bloqueExpandido === bloque.id;
            
            return (
              <div
                key={bloque.id}
                className={`border rounded-lg transition-all ${estiloEstado.bg} ${estiloEstado.border}`}
              >
                {/* Header del bloque */}
                <div
                  className="p-3 cursor-pointer flex items-center justify-between"
                  onClick={() => setBloqueExpandido(expandido ? null : bloque.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{bloque.horaInicio}</p>
                      <p className="text-xs text-gray-500">{bloque.horaFin}</p>
                    </div>
                    
                    <div className="h-10 w-px bg-gray-300" />
                    
                    <div>
                      <p className="font-medium text-gray-900">{bloque.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {bloque.spots.length} spots • {bloque.duracionOcupada}s / {bloque.duracionMaxima}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Indicador de saturación */}
                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Saturación</span>
                        <span className={saturacion >= 100 ? 'text-red-600 font-bold' : ''}>
                          {saturacion.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getColorSaturacion(bloque.duracionOcupada, bloque.duracionMaxima)}`}
                          style={{ width: `${Math.min(saturacion, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Estado */}
                    {bloque.estado === 'en_aire' && (
                      <Badge className="bg-purple-500 text-white animate-pulse">
                        🔴 EN AIRE
                      </Badge>
                    )}
                    {bloque.estado === 'completado' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    
                    {/* Alerta de saturación */}
                    {saturacion >= 100 && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>

                {/* Lista de spots (expandida) */}
                {expandido && (
                  <div className="border-t p-3 bg-white space-y-2">
                    {bloque.spots.map((spot, idx) => (
                      <div
                        key={spot.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{spot.anunciante}</p>
                            <p className="text-xs text-gray-500">{spot.campanaNombre}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{spot.duracion}s</span>
                          {getEstadoSpotBadge(spot.estado)}
                          <Button variant="ghost" size="sm" className="h-7">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// Label helper
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
