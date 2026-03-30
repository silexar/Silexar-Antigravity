/**
 * 🔄 SILEXAR PULSE - Sistema de Copiar/Extender Campaña 2050
 * 
 * @description Componente para copiar campañas existentes y
 * extender campañas con un clic para renovaciones/continuaciones.
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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Copy,
  Clock,
  AlertTriangle,
  Play,
  FileText,
  DollarSign,
  Radio,
  Globe,
  Zap,
  CalendarPlus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CampanaParaCopiar {
  id: string;
  codigo: string;
  nombre: string;
  anunciante: string;
  fechaInicio: string;
  fechaFin: string;
  lineasCount: number;
  cunasCount: number;
  valorTotal: number;
  estado: string;
  tipo: 'FM' | 'Digital' | 'Cross-Media';
}

export interface OpcionCopiado {
  id: string;
  label: string;
  descripcion: string;
  checked: boolean;
}

interface CopiarExtenderCampanaProps {
  campanaOrigen: CampanaParaCopiar;
  onCopiar: (config: ConfiguracionCopia) => void;
  onExtender: (config: ConfiguracionExtension) => void;
}

interface ConfiguracionCopia {
  nuevoCodigo: string;
  nuevoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  copiarLineas: boolean;
  copiarCunas: boolean;
  copiarHorarios: boolean;
  copiarTarifas: boolean;
  copiarMateriales: boolean;
  copiarTracking: boolean;
  ajustarFechas: boolean;
}

interface ConfiguracionExtension {
  nuevaFechaFin: string;
  mantenerProgramacion: boolean;
  recalcularValor: boolean;
  aplicarAjuste: number; // porcentaje de ajuste de tarifa
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const CAMPANA_EJEMPLO: CampanaParaCopiar = {
  id: 'camp_001',
  codigo: 'BCH-2024-DIC-001',
  nombre: 'BANCO CHILE - Campaña Navidad',
  anunciante: 'BANCO CHILE',
  fechaInicio: '2024-12-01',
  fechaFin: '2024-12-31',
  lineasCount: 5,
  cunasCount: 3,
  valorTotal: 45000000,
  estado: 'Activa',
  tipo: 'Cross-Media'
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const CopiarExtenderCampana: React.FC<CopiarExtenderCampanaProps> = ({
  campanaOrigen = CAMPANA_EJEMPLO,
  onCopiar,
  onExtender
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [tabActiva, setTabActiva] = useState<'copiar' | 'extender'>('copiar');

  // Estado para Copiar
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaFechaInicio, setNuevaFechaInicio] = useState('');
  const [nuevaFechaFin, setNuevaFechaFin] = useState('');
  const [opciones, setOpciones] = useState({
    copiarLineas: true,
    copiarCunas: true,
    copiarHorarios: true,
    copiarTarifas: true,
    copiarMateriales: true,
    copiarTracking: true,
    ajustarFechas: true
  });

  // Estado para Extender
  const [nuevaFechaFinExtension, setNuevaFechaFinExtension] = useState('');
  const [mantenerProgramacion, setMantenerProgramacion] = useState(true);
  const [recalcularValor, setRecalcularValor] = useState(true);
  const [ajusteTarifa, setAjusteTarifa] = useState(0);

  // Generar código sugerido
  useMemo(() => {
    const hoy = new Date();
    const mes = hoy.toLocaleString('es', { month: 'short' }).toUpperCase();
    const anio = hoy.getFullYear();
    const codigoBase = campanaOrigen.codigo.split('-')[0];
    setNuevoCodigo(`${codigoBase}-${anio}-${mes}-COPIA`);
  }, [campanaOrigen.codigo]);

  // Calcular nueva fecha fin para extensión
  const calcularNuevaFechaFin = (dias: number) => {
    const fechaActual = new Date(campanaOrigen.fechaFin);
    fechaActual.setDate(fechaActual.getDate() + dias);
    return fechaActual.toISOString().split('T')[0];
  };

  // Ejecutar copia
  const handleCopiar = () => {
    onCopiar?.({
      nuevoCodigo,
      nuevoNombre: nuevoNombre || `${campanaOrigen.nombre} - Copia`,
      fechaInicio: nuevaFechaInicio,
      fechaFin: nuevaFechaFin,
      ...opciones
    });
    setDialogoAbierto(false);
  };

  // Ejecutar extensión
  const handleExtender = () => {
    onExtender?.({
      nuevaFechaFin: nuevaFechaFinExtension,
      mantenerProgramacion,
      recalcularValor,
      aplicarAjuste: ajusteTarifa
    });
    setDialogoAbierto(false);
  };

  // Extensión rápida (1-click)
  const handleExtensionRapida = (dias: number) => {
    onExtender?.({
      nuevaFechaFin: calcularNuevaFechaFin(dias),
      mantenerProgramacion: true,
      recalcularValor: true,
      aplicarAjuste: 0
    });
  };

  // Formatear moneda
  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
  };

  return (
    <div className="flex gap-2">
      {/* Botón Extensión Rápida */}
      <div className="flex gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => handleExtensionRapida(7)}
        >
          <Zap className="w-3 h-3" />
          +7 días
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => handleExtensionRapida(30)}
        >
          <Zap className="w-3 h-3" />
          +30 días
        </Button>
      </div>

      {/* Diálogo principal */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700">
            <Copy className="w-4 h-4" />
            Copiar/Extender
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-purple-600" />
              Copiar o Extender Campaña
            </DialogTitle>
          </DialogHeader>

          {/* Campaña origen */}
          <Card className="p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{campanaOrigen.codigo}</p>
                <p className="text-sm text-gray-500">{campanaOrigen.nombre}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">{campanaOrigen.fechaInicio} → {campanaOrigen.fechaFin}</p>
                <p className="font-medium">{formatMoneda(campanaOrigen.valorTotal)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{campanaOrigen.lineasCount} líneas</Badge>
              <Badge variant="outline">{campanaOrigen.cunasCount} cuñas</Badge>
              <Badge className="bg-blue-100 text-blue-700">{campanaOrigen.tipo}</Badge>
            </div>
          </Card>

          <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as 'copiar' | 'extender')}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="copiar" className="gap-1">
                <Copy className="w-4 h-4" />
                Copiar Campaña
              </TabsTrigger>
              <TabsTrigger value="extender" className="gap-1">
                <CalendarPlus className="w-4 h-4" />
                Extender Campaña
              </TabsTrigger>
            </TabsList>

            {/* TAB: COPIAR */}
            <TabsContent value="copiar" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nuevo código</Label>
                  <Input
                    value={nuevoCodigo}
                    onChange={(e) => setNuevoCodigo(e.target.value)}
                    placeholder="BCH-2025-ENE-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nuevo nombre</Label>
                  <Input
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder={`${campanaOrigen.nombre} - Copia`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nueva fecha inicio</Label>
                  <Input
                    type="date"
                    value={nuevaFechaInicio}
                    onChange={(e) => setNuevaFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nueva fecha fin</Label>
                  <Input
                    type="date"
                    value={nuevaFechaFin}
                    onChange={(e) => setNuevaFechaFin(e.target.value)}
                  />
                </div>
              </div>

              <Card className="p-4 bg-gray-50">
                <h4 className="font-medium mb-3">¿Qué copiar?</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'copiarLineas', label: 'Líneas de emisión', icon: Radio },
                    { key: 'copiarCunas', label: 'Cuñas asignadas', icon: Play },
                    { key: 'copiarHorarios', label: 'Horarios y spots', icon: Clock },
                    { key: 'copiarTarifas', label: 'Tarifas y precios', icon: DollarSign },
                    { key: 'copiarMateriales', label: 'Materiales/Creativos', icon: FileText },
                    { key: 'copiarTracking', label: 'Configuración tracking', icon: Globe },
                  ].map(item => {
                    const Icono = item.icon;
                    const isChecked = opciones[item.key as keyof typeof opciones];
                    return (
                      <div 
                        key={item.key}
                        className={`p-3 border rounded-lg cursor-pointer flex items-center gap-2 ${
                          isChecked ? 'border-purple-400 bg-purple-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => setOpciones(prev => ({ ...prev, [item.key]: !isChecked }))}
                      >
                        <Checkbox checked={isChecked} />
                        <Icono className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={opciones.ajustarFechas} 
                      onCheckedChange={(v) => setOpciones(prev => ({ ...prev, ajustarFechas: v }))}
                    />
                    <Label className="text-sm">Ajustar fechas automáticamente a nuevo período</Label>
                  </div>
                </div>
              </Card>

              <Button onClick={handleCopiar} className="w-full gap-2">
                <Copy className="w-4 h-4" />
                Crear Copia de Campaña
              </Button>
            </TabsContent>

            {/* TAB: EXTENDER */}
            <TabsContent value="extender" className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-700">Extensión de campaña</span>
                </div>
                <p className="text-sm text-amber-600">
                  Extender modificará la fecha de fin de la campaña actual y recalculará 
                  valores según corresponda.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nueva fecha de finalización</Label>
                  <Input
                    type="date"
                    value={nuevaFechaFinExtension}
                    onChange={(e) => setNuevaFechaFinExtension(e.target.value)}
                    min={campanaOrigen.fechaFin}
                  />
                </div>

                {/* Botones rápidos */}
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500">Extensión rápida:</span>
                  {[7, 15, 30, 60, 90].map(dias => (
                    <Button
                      key={dias}
                      variant="outline"
                      size="sm"
                      onClick={() => setNuevaFechaFinExtension(calcularNuevaFechaFin(dias))}
                    >
                      +{dias} días
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Mantener programación actual</Label>
                      <Switch 
                        checked={mantenerProgramacion} 
                        onCheckedChange={setMantenerProgramacion}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Los spots ya programados se mantendrán
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Recalcular valor total</Label>
                      <Switch 
                        checked={recalcularValor} 
                        onCheckedChange={setRecalcularValor}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Calcular nuevo valor según días adicionales
                    </p>
                  </div>
                </div>

                {recalcularValor && (
                  <div className="space-y-2">
                    <Label>Ajuste de tarifa (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={ajusteTarifa}
                        onChange={(e) => setAjusteTarifa(parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">
                        {ajusteTarifa > 0 ? `+${ajusteTarifa}%` : ajusteTarifa < 0 ? `${ajusteTarifa}%` : 'Sin ajuste'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleExtender} className="w-full gap-2 bg-green-600 hover:bg-green-700">
                <CalendarPlus className="w-4 h-4" />
                Extender Campaña
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CopiarExtenderCampana;
