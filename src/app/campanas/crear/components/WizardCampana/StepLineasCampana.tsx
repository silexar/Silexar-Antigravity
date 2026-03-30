/**
 * 📝 Step 5: Definición de Líneas TIER0 - Sistema Híbrido FM + Digital 2050
 * 
 * Permite crear las líneas de programación de la campaña con soporte
 * para FM tradicional (cuñas, menciones, frases, auspicios) y
 * publicidad digital programática (banners, audio ads, video ads).
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WizardStepProps } from './types/wizard.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, Trash2, Clock, Calendar, DollarSign, 
  Tv, AlertCircle, MapPin, Edit2, Settings,
  ChevronUp, ChevronDown, Gift, Zap, Radio, Smartphone,
  Music, Mic, MessageSquare, Shield, ImageIcon, Volume2,
  Video, Sparkles, Target, Eye
} from 'lucide-react';

// Nuevos componentes del sistema híbrido
import { EditorMencionesInline, EstadisticasTexto } from './EditorMencionesInline';
import { PanelTargetingAvanzado } from './PanelTargetingAvanzado';
import { EditorCreativosDigitales, ArchivoCreativo } from './EditorCreativosDigitales';
import { SistemaTrackingLinks } from './SistemaTrackingLinks';
import type {
  TipoContenidoFM,
  TipoContenidoDigital,
  FormatoBanner,
  TargetingCompleto,
  ConfiguracionTracking,
  DistribucionSemanal
} from './types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface LineaData {
  id: string;
  programa: string;
  horaInicio: string;
  horaFin: string;
  dias: string[];
  distribucion: DistribucionSemanal;
  bonificadas: DistribucionSemanal;
  duracion: number;
  valorUnitario: number;
  posicionFija: string;
  tipoPedido: string;
  paquete: string;
  total: number;
  // Nuevos campos para sistema híbrido
  medio?: 'fm' | 'digital';
  tipoContenido?: TipoContenidoFM | TipoContenidoDigital;
  textoMencion?: string;
  targeting?: Partial<TargetingCompleto>;
  tracking?: Partial<ConfiguracionTracking>;
}

interface StepLineasProps extends WizardStepProps {
  data: { lineas?: LineaData[]; valorBruto?: number; valorNeto?: number };
  onUpdate: (data: Record<string, unknown>) => void;
}

type MedioTab = 'fm' | 'digital' | 'hibrido';
type TipoContenidoActivo = TipoContenidoFM | TipoContenidoDigital;

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const DIAS_SEMANA = [
  { key: 'lunes', label: 'L', full: 'Lunes' },
  { key: 'martes', label: 'M', full: 'Martes' },
  { key: 'miercoles', label: 'M', full: 'Miércoles' },
  { key: 'jueves', label: 'J', full: 'Jueves' },
  { key: 'viernes', label: 'V', full: 'Viernes' },
  { key: 'sabado', label: 'S', full: 'Sábado' },
  { key: 'domingo', label: 'D', full: 'Domingo' },
] as const;

const TIPOS_CONTENIDO_FM: { id: TipoContenidoFM; label: string; icono: React.ElementType; color: string }[] = [
  { id: 'cuna', label: 'Cuña', icono: Music, color: 'bg-blue-100 text-blue-700' },
  { id: 'mencion', label: 'Mención', icono: Mic, color: 'bg-purple-100 text-purple-700' },
  { id: 'frase', label: 'Frase', icono: MessageSquare, color: 'bg-violet-100 text-violet-700' },
  { id: 'auspicio', label: 'Auspicio', icono: Shield, color: 'bg-amber-100 text-amber-700' },
];

const TIPOS_CONTENIDO_DIGITAL: { id: TipoContenidoDigital; label: string; icono: React.ElementType; color: string }[] = [
  { id: 'banner', label: 'Banner', icono: ImageIcon, color: 'bg-green-100 text-green-700' },
  { id: 'audio_ad', label: 'Audio Ad', icono: Volume2, color: 'bg-cyan-100 text-cyan-700' },
  { id: 'video_ad', label: 'Video Ad', icono: Video, color: 'bg-pink-100 text-pink-700' },
  { id: 'rich_media', label: 'Rich Media', icono: Sparkles, color: 'bg-indigo-100 text-indigo-700' },
];

const POSICIONES_FIJAS = [
  { id: 'ninguno', label: 'Ninguno (Rotación libre)' },
  { id: 'inicio', label: 'Inicio (Posición 1°)' },
  { id: 'segundo', label: 'Segundo en el bloque' },
  { id: 'tercero', label: 'Tercero en el bloque' },
  { id: 'medio', label: 'Al medio del bloque' },
  { id: 'penultimo', label: 'Penúltimo en el bloque' },
  { id: 'final', label: 'Final del bloque' },
];

const TIPOS_BLOQUE = [
  { id: 'PRIME MATINAL', label: 'PRIME MATINAL', color: 'bg-red-100 text-red-700' },
  { id: 'PRIME TARDE', label: 'PRIME VESPERTINO', color: 'bg-red-100 text-red-700' },
  { id: 'AUSPICIO', label: 'AUSPICIO', color: 'bg-blue-100 text-blue-700' },
  { id: 'ROTATIVO', label: 'ROTATIVO / REPARTIDO', color: 'bg-green-100 text-green-700' },
  { id: 'MENCIONES', label: 'MENCIONES', color: 'bg-purple-100 text-purple-700' },
];

const PAQUETES = [
  { id: 'navidad', label: 'Paquete Navidad Premium' },
  { id: 'verano', label: 'Paquete Verano 2025' },
  { id: 'standard', label: 'Paquete Standard' },
  { id: 'custom', label: 'Sin Paquete (Individual)' },
];

const defaultDistribucion: DistribucionSemanal = {
  lunes: 5, martes: 5, miercoles: 5, jueves: 5, viernes: 5, sabado: 0, domingo: 0
};

const defaultBonificadas: DistribucionSemanal = {
  lunes: 1, martes: 1, miercoles: 1, jueves: 1, viernes: 1, sabado: 0, domingo: 0
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const StepLineasCampana: React.FC<StepLineasProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isActive,
  onComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack,
  data,
  onUpdate
}) => {
  // ═════════════════════════════════════════════════════════════
  // ESTADO
  // ═════════════════════════════════════════════════════════════
  
  const [medioActivo, setMedioActivo] = useState<MedioTab>('fm');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipoContenidoActivo, setTipoContenidoActivo] = useState<TipoContenidoActivo>('cuna');
  
  // Estado para línea FM
  const [newLinea, setNewLinea] = useState<Partial<LineaData>>({
    programa: 'PRIME MATINAL',
    horaInicio: '07:00',
    horaFin: '09:30',
    duracion: 30,
    valorUnitario: 85000,
    posicionFija: 'ninguno',
    tipoPedido: 'PRIME MATINAL',
    paquete: 'navidad',
    distribucion: { ...defaultDistribucion },
    bonificadas: { ...defaultBonificadas },
    medio: 'fm',
    tipoContenido: 'cuna'
  });

  // Estado para mención
  const [textoMencion, setTextoMencion] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_statsMencion, setStatsMencion] = useState<EstadisticasTexto | null>(null);

  // Estado para línea Digital
  const [formatoBanner, setFormatoBanner] = useState<FormatoBanner>('300x250');
  const [creativoDigital, setCreativoDigital] = useState<ArchivoCreativo | null>(null);
  const [targetingDigital, setTargetingDigital] = useState<Partial<TargetingCompleto>>({});
  const [trackingDigital, setTrackingDigital] = useState<Partial<ConfiguracionTracking>>({});

  // Validation
  useEffect(() => {
    if (data.lineas && data.lineas.length > 0) {
      onComplete();
    }
  }, [data.lineas, onComplete]);

  // ═════════════════════════════════════════════════════════════
  // CÁLCULOS
  // ═════════════════════════════════════════════════════════════

  const calcularTotal = useCallback((linea: Partial<LineaData>) => {
    const dist = linea.distribucion || defaultDistribucion;
    const totalCunas = Object.values(dist).reduce((a, b) => a + b, 0);
    return totalCunas * (linea.valorUnitario || 0) * 4; // 4 semanas aprox
  }, []);

  const handleDistribucionChange = (
    tipo: 'distribucion' | 'bonificadas',
    dia: keyof DistribucionSemanal,
    delta: number
  ) => {
    const current = newLinea[tipo] || defaultDistribucion;
    const newValue = Math.max(0, Math.min(99, current[dia] + delta));
    setNewLinea({
      ...newLinea,
      [tipo]: { ...current, [dia]: newValue }
    });
  };

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════

  const handleAddLinea = () => {
    if (!newLinea.programa || !newLinea.horaInicio || !newLinea.horaFin) return;

    const total = calcularTotal(newLinea);
    const dist = newLinea.distribucion || defaultDistribucion;
    const dias = Object.entries(dist)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_key, v]) => v > 0)
      .map(([k]) => k.toUpperCase().substring(0, 3));

    const linea: LineaData = {
      id: Math.random().toString(36).substr(2, 9),
      programa: newLinea.programa!,
      horaInicio: newLinea.horaInicio!,
      horaFin: newLinea.horaFin!,
      dias,
      distribucion: newLinea.distribucion || defaultDistribucion,
      bonificadas: newLinea.bonificadas || defaultBonificadas,
      duracion: newLinea.duracion || 30,
      valorUnitario: newLinea.valorUnitario || 0,
      posicionFija: newLinea.posicionFija || 'ninguno',
      tipoPedido: newLinea.tipoPedido || 'PRIME',
      paquete: newLinea.paquete || 'custom',
      total,
      medio: medioActivo === 'fm' || medioActivo === 'hibrido' ? 'fm' : 'digital',
      tipoContenido: tipoContenidoActivo,
      textoMencion: tipoContenidoActivo === 'mencion' ? textoMencion : undefined,
      targeting: medioActivo === 'digital' ? targetingDigital : undefined,
      tracking: medioActivo === 'digital' ? trackingDigital : undefined
    };

    onUpdate({ lineas: [...(data.lineas || []), linea] });
    setIsDialogOpen(false);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setNewLinea({
      programa: 'PRIME MATINAL',
      horaInicio: '07:00',
      horaFin: '09:30',
      duracion: 30,
      valorUnitario: 85000,
      posicionFija: 'ninguno',
      tipoPedido: 'PRIME MATINAL',
      paquete: 'navidad',
      distribucion: { ...defaultDistribucion },
      bonificadas: { ...defaultBonificadas },
      medio: 'fm',
      tipoContenido: 'cuna'
    });
    setTextoMencion('');
    setStatsMencion(null);
    setCreativoDigital(null);
    setTargetingDigital({});
    setTrackingDigital({});
  };

  const removeLinea = (id: string) => {
    onUpdate({ lineas: data.lineas?.filter(l => l.id !== id) });
  };

  const handleMencionChange = useCallback((texto: string, stats: EstadisticasTexto) => {
    setTextoMencion(texto);
    setStatsMencion(stats);
  }, []);

  const totalCunasSemana = Object.values(newLinea.distribucion || defaultDistribucion).reduce((a, b) => a + b, 0);
  const totalBonificadasSemana = Object.values(newLinea.bonificadas || defaultBonificadas).reduce((a, b) => a + b, 0);

  // Estadísticas por medio
  const lineasFM = data.lineas?.filter(l => l.medio === 'fm' || !l.medio) || [];
  const lineasDigital = data.lineas?.filter(l => l.medio === 'digital') || [];

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📋 LÍNEAS DE CAMPAÑA
            <Badge className="bg-purple-100 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Enterprise 2050
            </Badge>
          </h2>
          <p className="text-gray-500">Sistema híbrido FM + Digital con targeting IA</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Edit2 className="w-4 h-4" />
            ✏️ Editar
          </Button>
          <Button variant="outline" className="gap-1">
            <Settings className="w-4 h-4" />
            📊 Validar
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                ➕ Crear Línea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  📝 CREAR NUEVA LÍNEA - Sistema Híbrido 2050
                </DialogTitle>
              </DialogHeader>
              
              {/* TABS PRINCIPAL: FM / DIGITAL */}
              <Tabs 
                value={medioActivo} 
                onValueChange={(v) => {
                  setMedioActivo(v as MedioTab);
                  // Cambiar tipo de contenido por defecto según medio
                  if (v === 'fm') {
                    setTipoContenidoActivo('cuna');
                  } else if (v === 'digital') {
                    setTipoContenidoActivo('banner');
                  }
                }}
                className="mt-4"
              >
                <TabsList className="grid grid-cols-3 w-full mb-6">
                  <TabsTrigger value="fm" className="gap-2 data-[state=active]:bg-blue-100">
                    <Radio className="w-4 h-4" />
                    📻 FM / Radio
                  </TabsTrigger>
                  <TabsTrigger value="digital" className="gap-2 data-[state=active]:bg-green-100">
                    <Smartphone className="w-4 h-4" />
                    📱 Digital
                  </TabsTrigger>
                  <TabsTrigger value="hibrido" className="gap-2 data-[state=active]:bg-purple-100">
                    <Zap className="w-4 h-4" />
                    ⚡ Híbrido
                  </TabsTrigger>
                </TabsList>

                {/* ══════════════════════════════════════════════════════ */}
                {/* TAB: FM / RADIO */}
                {/* ══════════════════════════════════════════════════════ */}
                <TabsContent value="fm" className="space-y-4">
                  {/* Selector de Tipo de Contenido FM */}
                  <Card className="p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Music className="w-4 h-4 text-blue-600" />
                      🎵 TIPO DE CONTENIDO FM
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {TIPOS_CONTENIDO_FM.map(tipo => (
                        <Button
                          key={tipo.id}
                          variant={tipoContenidoActivo === tipo.id ? 'default' : 'outline'}
                          className={`h-20 flex-col gap-2 ${
                            tipoContenidoActivo === tipo.id 
                              ? 'bg-blue-600 text-white' 
                              : ''
                          }`}
                          onClick={() => setTipoContenidoActivo(tipo.id)}
                        >
                          <tipo.icono className="w-6 h-6" />
                          <span>{tipo.label}</span>
                        </Button>
                      ))}
                    </div>
                  </Card>

                  {/* Editor de Mención (si aplica) */}
                  {tipoContenidoActivo === 'mencion' && (
                    <EditorMencionesInline
                      tipo="mencion"
                      valorInicial={textoMencion}
                      duracionMaxima={30}
                      onChange={handleMencionChange}
                    />
                  )}

                  {/* Configuración común FM */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Horarios */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        ⏰ HORARIO
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Hora inicio:</Label>
                          <Input 
                            type="time" 
                            value={newLinea.horaInicio || '07:00'}
                            onChange={(e) => setNewLinea({ ...newLinea, horaInicio: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Hora fin:</Label>
                          <Input 
                            type="time" 
                            value={newLinea.horaFin || '09:30'}
                            onChange={(e) => setNewLinea({ ...newLinea, horaFin: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Duración y Posición */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        📍 CONFIGURACIÓN
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Duración:</Label>
                          <div className="flex gap-2 mt-1">
                            {[15, 30, 45, 60].map(dur => (
                              <button
                                key={dur}
                                onClick={() => setNewLinea({ ...newLinea, duracion: dur })}
                                className={`
                                  px-4 py-2 rounded-lg text-sm font-bold transition-all
                                  ${newLinea.duracion === dur 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                `}
                              >
                                {dur}s
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Posición Fija:</Label>
                          <Select 
                            value={newLinea.posicionFija}
                            onValueChange={(v) => setNewLinea({ ...newLinea, posicionFija: v })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Ninguno" />
                            </SelectTrigger>
                            <SelectContent>
                              {POSICIONES_FIJAS.map(pos => (
                                <SelectItem key={pos.id} value={pos.id}>
                                  {pos.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Financiero */}
                  <Card className="p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      💰 CONFIGURACIÓN FINANCIERA
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Valor por unidad:</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            type="number"
                            value={newLinea.valorUnitario || 85000}
                            onChange={(e) => setNewLinea({ ...newLinea, valorUnitario: parseInt(e.target.value) })}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Tipo de Bloque:</Label>
                        <Select
                          value={newLinea.tipoPedido}
                          onValueChange={(v) => setNewLinea({ ...newLinea, tipoPedido: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_BLOQUE.map(tipo => (
                              <SelectItem key={tipo.id} value={tipo.id}>
                                <Badge className={tipo.color}>{tipo.label}</Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Paquete:</Label>
                        <Select
                          value={newLinea.paquete}
                          onValueChange={(v) => setNewLinea({ ...newLinea, paquete: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAQUETES.map(paq => (
                              <SelectItem key={paq.id} value={paq.id}>{paq.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>

                  {/* Grid Distribución Semanal */}
                  <Card className="p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      📊 DISTRIBUCIÓN SEMANAL
                    </h4>
                    
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {DIAS_SEMANA.map(({ key, label }) => (
                        <div key={key} className="text-center">
                          <div className="text-xs font-bold text-gray-500 mb-1">{label}</div>
                          <div className="bg-slate-50 rounded-lg p-2 border hover:border-blue-300">
                            <button
                              onClick={() => handleDistribucionChange('distribucion', key, 1)}
                              className="w-full text-gray-400 hover:text-blue-600"
                            >
                              <ChevronUp className="w-4 h-4 mx-auto" />
                            </button>
                            <div className="text-xl font-bold text-center py-1">
                              [{(newLinea.distribucion || defaultDistribucion)[key]}]
                            </div>
                            <button
                              onClick={() => handleDistribucionChange('distribucion', key, -1)}
                              className="w-full text-gray-400 hover:text-blue-600"
                            >
                              <ChevronDown className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <Badge variant="outline" className="gap-1">
                        🔢 Total: {totalCunasSemana}/semana
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 gap-1">
                        <Gift className="w-3 h-3" />
                        Bonificadas: {totalBonificadasSemana}/semana
                      </Badge>
                    </div>
                  </Card>

                  {/* Resumen */}
                  <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{totalCunasSemana}</p>
                        <p className="text-xs text-gray-500">Spots/Semana</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{totalBonificadasSemana}</p>
                        <p className="text-xs text-gray-500">Bonificadas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{totalCunasSemana + totalBonificadasSemana}</p>
                        <p className="text-xs text-gray-500">Total Spots</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-600">
                          ${((calcularTotal(newLinea)) / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-gray-500">Valor Línea</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* ══════════════════════════════════════════════════════ */}
                {/* TAB: DIGITAL */}
                {/* ══════════════════════════════════════════════════════ */}
                <TabsContent value="digital" className="space-y-4">
                  {/* Selector de Tipo de Contenido Digital */}
                  <Card className="p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      📱 TIPO DE CONTENIDO DIGITAL
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {TIPOS_CONTENIDO_DIGITAL.map(tipo => (
                        <Button
                          key={tipo.id}
                          variant={tipoContenidoActivo === tipo.id ? 'default' : 'outline'}
                          className={`h-20 flex-col gap-2 ${
                            tipoContenidoActivo === tipo.id 
                              ? 'bg-green-600 text-white' 
                              : ''
                          }`}
                          onClick={() => setTipoContenidoActivo(tipo.id)}
                        >
                          <tipo.icono className="w-6 h-6" />
                          <span>{tipo.label}</span>
                        </Button>
                      ))}
                    </div>
                  </Card>

                  {/* Editor de Creativos */}
                  <EditorCreativosDigitales
                    tipoCreativo={
                      tipoContenidoActivo === 'banner' ? 'banner' :
                      tipoContenidoActivo === 'audio_ad' ? 'audio' :
                      tipoContenidoActivo === 'video_ad' ? 'video' : 'banner'
                    }
                    creativoActual={creativoDigital || undefined}
                    formatoBanner={formatoBanner}
                    onFormatoBannerChange={setFormatoBanner}
                    onCreativoChange={setCreativoDigital}
                  />

                  {/* Panel de Targeting */}
                  <PanelTargetingAvanzado
                    targeting={targetingDigital}
                    onChange={setTargetingDigital}
                  />

                  {/* Sistema de Tracking */}
                  <SistemaTrackingLinks
                    tracking={trackingDigital}
                    campaignName={data.lineas?.[0]?.programa || 'Nueva Campaña'}
                    onChange={setTrackingDigital}
                  />

                  {/* Horarios Digital */}
                  <Card className="p-4">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      ⏰ PROGRAMACIÓN DIGITAL
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Fecha inicio:</Label>
                        <Input type="date" defaultValue="2025-08-11" className="mt-1" />
                      </div>
                      <div>
                        <Label>Fecha término:</Label>
                        <Input type="date" defaultValue="2025-08-26" className="mt-1" />
                      </div>
                      <div>
                        <Label>Hora inicio:</Label>
                        <Input 
                          type="time" 
                          value={newLinea.horaInicio || '00:00'}
                          onChange={(e) => setNewLinea({ ...newLinea, horaInicio: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Hora fin:</Label>
                        <Input 
                          type="time" 
                          value={newLinea.horaFin || '23:59'}
                          onChange={(e) => setNewLinea({ ...newLinea, horaFin: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* ══════════════════════════════════════════════════════ */}
                {/* TAB: HÍBRIDO */}
                {/* ══════════════════════════════════════════════════════ */}
                <TabsContent value="hibrido" className="space-y-4">
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        ⚡ Modo Híbrido FM + Digital
                      </h3>
                      <p className="text-gray-600 max-w-lg mx-auto mb-4">
                        Crea una línea FM y una Digital sincronizadas. Cuando suene tu anuncio 
                        en la radio, los oyentes por streaming verán automáticamente tu banner 
                        o recibirán un audio ad coordinado.
                      </p>
                      <div className="flex justify-center gap-4">
                        <Badge className="bg-blue-100 text-blue-700 gap-1 px-4 py-2">
                          <Radio className="w-4 h-4" />
                          FM/Radio
                        </Badge>
                        <span className="text-2xl">→</span>
                        <Badge className="bg-green-100 text-green-700 gap-1 px-4 py-2">
                          <Smartphone className="w-4 h-4" />
                          Digital
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-600 mt-4">
                        💡 Primero crea líneas FM y Digital por separado, luego configura 
                        la sincronización en el módulo Cross-Media
                      </p>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Botones de acción */}
              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={handleAddLinea} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  ✅ CREAR LÍNEA {medioActivo.toUpperCase()}
                </Button>
                <Button variant="outline" className="gap-1">
                  <Zap className="w-4 h-4" />
                  🔄 Aplicar Paquete
                </Button>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  ❌ Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{lineasFM.length}</p>
              <p className="text-xs text-blue-600">Líneas FM</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{lineasDigital.length}</p>
              <p className="text-xs text-green-600">Líneas Digital</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{data.lineas?.length || 0}</p>
              <p className="text-xs text-purple-600">Total Líneas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">
                ${((data.lineas?.reduce((acc, l) => acc + l.total, 0) || 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-amber-600">Valor Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de líneas */}
      <Card className="overflow-hidden border-slate-200">
        <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b font-bold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            📊 LÍNEAS CONFIGURADAS
          </span>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Radio className="w-3 h-3" />
              {lineasFM.length} FM
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Smartphone className="w-3 h-3" />
              {lineasDigital.length} Digital
            </Badge>
          </div>
        </div>
        {!data.lineas || data.lineas.length === 0 ? (
          <div className="p-12 text-center bg-slate-50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tv className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No hay líneas definidas</h3>
            <p className="text-slate-500">Agrega líneas FM o Digital para comenzar la programación</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-20">Medio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Dur</TableHead>
                <TableHead>H.Inicio</TableHead>
                <TableHead>H.Final</TableHead>
                <TableHead>Bloque</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">M</TableHead>
                <TableHead className="text-center">M</TableHead>
                <TableHead className="text-center">J</TableHead>
                <TableHead className="text-center">V</TableHead>
                <TableHead className="text-center">S</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lineas.map((linea) => (
                <TableRow key={linea.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    {linea.medio === 'digital' ? (
                      <Badge className="bg-green-100 text-green-700 gap-1">
                        <Smartphone className="w-3 h-3" />
                        Digital
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 gap-1">
                        <Radio className="w-3 h-3" />
                        FM
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {linea.tipoContenido || 'cuña'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{linea.duracion}s</TableCell>
                  <TableCell className="font-mono">{linea.horaInicio}</TableCell>
                  <TableCell className="font-mono">{linea.horaFin}</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-700">{linea.tipoPedido}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{linea.distribucion?.lunes || 0}</TableCell>
                  <TableCell className="text-center">{linea.distribucion?.martes || 0}</TableCell>
                  <TableCell className="text-center">{linea.distribucion?.miercoles || 0}</TableCell>
                  <TableCell className="text-center">{linea.distribucion?.jueves || 0}</TableCell>
                  <TableCell className="text-center">{linea.distribucion?.viernes || 0}</TableCell>
                  <TableCell className="text-center">{linea.distribucion?.sabado || 0}</TableCell>
                  <TableCell className="text-center">{linea.distribucion?.domingo || 0}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${(linea.total / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-500"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeLinea(linea.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {data.lineas && data.lineas.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>
            Recuerda: El valor total de las líneas (${data.lineas.reduce((acc, l) => acc + l.total, 0).toLocaleString()})
            se comparará contra el valor neto de la tarifa en el paso de validación.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepLineasCampana;
