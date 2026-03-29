/**
 * 🔄 SILEXAR PULSE - Sincronizador Cross-Media 2050
 * 
 * @description Configurador de sincronización entre elementos FM
 * y Digital para maximizar impacto publicitario coordinado.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ArrowRight,
  Radio,
  Smartphone,
  Link2,
  Clock,
  TrendingUp,
  Zap,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Info,
  Music,
  ImageIcon,
  Volume2,
  Sparkles
} from 'lucide-react';
import type { 
  ElementoProgramado, 
  ConfiguracionSincronizacion 
} from './types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SincronizadorCrossMediaProps {
  elementosFM: ElementoProgramado[];
  elementosDigital: ElementoProgramado[];
  sincronizaciones: ConfiguracionSincronizacion[];
  onSincronizacionesChange: (sincs: ConfiguracionSincronizacion[]) => void;
  oyentesFMEstimados?: number;
  oyentesStreamingEstimados?: number;
}

interface NuevaSincronizacion {
  elementoFMId: string;
  elementoDigitalId: string;
  delaySegundos: number;
  duracionSegundos: number;
  soloOyentesStreaming: boolean;
  soloAppActiva: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const SincronizadorCrossMedia: React.FC<SincronizadorCrossMediaProps> = ({
  elementosFM,
  elementosDigital,
  sincronizaciones,
  onSincronizacionesChange,
  oyentesFMEstimados = 125000,
  oyentesStreamingEstimados = 45000
}) => {
  // Estado
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [nuevaSinc, setNuevaSinc] = useState<NuevaSincronizacion>({
    elementoFMId: '',
    elementoDigitalId: '',
    delaySegundos: 0,
    duracionSegundos: 30,
    soloOyentesStreaming: true,
    soloAppActiva: true
  });
  const [sincActiva, setSincActiva] = useState(true);

  // Cálculos de impacto
  const impactoEstimado = useMemo(() => {
    const porcentajeStreaming = (oyentesStreamingEstimados / oyentesFMEstimados) * 100;
    const impresionesCoordinadas = Math.round(oyentesStreamingEstimados * 0.85); // 85% participación
    const amplificacion = Math.round((impresionesCoordinadas / oyentesFMEstimados) * 100);
    
    return {
      oyentesFM: oyentesFMEstimados,
      oyentesStreaming: oyentesStreamingEstimados,
      porcentajeStreaming: Math.round(porcentajeStreaming),
      impresionesCoordinadas,
      amplificacion: amplificacion + 67 // Amplificación adicional por multi-canal
    };
  }, [oyentesFMEstimados, oyentesStreamingEstimados]);

  // Obtener nombre del elemento
  const obtenerNombreElemento = useCallback((id: string, elementos: ElementoProgramado[]): string => {
    const elem = elementos.find(e => e.id === id);
    if (!elem) return 'Desconocido';
    
    const contenido = elem.contenido;
    switch (contenido.tipo) {
      case 'cuna':
        return contenido.materialNombre || 'Cuña';
      case 'mencion':
        return contenido.texto?.substring(0, 25) + '...' || 'Mención';
      case 'banner':
        return `Banner ${contenido.formato}`;
      case 'audio_ad':
        return `Audio Ad ${contenido.duracionSegundos}s`;
      default:
        return elem.tipo;
    }
  }, []);

  // Handlers
  const handleAgregarSincronizacion = useCallback(() => {
    if (!nuevaSinc.elementoFMId || !nuevaSinc.elementoDigitalId) return;

    const nueva: ConfiguracionSincronizacion = {
      id: `sync_${Date.now()}`,
      nombre: `Sinc ${sincronizaciones.length + 1}`,
      activa: true,
      elementoFMId: nuevaSinc.elementoFMId,
      elementoDigitalId: nuevaSinc.elementoDigitalId,
      delaySegundos: nuevaSinc.delaySegundos,
      duracionSegundos: nuevaSinc.duracionSegundos,
      soloOyentesStreaming: nuevaSinc.soloOyentesStreaming,
      soloAppActiva: nuevaSinc.soloAppActiva,
      oyentesFMEstimados: impactoEstimado.oyentesFM,
      oyentesStreamingEstimados: impactoEstimado.oyentesStreaming,
      impresionesCoordinadasEstimadas: impactoEstimado.impresionesCoordinadas,
      amplificacionPorcentaje: impactoEstimado.amplificacion
    };

    onSincronizacionesChange([...sincronizaciones, nueva]);
    setMostrarNueva(false);
    setNuevaSinc({
      elementoFMId: '',
      elementoDigitalId: '',
      delaySegundos: 0,
      duracionSegundos: 30,
      soloOyentesStreaming: true,
      soloAppActiva: true
    });
  }, [nuevaSinc, sincronizaciones, impactoEstimado, onSincronizacionesChange]);

  const handleEliminarSincronizacion = useCallback((id: string) => {
    onSincronizacionesChange(sincronizaciones.filter(s => s.id !== id));
  }, [sincronizaciones, onSincronizacionesChange]);

  const handleToggleActiva = useCallback((id: string) => {
    onSincronizacionesChange(
      sincronizaciones.map(s => 
        s.id === id ? { ...s, activa: !s.activa } : s
      )
    );
  }, [sincronizaciones, onSincronizacionesChange]);

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  return (
    <Card className="p-4 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">🔄 Sincronización Cross-Media</h4>
            <p className="text-xs text-gray-500">
              Coordina FM con Digital para máximo impacto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={sincActiva}
            onCheckedChange={setSincActiva}
          />
          <span className="text-sm text-gray-600">
            {sincActiva ? 'Activa' : 'Desactivada'}
          </span>
        </div>
      </div>

      {/* Panel de Impacto Estimado */}
      <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <Radio className="w-3 h-3" />
            Oyentes FM
          </div>
          <p className="text-lg font-bold text-gray-800">
            {(impactoEstimado.oyentesFM / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <Smartphone className="w-3 h-3" />
            Streaming
          </div>
          <p className="text-lg font-bold text-indigo-600">
            {(impactoEstimado.oyentesStreaming / 1000).toFixed(0)}K
            <span className="text-xs font-normal text-gray-500 ml-1">
              ({impactoEstimado.porcentajeStreaming}%)
            </span>
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <Eye className="w-3 h-3" />
            Imp. Coordinadas
          </div>
          <p className="text-lg font-bold text-green-600">
            ~{(impactoEstimado.impresionesCoordinadas / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            Amplificación
          </div>
          <p className="text-lg font-bold text-purple-600">
            +{impactoEstimado.amplificacion}%
          </p>
        </div>
      </div>

      {/* Lista de Sincronizaciones */}
      <div className="space-y-3 mb-4">
        {sincronizaciones.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Link2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              No hay sincronizaciones configuradas
            </p>
            <p className="text-gray-400 text-xs">
              Vincula elementos FM con Digital para coordinar impactos
            </p>
          </div>
        ) : (
          sincronizaciones.map((sinc) => (
            <div
              key={sinc.id}
              className={`p-4 border rounded-lg transition-all ${
                sinc.activa 
                  ? 'bg-white border-indigo-200' 
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sinc.activa}
                    onCheckedChange={() => handleToggleActiva(sinc.id)}
                  />
                  <span className="font-medium text-gray-800">{sinc.nombre}</span>
                  {sinc.activa && (
                    <Badge className="bg-green-100 text-green-700 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Activa
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEliminarSincronizacion(sinc.id)}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Visualización de la sincronización */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                {/* Elemento FM */}
                <div className="flex-1 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                    <Radio className="w-3 h-3" />
                    Trigger FM
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {obtenerNombreElemento(sinc.elementoFMId, elementosFM)}
                  </p>
                </div>

                {/* Flecha con timing */}
                <div className="flex flex-col items-center">
                  <ArrowRight className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs text-gray-500">
                    +{sinc.delaySegundos}s
                  </span>
                </div>

                {/* Elemento Digital */}
                <div className="flex-1 p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                    <Smartphone className="w-3 h-3" />
                    Acción Digital
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {obtenerNombreElemento(sinc.elementoDigitalId, elementosDigital)}
                  </p>
                </div>
              </div>

              {/* Configuración */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Duración: {sinc.duracionSegundos}s
                </span>
                {sinc.soloOyentesStreaming && (
                  <Badge variant="outline" className="text-xs">
                    Solo Streaming
                  </Badge>
                )}
                {sinc.soloAppActiva && (
                  <Badge variant="outline" className="text-xs">
                    Solo App Activa
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario Nueva Sincronización */}
      {mostrarNueva ? (
        <div className="p-4 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50/50">
          <h5 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Nueva Sincronización
          </h5>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Selector FM */}
            <div>
              <Label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Radio className="w-3 h-3" />
                Trigger FM
              </Label>
              <Select
                value={nuevaSinc.elementoFMId}
                onValueChange={(v) => setNuevaSinc(prev => ({ ...prev, elementoFMId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona elemento FM" />
                </SelectTrigger>
                <SelectContent>
                  {elementosFM.map(elem => (
                    <SelectItem key={elem.id} value={elem.id}>
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-blue-500" />
                        {obtenerNombreElemento(elem.id, elementosFM)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Cuando suene este elemento en FM...
              </p>
            </div>

            {/* Selector Digital */}
            <div>
              <Label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                Acción Digital
              </Label>
              <Select
                value={nuevaSinc.elementoDigitalId}
                onValueChange={(v) => setNuevaSinc(prev => ({ ...prev, elementoDigitalId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona elemento Digital" />
                </SelectTrigger>
                <SelectContent>
                  {elementosDigital.map(elem => (
                    <SelectItem key={elem.id} value={elem.id}>
                      <div className="flex items-center gap-2">
                        {elem.tipo === 'banner' && <ImageIcon className="w-4 h-4 text-green-500" />}
                        {elem.tipo === 'audio_ad' && <Volume2 className="w-4 h-4 text-cyan-500" />}
                        {obtenerNombreElemento(elem.id, elementosDigital)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                ...mostrar/reproducir este en Digital
              </p>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-xs text-gray-600 mb-1">
                Delay (segundos después del FM)
              </Label>
              <Slider
                value={[nuevaSinc.delaySegundos]}
                onValueChange={([v]) => setNuevaSinc(prev => ({ ...prev, delaySegundos: v }))}
                max={30}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                {nuevaSinc.delaySegundos}s
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1">
                Duración de la acción digital
              </Label>
              <Slider
                value={[nuevaSinc.duracionSegundos]}
                onValueChange={([v]) => setNuevaSinc(prev => ({ ...prev, duracionSegundos: v }))}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                {nuevaSinc.duracionSegundos}s
              </p>
            </div>
          </div>

          {/* Opciones */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={nuevaSinc.soloOyentesStreaming}
                onCheckedChange={(v) => setNuevaSinc(prev => ({ ...prev, soloOyentesStreaming: v }))}
              />
              <Label className="text-sm">Solo oyentes streaming</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={nuevaSinc.soloAppActiva}
                onCheckedChange={(v) => setNuevaSinc(prev => ({ ...prev, soloAppActiva: v }))}
              />
              <Label className="text-sm">Solo app activa</Label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setMostrarNueva(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarSincronizacion}
              disabled={!nuevaSinc.elementoFMId || !nuevaSinc.elementoDigitalId}
              className="gap-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Zap className="w-4 h-4" />
              Crear Sincronización
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setMostrarNueva(true)}
          className="w-full gap-2 border-dashed border-2"
          disabled={elementosFM.length === 0 || elementosDigital.length === 0}
        >
          <Plus className="w-4 h-4" />
          Agregar Sincronización FM → Digital
        </Button>
      )}

      {/* Advertencia si no hay elementos */}
      {(elementosFM.length === 0 || elementosDigital.length === 0) && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-medium">Faltan elementos</p>
            <p className="text-xs">
              Necesitas al menos un elemento FM y uno Digital para crear sincronizaciones.
            </p>
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <b>Cross-Media:</b> Cuando un anuncio suena en la radio FM, los usuarios que 
          escuchan por streaming verán un banner o recibirán un audio ad coordinado, 
          maximizando el impacto del mensaje.
        </p>
      </div>
    </Card>
  );
};

export default SincronizadorCrossMedia;
