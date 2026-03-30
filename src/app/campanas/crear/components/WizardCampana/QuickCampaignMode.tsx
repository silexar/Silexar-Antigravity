/**
 * ⚡ SILEXAR PULSE - Quick Campaign Mode 2050
 * 
 * @description Modo rápido para crear campañas simples en una sola
 * pantalla, sin pasar por el wizard completo de 7 pasos.
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
import { Label } from '@/components/ui/label';
// Textarea and Switch removed - not used
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Zap,
  Rocket,
  Calendar,
  Clock,
  Radio,
  Target,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  Building2,
  FileText,
  Music
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface QuickCampanaData {
  // Básicos
  anuncianteId: string;
  anuncianteNombre: string;
  nombreCampana: string;
  tipoCampana: string;
  
  // Fechas
  fechaInicio: string;
  fechaFin: string;
  
  // Programación
  emisorasSeleccionadas: string[];
  spotsPorDia: number;
  duracionSpot: number;
  horariosSeleccionados: string[];
  
  // Material
  cunaId?: string;
  cunaNombre?: string;
  
  // Presupuesto
  presupuestoEstimado: number;
}

interface QuickCampaignModeProps {
  onGuardar: (data: QuickCampanaData) => void;
  onCancelar: () => void;
  onProgramar: (data: QuickCampanaData) => void;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const ANUNCIANTES_MOCK = [
  { id: 'anun_001', nombre: 'COCA-COLA CHILE' },
  { id: 'anun_002', nombre: 'BANCO CHILE' },
  { id: 'anun_003', nombre: 'FALABELLA' },
  { id: 'anun_004', nombre: 'ENTEL' },
  { id: 'anun_005', nombre: 'PARIS' }
];

const EMISORAS_MOCK = [
  { id: 'em_001', nombre: 'Radio Pudahuel', tarifa: 18000 },
  { id: 'em_002', nombre: 'ADN Radio', tarifa: 22000 },
  { id: 'em_003', nombre: 'Radio Futuro', tarifa: 15000 },
  { id: 'em_004', nombre: 'Oasis FM', tarifa: 12000 },
  { id: 'em_005', nombre: 'Radio Activa', tarifa: 16000 }
];

const HORARIOS_MOCK = [
  { id: 'prime_mat', label: 'Prime Matinal (06-09)', multiplicador: 1.5 },
  { id: 'manana', label: 'Mañana (09-12)', multiplicador: 1.2 },
  { id: 'mediodia', label: 'Mediodía (12-15)', multiplicador: 1.0 },
  { id: 'tarde', label: 'Tarde (15-18)', multiplicador: 1.1 },
  { id: 'prime_noc', label: 'Prime Nocturno (18-21)', multiplicador: 1.4 }
];

const CUNAS_MOCK = [
  { id: 'cuna_001', nombre: 'Verano 2025 - 30s', duracion: 30 },
  { id: 'cuna_002', nombre: 'Promo Enero - 20s', duracion: 20 },
  { id: 'cuna_003', nombre: 'Institucional - 30s', duracion: 30 }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const QuickCampaignMode: React.FC<QuickCampaignModeProps> = ({
  onGuardar,
  onCancelar,
  onProgramar
}) => {
  const [guardando, setGuardando] = useState(false);
  const [data, setData] = useState<QuickCampanaData>({
    anuncianteId: '',
    anuncianteNombre: '',
    nombreCampana: '',
    tipoCampana: 'promocional',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    emisorasSeleccionadas: [],
    spotsPorDia: 4,
    duracionSpot: 30,
    horariosSeleccionados: ['prime_mat', 'prime_noc'],
    presupuestoEstimado: 0
  });

  // Calcular días
  const diasCampana = useMemo(() => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [data.fechaInicio, data.fechaFin]);

  // Calcular spots totales
  const spotsTotal = useMemo(() => {
    return diasCampana * data.spotsPorDia * data.emisorasSeleccionadas.length;
  }, [diasCampana, data.spotsPorDia, data.emisorasSeleccionadas]);

  // Calcular presupuesto
  const presupuesto = useMemo(() => {
    let total = 0;
    data.emisorasSeleccionadas.forEach(emId => {
      const emisora = EMISORAS_MOCK.find(e => e.id === emId);
      if (emisora) {
        total += emisora.tarifa * data.spotsPorDia * diasCampana;
      }
    });
    return total;
  }, [data.emisorasSeleccionadas, data.spotsPorDia, diasCampana]);

  // Actualizar campo
  const updateField = <K extends keyof QuickCampanaData>(key: K, value: QuickCampanaData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Toggle emisora
  const toggleEmisora = (emisoraId: string) => {
    setData(prev => ({
      ...prev,
      emisorasSeleccionadas: prev.emisorasSeleccionadas.includes(emisoraId)
        ? prev.emisorasSeleccionadas.filter(id => id !== emisoraId)
        : [...prev.emisorasSeleccionadas, emisoraId]
    }));
  };

  // Toggle horario
  const toggleHorario = (horarioId: string) => {
    setData(prev => ({
      ...prev,
      horariosSeleccionados: prev.horariosSeleccionados.includes(horarioId)
        ? prev.horariosSeleccionados.filter(id => id !== horarioId)
        : [...prev.horariosSeleccionados, horarioId]
    }));
  };

  // Validar formulario
  const esValido = useMemo(() => {
    return (
      data.anuncianteId &&
      data.nombreCampana &&
      data.fechaInicio &&
      data.fechaFin &&
      data.emisorasSeleccionadas.length > 0 &&
      data.horariosSeleccionados.length > 0
    );
  }, [data]);

  // Guardar y programar
  const handleProgramar = async () => {
    setGuardando(true);
    await new Promise(r => setTimeout(r, 1500));
    onProgramar({ ...data, presupuestoEstimado: presupuesto });
    setGuardando(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚡ Campaña Rápida</h1>
          <p className="text-gray-500">Crea una campaña simple en menos de 1 minuto</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* COLUMNA 1: DATOS BÁSICOS */}
        <Card className="p-4 col-span-2 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold">Datos de la Campaña</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Anunciante */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Anunciante
              </Label>
              <Select 
                value={data.anuncianteId} 
                onValueChange={(v) => {
                  const anun = ANUNCIANTES_MOCK.find(a => a.id === v);
                  updateField('anuncianteId', v);
                  updateField('anuncianteNombre', anun?.nombre || '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {ANUNCIANTES_MOCK.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo de Campaña</Label>
              <Select value={data.tipoCampana} onValueChange={(v) => updateField('tipoCampana', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promocional">Promocional</SelectItem>
                  <SelectItem value="branding">Branding</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nombre */}
            <div className="space-y-2 col-span-2">
              <Label>Nombre de la Campaña</Label>
              <Input
                placeholder="Ej: Promo Verano 2025"
                value={data.nombreCampana}
                onChange={(e) => updateField('nombreCampana', e.target.value)}
              />
            </div>

            {/* Fechas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha Inicio
              </Label>
              <Input
                type="date"
                value={data.fechaInicio}
                onChange={(e) => updateField('fechaInicio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha Fin
              </Label>
              <Input
                type="date"
                value={data.fechaFin}
                onChange={(e) => updateField('fechaFin', e.target.value)}
              />
            </div>
          </div>

          {/* Emisoras */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Emisoras ({data.emisorasSeleccionadas.length} seleccionadas)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {EMISORAS_MOCK.map(emisora => (
                <div
                  key={emisora.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    data.emisorasSeleccionadas.includes(emisora.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleEmisora(emisora.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={data.emisorasSeleccionadas.includes(emisora.id)} />
                    <span className="text-sm font-medium">{emisora.nombre}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ${emisora.tarifa.toLocaleString()}/spot
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Programación */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Spots por día
              </Label>
              <Select 
                value={data.spotsPorDia.toString()} 
                onValueChange={(v) => updateField('spotsPorDia', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} spots/día</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duración del spot
              </Label>
              <Select 
                value={data.duracionSpot.toString()} 
                onValueChange={(v) => updateField('duracionSpot', parseInt(v))}
              >
                <SelectTrigger>
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
          </div>

          {/* Horarios */}
          <div className="space-y-3">
            <Label>Horarios preferidos</Label>
            <div className="flex flex-wrap gap-2">
              {HORARIOS_MOCK.map(horario => (
                <Badge
                  key={horario.id}
                  variant={data.horariosSeleccionados.includes(horario.id) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    data.horariosSeleccionados.includes(horario.id)
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleHorario(horario.id)}
                >
                  {horario.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Material (opcional) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Material (opcional)
            </Label>
            <Select 
              value={data.cunaId || ''} 
              onValueChange={(v) => {
                const cuna = CUNAS_MOCK.find(c => c.id === v);
                updateField('cunaId', v);
                updateField('cunaNombre', cuna?.nombre);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Asignar cuña..." />
              </SelectTrigger>
              <SelectContent>
                {CUNAS_MOCK.map(cuna => (
                  <SelectItem key={cuna.id} value={cuna.id}>
                    {cuna.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* COLUMNA 2: RESUMEN */}
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">📊 Resumen</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Días</span>
                <span className="font-bold text-gray-900">{diasCampana}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Emisoras</span>
                <span className="font-bold text-gray-900">{data.emisorasSeleccionadas.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Total Spots</span>
                <span className="font-bold text-blue-600">{spotsTotal}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Minutos de aire</span>
                <span className="font-bold text-purple-600">{(spotsTotal * data.duracionSpot / 60).toFixed(0)} min</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-700">Estimado</span>
                <span className="font-bold text-green-700 text-lg">
                  ${presupuesto.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          </Card>

          {/* Validación */}
          <Card className={`p-4 ${esValido ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            {esValido ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Listo para programar</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Falta completar:</span>
                </div>
                <ul className="text-xs text-amber-600 space-y-1 ml-7">
                  {!data.anuncianteId && <li>• Seleccionar anunciante</li>}
                  {!data.nombreCampana && <li>• Nombre de campaña</li>}
                  {data.emisorasSeleccionadas.length === 0 && <li>• Al menos 1 emisora</li>}
                  {data.horariosSeleccionados.length === 0 && <li>• Al menos 1 horario</li>}
                </ul>
              </div>
            )}
          </Card>

          {/* Acciones */}
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 gap-2"
              disabled={!esValido || guardando}
              onClick={handleProgramar}
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Programando...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Programar Campaña
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => onGuardar({ ...data, presupuestoEstimado: presupuesto })}
            >
              <Save className="w-4 h-4" />
              Guardar Borrador
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={onCancelar}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCampaignMode;
