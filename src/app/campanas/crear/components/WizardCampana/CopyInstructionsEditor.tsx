/**
 * 📋 SILEXAR PULSE - Copy Instructions (Instrucciones de Material) 2050
 * 
 * @description Sistema enterprise para gestionar las instrucciones que acompañan
 * cada cuña: texto de mención, pronunciación, tono, restricciones y variaciones.
 * Estándar similar a WideOrbit EMI (Electronic Material Instructions)
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Mic,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Save,
  Eye,
  History,
  Volume2,
  Calendar,
  Ban,
  Plus,
  Trash2,
  Languages
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CopyInstruction {
  id: string;
  cunaId: string;
  cunaCodigo: string;
  cunaNombre: string;
  
  // Texto principal
  textoMencion: string;
  guiaPronunciacion: string;
  
  // Variaciones por horario
  variacionesPorHorario: {
    horario: string;
    tono: string;
    enfasis: string;
    notas: string;
  }[];
  
  // Restricciones
  restricciones: {
    competidoresExcluidos: string[];
    separacionMinutosCompetencia: number;
    horariosProhibidos: string[];
    programasProhibidos: string[];
    notasRestricciones: string;
  };
  
  // Vigencia
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  
  // Aprobación
  estadoAprobacion: 'borrador' | 'pendiente' | 'aprobado' | 'rechazado';
  aprobadoPorCliente: boolean;
  nombreAprobador: string;
  fechaAprobacion: string;
  
  // Versión
  version: number;
  historialVersiones: { version: number; fecha: string; cambios: string }[];
}

interface CopyInstructionsEditorProps {
  cunaId: string;
  cunaCodigo: string;
  cunaNombre: string;
  anunciante: string;
  instruction?: Partial<CopyInstruction>;
  onSave: (instruction: CopyInstruction) => void;
  onCancel: () => void;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const TONOS_LECTURA = [
  { id: 'energico', label: 'Enérgico', desc: 'Dinámico, con entusiasmo' },
  { id: 'profesional', label: 'Profesional', desc: 'Serio, corporativo' },
  { id: 'relajado', label: 'Relajado', desc: 'Casual, amigable' },
  { id: 'urgente', label: 'Urgente', desc: 'Con sentido de urgencia' },
  { id: 'emotivo', label: 'Emotivo', desc: 'Conecta emocionalmente' },
  { id: 'informativo', label: 'Informativo', desc: 'Claro, objetivo' }
];

const HORARIOS_PREDEFINIDOS = [
  'Prime Matinal (06:00-09:00)',
  'Mañana (09:00-12:00)',
  'Mediodía (12:00-15:00)',
  'Tarde (15:00-18:00)',
  'Prime Nocturno (18:00-21:00)',
  'Noche (21:00-00:00)',
  'Trasnoche (00:00-06:00)'
];

const COMPETIDORES_COMUNES = [
  'COCA-COLA', 'PEPSI', 'FANTA', 'SPRITE',
  'BANCO CHILE', 'BANCO SANTANDER', 'BCI', 'BANCO ESTADO',
  'ENTEL', 'CLARO', 'MOVISTAR', 'WOM',
  'FALABELLA', 'PARIS', 'RIPLEY', 'LA POLAR'
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const CopyInstructionsEditor: React.FC<CopyInstructionsEditorProps> = ({
  cunaId,
  cunaCodigo,
  cunaNombre,
  anunciante,
  instruction,
  onSave,
  onCancel
}) => {
  const [data, setData] = useState<Partial<CopyInstruction>>({
    cunaId,
    cunaCodigo,
    cunaNombre,
    textoMencion: '',
    guiaPronunciacion: '',
    variacionesPorHorario: [
      { horario: 'Prime Matinal (06:00-09:00)', tono: 'energico', enfasis: '', notas: '' },
      { horario: 'Prime Nocturno (18:00-21:00)', tono: 'relajado', enfasis: '', notas: '' }
    ],
    restricciones: {
      competidoresExcluidos: [],
      separacionMinutosCompetencia: 15,
      horariosProhibidos: [],
      programasProhibidos: [],
      notasRestricciones: ''
    },
    fechaInicioVigencia: new Date().toISOString().split('T')[0],
    fechaFinVigencia: '',
    estadoAprobacion: 'borrador',
    aprobadoPorCliente: false,
    version: 1,
    ...instruction
  });

  const [nuevoCompetidor, setNuevoCompetidor] = useState('');
  const [tabActiva, setTabActiva] = useState('texto');

  // Actualizar campo
  const updateField = <K extends keyof CopyInstruction>(key: K, value: CopyInstruction[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Agregar competidor excluido
  const agregarCompetidor = (competidor: string) => {
    if (!competidor.trim()) return;
    const actual = data.restricciones?.competidoresExcluidos || [];
    if (!actual.includes(competidor.toUpperCase())) {
      setData(prev => ({
        ...prev,
        restricciones: {
          ...prev.restricciones!,
          competidoresExcluidos: [...actual, competidor.toUpperCase()]
        }
      }));
    }
    setNuevoCompetidor('');
  };

  // Remover competidor
  const removerCompetidor = (competidor: string) => {
    setData(prev => ({
      ...prev,
      restricciones: {
        ...prev.restricciones!,
        competidoresExcluidos: (prev.restricciones?.competidoresExcluidos || [])
          .filter(c => c !== competidor)
      }
    }));
  };

  // Agregar variación horaria
  const agregarVariacion = () => {
    setData(prev => ({
      ...prev,
      variacionesPorHorario: [
        ...(prev.variacionesPorHorario || []),
        { horario: '', tono: 'profesional', enfasis: '', notas: '' }
      ]
    }));
  };

  // Actualizar variación
  const actualizarVariacion = (index: number, campo: string, valor: string) => {
    setData(prev => ({
      ...prev,
      variacionesPorHorario: (prev.variacionesPorHorario || []).map((v, i) =>
        i === index ? { ...v, [campo]: valor } : v
      )
    }));
  };

  // Eliminar variación
  const eliminarVariacion = (index: number) => {
    setData(prev => ({
      ...prev,
      variacionesPorHorario: (prev.variacionesPorHorario || []).filter((_, i) => i !== index)
    }));
  };

  // Guardar
  const handleGuardar = () => {
    const instruction: CopyInstruction = {
      id: data.id || `ci_${Date.now()}`,
      cunaId: data.cunaId!,
      cunaCodigo: data.cunaCodigo!,
      cunaNombre: data.cunaNombre!,
      textoMencion: data.textoMencion || '',
      guiaPronunciacion: data.guiaPronunciacion || '',
      variacionesPorHorario: data.variacionesPorHorario || [],
      restricciones: data.restricciones!,
      fechaInicioVigencia: data.fechaInicioVigencia || '',
      fechaFinVigencia: data.fechaFinVigencia || '',
      estadoAprobacion: data.estadoAprobacion || 'borrador',
      aprobadoPorCliente: data.aprobadoPorCliente || false,
      nombreAprobador: data.nombreAprobador || '',
      fechaAprobacion: data.fechaAprobacion || '',
      version: data.version || 1,
      historialVersiones: data.historialVersiones || []
    };
    onSave(instruction);
  };

  return (
    <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50/30 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">📋 Copy Instructions</h2>
            <p className="text-sm text-gray-500">
              {cunaCodigo} | {cunaNombre} | {anunciante}
            </p>
          </div>
        </div>
        <Badge 
          className={
            data.estadoAprobacion === 'aprobado' ? 'bg-green-100 text-green-700' :
            data.estadoAprobacion === 'pendiente' ? 'bg-amber-100 text-amber-700' :
            data.estadoAprobacion === 'rechazado' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }
        >
          {data.estadoAprobacion === 'aprobado' && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {data.estadoAprobacion?.toUpperCase()}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="mb-4">
          <TabsTrigger value="texto" className="gap-1">
            <Mic className="w-4 h-4" />
            Texto y Pronunciación
          </TabsTrigger>
          <TabsTrigger value="variaciones" className="gap-1">
            <Clock className="w-4 h-4" />
            Variaciones Horario
          </TabsTrigger>
          <TabsTrigger value="restricciones" className="gap-1">
            <Ban className="w-4 h-4" />
            Restricciones
          </TabsTrigger>
          <TabsTrigger value="vigencia" className="gap-1">
            <Calendar className="w-4 h-4" />
            Vigencia
          </TabsTrigger>
        </TabsList>

        {/* TAB: Texto y Pronunciación */}
        <TabsContent value="texto" className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Texto de la Mención
            </Label>
            <Textarea
              placeholder="Escriba el texto exacto que debe leer el locutor..."
              value={data.textoMencion || ''}
              onChange={(e) => updateField('textoMencion', e.target.value)}
              rows={5}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              {(data.textoMencion || '').split(' ').length} palabras | 
              ~{Math.ceil((data.textoMencion || '').split(' ').length / 2.5)} segundos de lectura
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-600" />
              Guía de Pronunciación
            </Label>
            <Textarea
              placeholder="Indique cómo pronunciar marcas, nombres o términos especiales..."
              value={data.guiaPronunciacion || ''}
              onChange={(e) => updateField('guiaPronunciacion', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Ejemplo: "Coca-Cola" → énfasis en "Coca", pausa antes de "Cola"
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-700">Audio de Referencia (opcional)</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Subir audio de ejemplo
            </Button>
          </div>
        </TabsContent>

        {/* TAB: Variaciones por Horario */}
        <TabsContent value="variaciones" className="space-y-4">
          <p className="text-sm text-gray-600">
            Configure el tono y énfasis según el horario de emisión.
          </p>

          {(data.variacionesPorHorario || []).map((variacion, index) => (
            <Card key={index} className="p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <Select
                    value={variacion.horario}
                    onValueChange={(v) => actualizarVariacion(index, 'horario', v)}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Seleccionar horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {HORARIOS_PREDEFINIDOS.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar"
                  onClick={() => eliminarVariacion(index)}
                  className="h-8 w-8 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tono</Label>
                  <Select
                    value={variacion.tono}
                    onValueChange={(v) => actualizarVariacion(index, 'tono', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONOS_LECTURA.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <div>
                            <span className="font-medium">{t.label}</span>
                            <span className="text-xs text-gray-500 ml-2">{t.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Énfasis especial</Label>
                  <Input
                    placeholder="Ej: enfatizar el precio"
                    value={variacion.enfasis}
                    onChange={(e) => actualizarVariacion(index, 'enfasis', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Label className="text-sm">Notas adicionales</Label>
                <Textarea
                  placeholder="Instrucciones específicas para este horario..."
                  value={variacion.notas}
                  onChange={(e) => actualizarVariacion(index, 'notas', e.target.value)}
                  rows={2}
                />
              </div>
            </Card>
          ))}

          <Button variant="outline" onClick={agregarVariacion} className="w-full gap-1">
            <Plus className="w-4 h-4" />
            Agregar Variación de Horario
          </Button>
        </TabsContent>

        {/* TAB: Restricciones */}
        <TabsContent value="restricciones" className="space-y-4">
          <Card className="p-4 bg-red-50 border-red-200">
            <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Competidores Excluidos
            </h4>
            <p className="text-sm text-red-600 mb-3">
              Esta cuña NO debe emitirse junto a los siguientes anunciantes:
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {(data.restricciones?.competidoresExcluidos || []).map(comp => (
                <Badge key={comp} variant="destructive" className="gap-1">
                  {comp}
                  <button onClick={() => removerCompetidor(comp)} className="ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Select value={nuevoCompetidor} onValueChange={setNuevoCompetidor}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar competidor" />
                </SelectTrigger>
                <SelectContent>
                  {COMPETIDORES_COMUNES
                    .filter(c => !(data.restricciones?.competidoresExcluidos || []).includes(c))
                    .map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <Button onClick={() => agregarCompetidor(nuevoCompetidor)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <div className="space-y-2">
            <Label>Separación mínima de competencia (minutos)</Label>
            <Input
              type="number"
              value={data.restricciones?.separacionMinutosCompetencia || 15}
              onChange={(e) => setData(prev => ({
                ...prev,
                restricciones: {
                  ...prev.restricciones!,
                  separacionMinutosCompetencia: parseInt(e.target.value)
                }
              }))}
              className="w-32"
            />
          </div>

          <div className="space-y-2">
            <Label>Notas adicionales de restricciones</Label>
            <Textarea
              placeholder="Otras restricciones o consideraciones..."
              value={data.restricciones?.notasRestricciones || ''}
              onChange={(e) => setData(prev => ({
                ...prev,
                restricciones: {
                  ...prev.restricciones!,
                  notasRestricciones: e.target.value
                }
              }))}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* TAB: Vigencia */}
        <TabsContent value="vigencia" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha Inicio
              </Label>
              <Input
                type="date"
                value={data.fechaInicioVigencia || ''}
                onChange={(e) => updateField('fechaInicioVigencia', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha Fin
              </Label>
              <Input
                type="date"
                value={data.fechaFinVigencia || ''}
                onChange={(e) => updateField('fechaFinVigencia', e.target.value)}
              />
            </div>
          </div>

          <Card className="p-4 bg-green-50 border-green-200">
            <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Aprobación del Cliente
            </h4>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-green-600">
                  ¿El cliente ha aprobado estas instrucciones?
                </p>
                {data.aprobadoPorCliente && data.nombreAprobador && (
                  <p className="text-xs text-green-500">
                    Aprobado por: {data.nombreAprobador} | {data.fechaAprobacion}
                  </p>
                )}
              </div>
              <Switch
                checked={data.aprobadoPorCliente || false}
                onCheckedChange={(v) => {
                  updateField('aprobadoPorCliente', v);
                  if (v) {
                    updateField('estadoAprobacion', 'aprobado');
                    updateField('fechaAprobacion', new Date().toISOString());
                  }
                }}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acciones */}
      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" className="gap-1">
            <History className="w-4 h-4" />
            Historial
          </Button>
          <Button onClick={handleGuardar} className="gap-1 bg-blue-600">
            <Save className="w-4 h-4" />
            Guardar Instructions
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CopyInstructionsEditor;
