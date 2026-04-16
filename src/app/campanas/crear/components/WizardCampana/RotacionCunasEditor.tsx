/**
 * 🔄 SILEXAR PULSE - Sistema de Rotación de Cuñas 2050
 * 
 * @description Componente enterprise para configurar rotación de
 * múltiples versiones de cuñas (A/B/C), scheduling por fecha,
 * cuña de backup y A/B testing automático.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Music,
  Calendar,
  BarChart3,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Shuffle,
  ArrowRight,
  Shield
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CunaEnRotacion {
  id: string;
  cunaId: string;
  cunaCodigo: string;
  cunaNombre: string;
  duracion: number;
  peso: number; // Porcentaje de rotación
  fechaInicio?: string;
  fechaFin?: string;
  activa: boolean;
  emisiones: number;
  esVarianteAB?: boolean;
}

export interface ConfiguracionRotacion {
  lineaId: string;
  lineaNombre: string;
  tipoRotacion: 'equitativo' | 'ponderado' | 'secuencial' | 'ab_test' | 'por_fecha';
  cunasEnRotacion: CunaEnRotacion[];
  cunaBackupId?: string;
  cunaBackupNombre?: string;
  abTestActivo: boolean;
  splitPorcentaje: number; // Para A/B: 50/50, 70/30, etc.
}

interface RotacionCunasEditorProps {
  lineaId: string;
  lineaNombre: string;
  configuracion?: ConfiguracionRotacion;
  cunasDisponibles?: { id: string; codigo: string; nombre: string; duracion: number }[];
  anuncianteId?: string; // Nuevo: si se pasa, fetch automático de la API
  onGuardar: (config: ConfiguracionRotacion) => void;
  onCancelar: () => void;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const TIPOS_ROTACION = [
  {
    id: 'equitativo',
    label: 'Equitativo',
    desc: 'Todas las cuñas se emiten igual cantidad de veces',
    icon: Shuffle
  },
  {
    id: 'ponderado',
    label: 'Ponderado',
    desc: 'Cada cuña tiene un peso diferente en la rotación',
    icon: Percent
  },
  {
    id: 'secuencial',
    label: 'Secuencial',
    desc: 'Las cuñas se emiten en orden: A, B, C, A, B, C...',
    icon: ArrowRight
  },
  {
    id: 'ab_test',
    label: 'A/B Testing',
    desc: 'Compara rendimiento entre dos versiones',
    icon: BarChart3
  },
  {
    id: 'por_fecha',
    label: 'Por Fecha',
    desc: 'Diferentes cuñas según el período',
    icon: Calendar
  }
];

/**
 * ERRATA LOG — RotacionCunasEditor
 * 
 * BUG FIXED: Previously used CUNAS_MOCK hardcodeado como default.
 * FIX: Added anuncianteId prop → auto-fetches from /api/cunas?anuncianteId=X&estado=aprobada
 * BACKWARD COMPAT: cunasDisponibles prop still works as before.
 */

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const RotacionCunasEditor: React.FC<RotacionCunasEditorProps> = ({
  lineaId,
  lineaNombre,
  configuracion,
  cunasDisponibles: cunasProp,
  anuncianteId,
  onGuardar,
  onCancelar
}) => {
  // Estado para cuñas cargadas desde API
  const [cunasApi, setCunasApi] = useState<{ id: string; codigo: string; nombre: string; duracion: number }[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);

  // Fetch automático cuando hay anuncianteId
  useEffect(() => {
    if (!anuncianteId) return;
    let cancelled = false;
    setLoadingApi(true);

    fetch(`/api/cunas?anuncianteId=${anuncianteId}&estado=aprobada&limit=100`)
      .then(res => res.json())
      .then(json => {
        if (!cancelled && json.success && json.data) {
          setCunasApi(json.data.map((c: any) => ({
            id: c.id,
            codigo: c.spxCodigo || c.codigo,
            nombre: c.nombre,
            duracion: c.duracionSegundos || 30,
          })));
        }
      })
      .catch(() => { /* silencioso, fallback a prop si existe */ })
      .finally(() => { if (!cancelled) setLoadingApi(false); });

    return () => { cancelled = true; };
  }, [anuncianteId]);

  // Cuñas efectivas: API > prop > empty
  const cunasDisponibles = anuncianteId
    ? (cunasApi.length > 0 ? cunasApi : (cunasProp || []))
    : (cunasProp || []);

  const [config, setConfig] = useState<ConfiguracionRotacion>({
    lineaId,
    lineaNombre,
    tipoRotacion: 'equitativo',
    cunasEnRotacion: [],
    abTestActivo: false,
    splitPorcentaje: 50,
    ...configuracion
  });

  const [cunaSeleccionada, setCunaSeleccionada] = useState('');

  // Calcular peso total
  const pesoTotal = useMemo(() => {
    return config.cunasEnRotacion.reduce((acc, c) => acc + (c.activa ? c.peso : 0), 0);
  }, [config.cunasEnRotacion]);

  // Agregar cuña a rotación
  const agregarCuna = () => {
    if (!cunaSeleccionada) return;

    const cuna = cunasDisponibles.find(c => c.id === cunaSeleccionada);
    if (!cuna) return;

    // Verificar si ya existe
    if (config.cunasEnRotacion.some(c => c.cunaId === cunaSeleccionada)) return;

    const pesoEquitativo = 100 / (config.cunasEnRotacion.length + 1);

    setConfig(prev => ({
      ...prev,
      cunasEnRotacion: [
        ...prev.cunasEnRotacion.map(c => ({ ...c, peso: pesoEquitativo })),
        {
          id: `rot_${Date.now()}`,
          cunaId: cuna.id,
          cunaCodigo: cuna.codigo,
          cunaNombre: cuna.nombre,
          duracion: cuna.duracion,
          peso: pesoEquitativo,
          activa: true,
          emisiones: 0
        }
      ]
    }));

    setCunaSeleccionada('');
  };

  // Remover cuña de rotación
  const removerCuna = (cunaId: string) => {
    setConfig(prev => {
      const nuevasCunas = prev.cunasEnRotacion.filter(c => c.cunaId !== cunaId);
      const pesoEquitativo = nuevasCunas.length > 0 ? 100 / nuevasCunas.length : 0;
      return {
        ...prev,
        cunasEnRotacion: nuevasCunas.map(c => ({ ...c, peso: pesoEquitativo }))
      };
    });
  };

  // Actualizar peso
  const actualizarPeso = (cunaId: string, peso: number) => {
    setConfig(prev => ({
      ...prev,
      cunasEnRotacion: prev.cunasEnRotacion.map(c =>
        c.cunaId === cunaId ? { ...c, peso } : c
      )
    }));
  };

  // Toggle activa
  const toggleActiva = (cunaId: string) => {
    setConfig(prev => ({
      ...prev,
      cunasEnRotacion: prev.cunasEnRotacion.map(c =>
        c.cunaId === cunaId ? { ...c, activa: !c.activa } : c
      )
    }));
  };

  // Actualizar fechas
  const actualizarFecha = (cunaId: string, campo: 'fechaInicio' | 'fechaFin', valor: string) => {
    setConfig(prev => ({
      ...prev,
      cunasEnRotacion: prev.cunasEnRotacion.map(c =>
        c.cunaId === cunaId ? { ...c, [campo]: valor } : c
      )
    }));
  };

  // Guardar
  const handleGuardar = () => {
    onGuardar(config);
  };

  // Cuñas disponibles filtradas (no en rotación ya)
  const cunasParaAgregar = cunasDisponibles.filter(
    c => !config.cunasEnRotacion.some(r => r.cunaId === c.id) &&
      c.id !== config.cunaBackupId
  );

  return (
    <Card className="p-6 border-purple-200 bg-gradient-to-br from-purple-50/30 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">🔄 Rotación de Cuñas</h2>
            <p className="text-sm text-gray-500">Línea: {lineaNombre}</p>
          </div>
        </div>
        <Badge className="bg-purple-100 text-purple-700">
          {config.cunasEnRotacion.filter(c => c.activa).length} cuñas activas
        </Badge>
      </div>

      {/* Tipo de rotación */}
      <div className="mb-6">
        <Label className="mb-3 block">Tipo de Rotación</Label>
        <div className="grid grid-cols-5 gap-2">
          {TIPOS_ROTACION.map(tipo => {
            const Icono = tipo.icon;
            return (
              <div
                key={tipo.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${config.tipoRotacion === tipo.id
                  ? 'border-purple-400 bg-purple-100'
                  : 'hover:border-gray-300'
                  }`}
                onClick={() => setConfig(prev => ({ ...prev, tipoRotacion: tipo.id as ConfiguracionRotacion['tipoRotacion'] }))}
              >
                <Icono className={`w-5 h-5 mx-auto mb-1 ${config.tipoRotacion === tipo.id ? 'text-purple-600' : 'text-gray-500'}`} />
                <p className="text-xs font-medium">{tipo.label}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {TIPOS_ROTACION.find(t => t.id === config.tipoRotacion)?.desc}
        </p>
      </div>

      {/* Agregar cuña */}
      <div className="flex gap-2 mb-4">
        <Select value={cunaSeleccionada} onValueChange={setCunaSeleccionada} disabled={loadingApi}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loadingApi ? 'Cargando cuñas...' : 'Seleccionar cuña para agregar...'} />
          </SelectTrigger>
          <SelectContent>
            {loadingApi ? (
              <div className="flex items-center justify-center py-4 text-sm text-gray-400">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Cargando cuñas del anunciante...
              </div>
            ) : cunasParaAgregar.length === 0 ? (
              <div className="py-4 text-sm text-gray-400 text-center">
                {cunasDisponibles.length === 0
                  ? 'No hay cuñas disponibles. Agregue cuñas primero.'
                  : 'Todas las cuñas están en rotación'}
              </div>
            ) : (
              cunasParaAgregar.map(cuna => (
                <SelectItem key={cuna.id} value={cuna.id}>
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    {cuna.codigo} - {cuna.nombre} ({cuna.duracion}s)
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button onClick={agregarCuna} disabled={!cunaSeleccionada} className="gap-1">
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      {/* Lista de cuñas en rotación */}
      <div className="space-y-3 mb-6">
        {config.cunasEnRotacion.map((cuna, index) => (
          <Card
            key={cuna.id}
            className={`p-4 ${cuna.activa ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${cuna.activa ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cuna.cunaNombre}</p>
                  <p className="text-xs text-gray-500">{cuna.cunaCodigo} • {cuna.duracion}s</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={cuna.activa}
                  onCheckedChange={() => toggleActiva(cuna.cunaId)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removerCuna(cuna.cunaId)}
                  className="h-8 w-8 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {config.tipoRotacion === 'ponderado' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Peso en rotación</span>
                  <span className="font-medium">{cuna.peso.toFixed(0)}%</span>
                </div>
                <Slider
                  value={[cuna.peso]}
                  onValueChange={([v]) => actualizarPeso(cuna.cunaId, v)}
                  min={0}
                  max={100}
                  step={5}
                  disabled={!cuna.activa}
                />
              </div>
            )}

            {config.tipoRotacion === 'por_fecha' && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-1">
                  <Label className="text-xs">Desde</Label>
                  <Input
                    type="date"
                    aria-label="Fecha desde"
                    value={cuna.fechaInicio || ''}
                    onChange={(e) => actualizarFecha(cuna.cunaId, 'fechaInicio', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hasta</Label>
                  <Input
                    type="date"
                    aria-label="Fecha hasta"
                    value={cuna.fechaFin || ''}
                    onChange={(e) => actualizarFecha(cuna.cunaId, 'fechaFin', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            )}

            {config.tipoRotacion === 'ab_test' && index < 2 && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  {index === 0 ? '🅰️ Variante Control' : '🅱️ Variante Test'}
                </p>
              </div>
            )}
          </Card>
        ))}

        {config.cunasEnRotacion.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay cuñas en rotación</p>
            <p className="text-sm">Agregue cuñas para configurar la rotación</p>
          </div>
        )}
      </div>

      {/* A/B Testing */}
      {config.tipoRotacion === 'ab_test' && config.cunasEnRotacion.length >= 2 && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-700">Configuración A/B Test</h4>
            </div>
            <Switch
              checked={config.abTestActivo}
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, abTestActivo: v }))}
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm text-blue-600">Split</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700">A: {config.splitPorcentaje}%</Badge>
                  <Slider
                    value={[config.splitPorcentaje]}
                    onValueChange={([v]) => setConfig(prev => ({ ...prev, splitPorcentaje: v }))}
                    min={10}
                    max={90}
                    step={10}
                    className="w-32"
                  />
                  <Badge className="bg-green-100 text-green-700">B: {100 - config.splitPorcentaje}%</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cuña de backup */}
      <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-amber-600" />
          <h4 className="font-medium text-amber-700">Cuña de Backup</h4>
        </div>
        <p className="text-xs text-amber-600 mb-3">
          Se usará si ninguna cuña principal está disponible o hay error en el material.
        </p>
        <Select
          value={config.cunaBackupId || ''}
          onValueChange={(v) => {
            const cuna = cunasDisponibles.find(c => c.id === v);
            setConfig(prev => ({
              ...prev,
              cunaBackupId: v,
              cunaBackupNombre: cuna?.nombre
            }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuña de backup..." />
          </SelectTrigger>
          <SelectContent>
            {cunasDisponibles
              .filter(c => !config.cunasEnRotacion.some(r => r.cunaId === c.id))
              .map(cuna => (
                <SelectItem key={cuna.id} value={cuna.id}>
                  {cuna.codigo} - {cuna.nombre}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </Card>

      {/* Validación de peso */}
      {config.tipoRotacion === 'ponderado' && pesoTotal !== 100 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">
            Los pesos deben sumar 100%. Actual: {pesoTotal.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          className="gap-1 bg-purple-600"
          disabled={config.cunasEnRotacion.length === 0 || (config.tipoRotacion === 'ponderado' && pesoTotal !== 100)}
        >
          <CheckCircle2 className="w-4 h-4" />
          Guardar Rotación
        </Button>
      </div>
    </Card>
  );
};

export default RotacionCunasEditor;
