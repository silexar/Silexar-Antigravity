/**
 * 🗓️ SILEXAR PULSE - Auto-Distribuidor de Spots 2050
 * 
 * @description Componente para distribuir automáticamente spots a lo largo
 * de un período (días, semanas, meses, año completo) con patrones inteligentes.
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Clock,
  Zap,
  Settings,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Target,
  TrendingUp,
  Sparkles,
  Radio
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ConfiguracionDistribucion {
  spotsPorDia: number;
  duracionSpot: number; // segundos
  horariosPreferidos: string[];
  patron: 'uniforme' | 'mas_semana' | 'picos_viernes' | 'custom';
  evitarFeriados: boolean;
  evitarFinSemana: boolean;
  distribucionSemana: {
    lunes: number;
    martes: number;
    miercoles: number;
    jueves: number;
    viernes: number;
    sabado: number;
    domingo: number;
  };
}

interface ResultadoDistribucion {
  diasProgramados: number;
  spotsTotal: number;
  minutosAire: number;
  costoEstimado: number;
  distribucionPorDia: { fecha: string; spots: number }[];
  alertas: string[];
}

interface AutoDistribuidorProps {
  fechaInicio: Date;
  fechaFin: Date;
  emisoras: string[];
  tarifaPorSpot?: number;
  onDistribuir: (resultado: ResultadoDistribucion) => void;
  onCancelar: () => void;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const HORARIOS_DISPONIBLES = [
  { id: '06:00-09:00', label: 'Prime Matinal (06:00-09:00)', multiplicador: 1.5 },
  { id: '09:00-12:00', label: 'Mañana (09:00-12:00)', multiplicador: 1.2 },
  { id: '12:00-15:00', label: 'Mediodía (12:00-15:00)', multiplicador: 1.0 },
  { id: '15:00-18:00', label: 'Tarde (15:00-18:00)', multiplicador: 1.1 },
  { id: '18:00-21:00', label: 'Prime Nocturno (18:00-21:00)', multiplicador: 1.4 },
  { id: '21:00-00:00', label: 'Noche (21:00-00:00)', multiplicador: 0.9 },
  { id: '00:00-06:00', label: 'Trasnoche (00:00-06:00)', multiplicador: 0.5 }
];

const PATRONES_PREDEFINIDOS = [
  { id: 'uniforme', label: 'Uniforme', descripcion: 'Misma cantidad todos los días' },
  { id: 'mas_semana', label: 'Más en semana', descripcion: 'Mayor concentración Lun-Vie' },
  { id: 'picos_viernes', label: 'Picos Vie-Dom', descripcion: 'Máximo en fin de semana' },
  { id: 'custom', label: 'Personalizado', descripcion: 'Definir manualmente' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const AutoDistribuidorSpots: React.FC<AutoDistribuidorProps> = ({
  fechaInicio,
  fechaFin,
  emisoras,
  tarifaPorSpot = 15000,
  onDistribuir,
  onCancelar
}) => {
  // Estado de configuración
  const [config, setConfig] = useState<ConfiguracionDistribucion>({
    spotsPorDia: 4,
    duracionSpot: 30,
    horariosPreferidos: ['06:00-09:00', '18:00-21:00'],
    patron: 'mas_semana',
    evitarFeriados: true,
    evitarFinSemana: false,
    distribucionSemana: {
      lunes: 100,
      martes: 100,
      miercoles: 100,
      jueves: 100,
      viernes: 120,
      sabado: 60,
      domingo: 40
    }
  });

  const [generando, setGenerando] = useState(false);
  const [preview, setPreview] = useState<ResultadoDistribucion | null>(null);

  // Calcular días totales
  const diasTotales = useMemo(() => {
    const diff = fechaFin.getTime() - fechaInicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [fechaInicio, fechaFin]);

  // Calcular preview
  const calcularPreview = useCallback(() => {
    const resultado: ResultadoDistribucion = {
      diasProgramados: 0,
      spotsTotal: 0,
      minutosAire: 0,
      costoEstimado: 0,
      distribucionPorDia: [],
      alertas: []
    };

    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
      const diaSemana = diasSemana[fechaActual.getDay()] as keyof typeof config.distribucionSemana;
      const multiplicador = config.distribucionSemana[diaSemana] / 100;
      
      // Verificar si evitar fin de semana
      const esFinSemana = fechaActual.getDay() === 0 || fechaActual.getDay() === 6;
      if (config.evitarFinSemana && esFinSemana) {
        fechaActual.setDate(fechaActual.getDate() + 1);
        continue;
      }

      const spotsDia = Math.round(config.spotsPorDia * multiplicador * emisoras.length);
      
      if (spotsDia > 0) {
        resultado.diasProgramados++;
        resultado.spotsTotal += spotsDia;
        resultado.distribucionPorDia.push({
          fecha: fechaActual.toISOString().split('T')[0],
          spots: spotsDia
        });
      }

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    resultado.minutosAire = (resultado.spotsTotal * config.duracionSpot) / 60;
    resultado.costoEstimado = resultado.spotsTotal * tarifaPorSpot;

    // Alertas
    if (resultado.spotsTotal > 1000) {
      resultado.alertas.push('Campaña con más de 1000 spots - verificar disponibilidad');
    }
    if (resultado.minutosAire > 500) {
      resultado.alertas.push('Más de 500 minutos de aire - campaña de alto volumen');
    }

    return resultado;
  }, [config, fechaInicio, fechaFin, emisoras, tarifaPorSpot]);

  // Actualizar preview cuando cambia config
  React.useEffect(() => {
    const newPreview = calcularPreview();
    setPreview(newPreview);
  }, [calcularPreview]);

  // Generar distribución
  const handleGenerar = async () => {
    setGenerando(true);
    await new Promise(r => setTimeout(r, 1500)); // Simular procesamiento
    
    const resultado = calcularPreview();
    onDistribuir(resultado);
    setGenerando(false);
  };

  // Actualizar configuración
  const updateConfig = (key: keyof ConfiguracionDistribucion, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Toggle horario
  const toggleHorario = (horarioId: string) => {
    setConfig(prev => ({
      ...prev,
      horariosPreferidos: prev.horariosPreferidos.includes(horarioId)
        ? prev.horariosPreferidos.filter(h => h !== horarioId)
        : [...prev.horariosPreferidos, horarioId]
    }));
  };

  // Aplicar patrón predefinido
  const aplicarPatron = (patronId: string) => {
    let distribucion = config.distribucionSemana;
    
    switch (patronId) {
      case 'uniforme':
        distribucion = { lunes: 100, martes: 100, miercoles: 100, jueves: 100, viernes: 100, sabado: 100, domingo: 100 };
        break;
      case 'mas_semana':
        distribucion = { lunes: 100, martes: 100, miercoles: 100, jueves: 100, viernes: 120, sabado: 60, domingo: 40 };
        break;
      case 'picos_viernes':
        distribucion = { lunes: 80, martes: 80, miercoles: 80, jueves: 100, viernes: 150, sabado: 130, domingo: 100 };
        break;
    }
    
    setConfig(prev => ({ ...prev, patron: patronId as ConfiguracionDistribucion['patron'], distribucionSemana: distribucion }));
  };

  return (
    <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">🗓️ Auto-Distribuidor de Spots</h2>
          <p className="text-sm text-gray-500">
            {emisoras.length} emisora(s) • {diasTotales} días ({fechaInicio.toLocaleDateString('es-CL')} - {fechaFin.toLocaleDateString('es-CL')})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
        <div className="space-y-6">
          {/* Spots por día */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Spots por día por emisora
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[config.spotsPorDia]}
                onValueChange={([v]) => updateConfig('spotsPorDia', v)}
                min={1}
                max={20}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={config.spotsPorDia}
                onChange={(e) => updateConfig('spotsPorDia', parseInt(e.target.value) || 1)}
                className="w-20 h-9 text-center"
              />
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Duración del spot
            </Label>
            <Select 
              value={config.duracionSpot.toString()} 
              onValueChange={(v) => updateConfig('duracionSpot', parseInt(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 segundos</SelectItem>
                <SelectItem value="20">20 segundos</SelectItem>
                <SelectItem value="30">30 segundos</SelectItem>
                <SelectItem value="45">45 segundos</SelectItem>
                <SelectItem value="60">60 segundos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Horarios preferidos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Horarios preferidos
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {HORARIOS_DISPONIBLES.map(horario => (
                <div
                  key={horario.id}
                  className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                    config.horariosPreferidos.includes(horario.id)
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => toggleHorario(horario.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={config.horariosPreferidos.includes(horario.id)} />
                    <span className="text-xs font-medium">{horario.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    x{horario.multiplicador}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Patrón de distribución */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Patrón de distribución
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PATRONES_PREDEFINIDOS.map(patron => (
                <div
                  key={patron.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.patron === patron.id
                      ? 'bg-purple-100 border-purple-300'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => aplicarPatron(patron.id)}
                >
                  <p className="text-sm font-medium">{patron.label}</p>
                  <p className="text-xs text-gray-500">{patron.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Opciones
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm">Evitar feriados</span>
                <Switch
                  checked={config.evitarFeriados}
                  onCheckedChange={(v) => updateConfig('evitarFeriados', v)}
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm">Evitar fin de semana</span>
                <Switch
                  checked={config.evitarFinSemana}
                  onCheckedChange={(v) => updateConfig('evitarFinSemana', v)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PREVIEW */}
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              📊 Preview de Distribución
            </h3>

            {preview && (
              <>
                {/* Métricas principales */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Días programados</p>
                    <p className="text-2xl font-bold text-gray-900">{preview.diasProgramados}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Total spots</p>
                    <p className="text-2xl font-bold text-blue-600">{preview.spotsTotal}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Minutos de aire</p>
                    <p className="text-2xl font-bold text-purple-600">{preview.minutosAire.toFixed(0)}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Costo estimado</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${preview.costoEstimado.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>

                {/* Distribución semanal visual */}
                <div className="p-3 bg-white rounded-lg border mb-4">
                  <p className="text-xs text-gray-500 mb-2">Distribución semanal</p>
                  <div className="flex items-end justify-between h-20 gap-1">
                    {Object.entries(config.distribucionSemana).map(([dia, valor]) => (
                      <div key={dia} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all"
                          style={{ height: `${(valor / 150) * 100}%` }}
                        />
                        <span className="text-xs mt-1 text-gray-500">
                          {dia.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alertas */}
                {preview.alertas.length > 0 && (
                  <div className="space-y-2">
                    {preview.alertas.map((alerta, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-amber-700">{alerta}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancelar}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 gap-2"
              onClick={handleGenerar}
              disabled={generando}
            >
              {generando ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generar Programación
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AutoDistribuidorSpots;
