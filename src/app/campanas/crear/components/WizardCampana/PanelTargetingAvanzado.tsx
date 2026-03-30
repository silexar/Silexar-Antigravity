/**
 * 🎯 SILEXAR PULSE - Panel de Targeting Avanzado 2050
 * 
 * @description Panel completo de targeting para publicidad digital
 * con opciones demográficas, geográficas, contextuales y comportamentales.
 * Incluye detección IA y geofencing.
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  MapPin,
  Clock,
  Brain,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Tv,
  Speaker,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Thermometer,
  Eye,
  Mic,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Navigation,
  Map as MapIcon,
  Zap
} from 'lucide-react';
import type {
  TargetingCompleto,
  TargetingDemografico,
  TargetingGeografico,
  TargetingContextual,
  TargetingComportamental,
  TipoDispositivo,
  CondicionClima
} from './types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════

export interface PanelTargetingProps {
  targeting: Partial<TargetingCompleto>;
  onChange: (targeting: Partial<TargetingCompleto>) => void;
  estimarAlcance?: (targeting: Partial<TargetingCompleto>) => Promise<{
    usuariosUnicos: number;
    impresionesEstimadas: number;
    porcentajePoblacion: number;
  }>;
}

const PAISES = [
  { id: 'CL', nombre: 'Chile 🇨🇱', regiones: ['Metropolitana', 'Valparaíso', 'Biobío', 'Araucanía', 'Los Lagos', 'O\'Higgins', 'Maule', 'Coquimbo', 'Antofagasta', 'Atacama', 'Los Ríos', 'Aysén', 'Magallanes', 'Arica', 'Tarapacá', 'Ñuble'] },
  { id: 'AR', nombre: 'Argentina 🇦🇷', regiones: ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza'] },
  { id: 'PE', nombre: 'Perú 🇵🇪', regiones: ['Lima', 'Arequipa', 'Cusco', 'Trujillo'] },
  { id: 'CO', nombre: 'Colombia 🇨🇴', regiones: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'] },
  { id: 'MX', nombre: 'México 🇲🇽', regiones: ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla'] }
];

const INTERESES_SUGERIDOS = [
  'Deportes', 'Tecnología', 'Moda', 'Gastronomía', 'Viajes', 
  'Música', 'Cine', 'Gaming', 'Fitness', 'Negocios',
  'Emprendimiento', 'Familia', 'Mascotas', 'Arte', 'Educación',
  'Finanzas', 'Automovilismo', 'Belleza', 'Hogar', 'Salud'
];

const DISPOSITIVOS: { id: TipoDispositivo; icono: React.ElementType; label: string }[] = [
  { id: 'mobile', icono: Smartphone, label: 'Móvil' },
  { id: 'tablet', icono: Tablet, label: 'Tablet' },
  { id: 'desktop', icono: Monitor, label: 'Desktop' },
  { id: 'smart_tv', icono: Tv, label: 'Smart TV' },
  { id: 'smart_speaker', icono: Speaker, label: 'Smart Speaker' }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SISTEMAS_OPERATIVOS = [
  { id: 'ios', label: 'iOS', color: 'bg-gray-100' },
  { id: 'android', label: 'Android', color: 'bg-green-100' },
  { id: 'windows', label: 'Windows', color: 'bg-blue-100' },
  { id: 'macos', label: 'macOS', color: 'bg-gray-100' }
];

const CONDICIONES_CLIMA: { id: CondicionClima; icono: React.ElementType; label: string }[] = [
  { id: 'soleado', icono: Sun, label: 'Soleado' },
  { id: 'nublado', icono: Cloud, label: 'Nublado' },
  { id: 'lluvia', icono: CloudRain, label: 'Lluvia' },
  { id: 'nieve', icono: Snowflake, label: 'Nieve' },
  { id: 'caluroso', icono: Thermometer, label: 'Caluroso' },
  { id: 'frio', icono: Thermometer, label: 'Frío' }
];

const RANGOS_EDAD_CONFIG = [
  { id: '13-17', label: '13-17', min: 13, max: 17 },
  { id: '18-24', label: '18-24', min: 18, max: 24 },
  { id: '25-34', label: '25-34', min: 25, max: 34 },
  { id: '35-44', label: '35-44', min: 35, max: 44 },
  { id: '45-54', label: '45-54', min: 45, max: 54 },
  { id: '55-64', label: '55-64', min: 55, max: 64 },
  { id: '65+', label: '65+', min: 65, max: 120 }
];

// ═══════════════════════════════════════════════════════════════
// VALORES POR DEFECTO
// ═══════════════════════════════════════════════════════════════

const defaultDemografico: TargetingDemografico = {
  edades: [],
  generos: ['todos'],
  nse: [],
  intereses: [],
  idiomas: ['es'],
  ocupaciones: []
};

const defaultGeografico: TargetingGeografico = {
  paises: [],
  regiones: [],
  ciudades: [],
  codigosPostales: [],
  geofences: [],
  exclusiones: [],
  radioDefaultKm: 5,
  usarGPSPreciso: false
};

const defaultContextual: TargetingContextual = {
  horasPermitidas: [{ inicio: '00:00', fin: '23:59' }],
  diasSemana: [0, 1, 2, 3, 4, 5, 6],
  dispositivos: ['mobile', 'tablet', 'desktop'],
  sistemasOperativos: ['ios', 'android', 'windows', 'macos'],
  condicionesClima: [],
  rangoTemperatura: undefined,
  conexion: ['wifi', 'celular'],
  velocidadMinimaMbps: undefined
};

const defaultComportamental: TargetingComportamental = {
  categoriasInteres: [],
  engagementMinimo: 0,
  vozActiva: null,
  pantallaActiva: null,
  tiempoMinimoAppSegundos: 0,
  scrollDepthMinimo: 0,
  intencionCompraMinima: 0,
  momentoOptimoRequerido: false,
  maxImpresionesUsuario: 10,
  maxImpresionesUsuarioPorDia: 3,
  separacionMinutosEntreImpresiones: 30
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const PanelTargetingAvanzado: React.FC<PanelTargetingProps> = ({
  targeting,
  onChange,
  estimarAlcance
}) => {
  // Estado local
  const [expandedSections, setExpandedSections] = useState<string[]>(['demografico']);
  const [nuevoInteres, setNuevoInteres] = useState('');
  const [estimandoAlcance, setEstimandoAlcance] = useState(false);
  const [alcanceEstimado, setAlcanceEstimado] = useState<{
    usuariosUnicos: number;
    impresionesEstimadas: number;
    porcentajePoblacion: number;
  } | null>(null);

  // Merge con defaults
  const demografico = useMemo(() => ({
    ...defaultDemografico,
    ...targeting.demografico
  }), [targeting.demografico]);

  const geografico = useMemo(() => ({
    ...defaultGeografico,
    ...targeting.geografico
  }), [targeting.geografico]);

  const contextual = useMemo(() => ({
    ...defaultContextual,
    ...targeting.contextual
  }), [targeting.contextual]);

  const comportamental = useMemo(() => ({
    ...defaultComportamental,
    ...targeting.comportamental
  }), [targeting.comportamental]);

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════

  const updateDemografico = useCallback((updates: Partial<TargetingDemografico>) => {
    onChange({
      ...targeting,
      demografico: { ...demografico, ...updates }
    });
  }, [targeting, demografico, onChange]);

  const updateGeografico = useCallback((updates: Partial<TargetingGeografico>) => {
    onChange({
      ...targeting,
      geografico: { ...geografico, ...updates }
    });
  }, [targeting, geografico, onChange]);

  const updateContextual = useCallback((updates: Partial<TargetingContextual>) => {
    onChange({
      ...targeting,
      contextual: { ...contextual, ...updates }
    });
  }, [targeting, contextual, onChange]);

  const updateComportamental = useCallback((updates: Partial<TargetingComportamental>) => {
    onChange({
      ...targeting,
      comportamental: { ...comportamental, ...updates }
    });
  }, [targeting, comportamental, onChange]);

  const toggleArrayItem = <T extends string | number>(arr: T[], item: T): T[] => {
    return arr.includes(item) 
      ? arr.filter(i => i !== item)
      : [...arr, item];
  };

  const handleEstimarAlcance = useCallback(async () => {
    if (!estimarAlcance) return;
    
    setEstimandoAlcance(true);
    try {
      const resultado = await estimarAlcance(targeting);
      setAlcanceEstimado(resultado);
    } catch {
      // /* console.error('Error estimando alcance') */;
    } finally {
      setEstimandoAlcance(false);
    }
  }, [estimarAlcance, targeting]);

  // Contador de criterios activos
  const criteriosActivos = useMemo(() => {
    let count = 0;
    if (demografico.edades.length > 0) count++;
    if (demografico.generos.length > 0 && !demografico.generos.includes('todos')) count++;
    if (demografico.nse.length > 0) count++;
    if (demografico.intereses.length > 0) count++;
    if (geografico.paises.length > 0) count++;
    if (geografico.regiones.length > 0) count++;
    if (geografico.geofences.length > 0) count++;
    if (contextual.dispositivos.length < 5) count++;
    if (contextual.condicionesClima.length > 0) count++;
    if (comportamental.engagementMinimo > 0) count++;
    if (comportamental.vozActiva !== null) count++;
    if (comportamental.pantallaActiva !== null) count++;
    return count;
  }, [demografico, geografico, contextual, comportamental]);

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  return (
    <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">🎯 Targeting Avanzado IA</h4>
            <p className="text-xs text-gray-500">
              {criteriosActivos} criterios activos
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {estimarAlcance && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEstimarAlcance}
              disabled={estimandoAlcance}
              className="gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              {estimandoAlcance ? 'Estimando...' : 'Estimar Alcance'}
            </Button>
          )}
          
          {alcanceEstimado && (
            <Badge className="bg-emerald-100 text-emerald-700 gap-1">
              <Users className="w-3 h-3" />
              ~{(alcanceEstimado.usuariosUnicos / 1000).toFixed(0)}K usuarios
            </Badge>
          )}
        </div>
      </div>

      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={(value) => setExpandedSections(Array.isArray(value) ? value : value ? [value] : [])}
        className="space-y-2"
      >
        {/* ══════════════════════════════════════════════════════════ */}
        {/* DEMOGRÁFICO */}
        {/* ══════════════════════════════════════════════════════════ */}
        <AccordionItem value="demografico" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">👥 Demográfico</span>
              {demografico.edades.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {demografico.edades.length} edades
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Edad */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Rangos de Edad</Label>
              <div className="flex flex-wrap gap-2">
                {RANGOS_EDAD_CONFIG.map(rango => (
                  <Button
                    key={rango.id}
                    variant={demografico.edades.includes(rango.id) ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 ${demografico.edades.includes(rango.id) ? 'bg-blue-600' : ''}`}
                    onClick={() => updateDemografico({
                      edades: toggleArrayItem(demografico.edades, rango.id)
                    })}
                  >
                    {rango.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Género */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Género</Label>
              <div className="flex gap-2">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'M', label: 'Masculino' },
                  { id: 'F', label: 'Femenino' },
                  { id: 'O', label: 'Otro' }
                ].map(g => (
                  <Button
                    key={g.id}
                    variant={demografico.generos.includes(g.id as typeof demografico.generos[number]) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      if (g.id === 'todos') {
                        updateDemografico({ generos: ['todos'] });
                      } else {
                        const nuevos = demografico.generos.filter(x => x !== 'todos');
                        updateDemografico({
                          generos: toggleArrayItem(nuevos, g.id as typeof demografico.generos[number])
                        });
                      }
                    }}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* NSE */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Nivel Socioeconómico</Label>
              <div className="flex gap-2">
                {['ABC1', 'C2', 'C3', 'D', 'E'].map(nse => (
                  <Button
                    key={nse}
                    variant={demografico.nse.includes(nse as typeof demografico.nse[number]) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => updateDemografico({
                      nse: toggleArrayItem(demografico.nse, nse as typeof demografico.nse[number])
                    })}
                  >
                    {nse}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intereses */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Intereses</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {demografico.intereses.map(interes => (
                  <Badge
                    key={interes}
                    className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                    onClick={() => updateDemografico({
                      intereses: demografico.intereses.filter(i => i !== interes)
                    })}
                  >
                    {interes} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar interés..."
                  value={nuevoInteres}
                  onChange={(e) => setNuevoInteres(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nuevoInteres) {
                      updateDemografico({
                        intereses: [...demografico.intereses, nuevoInteres]
                      });
                      setNuevoInteres('');
                    }
                  }}
                  className="h-8"
                />
                <Select
                  onValueChange={(v) => {
                    if (!demografico.intereses.includes(v)) {
                      updateDemografico({
                        intereses: [...demografico.intereses, v]
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="Sugeridos" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERESES_SUGERIDOS.filter(i => !demografico.intereses.includes(i)).map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* GEOGRÁFICO */}
        {/* ══════════════════════════════════════════════════════════ */}
        <AccordionItem value="geografico" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-semibold">📍 Geográfico</span>
              {geografico.paises.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {geografico.paises.length} países
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* País */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Países</Label>
              <div className="flex flex-wrap gap-2">
                {PAISES.map(pais => (
                  <Button
                    key={pais.id}
                    variant={geografico.paises.includes(pais.id) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => updateGeografico({
                      paises: toggleArrayItem(geografico.paises, pais.id)
                    })}
                  >
                    {pais.nombre}
                  </Button>
                ))}
              </div>
            </div>

            {/* Regiones (dinámico según país) */}
            {geografico.paises.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Regiones</Label>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {PAISES
                    .filter(p => geografico.paises.includes(p.id))
                    .flatMap(p => p.regiones)
                    .map(region => (
                      <Button
                        key={region}
                        variant={geografico.regiones.includes(region) ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateGeografico({
                          regiones: toggleArrayItem(geografico.regiones, region)
                        })}
                      >
                        {region}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Geofencing */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Geofencing GPS
                </Label>
                <Switch
                  checked={geografico.usarGPSPreciso}
                  onCheckedChange={(v) => updateGeografico({ usarGPSPreciso: v })}
                />
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Activa para usar ubicación GPS precisa del usuario en tiempo real.
              </p>
              
              <div className="flex items-center gap-2">
                <Label className="text-xs">Radio por defecto:</Label>
                <Input
                  type="number"
                  value={geografico.radioDefaultKm}
                  onChange={(e) => updateGeografico({
                    radioDefaultKm: parseInt(e.target.value) || 5
                  })}
                  className="w-20 h-7 text-xs"
                />
                <span className="text-xs text-gray-500">km</span>
              </div>
              
              <Button variant="outline" size="sm" className="mt-2 gap-1 w-full">
                <MapIcon className="w-3 h-3" />
                Abrir Mapa para Geofences
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* CONTEXTUAL */}
        {/* ══════════════════════════════════════════════════════════ */}
        <AccordionItem value="contextual" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">⏰ Contextual</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Días de la semana */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Días de la Semana</Label>
              <div className="flex gap-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, idx) => (
                  <Button
                    key={dia}
                    variant={contextual.diasSemana.includes(idx as typeof contextual.diasSemana[number]) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-10 p-0"
                    onClick={() => updateContextual({
                      diasSemana: toggleArrayItem(
                        contextual.diasSemana,
                        idx as typeof contextual.diasSemana[number]
                      )
                    })}
                  >
                    {dia}
                  </Button>
                ))}
              </div>
            </div>

            {/* Horarios */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Horario Permitido</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={contextual.horasPermitidas[0]?.inicio || '00:00'}
                  onChange={(e) => updateContextual({
                    horasPermitidas: [{
                      ...contextual.horasPermitidas[0],
                      inicio: e.target.value
                    }]
                  })}
                  className="w-24 h-8"
                />
                <span className="text-gray-500">a</span>
                <Input
                  type="time"
                  value={contextual.horasPermitidas[0]?.fin || '23:59'}
                  onChange={(e) => updateContextual({
                    horasPermitidas: [{
                      ...contextual.horasPermitidas[0],
                      fin: e.target.value
                    }]
                  })}
                  className="w-24 h-8"
                />
              </div>
            </div>

            {/* Dispositivos */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Dispositivos</Label>
              <div className="flex gap-2">
                {DISPOSITIVOS.map(d => (
                  <TooltipProvider key={d.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={contextual.dispositivos.includes(d.id) ? 'default' : 'outline'}
                          size="sm"
                          className="h-10 w-10 p-0"
                          onClick={() => updateContextual({
                            dispositivos: toggleArrayItem(contextual.dispositivos, d.id)
                          })}
                        >
                          <d.icono className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{d.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {/* Clima */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Condiciones Climáticas</Label>
              <div className="flex gap-2">
                {CONDICIONES_CLIMA.map(c => (
                  <Button
                    key={c.id}
                    variant={contextual.condicionesClima.includes(c.id) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => updateContextual({
                      condicionesClima: toggleArrayItem(contextual.condicionesClima, c.id)
                    })}
                  >
                    <c.icono className="w-3 h-3" />
                    {c.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Muestra anuncios solo cuando el clima coincida
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* COMPORTAMENTAL IA */}
        {/* ══════════════════════════════════════════════════════════ */}
        <AccordionItem value="comportamental" className="border rounded-lg px-4 border-purple-200">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">🧠 Comportamental IA</span>
              <Badge className="bg-purple-100 text-purple-700 ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                IA
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Engagement mínimo */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>Engagement Mínimo</span>
                <span className="text-purple-600 font-bold">{comportamental.engagementMinimo}%</span>
              </Label>
              <Slider
                value={[comportamental.engagementMinimo]}
                onValueChange={([v]) => updateComportamental({ engagementMinimo: v })}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo usuarios con score de engagement mayor a este valor
              </p>
            </div>

            {/* Intención de compra */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>Intención de Compra Mínima</span>
                <span className="text-purple-600 font-bold">{comportamental.intencionCompraMinima}%</span>
              </Label>
              <Slider
                value={[comportamental.intencionCompraMinima]}
                onValueChange={([v]) => updateComportamental({ intencionCompraMinima: v })}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Detección de sensores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Mic className="w-3 h-3 text-blue-600" />
                    Voz Activa
                  </Label>
                  <Select
                    value={comportamental.vozActiva === null ? 'any' : comportamental.vozActiva ? 'yes' : 'no'}
                    onValueChange={(v) => updateComportamental({
                      vozActiva: v === 'any' ? null : v === 'yes'
                    })}
                  >
                    <SelectTrigger className="w-24 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Cualquiera</SelectItem>
                      <SelectItem value="yes">Solo activa</SelectItem>
                      <SelectItem value="no">Solo inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500">
                  Detecta si el usuario está hablando al dispositivo
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Eye className="w-3 h-3 text-green-600" />
                    Pantalla Activa
                  </Label>
                  <Select
                    value={comportamental.pantallaActiva === null ? 'any' : comportamental.pantallaActiva ? 'yes' : 'no'}
                    onValueChange={(v) => updateComportamental({
                      pantallaActiva: v === 'any' ? null : v === 'yes'
                    })}
                  >
                    <SelectTrigger className="w-24 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Cualquiera</SelectItem>
                      <SelectItem value="yes">Mirando</SelectItem>
                      <SelectItem value="no">No mirando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500">
                  Detecta si el usuario está mirando la pantalla
                </p>
              </div>
            </div>

            {/* Momento óptimo */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <div>
                  <Label className="text-sm font-medium">Momento Óptimo IA</Label>
                  <p className="text-xs text-gray-500">
                    Solo mostrar cuando la IA prediga máximo impacto
                  </p>
                </div>
              </div>
              <Switch
                checked={comportamental.momentoOptimoRequerido}
                onCheckedChange={(v) => updateComportamental({ momentoOptimoRequerido: v })}
              />
            </div>

            {/* Frecuencia */}
            <div className="p-3 border rounded-lg">
              <Label className="text-sm font-medium mb-3 block">Frecuencia de Impresiones</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Máx por usuario</Label>
                  <Input
                    type="number"
                    value={comportamental.maxImpresionesUsuario}
                    onChange={(e) => updateComportamental({
                      maxImpresionesUsuario: parseInt(e.target.value) || 10
                    })}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Máx por día</Label>
                  <Input
                    type="number"
                    value={comportamental.maxImpresionesUsuarioPorDia}
                    onChange={(e) => updateComportamental({
                      maxImpresionesUsuarioPorDia: parseInt(e.target.value) || 3
                    })}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Separación (min)</Label>
                  <Input
                    type="number"
                    value={comportamental.separacionMinutosEntreImpresiones}
                    onChange={(e) => updateComportamental({
                      separacionMinutosEntreImpresiones: parseInt(e.target.value) || 30
                    })}
                    className="h-8 mt-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer con resumen */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{criteriosActivos}</span> criterios de targeting activos
        </div>
        {criteriosActivos > 5 && (
          <Badge className="bg-amber-100 text-amber-700 gap-1">
            <AlertCircle className="w-3 h-3" />
            Targeting muy específico
          </Badge>
        )}
        {criteriosActivos === 0 && (
          <Badge className="bg-blue-100 text-blue-700 gap-1">
            <Globe className="w-3 h-3" />
            Alcance máximo
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default PanelTargetingAvanzado;
