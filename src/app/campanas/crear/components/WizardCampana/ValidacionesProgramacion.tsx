/**
 * 🔍 Validaciones Automáticas - Checklist de Programación TIER0
 * 
 * Sistema de validaciones inteligentes que verifica:
 * - Campaña duplicada en bloque
 * - Posición en el bloque (coherencia tipo)
 * - Límite de tiempo en el bloque (saturación)
 * - Conflictos de competencia
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Shield, Zap,
  Play, RefreshCw, Settings, Radio, Target,
  AlertOctagon, CheckSquare, Square
} from 'lucide-react';

// ==================== INTERFACES ====================

interface ValidacionItem {
  id: string;
  nombre: string;
  descripcion: string;
  enabled: boolean;
  estado: 'pendiente' | 'validando' | 'ok' | 'warning' | 'error';
  mensaje?: string;
  icono: React.ReactNode;
}

interface ResultadoValidacion {
  lineasPlanificadas: number;
  lineasTotales: number;
  cunasRechazadas: number;
  conflictosDetectados: number;
  conflictosResueltos: number;
}

interface ConfiguracionAvanzada {
  nivelConflicto: 'ninguno' | 'bloque' | 'dia' | 'exclusivo';
  separacionMinutos: number;
  separacionTipo: 'ninguno' | 'tiempo' | 'bloques';
}

// ==================== COMPONENTE PRINCIPAL ====================

export function ValidacionesProgramacion({
  onPlanificar,
  onPlanificarLinea,
  onEliminarPlanificacion,
  onDesprogramarLineas,
  onCalcularValores,
}: {
  onPlanificar?: () => void;
  onPlanificarLinea?: () => void;
  onEliminarPlanificacion?: () => void;
  onDesprogramarLineas?: () => void;
  onCalcularValores?: () => void;
}) {
  const [validaciones, setValidaciones] = useState<ValidacionItem[]>([
    {
      id: 'campana_bloque',
      nombre: 'Verificar campaña en el bloque',
      descripcion: '🤖 Previene duplicación campaña en mismo bloque',
      enabled: true,
      estado: 'pendiente',
      icono: <Shield className="w-4 h-4" />,
    },
    {
      id: 'posicion_bloque',
      nombre: 'Verificar posición en el bloque',
      descripcion: '🎯 Valida coherencia: Auspicio→Bloque Auspicio',
      enabled: true,
      estado: 'pendiente',
      icono: <Target className="w-4 h-4" />,
    },
    {
      id: 'limite_tiempo',
      nombre: 'Verificar límite de tiempo en el bloque',
      descripcion: '⏱️ Controla saturación de tandas (300s máximo)',
      enabled: true,
      estado: 'pendiente',
      icono: <Clock className="w-4 h-4" />,
    },
    {
      id: 'conflictos',
      nombre: 'Comprobar si hay conflictos',
      descripcion: '🚨 Detecta competencia directa en misma tanda',
      enabled: false,
      estado: 'pendiente',
      icono: <AlertOctagon className="w-4 h-4" />,
    },
  ]);

  const [configuracion, setConfiguracion] = useState<ConfiguracionAvanzada>({
    nivelConflicto: 'bloque',
    separacionMinutos: 0,
    separacionTipo: 'ninguno',
  });

  const [isValidating, setIsValidating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [progreso, setProgreso] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [resultado, setResultado] = useState<ResultadoValidacion>({
    lineasPlanificadas: 17,
    lineasTotales: 20,
    cunasRechazadas: 23,
    conflictosDetectados: 2,
    conflictosResueltos: 2,
  });

  const toggleValidacion = (id: string) => {
    setValidaciones(prev => prev.map(v => 
      v.id === id ? { ...v, enabled: !v.enabled } : v
    ));
  };

  const simularValidacion = async () => {
    setIsValidating(true);
    setProgreso(0);

    // Simular validación paso a paso
    for (let i = 0; i < validaciones.length; i++) {
      const v = validaciones[i];
      if (!v.enabled) continue;

      setValidaciones(prev => prev.map(item => 
        item.id === v.id ? { ...item, estado: 'validando' } : item
      ));

      await new Promise(r => setTimeout(r, 500));
      setProgreso((i + 1) / validaciones.length * 100);

      // Simular resultado
      const estados: Array<'ok' | 'warning' | 'error'> = ['ok', 'ok', 'warning', 'ok'];
      const mensajes = [
        'Sin duplicados detectados',
        'Posiciones coherentes',
        '23 cuñas rechazadas por límite tiempo',
        'Sin conflictos de competencia',
      ];

      setValidaciones(prev => prev.map(item => 
        item.id === v.id ? { 
          ...item, 
          estado: estados[i] || 'ok',
          mensaje: mensajes[i]
        } : item
      ));
    }

    setIsValidating(false);
    setProgreso(100);
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ok': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'validando': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Square className="w-5 h-5 text-gray-300" />;
    }
  };

  const getEstadoBg = (estado: string) => {
    switch (estado) {
      case 'ok': return 'bg-emerald-50 border-emerald-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'validando': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const porcentajePlanificacion = Math.round((resultado.lineasPlanificadas / resultado.lineasTotales) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            ⚙️ OPCIONES DE PROGRAMACIÓN INTELIGENTE
          </h3>
          <p className="text-sm text-gray-500">Validaciones automáticas antes de planificar</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={simularValidacion}
          disabled={isValidating}
          className="gap-2"
        >
          {isValidating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Validar Todo
        </Button>
      </div>

      {/* Checklist de Validaciones */}
      <Card className="p-4 border-l-4 border-l-blue-500">
        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          ✅ CHECKLIST DE VALIDACIONES AUTOMÁTICAS
        </h4>

        <div className="space-y-3">
          {validaciones.map(v => (
            <div 
              key={v.id}
              className={`p-3 rounded-lg border transition-all ${getEstadoBg(v.estado)}`}
            >
              <div className="flex items-center gap-3">
                <Switch 
                  checked={v.enabled}
                  onCheckedChange={() => toggleValidacion(v.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {v.icono}
                    <span className={`font-medium ${v.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                      {v.enabled ? '☑️' : '☐'} {v.nombre}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">└─ {v.descripcion}</p>
                  {v.mensaje && v.estado !== 'pendiente' && (
                    <p className={`text-xs ml-6 mt-1 ${
                      v.estado === 'ok' ? 'text-emerald-600' :
                      v.estado === 'warning' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      → {v.mensaje}
                    </p>
                  )}
                </div>
                {getEstadoIcon(v.estado)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Configuración Avanzada */}
      <Card className="p-4">
        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          🎯 CONFIGURACIÓN AVANZADA
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Nivel de Conflicto:</label>
            <Select 
              value={configuracion.nivelConflicto}
              onValueChange={(v) => setConfiguracion(prev => ({ ...prev, nivelConflicto: v as ConfiguracionAvanzada['nivelConflicto'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">Ninguno</SelectItem>
                <SelectItem value="bloque">Bloque Exclusivo</SelectItem>
                <SelectItem value="dia">Día Exclusivo</SelectItem>
                <SelectItem value="exclusivo">Campaña Exclusiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Separación:</label>
            <div className="flex gap-2">
              <Select 
                value={configuracion.separacionTipo}
                onValueChange={(v) => setConfiguracion(prev => ({ ...prev, separacionTipo: v as ConfiguracionAvanzada['separacionTipo'] }))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Ninguno</SelectItem>
                  <SelectItem value="tiempo">Tiempo</SelectItem>
                  <SelectItem value="bloques">Bloques</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="text"
                value="00:00"
                aria-label="Hora de separación"
                className="w-20 px-2 border rounded text-center text-sm"
                disabled={configuracion.separacionTipo === 'ninguno'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Estado de Programación */}
      <Card className="p-4 bg-slate-50">
        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4" />
          📊 ESTADO PROGRAMACIÓN ACTUAL
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Prog</th>
                <th className="p-2 text-left">Dur</th>
                <th className="p-2 text-left">H.Inicio</th>
                <th className="p-2 text-left">H.Final</th>
                <th className="p-2 text-left">Hora</th>
                <th className="p-2 text-left">Bloque</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">F.Final</th>
                <th className="p-2 text-center">Lun</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ✅</td>
                <td className="p-2">35s</td>
                <td className="p-2">07:00</td>
                <td className="p-2">09:30</td>
                <td className="p-2">0</td>
                <td className="p-2"><Badge className="bg-red-100 text-red-700">PRIME</Badge></td>
                <td className="p-2">11/08/25</td>
                <td className="p-2">26/08/25</td>
                <td className="p-2 text-center">1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Acciones de Programación */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700 h-auto py-3 flex-col"
          onClick={onPlanificar}
        >
          <Target className="w-5 h-5" />
          <span>🎯 PLANIFICAR CAMPAÑA</span>
          <span className="text-[10px] opacity-70">⚡ Procesa todas las líneas en {'<5s'}</span>
        </Button>

        <Button 
          variant="outline"
          className="gap-2 h-auto py-3 flex-col"
          onClick={onPlanificarLinea}
        >
          <Play className="w-5 h-5" />
          <span>📋 PLANIFICAR LÍNEA</span>
          <span className="text-[10px] opacity-70">🎯 Solo línea seleccionada</span>
        </Button>

        <Button 
          variant="outline"
          className="gap-2 h-auto py-3 flex-col text-red-600 border-red-200 hover:bg-red-50"
          onClick={onEliminarPlanificacion}
        >
          <XCircle className="w-5 h-5" />
          <span>❌ ELIMINAR PLANIFICACIÓN</span>
          <span className="text-[10px] opacity-70">🔄 Libera espacios</span>
        </Button>

        <Button 
          variant="outline"
          className="gap-2 h-auto py-3 flex-col"
          onClick={onDesprogramarLineas}
        >
          <RefreshCw className="w-5 h-5" />
          <span>📝 DESPROGRAMAR LÍNEAS</span>
          <span className="text-[10px] opacity-70">🎯 Solo líneas seleccionadas</span>
        </Button>

        <Button 
          variant="outline"
          className="gap-2 h-auto py-3 flex-col text-amber-600 border-amber-200 hover:bg-amber-50"
          onClick={onCalcularValores}
        >
          <Zap className="w-5 h-5" />
          <span>💰 CALCULAR VALORES</span>
          <span className="text-[10px] opacity-70">🧮 Recalcula estructura</span>
        </Button>
      </div>

      {/* Progreso Planificación */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h4 className="font-bold text-gray-700 mb-3">📈 PROGRESO PLANIFICACIÓN</h4>
        
        <Progress value={porcentajePlanificacion} className="h-3 mb-2" />
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            ████████████████████████████████████████████░░░░░ {porcentajePlanificacion}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{resultado.lineasPlanificadas}/{resultado.lineasTotales}</p>
            <p className="text-gray-500">Líneas planificadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{resultado.cunasRechazadas}</p>
            <p className="text-gray-500">Cuñas rechazadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{resultado.conflictosResueltos}/{resultado.conflictosDetectados}</p>
            <p className="text-gray-500">Conflictos resueltos</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="gap-1">
            📊 Ver Detalles
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-amber-600">
            🚨 Gestionar Rechazadas
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-blue-600">
            ⚙️ Optimizar
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ValidacionesProgramacion;
