/**
 * ⚠️ SILEXAR PULSE - Sistema de Alertas de Vencimientos 2050
 * 
 * @description Panel para monitorear cuñas próximas a vencer
 * con opciones de reemplazo, extensión y notificaciones
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
  AlertTriangle,
  Clock,
  RefreshCw,
  CalendarPlus,
  Eye,
  Music,
  Bell,
  BellOff
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CunaConVigencia {
  id: string;
  codigo: string;
  nombre: string;
  anunciante: string;
  vigenciaFin: Date;
  spotsProgramados: number;
  lineas: string[];
  estado: 'activa' | 'por_vencer' | 'vencida';
}

interface AlertasVencimientosProps {
  cunas: CunaConVigencia[];
  onReemplazar: (cunaId: string, nuevaCunaId: string) => void;
  onExtender: (cunaId: string, nuevaFecha: Date) => void;
  onVerDetalles: (cunaId: string) => void;
  cunasDisponibles: { id: string; codigo: string; nombre: string }[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const hoy = new Date();

const CUNAS_MOCK: CunaConVigencia[] = [
  {
    id: 'cuna_001',
    codigo: 'BCH-VER-001',
    nombre: 'BANCO CHILE Verano',
    anunciante: 'BANCO CHILE',
    vigenciaFin: new Date(hoy.getTime() + 0 * 24 * 60 * 60 * 1000), // HOY
    spotsProgramados: 15,
    lineas: ['Prime Matinal', 'Prime Tarde'],
    estado: 'vencida'
  },
  {
    id: 'cuna_002',
    codigo: 'ENT-PRO-001',
    nombre: 'ENTEL Promocional',
    anunciante: 'ENTEL',
    vigenciaFin: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000), // En 2 días
    spotsProgramados: 30,
    lineas: ['Mañana'],
    estado: 'por_vencer'
  },
  {
    id: 'cuna_003',
    codigo: 'FAL-BF-001',
    nombre: 'FALABELLA Black Friday',
    anunciante: 'FALABELLA',
    vigenciaFin: new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000), // En 5 días
    spotsProgramados: 45,
    lineas: ['Prime Matinal', 'Tarde', 'Noche'],
    estado: 'por_vencer'
  },
  {
    id: 'cuna_004',
    codigo: 'CLR-5G-001',
    nombre: 'CLARO 5G',
    anunciante: 'CLARO',
    vigenciaFin: new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000), // En 15 días
    spotsProgramados: 60,
    lineas: ['Todo el día'],
    estado: 'activa'
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const AlertasVencimientos: React.FC<AlertasVencimientosProps> = ({
  cunas = CUNAS_MOCK,
  onReemplazar,
  onExtender,
  onVerDetalles,
  cunasDisponibles = []
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [cunaSeleccionada, setCunaSeleccionada] = useState<CunaConVigencia | null>(null);
  const [accionDialogo, setAccionDialogo] = useState<'reemplazar' | 'extender'>('reemplazar');
  const [cunaReemplazo, setCunaReemplazo] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [notificaciones, setNotificaciones] = useState(true);

  // Calcular días restantes
  const getDiasRestantes = (fecha: Date) => {
    const diff = fecha.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Formatear fecha
  const formatFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Clasificar cuñas
  const cunasClasificadas = useMemo(() => {
    const vencenHoy = cunas.filter(c => getDiasRestantes(c.vigenciaFin) <= 0);
    const vencen3Dias = cunas.filter(c => {
      const dias = getDiasRestantes(c.vigenciaFin);
      return dias > 0 && dias <= 3;
    });
    const vencen7Dias = cunas.filter(c => {
      const dias = getDiasRestantes(c.vigenciaFin);
      return dias > 3 && dias <= 7;
    });
    
    return { vencenHoy, vencen3Dias, vencen7Dias };
  }, [cunas]);

  // Abrir diálogo
  const abrirDialogo = (cuna: CunaConVigencia, accion: 'reemplazar' | 'extender') => {
    setCunaSeleccionada(cuna);
    setAccionDialogo(accion);
    setDialogoAbierto(true);
  };

  // Ejecutar acción
  const ejecutarAccion = () => {
    if (!cunaSeleccionada) return;

    if (accionDialogo === 'reemplazar' && cunaReemplazo) {
      onReemplazar?.(cunaSeleccionada.id, cunaReemplazo);
    } else if (accionDialogo === 'extender' && nuevaFecha) {
      onExtender?.(cunaSeleccionada.id, new Date(nuevaFecha));
    }

    setDialogoAbierto(false);
    setCunaReemplazo('');
    setNuevaFecha('');
  };

  // Renderizar grupo de alertas
  const renderGrupo = (
    titulo: string, 
    items: CunaConVigencia[], 
    colorBg: string, 
    colorText: string,
    iconColor: string
  ) => {
    if (items.length === 0) return null;

    return (
      <div className={`rounded-lg border ${colorBg} p-4 mb-4`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
          <h4 className={`font-bold ${colorText}`}>{titulo}</h4>
          <Badge className={`${colorBg} ${colorText} font-bold`}>{items.length}</Badge>
        </div>

        <div className="space-y-3">
          {items.map(cuna => {
            const dias = getDiasRestantes(cuna.vigenciaFin);
            
            return (
              <Card key={cuna.id} className="p-3 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Music className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cuna.codigo}</p>
                      <p className="text-sm text-gray-500">{cuna.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {cuna.anunciante}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {cuna.spotsProgramados} spots afectados
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-medium ${colorText}`}>
                      {dias === 0 ? 'VENCE HOY' : 
                       dias < 0 ? `VENCIDA hace ${Math.abs(dias)} día(s)` :
                       `Vence en ${dias} día(s)`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFecha(cuna.vigenciaFin)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onVerDetalles?.(cuna.id)}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => abrirDialogo(cuna, 'reemplazar')}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reemplazar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => abrirDialogo(cuna, 'extender')}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Extender
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 border-amber-200 bg-gradient-to-br from-amber-50/30 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">⏰ Alertas de Vencimientos</h3>
            <p className="text-sm text-gray-500">Cuñas próximas a vencer o vencidas</p>
          </div>
        </div>

        <Button
          variant={notificaciones ? "default" : "outline"}
          size="sm"
          className="gap-1"
          onClick={() => setNotificaciones(!notificaciones)}
        >
          {notificaciones ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          {notificaciones ? 'Notificaciones ON' : 'Notificaciones OFF'}
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-red-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-700">{cunasClasificadas.vencenHoy.length}</p>
          <p className="text-xs text-red-600">Vencen HOY</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-amber-700">{cunasClasificadas.vencen3Dias.length}</p>
          <p className="text-xs text-amber-600">Próximos 3 días</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-700">{cunasClasificadas.vencen7Dias.length}</p>
          <p className="text-xs text-yellow-600">Próximos 7 días</p>
        </div>
      </div>

      {/* Grupos de alertas */}
      {renderGrupo(
        '🔴 VENCEN HOY', 
        cunasClasificadas.vencenHoy,
        'bg-red-50 border-red-200',
        'text-red-700',
        'text-red-600'
      )}

      {renderGrupo(
        '🟠 VENCEN EN 3 DÍAS', 
        cunasClasificadas.vencen3Dias,
        'bg-amber-50 border-amber-200',
        'text-amber-700',
        'text-amber-600'
      )}

      {renderGrupo(
        '🟡 VENCEN EN 7 DÍAS', 
        cunasClasificadas.vencen7Dias,
        'bg-yellow-50 border-yellow-200',
        'text-yellow-700',
        'text-yellow-600'
      )}

      {/* Sin alertas */}
      {cunasClasificadas.vencenHoy.length === 0 && 
       cunasClasificadas.vencen3Dias.length === 0 && 
       cunasClasificadas.vencen7Dias.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay cuñas próximas a vencer</p>
        </div>
      )}

      {/* Diálogo de acción */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {accionDialogo === 'reemplazar' ? (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  Reemplazar Cuña
                </>
              ) : (
                <>
                  <CalendarPlus className="w-5 h-5 text-green-600" />
                  Extender Vigencia
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {cunaSeleccionada && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Cuña seleccionada:</p>
                <p className="font-medium">{cunaSeleccionada.codigo} - {cunaSeleccionada.nombre}</p>
                <p className="text-xs text-gray-500">
                  {cunaSeleccionada.spotsProgramados} spots afectados
                </p>
              </div>

              {accionDialogo === 'reemplazar' ? (
                <Select value={cunaReemplazo} onValueChange={setCunaReemplazo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuña de reemplazo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cunasDisponibles.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.codigo} - {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nueva fecha de vigencia:</label>
                  <Input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={ejecutarAccion}
              disabled={accionDialogo === 'reemplazar' ? !cunaReemplazo : !nuevaFecha}
            >
              {accionDialogo === 'reemplazar' ? 'Aplicar Reemplazo' : 'Extender Vigencia'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AlertasVencimientos;
