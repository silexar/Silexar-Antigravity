/**
 * 🌐 Panel de Especificaciones Digitales
 *
 * Captura la configuración de campañas digitales:
 * plataformas, presupuesto, objetivos, tracking, targeting y notas.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  X,
  Globe,
  Target,
  Users,
  Banknote,
  StickyNote,
} from 'lucide-react';
import { EspecificacionDigitalData } from './types/wizard.types';

interface PanelEspecificacionesDigitalesProps {
  data: Partial<EspecificacionDigitalData>;
  onUpdate: (data: Partial<EspecificacionDigitalData>) => void;
}

const PLATAFORMAS = [
  { id: 'meta_ads', label: 'Meta Ads' },
  { id: 'google_ads', label: 'Google Ads' },
  { id: 'tiktok_ads', label: 'TikTok Ads' },
  { id: 'linkedin_ads', label: 'LinkedIn Ads' },
  { id: 'twitter_ads', label: 'Twitter Ads' },
  { id: 'spotify', label: 'Spotify' },
  { id: 'deezer', label: 'Deezer' },
  { id: 'soundcloud', label: 'SoundCloud' },
  { id: 'youtube_ads', label: 'YouTube Ads' },
  { id: 'programmatic', label: 'Programmatic' },
  { id: 'sitio_propio', label: 'Sitio Propio' },
  { id: 'app_propia', label: 'App Propia' },
] as const;

export const PanelEspecificacionesDigitales: React.FC<
  PanelEspecificacionesDigitalesProps
> = ({ data, onUpdate }) => {
  const [nuevaRegion, setNuevaRegion] = useState('');

  const togglePlataforma = (id: string) => {
    const actuales = data.plataformas || [];
    const nuevas = actuales.includes(id)
      ? actuales.filter((p) => p !== id)
      : [...actuales, id];
    onUpdate({ plataformas: nuevas });
  };

  const handleObjetivoChange = (
    campo: keyof NonNullable<EspecificacionDigitalData['objetivos']>,
    valor: string
  ) => {
    const num = valor === '' ? undefined : Number(valor);
    onUpdate({
      objetivos: {
        ...data.objetivos,
        [campo]: num,
      },
    });
  };

  const addTrackingLink = () => {
    const actuales = data.trackingLinks || [];
    onUpdate({ trackingLinks: [...actuales, ''] });
  };

  const updateTrackingLink = (index: number, valor: string) => {
    const actuales = [...(data.trackingLinks || [])];
    actuales[index] = valor;
    onUpdate({ trackingLinks: actuales });
  };

  const removeTrackingLink = (index: number) => {
    const actuales = [...(data.trackingLinks || [])];
    actuales.splice(index, 1);
    onUpdate({ trackingLinks: actuales });
  };

  const toggleGenero = (genero: string) => {
    const actuales = data.configuracionTargeting?.generos || [];
    const nuevos = actuales.includes(genero)
      ? actuales.filter((g) => g !== genero)
      : [...actuales, genero];
    onUpdate({
      configuracionTargeting: {
        ...data.configuracionTargeting,
        generos: nuevos,
      },
    });
  };

  const addRegion = () => {
    const region = nuevaRegion.trim();
    if (!region) return;
    const actuales = data.configuracionTargeting?.regiones || [];
    if (actuales.includes(region)) return;
    onUpdate({
      configuracionTargeting: {
        ...data.configuracionTargeting,
        regiones: [...actuales, region],
      },
    });
    setNuevaRegion('');
  };

  const removeRegion = (region: string) => {
    const actuales = data.configuracionTargeting?.regiones || [];
    onUpdate({
      configuracionTargeting: {
        ...data.configuracionTargeting,
        regiones: actuales.filter((r) => r !== region),
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-indigo-500" />
        <h3 className="font-semibold text-gray-900">Especificaciones Digitales</h3>
      </div>

      {/* Plataformas */}
      <Card className="p-5 border-slate-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Plataformas</h4>
        <div className="flex flex-wrap gap-2">
          {PLATAFORMAS.map((p) => {
            const selected = (data.plataformas || []).includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlataforma(p.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  selected
                    ? 'bg-indigo-100 border-indigo-400 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Presupuesto */}
      <Card className="p-5 border-slate-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-emerald-500" />
          Presupuesto Digital
        </h4>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="presupuestoDigital" className="text-xs text-gray-500">
              Monto
            </Label>
            <Input
              id="presupuestoDigital"
              type="number"
              min={0}
              value={data.presupuestoDigital ?? ''}
              onChange={(e) =>
                onUpdate({
                  presupuestoDigital:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="moneda" className="text-xs text-gray-500">
              Moneda
            </Label>
            <Select
              value={data.moneda || 'CLP'}
              onValueChange={(v) =>
                onUpdate({ moneda: v as 'CLP' | 'USD' | 'UF' })
              }
            >
              <SelectTrigger id="moneda" className="mt-1">
                <SelectValue placeholder="Moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLP">CLP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="UF">UF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pb-1">
            <Switch
              id="tipoPresupuesto"
              checked={data.tipoPresupuesto === 'total'}
              onCheckedChange={(checked) =>
                onUpdate({ tipoPresupuesto: checked ? 'total' : 'diario' })
              }
            />
            <Label htmlFor="tipoPresupuesto" className="text-sm text-gray-700">
              {data.tipoPresupuesto === 'total' ? 'Total' : 'Diario'}
            </Label>
          </div>
        </div>
      </Card>

      {/* Objetivos */}
      <Card className="p-5 border-slate-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-rose-500" />
          Objetivos
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="objAlcance" className="text-xs text-gray-500">
              Alcance
            </Label>
            <Input
              id="objAlcance"
              type="number"
              min={0}
              value={data.objetivos?.alcance ?? ''}
              onChange={(e) => handleObjetivoChange('alcance', e.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="objImpresiones" className="text-xs text-gray-500">
              Impresiones
            </Label>
            <Input
              id="objImpresiones"
              type="number"
              min={0}
              value={data.objetivos?.impresiones ?? ''}
              onChange={(e) => handleObjetivoChange('impresiones', e.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="objClics" className="text-xs text-gray-500">
              Clics
            </Label>
            <Input
              id="objClics"
              type="number"
              min={0}
              value={data.objetivos?.clics ?? ''}
              onChange={(e) => handleObjetivoChange('clics', e.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Tracking Links */}
      <Card className="p-5 border-slate-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tracking Links</h4>
        <div className="space-y-2">
          {(data.trackingLinks || []).map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                type="url"
                value={link}
                onChange={(e) => updateTrackingLink(idx, e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeTrackingLink(idx)}
                className="shrink-0"
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTrackingLink}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar link
          </Button>
        </div>
      </Card>

      {/* Targeting */}
      <Card className="p-5 border-slate-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Targeting
        </h4>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="edadMinima" className="text-xs text-gray-500">
              Edad mínima
            </Label>
            <Input
              id="edadMinima"
              type="number"
              min={0}
              value={data.configuracionTargeting?.edadMinima ?? ''}
              onChange={(e) =>
                onUpdate({
                  configuracionTargeting: {
                    ...data.configuracionTargeting,
                    edadMinima:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              placeholder="18"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edadMaxima" className="text-xs text-gray-500">
              Edad máxima
            </Label>
            <Input
              id="edadMaxima"
              type="number"
              min={0}
              value={data.configuracionTargeting?.edadMaxima ?? ''}
              onChange={(e) =>
                onUpdate({
                  configuracionTargeting: {
                    ...data.configuracionTargeting,
                    edadMaxima:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              placeholder="65"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs text-gray-500">Géneros</Label>
            <div className="flex gap-2 mt-1">
              {['M', 'F'].map((g) => {
                const selected = (data.configuracionTargeting?.generos || []).includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenero(g)}
                    className={`px-4 py-1.5 rounded-lg text-sm border transition-all ${
                      selected
                        ? 'bg-blue-100 border-blue-400 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {g === 'M' ? 'Masculino' : 'Femenino'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="regiones" className="text-xs text-gray-500">
            Regiones
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="regiones"
              value={nuevaRegion}
              onChange={(e) => setNuevaRegion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRegion();
                }
              }}
              placeholder="Escribe una región y presiona Enter"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addRegion}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {(data.configuracionTargeting?.regiones || []).map((r) => (
              <Badge
                key={r}
                className="bg-slate-100 text-slate-700 border border-slate-200 gap-1 px-2 py-1"
              >
                {r}
                <button
                  type="button"
                  onClick={() => removeRegion(r)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Notas */}
      <Card className="p-5 border-slate-200 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-500" />
          Notas
        </h4>
        <Textarea
          value={data.notas || ''}
          onChange={(e) => onUpdate({ notas: e.target.value })}
          placeholder="Observaciones o instrucciones adicionales..."
          rows={4}
        />
      </Card>
    </div>
  );
};

export default PanelEspecificacionesDigitales;
